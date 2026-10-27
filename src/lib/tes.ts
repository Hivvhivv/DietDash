// Pretest & posttest online (keputusan peneliti 2026-10-27, menggantikan aturan "pretest/posttest di luar website").
// - Pretest wajib diisi sebelum responden dapat memakai website (gerbang di wajibResponden).
// - Posttest muncul setelah dibuka admin (per responden atau sekaligus), lalu wajib diisi.
// - Kunci jawaban pilihan ganda hanya untuk menghitung skor peneliti; tidak pernah dikirim ke responden.
// - Soal terkunci setelah ada jawaban agar semua responden menjawab instrumen yang sama. Jawaban tidak dapat diubah.
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import type { AdminAktif } from './admin-auth';
import { catatAudit, koleksi, type DokInstrumen, type DokPeserta, type JenisTes, type SoalTes } from './db';
import { buatKunci } from './identitas';

export const LABEL_TES: Record<JenisTes, string> = { pretest: 'Pretest', posttest: 'Posttest' };

const BAWAAN: Record<JenisTes, Pick<DokInstrumen, 'judul' | 'petunjuk'>> = {
  pretest: {
    judul: 'Pretest',
    petunjuk: 'Sebelum mulai belajar, jawab pertanyaan berikut sesuai pengetahuan Anda saat ini. Ini bukan ujian; tidak ada nilai yang ditampilkan.',
  },
  posttest: {
    judul: 'Posttest',
    petunjuk: 'Jawab pertanyaan berikut sesuai pengetahuan Anda setelah mengikuti materi. Ini bukan ujian; tidak ada nilai yang ditampilkan.',
  },
};

const skemaSoal = z
  .object({
    kunci: z.string().max(40).optional(),
    jenis: z.enum(['pilihan', 'skala', 'isian']),
    teks: z.string().trim().min(3, 'Teks soal minimal 3 karakter.').max(1000, 'Teks soal maksimal 1000 karakter.'),
    wajib: z.boolean(),
    pilihan: z.array(z.object({ kunci: z.string().max(40).optional(), teks: z.string().trim().min(1, 'Pilihan tidak boleh kosong.').max(300), benar: z.boolean() })).optional(),
    skala: z
      .object({ min: z.number().int().min(0).max(1), maks: z.number().int().min(2).max(10), label_min: z.string().trim().max(60), label_maks: z.string().trim().max(60) })
      .optional(),
    isian: z.object({ panjang: z.enum(['pendek', 'panjang']) }).optional(),
  })
  .superRefine((s, ctx) => {
    if (s.jenis === 'pilihan') {
      const p = s.pilihan ?? [];
      if (p.length < 2 || p.length > 6) ctx.addIssue({ code: 'custom', message: 'Soal pilihan ganda butuh 2–6 pilihan.' });
      if (p.filter((x) => x.benar).length > 1) ctx.addIssue({ code: 'custom', message: 'Tandai paling banyak satu jawaban benar.' });
    }
    if (s.jenis === 'skala' && !s.skala) ctx.addIssue({ code: 'custom', message: 'Atur rentang skala.' });
  });

export const skemaInstrumen = z.object({
  judul: z.string().trim().min(3, 'Judul minimal 3 karakter.').max(120),
  petunjuk: z.string().trim().max(1000),
  aktif: z.boolean(),
  soal: z.array(skemaSoal).max(100, 'Maksimal 100 soal.'),
});
export type MasukanInstrumen = z.infer<typeof skemaInstrumen>;

export async function ambilInstrumen(jenis: JenisTes): Promise<DokInstrumen> {
  const { instrumen } = await koleksi();
  const dok = await instrumen.findOne({ _id: jenis });
  return dok ?? { _id: jenis, ...BAWAAN[jenis], aktif: false, soal: [], diubah_pada: new Date(0), diubah_oleh: 'sistem' };
}

export async function jumlahJawaban(jenis: JenisTes): Promise<number> {
  const { jawabanTes } = await koleksi();
  return jawabanTes.countDocuments({ jenis });
}

// Simpan judul/petunjuk/status/soal. Soal tidak dapat diubah lagi setelah ada responden yang menjawab.
export async function simpanInstrumen(admin: AdminAktif, jenis: JenisTes, m: MasukanInstrumen): Promise<{ ok: true } | { ok: false; pesan: string }> {
  const lama = await ambilInstrumen(jenis);
  const terkunci = (await jumlahJawaban(jenis)) > 0;
  const soal: SoalTes[] = m.soal.map((s) => ({
    kunci: s.kunci || buatKunci(),
    jenis: s.jenis,
    teks: s.teks,
    wajib: s.wajib,
    ...(s.jenis === 'pilihan' ? { pilihan: (s.pilihan ?? []).map((p) => ({ kunci: p.kunci || buatKunci(), teks: p.teks, benar: p.benar })) } : {}),
    ...(s.jenis === 'skala' ? { skala: s.skala } : {}),
    ...(s.jenis === 'isian' ? { isian: s.isian ?? { panjang: 'pendek' } } : {}),
  }));
  if (terkunci && JSON.stringify(soal) !== JSON.stringify(lama.soal)) {
    return { ok: false, pesan: 'Soal sudah dijawab responden sehingga tidak dapat diubah. Judul, petunjuk, dan status aktif tetap bisa disimpan.' };
  }
  if (m.aktif && soal.length === 0) return { ok: false, pesan: 'Tambahkan minimal satu soal sebelum mengaktifkan.' };
  const { instrumen } = await koleksi();
  await instrumen.updateOne(
    { _id: jenis },
    { $set: { judul: m.judul, petunjuk: m.petunjuk, aktif: m.aktif, soal, diubah_pada: new Date(), diubah_oleh: admin.email } },
    { upsert: true },
  );
  await catatAudit({ admin: admin.email, aksi: `ubah_${jenis}`, keterangan: `${soal.length} soal, ${m.aktif ? 'aktif' : 'nonaktif'}` });
  return { ok: true };
}

