// Progres berurutan responden (PRD v2.0 Bagian 6).
// Materi berikutnya terbuka hanya setelah kuis materi sebelumnya selesai — diperiksa di server.
// Progres memakai kunci materi yang stabil lintas versi, dan mencatat versi konten yang dipakai.
import { ObjectId } from 'mongodb';
import { catatAudit, koleksi, type DokPercobaanKuis, type DokProgresMateri, type DokSoal } from './db';
import { ambilSoalKuis, type MateriTerurut, type StrukturVersi } from './konten';
import { ambilPengaturan } from './pengaturan';
import type { RespondenAktif } from './responden';

export type StatusMateri = 'terkunci' | 'tersedia' | 'sedang' | 'selesai';

export interface StatusPerMateri {
  materi: MateriTerurut;
  status: StatusMateri;
  alasan_kunci?: 'materi_sebelumnya' | 'pretest';
  percobaan_aktif: boolean; // ada kuis yang sedang dikerjakan
  progres: DokProgresMateri | null;
}

export interface RingkasanBelajar {
  daftar: StatusPerMateri[];
  selesai: number;
  total: number;
  persen: number;
  lanjut: { url: string; label: string; materi: MateriTerurut } | null; // null = semua selesai
}

export async function hitungStatus(respondentId: ObjectId, struktur: StrukturVersi, pretestSelesai: boolean): Promise<RingkasanBelajar> {
  const { progres, percobaan } = await koleksi();
  const atur = await ambilPengaturan();
  const [daftarProgres, aktif] = await Promise.all([
    progres.find({ respondent_id: respondentId }).toArray(),
    percobaan.find({ respondent_id: respondentId, selesai_pada: null }, { projection: { kuis_kunci: 1 } }).toArray(),
  ]);
  return susunStatus(struktur, daftarProgres, new Set(aktif.map((x) => x.kuis_kunci)), atur.gerbang_pretest, pretestSelesai);
}

// Fungsi murni: dipakai untuk satu responden maupun dashboard (banyak responden sekaligus).
export function susunStatus(
  struktur: StrukturVersi,
  daftarProgres: DokProgresMateri[],
  kuisAktif: Set<string>,
  gerbangPretest: boolean,
  pretestSelesai: boolean,
): RingkasanBelajar {
  const peta = new Map(daftarProgres.map((p) => [p.materi_kunci, p]));
  const daftar: StatusPerMateri[] = [];
  struktur.materi.forEach((m, i) => {
    const p = peta.get(m.kunci) ?? null;
    const sebelumSelesai = i === 0 ? true : daftar[i - 1].status === 'selesai';
    const gerbang = i === 0 && gerbangPretest && !pretestSelesai;
    let status: StatusMateri;
    let alasan: StatusPerMateri['alasan_kunci'];
    if (p?.selesai_pada) status = 'selesai';
    else if (p?.buka_manual || (sebelumSelesai && !gerbang)) status = p?.dibuka_pada ? 'sedang' : 'tersedia';
    else {
      status = 'terkunci';
      alasan = gerbang ? 'pretest' : 'materi_sebelumnya';
    }
    daftar.push({
      materi: m,
      status,
      alasan_kunci: alasan,
      percobaan_aktif: !!m.kuis && kuisAktif.has(m.kuis.kunci),
      progres: p,
    });
  });

  const selesai = daftar.filter((d) => d.status === 'selesai').length;
  const berikut = daftar.find((d) => d.status === 'sedang' || d.status === 'tersedia');
  let lanjut: RingkasanBelajar['lanjut'] = null;
  if (berikut) {
    const m = berikut.materi;
    lanjut = berikut.percobaan_aktif
      ? { url: `/belajar/materi/${m.kunci}/kuis/`, label: `Lanjutkan kuis Materi ${m.nomor}`, materi: m }
      : { url: `/belajar/materi/${m.kunci}/`, label: `${berikut.status === 'sedang' ? 'Lanjutkan' : 'Mulai'} Materi ${m.nomor}`, materi: m };
  } else if (selesai < daftar.length) {
    // Masih ada materi terkunci (mis. menunggu pretest): arahkan ke dashboard.
    const m = daftar[selesai].materi;
    lanjut = { url: '/belajar/', label: 'Lihat dashboard', materi: m };
  }
  return {
    daftar,
    selesai,
    total: daftar.length,
    persen: daftar.length ? Math.round((selesai / daftar.length) * 100) : 0,
    lanjut,
  };
}

