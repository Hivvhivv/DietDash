// Monitoring progres untuk admin (PRD v2.0 Bagian 11). Semua tampilan memakai ID peserta sebagai identitas utama.
// Progres = keterlaksanaan intervensi (fidelity), bukan ukuran efektivitas.
import type { ObjectId } from 'mongodb';
import {
  koleksi,
  type DokPercobaanKuis,
  type DokPeserta,
  type DokProgresMateri,
  type DokResponden,
  type DokRiwayatAkun,
  type DokSoal,
} from './db';
import { samarkanNomorHp } from './identitas';
import { strukturAktif, type StrukturVersi } from './konten';
import { ambilPengaturan } from './pengaturan';
import { susunStatus, type RingkasanBelajar } from './progres';

const HARI = 86_400_000;

export type StatusAkun = 'aktif' | 'nonaktif' | 'mundur';
export type StatusBelajar = 'belum' | 'sedang' | 'selesai';

export interface BarisResponden {
  id: ObjectId;
  id_peserta: string;
  nama: string;
  nomor_samar: string;
  nomor_hp: string;
  status_akun: StatusAkun;
  status_sampel: DokPeserta['status_sampel'];
  status_belajar: StatusBelajar;
  dibuat_pada: Date;
  terakhir_aktif: Date;
  selesai: number;
  total: number;
  persen: number;
  materi_saat_ini: string; // "2.1 Apa itu diet DASH?" atau "Selesai"
  modul_saat_ini: number | null;
  tidak_aktif: boolean;
  hari_sejak_daftar: number;
  mendekati_batas: boolean;
  pretest_selesai: boolean;
  ringkasan: RingkasanBelajar | null;
}

interface DataMentah {
  struktur: StrukturVersi | null;
  responden: DokResponden[];
  peserta: DokPeserta[];
  progres: DokProgresMateri[];
  percobaan: DokPercobaanKuis[];
}

async function muatData(): Promise<DataMentah> {
  const k = await koleksi();
  const [struktur, responden, peserta, progres, percobaan] = await Promise.all([
    strukturAktif(),
    k.responden.find({}, { projection: { token_hash: 0 } }).sort({ dibuat_pada: 1 }).toArray(),
    k.peserta.find({}).toArray(),
    k.progres.find({}).toArray(),
    k.percobaan.find({}).toArray(),
  ]);
  return { struktur, responden: responden as DokResponden[], peserta, progres, percobaan };
}

function kelompok<T>(daftar: T[], kunci: (x: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const x of daftar) {
    const k = kunci(x);
    const ada = m.get(k);
    if (ada) ada.push(x);
    else m.set(k, [x]);
  }
  return m;
}

export async function daftarResponden(): Promise<{ baris: BarisResponden[]; struktur: StrukturVersi | null }> {
  const d = await muatData();
  const atur = await ambilPengaturan();
  const pesertaPer = new Map(d.peserta.map((p) => [p.respondent_id.toHexString(), p]));
  const progresPer = kelompok(d.progres, (x) => x.respondent_id.toHexString());
  const aktifPer = kelompok(d.percobaan.filter((x) => !x.selesai_pada), (x) => x.respondent_id.toHexString());
  const sekarang = Date.now();

  const baris = d.responden.flatMap((r) => {
    const id = r._id.toHexString();
    const p = pesertaPer.get(id);
    if (!p) return [];
    const ringkasan = d.struktur
      ? susunStatus(d.struktur, progresPer.get(id) ?? [], new Set((aktifPer.get(id) ?? []).map((x) => x.kuis_kunci)), atur.gerbang_pretest, !!p.pretest_selesai_pada)
      : null;
    const selesai = ringkasan?.selesai ?? 0;
    const total = ringkasan?.total ?? 0;
    const sedang = ringkasan?.daftar.find((x) => x.status !== 'selesai');
    const hari = Math.floor((sekarang - r.dibuat_pada.getTime()) / HARI);
    const statusBelajar: StatusBelajar = total && selesai >= total ? 'selesai' : (progresPer.get(id)?.some((x) => x.dibuka_pada) ? 'sedang' : 'belum');
    const b: BarisResponden = {
      id: r._id,
      id_peserta: p.id_peserta,
      nama: r.nama,
      nomor_samar: samarkanNomorHp(r.nomor_hp),
      nomor_hp: r.nomor_hp,
      status_akun: r.mundur_pada ? 'mundur' : r.aktif ? 'aktif' : 'nonaktif',
      status_sampel: p.status_sampel,
      status_belajar: statusBelajar,
      dibuat_pada: r.dibuat_pada,
      terakhir_aktif: r.terakhir_aktif,
      selesai,
      total,
      persen: total ? Math.round((selesai / total) * 100) : 0,
      materi_saat_ini: statusBelajar === 'selesai' ? 'Selesai' : sedang ? `${sedang.materi.nomor} ${sedang.materi.judul}` : '—',
      modul_saat_ini: statusBelajar === 'selesai' ? null : (sedang?.materi.modul.nomor ?? null),
      tidak_aktif: r.aktif && sekarang - r.terakhir_aktif.getTime() > atur.batas_tidak_aktif_hari * HARI,
      hari_sejak_daftar: hari,
      mendekati_batas: r.aktif && statusBelajar !== 'selesai' && hari >= atur.batas_intervensi_hari - 2,
      pretest_selesai: !!p.pretest_selesai_pada,
      ringkasan,
    };
    return [b];
  });
  return { baris, struktur: d.struktur };
}