// ---------- Responden ----------

// Tes yang wajib diisi sekarang (gerbang): pretest dulu, lalu posttest bila sudah dibuka admin.
export async function tesWajib(p: DokPeserta): Promise<JenisTes | null> {
  if (!p.pretest_selesai_pada) {
    const pre = await ambilInstrumen('pretest');
    if (pre.aktif && pre.soal.length) return 'pretest';
  }
  if (p.posttest_dibuka_pada && !p.posttest_selesai_pada) {
    const post = await ambilInstrumen('posttest');
    if (post.aktif && post.soal.length) return 'posttest';
  }
  return null;
}

// Soal untuk responden: tanpa kunci jawaban.
export function soalUntukResponden(i: DokInstrumen) {
  return i.soal.map((s) => ({ ...s, pilihan: s.pilihan?.map(({ kunci, teks }) => ({ kunci, teks })) }));
}

export async function kirimJawaban(
  respondentId: ObjectId,
  p: DokPeserta,
  jenis: JenisTes,
  isian: Record<string, string>,
): Promise<{ ok: true } | { ok: false; pesan: string; soal?: string }> {
  if (jenis === 'posttest' && !p.posttest_dibuka_pada) return { ok: false, pesan: 'Posttest belum dibuka oleh peneliti.' };
  const i = await ambilInstrumen(jenis);
  if (!i.aktif || !i.soal.length) return { ok: false, pesan: `${LABEL_TES[jenis]} belum tersedia.` };
  const { jawabanTes, peserta } = await koleksi();
  if (await jawabanTes.findOne({ respondent_id: respondentId, jenis })) return { ok: true }; // kiriman ganda
  const jawaban: { soal_kunci: string; nilai: string }[] = [];
  let benar = 0;
  let berkunci = 0;
  for (const [n, s] of i.soal.entries()) {
    const nilai = (isian[s.kunci] ?? '').trim();
    if (!nilai) {
      if (s.wajib) return { ok: false, pesan: `Soal nomor ${n + 1} wajib dijawab.`, soal: s.kunci };
      continue;
    }
    if (s.jenis === 'pilihan' && !s.pilihan?.some((x) => x.kunci === nilai)) return { ok: false, pesan: `Jawaban soal nomor ${n + 1} tidak valid.`, soal: s.kunci };
    if (s.jenis === 'skala') {
      const v = Number(nilai);
      if (!Number.isInteger(v) || v < s.skala!.min || v > s.skala!.maks) return { ok: false, pesan: `Jawaban soal nomor ${n + 1} tidak valid.`, soal: s.kunci };
    }
    jawaban.push({ soal_kunci: s.kunci, nilai: s.jenis === 'isian' ? nilai.slice(0, s.isian?.panjang === 'panjang' ? 2000 : 300) : nilai });
  }
  for (const s of i.soal) {
    const kunciBenar = s.jenis === 'pilihan' ? s.pilihan?.find((x) => x.benar)?.kunci : undefined;
    if (!kunciBenar) continue;
    berkunci++;
    if (jawaban.find((j) => j.soal_kunci === s.kunci)?.nilai === kunciBenar) benar++;
  }
  const sekarang = new Date();
  try {
    await jawabanTes.insertOne({
      _id: new ObjectId(),
      respondent_id: respondentId,
      jenis,
      jawaban,
      benar,
      total_berkunci: berkunci,
      skor: berkunci ? Math.round((benar / berkunci) * 100) : null,
      dikirim_pada: sekarang,
    });
  } catch {
    return { ok: true }; // sudah tersimpan oleh kiriman lain
  }
  await peserta.updateOne({ _id: p._id }, { $set: jenis === 'pretest' ? { pretest_selesai_pada: sekarang } : { posttest_selesai_pada: sekarang } });
  return { ok: true };
}

// ---------- Admin ----------

