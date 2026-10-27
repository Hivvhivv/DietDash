// Monitoring progres untuk admin (PRD v2.0 Bagian 11). Semua tampilan memakai ID peserta sebagai identitas utama.
// Progres = keterlaksanaan intervensi (fidelity), bukan ukuran efektivitas. Materi selesai = sudah dibuka (tanpa kuis).
import type { ObjectId } from 'mongodb';
import { koleksi, type DokPeserta, type DokProgresMateri, type DokResponden, type DokRiwayatAkun } from './db';
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
  posttest_selesai: boolean;
  ringkasan: RingkasanBelajar | null;
}

interface DataMentah {
  struktur: StrukturVersi | null;
  responden: DokResponden[];
  peserta: DokPeserta[];
  progres: DokProgresMateri[];
}

async function muatData(): Promise<DataMentah> {
  const k = await koleksi();
  const [struktur, responden, peserta, progres] = await Promise.all([
    strukturAktif(),
    k.responden.find({}, { projection: { token_hash: 0, kode_terenkripsi: 0 } }).sort({ dibuat_pada: 1 }).toArray(),
    k.peserta.find({}).toArray(),
    k.progres.find({}).toArray(),
  ]);
  return { struktur, responden: responden as DokResponden[], peserta, progres };
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
  const sekarang = Date.now();

  const baris = d.responden.flatMap((r) => {
    const id = r._id.toHexString();
    const p = pesertaPer.get(id);
    if (!p) return [];
    const ringkasan = d.struktur ? susunStatus(d.struktur, progresPer.get(id) ?? [], atur.gerbang_pretest, !!p.pretest_selesai_pada) : null;
    const selesai = ringkasan?.selesai ?? 0;
    const total = ringkasan?.total ?? 0;
    const berikut = ringkasan?.daftar.find((x) => x.status !== 'selesai');
    const hari = Math.floor((sekarang - r.dibuat_pada.getTime()) / HARI);
    const statusBelajar: StatusBelajar = total && selesai >= total ? 'selesai' : selesai > 0 ? 'sedang' : 'belum';
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
      materi_saat_ini: statusBelajar === 'selesai' ? 'Selesai' : berikut ? `${berikut.materi.nomor} ${berikut.materi.judul}` : '—',
      modul_saat_ini: statusBelajar === 'selesai' ? null : (berikut?.materi.modul.nomor ?? null),
      tidak_aktif: r.aktif && sekarang - r.terakhir_aktif.getTime() > atur.batas_tidak_aktif_hari * HARI,
      hari_sejak_daftar: hari,
      mendekati_batas: r.aktif && statusBelajar !== 'selesai' && hari >= atur.batas_intervensi_hari - 2,
      pretest_selesai: !!p.pretest_selesai_pada,
      posttest_selesai: !!p.posttest_selesai_pada,
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
    const milik = sampel.map((b) => b.ringkasan?.daftar.find((d) => d.materi.kunci === m.kunci)).filter((d) => d?.status === 'selesai');
    const detik = milik.map((d) => d?.progres?.detik_baca ?? 0);
    return {
      nomor: m.nomor,
      judul: m.judul,
      kunci: m.kunci,
      selesai: milik.length,
      persen: sampel.length ? Math.round((milik.length / sampel.length) * 100) : 0,
      rata_menit_baca: detik.length ? Math.round(detik.reduce((n, x) => n + x, 0) / detik.length / 6) / 10 : null,
    };
  });

  const perhatian = sampel.filter((b) => b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas));
  return { kartu, perMateri, perhatian, struktur, atur, baris };
}

// ---------- Detail per responden (11.2) ----------