// ---------- Dashboard keseluruhan (11.1) ----------

export async function ringkasanDashboard() {
  const { baris, struktur } = await daftarResponden();
  const atur = await ambilPengaturan();
  const k = await koleksi();
  const sekarang = Date.now();
  const sampel = baris.filter((b) => b.status_sampel === 'responden_penelitian');
  const kartu = {
    total: baris.length,
    baru7: baris.filter((b) => sekarang - b.dibuat_pada.getTime() <= 7 * HARI).length,
    pendaftaran_dibuka: atur.pendaftaran_dibuka,
    sampel: sampel.length,
    bukan_sampel: baris.length - sampel.length,
    belum: sampel.filter((b) => b.status_belajar === 'belum').length,
    sedang: sampel.filter((b) => b.status_belajar === 'sedang').length,
    selesai: sampel.filter((b) => b.status_belajar === 'selesai').length,
    tidak_aktif: sampel.filter((b) => b.tidak_aktif).length,
    rata_persen: sampel.length ? Math.round(sampel.reduce((n, b) => n + b.persen, 0) / sampel.length) : 0,
    batas_tidak_aktif_hari: atur.batas_tidak_aktif_hari,
  };

  const perMateri = (struktur?.materi ?? []).map((m) => {
    const n = sampel.filter((b) => b.ringkasan?.daftar.find((d) => d.materi.kunci === m.kunci)?.status === 'selesai').length;
    return { nomor: m.nomor, judul: m.judul, kunci: m.kunci, selesai: n, persen: sampel.length ? Math.round((n / sampel.length) * 100) : 0 };
  });

  // Analisis kuis per materi: percobaan pertama responden penelitian.
  const idSampel = new Set(sampel.map((b) => b.id.toHexString()));
  const semuaPercobaan = (await k.percobaan.find({ selesai_pada: { $ne: null } }).toArray()).filter((x) => idSampel.has(x.respondent_id.toHexString()));
  const soalAktif = struktur ? await k.soal.find({ version_id: struktur.versi._id }).toArray() : [];
  const analisis = (struktur?.materi ?? []).map((m) => {
    const milik = semuaPercobaan.filter((x) => x.materi_kunci === m.kunci);
    const pertama = milik.filter((x) => x.pertama);
    const per = kelompok(milik, (x) => x.respondent_id.toHexString());
    const soalKuis = soalAktif.filter((s) => s.kuis_kunci === m.kuis?.kunci).sort((a, b) => a.urutan - b.urutan);
    const perSoal = soalKuis.map((s, i) => {
      const jawab = pertama.flatMap((x) => x.jawaban.filter((j) => j.soal_kunci === s.kunci));
      const benar = jawab.filter((j) => j.benar).length;
      const persen = jawab.length ? Math.round((benar / jawab.length) * 100) : null;
      return { nomor: i + 1, teks: s.teks, dijawab: jawab.length, persen, tinjau: persen !== null && jawab.length >= 3 && persen < 50 };
    });
    return {
      nomor: m.nomor,
      judul: m.judul,
      jumlah_pertama: pertama.length,
      rata_skor_pertama: pertama.length ? Math.round(pertama.reduce((n, x) => n + (x.skor ?? 0), 0) / pertama.length) : null,
      rata_percobaan: per.size ? Math.round((milik.length / per.size) * 10) / 10 : null,
      soal: perSoal,
    };
  });

  const perhatian = sampel.filter((b) => b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas));
  return { kartu, perMateri, analisis, perhatian, struktur, atur };
}