export async function bukaPosttest(admin: AdminAktif, sasaran: { idPeserta: string } | 'semua', buka = true): Promise<number> {
  const { peserta } = await koleksi();
  // { posttest_dibuka_pada: null } juga cocok untuk dokumen lama yang belum punya kolom ini.
  const filter = sasaran === 'semua' ? { status_sampel: 'responden_penelitian' as const, posttest_dibuka_pada: null } : { id_peserta: sasaran.idPeserta };
  const r = await peserta.updateMany(filter, { $set: { posttest_dibuka_pada: buka ? new Date() : null } });
  await catatAudit({
    admin: admin.email,
    aksi: buka ? 'buka_posttest' : 'tutup_posttest',
    objek: sasaran === 'semua' ? undefined : sasaran.idPeserta,
    keterangan: sasaran === 'semua' ? `${r.modifiedCount} responden penelitian` : undefined,
  });
  return r.modifiedCount;
}

export async function hasilTes(jenis: JenisTes) {
  const k = await koleksi();
  const [i, jawaban, peserta] = await Promise.all([ambilInstrumen(jenis), k.jawabanTes.find({ jenis }).sort({ dikirim_pada: 1 }).toArray(), k.peserta.find({}).toArray()]);
  const idPer = new Map(peserta.map((p) => [p.respondent_id.toHexString(), p]));
  const baris = jawaban.map((j) => ({ ...j, id_peserta: idPer.get(j.respondent_id.toHexString())?.id_peserta ?? '—', sampel: idPer.get(j.respondent_id.toHexString())?.status_sampel }));
  const berskor = baris.filter((b) => b.skor !== null && b.sampel === 'responden_penelitian');
  return {
    instrumen: i,
    baris,
    rataSkor: berskor.length ? Math.round(berskor.reduce((n, b) => n + (b.skor ?? 0), 0) / berskor.length) : null,
  };
}

// Ekspor jawaban (satu baris per responden, kolom per soal). ID peserta saja, tanpa nama/nomor.
export async function eksporTes(jenis: JenisTes, semua: boolean) {
  const { instrumen, baris } = await hasilTes(jenis);
  const dipilih = semua ? baris : baris.filter((b) => b.sampel === 'responden_penelitian');
  const kepala = ['id_peserta', 'dikirim_pada', 'benar', 'total_berkunci', 'skor_persen', ...instrumen.soal.map((s, n) => `s${n + 1}_${s.jenis}`)];
  const teksPilihan = (s: SoalTes, nilai: string) => s.pilihan?.find((p) => p.kunci === nilai)?.teks ?? nilai;
  const isi = dipilih.map((b) => [
    b.id_peserta,
    b.dikirim_pada.toISOString(),
    b.benar,
    b.total_berkunci,
    b.skor ?? '',
    ...instrumen.soal.map((s) => {
      const j = b.jawaban.find((x) => x.soal_kunci === s.kunci)?.nilai ?? '';
      return s.jenis === 'pilihan' && j ? teksPilihan(s, j) : j;
    }),
  ]);
  return { kepala, isi, soal: instrumen.soal };
}

// Jawaban satu responden per soal (detail & ekspor PDF responden; hanya admin). Hasil benar/belum tepat hanya untuk soal pilihan ganda berkunci.
export async function jawabanResponden(respondentId: ObjectId) {
  const { jawabanTes } = await koleksi();
  const [d, pre, post] = await Promise.all([jawabanTes.find({ respondent_id: respondentId }).toArray(), ambilInstrumen('pretest'), ambilInstrumen('posttest')]);
  const susun = (jenis: JenisTes, i: DokInstrumen) => {
    const j = d.find((x) => x.jenis === jenis) ?? null;
    const butir = j
      ? i.soal.map((s, n) => {
          const nilai = j.jawaban.find((x) => x.soal_kunci === s.kunci)?.nilai ?? '';
          const kunci = s.jenis === 'pilihan' ? s.pilihan?.find((x) => x.benar) : undefined;
          return {
            nomor: n + 1,
            teks: s.teks,
            jenis: s.jenis,
            jawaban: !nilai
              ? '—'
              : s.jenis === 'pilihan'
                ? (s.pilihan?.find((x) => x.kunci === nilai)?.teks ?? nilai)
                : s.jenis === 'skala' && s.skala
                  ? `${nilai} (skala ${s.skala.min}–${s.skala.maks})`
                  : nilai,
            hasil: kunci ? (nilai === kunci.kunci ? ('benar' as const) : ('salah' as const)) : null,
            kunci_teks: kunci?.teks ?? null,
          };
        })
      : [];
    return { jenis, instrumen: i, jawaban: j, butir };
  };
  return { pretest: susun('pretest', pre), posttest: susun('posttest', post) };
}
export type JawabanResponden = Awaited<ReturnType<typeof jawabanResponden>>;

export async function skorResponden(respondentId: ObjectId) {
  const { jawabanTes } = await koleksi();
  const d = await jawabanTes.find({ respondent_id: respondentId }, { projection: { jenis: 1, skor: 1, benar: 1, total_berkunci: 1, dikirim_pada: 1 } }).toArray();
  return { pretest: d.find((x) => x.jenis === 'pretest') ?? null, posttest: d.find((x) => x.jenis === 'posttest') ?? null };
}