export async function detailResponden(idPeserta: string) {
  const k = await koleksi();
  const p = await k.peserta.findOne({ id_peserta: idPeserta });
  if (!p) return null;
  const r = await k.responden.findOne({ _id: p.respondent_id }, { projection: { token_hash: 0, kode_terenkripsi: 0 } });
  if (!r) return null;
  const atur = await ambilPengaturan();
  const struktur = await strukturAktif();
  const [progres, riwayat] = await Promise.all([
    k.progres.find({ respondent_id: r._id }).toArray(),
    k.riwayatAkun.find({ respondent_id: r._id }).sort({ waktu: -1 }).toArray(),
  ]);
  const ringkasan = struktur ? susunStatus(struktur, progres, atur.gerbang_pretest, !!p.pretest_selesai_pada) : null;
  const versiPetaLabel = new Map(
    (await k.versi.find({ _id: { $in: progres.map((x) => x.version_id) } }).toArray()).map((v) => [v._id.toHexString(), v.label]),
  );

  const garisWaktu = (struktur?.materi ?? []).map((m) => {
    const pr = progres.find((x) => x.materi_kunci === m.kunci) ?? null;
    return {
      materi: m,
      status: ringkasan?.daftar.find((d) => d.materi.kunci === m.kunci)?.status ?? 'terkunci',
      dibuka_pada: pr?.dibuka_pada ?? null,
      selesai_pada: pr?.selesai_pada ?? pr?.dibuka_pada ?? null,
      detik_baca: pr?.detik_baca ?? 0,
      buka_manual: pr?.buka_manual ?? null,
      versi: pr ? (versiPetaLabel.get(pr.version_id.toHexString()) ?? '—') : '—',
    };
  });
  const modul = (struktur?.modul ?? []).map((md) => {
    const milik = garisWaktu.filter((g) => g.materi.modul.kunci === md.kunci);
    const selesai = milik.filter((g) => g.status === 'selesai').length;
    const terakhir = milik.reduce<Date | null>((t, g) => (g.dibuka_pada && (!t || g.dibuka_pada > t) ? g.dibuka_pada : t), null);
    const status: StatusModul =
      milik.length && selesai === milik.length ? 'selesai' : selesai > 0 ? 'sedang' : milik.some((g) => g.status === 'tersedia') ? 'tersedia' : 'terkunci';
    return {
      kunci: md.kunci,
      nomor: md.nomor,
      judul: md.judul,
      selesai,
      total: milik.length,
      persen: milik.length ? Math.round((selesai / milik.length) * 100) : 0,
      status,
      detik_baca: milik.reduce((n, g) => n + g.detik_baca, 0),
      menit: milik.reduce((n, g) => n + g.materi.menit, 0),
      terakhir_dibuka: terakhir,
    };
  });
  return {
    r: r as DokResponden,
    p,
    ringkasan,
    garisWaktu,
    modul,
    totalDetik: progres.reduce((n, x) => n + x.detik_baca, 0),
    hariKe: Math.floor((Date.now() - r.dibuat_pada.getTime()) / HARI) + 1,
    riwayat: riwayat as DokRiwayatAkun[],
    struktur,
    atur,
  };
}

export const LABEL_RIWAYAT: Record<string, string> = {
  token_dibuat: 'Kode akses dibuat',
  token_diganti_responden: 'Kode akses diganti responden',
  token_direset_admin: 'Kode akses dibuat ulang oleh admin',
  dibuat_admin: 'Akun dibuat oleh super admin',
  nomor_diganti: 'Nomor HP diganti',
  nama_diganti: 'Nama diganti',
  mengundurkan_diri: 'Mengundurkan diri',
  dinonaktifkan: 'Akun dinonaktifkan',
  diaktifkan: 'Akun diaktifkan',
};

// Status modul untuk detail responden: selesai = semua materi dibuka; sedang = sebagian; tersedia = materi pertamanya terbuka.
export type StatusModul = 'selesai' | 'sedang' | 'tersedia' | 'terkunci';
export type DetailResponden = NonNullable<Awaited<ReturnType<typeof detailResponden>>>;

// ---------- Ekspor (11.3) ----------

export type JenisEkspor = 'ringkasan' | 'progres';

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : '');

export async function dataEkspor(jenis: JenisEkspor, semua: boolean) {
  const { baris, struktur } = await daftarResponden();
  const dipilih = semua ? baris : baris.filter((b) => b.status_sampel === 'responden_penelitian');
  const k = await koleksi();
  const label = struktur?.versi.label ?? 'tanpa-versi';
  const progres = await k.progres.find({}).toArray();

  if (jenis === 'ringkasan') {
    const kepala = ['id_peserta', 'status_sampel', 'status_akun', 'status_belajar', 'tanggal_daftar', 'terakhir_aktif', 'materi_selesai', 'total_materi', 'persen_selesai', 'materi_berikutnya', 'total_detik_baca', 'pretest_selesai', 'posttest_selesai', 'versi_konten_aktif'];
    const isi = dipilih.map((b) => {
      const pr = progres.filter((x) => x.respondent_id.equals(b.id));
      return [
        b.id_peserta, b.status_sampel, b.status_akun, b.status_belajar, iso(b.dibuat_pada), iso(b.terakhir_aktif),
        b.selesai, b.total, b.persen, b.materi_saat_ini.split(' ')[0], pr.reduce((n, x) => n + x.detik_baca, 0),
        b.pretest_selesai ? 'ya' : 'tidak', b.posttest_selesai ? 'ya' : 'tidak', label,
      ];
    });
    return { label, baris: [kepala, ...isi] };
  }

  const versi = new Map((await k.versi.find({}).toArray()).map((v) => [v._id.toHexString(), v.label]));
  const kepala = ['id_peserta', 'nomor_materi', 'judul_materi', 'status', 'dibuka_pada', 'detik_baca', 'versi_konten', 'dibuka_manual_alasan'];
  const isi = dipilih.flatMap((b) =>
    (struktur?.materi ?? []).map((m) => {
      const pr = progres.find((x) => x.respondent_id.equals(b.id) && x.materi_kunci === m.kunci);
      return [
        b.id_peserta, m.nomor, m.judul, b.ringkasan?.daftar.find((d) => d.materi.kunci === m.kunci)?.status ?? '',
        iso(pr?.dibuka_pada), pr?.detik_baca ?? 0, pr ? (versi.get(pr.version_id.toHexString()) ?? '') : '', pr?.buka_manual?.alasan ?? '',
      ];
    }),
  );
  return { label, baris: [kepala, ...isi] };
}