// ---------- Detail per responden (11.2) ----------

export async function detailResponden(idPeserta: string) {
  const k = await koleksi();
  const p = await k.peserta.findOne({ id_peserta: idPeserta });
  if (!p) return null;
  const r = await k.responden.findOne({ _id: p.respondent_id }, { projection: { token_hash: 0 } });
  if (!r) return null;
  const atur = await ambilPengaturan();
  const struktur = await strukturAktif();
  const [progres, percobaan, riwayat] = await Promise.all([
    k.progres.find({ respondent_id: r._id }).toArray(),
    k.percobaan.find({ respondent_id: r._id }).sort({ mulai_pada: 1 }).toArray(),
    k.riwayatAkun.find({ respondent_id: r._id }).sort({ waktu: -1 }).toArray(),
  ]);
  const ringkasan = struktur
    ? susunStatus(struktur, progres, new Set(percobaan.filter((x) => !x.selesai_pada).map((x) => x.kuis_kunci)), atur.gerbang_pretest, !!p.pretest_selesai_pada)
    : null;

  // Soal dibaca dari versi yang dipakai saat percobaan, agar sesuai yang benar-benar dilihat responden.
  const soal: DokSoal[] = percobaan.length
    ? await k.soal.find({ version_id: { $in: percobaan.map((x) => x.version_id) } }).toArray()
    : [];
  const cariSoal = (versi: ObjectId, kunci: string) => soal.find((s) => s.version_id.equals(versi) && s.kunci === kunci);
  const versiPetaLabel = new Map(
    (await k.versi.find({ _id: { $in: [...progres.map((x) => x.version_id), ...percobaan.map((x) => x.version_id)] } }).toArray()).map((v) => [v._id.toHexString(), v.label]),
  );

  const garisWaktu = (struktur?.materi ?? []).map((m) => {
    const pr = progres.find((x) => x.materi_kunci === m.kunci) ?? null;
    const milik = percobaan.filter((x) => x.materi_kunci === m.kunci);
    const selesaiSemua = milik.filter((x) => x.selesai_pada);
    return {
      materi: m,
      status: ringkasan?.daftar.find((d) => d.materi.kunci === m.kunci)?.status ?? 'terkunci',
      dibuka_pada: pr?.dibuka_pada ?? null,
      selesai_pada: pr?.selesai_pada ?? null,
      detik_baca: pr?.detik_baca ?? 0,
      jumlah_percobaan: milik.length,
      skor_pertama: milik.find((x) => x.pertama)?.skor ?? null,
      skor_terbaik: selesaiSemua.length ? Math.max(...selesaiSemua.map((x) => x.skor ?? 0)) : null,
      buka_manual: pr?.buka_manual ?? null,
      versi: pr ? versiPetaLabel.get(pr.version_id.toHexString()) ?? '—' : '—',
      percobaan: milik.map((x) => ({
        ...x,
        versi_label: versiPetaLabel.get(x.version_id.toHexString()) ?? '—',
        rincian: x.jawaban.map((j) => {
          const s = cariSoal(x.version_id, j.soal_kunci);
          return {
            soal: s?.teks ?? '(soal tidak ditemukan)',
            dipilih: s?.pilihan.find((o) => o.kunci === j.pilihan_kunci)?.teks ?? j.pilihan_kunci,
            benar: j.benar,
            dijawab_pada: j.dijawab_pada,
          };
        }),
      })),
    };
  });
  return { r: r as DokResponden, p, ringkasan, garisWaktu, riwayat: riwayat as DokRiwayatAkun[], struktur, atur };
}

// ---------- Ekspor (11.3) ----------

export type JenisEkspor = 'ringkasan' | 'progres' | 'jawaban';

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : '');