export async function statusResponden(a: RespondenAktif, struktur: StrukturVersi) {
  return hitungStatus(a.r._id, struktur, !!a.p.pretest_selesai_pada);
}

export async function tandaiDibuka(a: RespondenAktif, struktur: StrukturVersi, materiKunci: string): Promise<boolean> {
  const r = await statusResponden(a, struktur);
  const s = r.daftar.find((d) => d.materi.kunci === materiKunci);
  if (!s || s.status === 'terkunci') return false;
  const { progres } = await koleksi();
  const sekarang = new Date();
  if (s.progres) {
    if (!s.progres.dibuka_pada) {
      await progres.updateOne({ _id: s.progres._id, dibuka_pada: null }, { $set: { dibuka_pada: sekarang } });
    }
    return true;
  }
  try {
    await progres.insertOne({
      _id: new ObjectId(),
      respondent_id: a.r._id,
      materi_kunci: materiKunci,
      version_id: struktur.versi._id,
      dibuka_pada: sekarang,
      selesai_pada: null,
      versi_selesai_id: null,
      detik_baca: 0,
      buka_manual: null,
    });
  } catch {
    // Sudah dibuat oleh permintaan lain yang bersamaan.
  }
  return true;
}

// Lama membaca: hanya dikirim saat halaman aktif dan ada interaksi dalam 5 menit terakhir (dibatasi per kiriman).
export async function tambahDetikBaca(respondentId: ObjectId, materiKunci: string, detik: number): Promise<void> {
  const d = Math.max(0, Math.min(60, Math.round(detik)));
  if (!d) return;
  const { progres } = await koleksi();
  await progres.updateOne(
    { respondent_id: respondentId, materi_kunci: materiKunci, dibuka_pada: { $ne: null } },
    { $inc: { detik_baca: d } },
  );
}

// ---------- Kuis ----------

export interface SoalUntukResponden {
  kunci: string;
  teks: string;
  gambar: { id: string; alt: string } | null;
  pilihan: { kunci: string; teks: string }[];
}

export interface HasilJawab {
  soal_kunci: string;
  pilihan_kunci: string;
  benar: boolean;
  kunci_benar: string;
  penjelasan: string;
}

export const tanpaKunci = (s: DokSoal): SoalUntukResponden => ({
  kunci: s.kunci,
  teks: s.teks,
  gambar: s.gambar,
  pilihan: s.pilihan.map((p) => ({ kunci: p.kunci, teks: p.teks })),
});

export function hasilJawaban(percobaanDok: DokPercobaanKuis, soal: DokSoal[]): HasilJawab[] {
  const peta = new Map(soal.map((s) => [s.kunci, s]));
  return percobaanDok.jawaban.map((j) => {
    const s = peta.get(j.soal_kunci);
    return {
      soal_kunci: j.soal_kunci,
      pilihan_kunci: j.pilihan_kunci,
      benar: j.benar,
      kunci_benar: s?.pilihan.find((p) => p.benar)?.kunci ?? '',
      penjelasan: s?.penjelasan ?? '',
    };
  });
}

// Mengambil percobaan yang sedang berjalan, atau membuat percobaan baru.
export async function mulaiAtauLanjutPercobaan(a: RespondenAktif, struktur: StrukturVersi, materiKunci: string) {
  const r = await statusResponden(a, struktur);
  const s = r.daftar.find((d) => d.materi.kunci === materiKunci);
  if (!s || s.status === 'terkunci' || !s.materi.kuis) return null;
  const kuis = s.materi.kuis;
  const { percobaan } = await koleksi();
  const berjalan = await percobaan.findOne({ respondent_id: a.r._id, kuis_kunci: kuis.kunci, selesai_pada: null });
  if (berjalan) return berjalan;
  const soal = await ambilSoalKuis(struktur.versi._id, kuis.kunci);
  if (soal.length === 0) return null;
  const ke = (await percobaan.countDocuments({ respondent_id: a.r._id, kuis_kunci: kuis.kunci })) + 1;
  const dok: DokPercobaanKuis = {
    _id: new ObjectId(),
    respondent_id: a.r._id,
    kuis_kunci: kuis.kunci,
    materi_kunci: materiKunci,
    version_id: struktur.versi._id,
    percobaan_ke: ke,
    pertama: ke === 1,
    mode: kuis.mode,
    batas_lulus: kuis.batas_lulus,
    urutan_soal: soal.map((x) => x.kunci),
    mulai_pada: new Date(),
    selesai_pada: null,
    benar: 0,
    total: soal.length,
    skor: null,
    lulus: null,
    jawaban: [],
  };
  await percobaan.insertOne(dok);
  // Membuka kuis berarti materi sudah dibaca.
  await tandaiDibuka(a, struktur, materiKunci);
  return dok;
}

// Menyimpan satu jawaban. Jawaban tidak dapat diubah setelah dikirim.
export async function jawabSoal(a: RespondenAktif, percobaanId: ObjectId, soalKunci: string, pilihanKunci: string) {
  const { percobaan, soal, progres } = await koleksi();
  const p = await percobaan.findOne({ _id: percobaanId, respondent_id: a.r._id });
  if (!p) return { ok: false as const, pesan: 'Percobaan kuis tidak ditemukan.' };
  if (!p.urutan_soal.includes(soalKunci)) return { ok: false as const, pesan: 'Soal tidak ada di kuis ini.' };
  const s = await soal.findOne({ version_id: p.version_id, kunci: soalKunci });
  if (!s) return { ok: false as const, pesan: 'Soal tidak ditemukan.' };
  const lama = p.jawaban.find((j) => j.soal_kunci === soalKunci);
  if (lama || p.selesai_pada) {
    // Kiriman ulang (mis. koneksi putus lalu tersambung): kembalikan hasil yang sudah tersimpan.
    const j = lama ?? { pilihan_kunci: pilihanKunci, benar: false };
    return {
      ok: true as const,
      hasil: { soal_kunci: soalKunci, pilihan_kunci: j.pilihan_kunci, benar: j.benar, kunci_benar: s.pilihan.find((x) => x.benar)?.kunci ?? '', penjelasan: s.penjelasan },
      selesai: !!p.selesai_pada,
    };
  }
  const pilihan = s.pilihan.find((x) => x.kunci === pilihanKunci);
  if (!pilihan) return { ok: false as const, pesan: 'Pilihan jawaban tidak valid.' };
  const jawaban = { soal_id: s._id, soal_kunci: s.kunci, pilihan_kunci: pilihanKunci, benar: pilihan.benar, dijawab_pada: new Date() };
  const ubah = await percobaan.updateOne(
    { _id: p._id, selesai_pada: null, 'jawaban.soal_kunci': { $ne: soalKunci } },
    { $push: { jawaban }, $inc: { benar: pilihan.benar ? 1 : 0 } },
  );
  if (ubah.modifiedCount === 0) return { ok: false as const, pesan: 'Jawaban sudah tersimpan sebelumnya. Muat ulang halaman.' };

  let selesai = false;
  const sesudah = await percobaan.findOne({ _id: p._id });
  if (sesudah && sesudah.jawaban.length >= sesudah.total && !sesudah.selesai_pada) {
    const skor = Math.round((sesudah.benar / sesudah.total) * 100);
    const lulus = sesudah.mode === 'A' ? true : skor >= sesudah.batas_lulus;
    await percobaan.updateOne({ _id: p._id, selesai_pada: null }, { $set: { selesai_pada: new Date(), skor, lulus } });
    if (lulus) {
      await progres.updateOne(
        { respondent_id: a.r._id, materi_kunci: p.materi_kunci, selesai_pada: null },
        { $set: { selesai_pada: new Date(), versi_selesai_id: p.version_id } },
      );
    }
    selesai = true;
  }
  return {
    ok: true as const,
    hasil: { soal_kunci: soalKunci, pilihan_kunci: pilihanKunci, benar: pilihan.benar, kunci_benar: s.pilihan.find((x) => x.benar)?.kunci ?? '', penjelasan: s.penjelasan },
    selesai,
  };
}

// ---------- Tindakan admin ----------

export async function bukaKunciManual(respondentId: ObjectId, materiKunci: string, versionId: ObjectId, adminEmail: string, alasan: string, idPeserta: string) {
  if (alasan.trim().length < 5) return { ok: false as const, pesan: 'Tulis alasan membuka kunci (minimal 5 karakter).' };
  const { progres } = await koleksi();
  await progres.updateOne(
    { respondent_id: respondentId, materi_kunci: materiKunci },
    {
      $set: { buka_manual: { oleh: adminEmail, alasan: alasan.trim(), waktu: new Date() } },
      $setOnInsert: { _id: new ObjectId(), version_id: versionId, dibuka_pada: null, selesai_pada: null, versi_selesai_id: null, detik_baca: 0 },
    },
    { upsert: true },
  );
  await catatAudit({ admin: adminEmail, aksi: 'buka_kunci_manual', objek: `${idPeserta} · materi ${materiKunci}`, alasan: alasan.trim() });
  return { ok: true as const };
}