export async function dataEkspor(jenis: JenisEkspor, semua: boolean) {
  const { baris, struktur } = await daftarResponden();
  const dipilih = semua ? baris : baris.filter((b) => b.status_sampel === 'responden_penelitian');
  const k = await koleksi();
  const label = struktur?.versi.label ?? 'tanpa-versi';

  if (jenis === 'ringkasan') {
    const progres = await k.progres.find({}).toArray();
    const percobaan = await k.percobaan.find({ pertama: true, selesai_pada: { $ne: null } }).toArray();
    const kepala = ['id_peserta', 'status_sampel', 'status_akun', 'status_belajar', 'tanggal_daftar', 'terakhir_aktif', 'materi_selesai', 'total_materi', 'persen_selesai', 'materi_saat_ini', 'total_detik_baca', 'rata_skor_percobaan_pertama', 'pretest_selesai', 'versi_konten_aktif'];
    const isi = dipilih.map((b) => {
      const pr = progres.filter((x) => x.respondent_id.equals(b.id));
      const pc = percobaan.filter((x) => x.respondent_id.equals(b.id));
      return [
        b.id_peserta, b.status_sampel, b.status_akun, b.status_belajar, iso(b.dibuat_pada), iso(b.terakhir_aktif),
        b.selesai, b.total, b.persen, b.materi_saat_ini.split(' ')[0], pr.reduce((n, x) => n + x.detik_baca, 0),
        pc.length ? Math.round(pc.reduce((n, x) => n + (x.skor ?? 0), 0) / pc.length) : '', b.pretest_selesai ? 'ya' : 'tidak', label,
      ];
    });
    return { label, baris: [kepala, ...isi] };
  }

  if (jenis === 'progres') {
    const progres = await k.progres.find({}).toArray();
    const percobaan = await k.percobaan.find({}).toArray();
    const versi = new Map((await k.versi.find({}).toArray()).map((v) => [v._id.toHexString(), v.label]));
    const kepala = ['id_peserta', 'nomor_materi', 'judul_materi', 'status', 'dibuka_pada', 'selesai_pada', 'detik_baca', 'jumlah_percobaan', 'skor_percobaan_pertama', 'skor_terbaik', 'versi_konten', 'dibuka_manual_alasan'];
    const isi = dipilih.flatMap((b) =>
      (struktur?.materi ?? []).map((m) => {
        const pr = progres.find((x) => x.respondent_id.equals(b.id) && x.materi_kunci === m.kunci);
        const pc = percobaan.filter((x) => x.respondent_id.equals(b.id) && x.materi_kunci === m.kunci);
        const selesai = pc.filter((x) => x.selesai_pada);
        return [
          b.id_peserta, m.nomor, m.judul, b.ringkasan?.daftar.find((d) => d.materi.kunci === m.kunci)?.status ?? '',
          iso(pr?.dibuka_pada), iso(pr?.selesai_pada), pr?.detik_baca ?? 0, pc.length,
          pc.find((x) => x.pertama)?.skor ?? '', selesai.length ? Math.max(...selesai.map((x) => x.skor ?? 0)) : '',
          pr ? versi.get(pr.version_id.toHexString()) ?? '' : '', pr?.buka_manual?.alasan ?? '',
        ];
      }),
    );
    return { label, baris: [kepala, ...isi] };
  }

  const percobaan = await k.percobaan.find({ respondent_id: { $in: dipilih.map((b) => b.id) } }).sort({ mulai_pada: 1 }).toArray();
  const idVersi = [...new Map(percobaan.map((x) => [x.version_id.toHexString(), x.version_id])).values()];
  const soal = idVersi.length ? await k.soal.find({ version_id: { $in: idVersi } }).toArray() : [];
  const versi = new Map((await k.versi.find({}).toArray()).map((v) => [v._id.toHexString(), v.label]));
  const nomorMateri = new Map((struktur?.materi ?? []).map((m) => [m.kunci, m.nomor]));
  const idPer = new Map(dipilih.map((b) => [b.id.toHexString(), b.id_peserta]));
  const kepala = ['id_peserta', 'nomor_materi', 'percobaan_ke', 'percobaan_pertama', 'mode', 'nomor_soal', 'teks_soal', 'jawaban_dipilih', 'benar', 'dijawab_pada', 'skor_percobaan', 'versi_konten'];
  const isi = percobaan.flatMap((x) =>
    x.jawaban.map((j) => {
      const s = soal.find((q) => q.version_id.equals(x.version_id) && q.kunci === j.soal_kunci);
      return [
        idPer.get(x.respondent_id.toHexString()) ?? '', nomorMateri.get(x.materi_kunci) ?? x.materi_kunci, x.percobaan_ke,
        x.pertama ? 'ya' : 'tidak', x.mode, x.urutan_soal.indexOf(j.soal_kunci) + 1, s?.teks ?? '',
        s?.pilihan.find((o) => o.kunci === j.pilihan_kunci)?.teks ?? '', j.benar ? 'ya' : 'tidak', iso(j.dijawab_pada),
        x.skor ?? '', versi.get(x.version_id.toHexString()) ?? '',
      ];
    }),
  );
  return { label, baris: [kepala, ...isi] };
}
