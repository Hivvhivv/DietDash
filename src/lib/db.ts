// Koneksi dan model data MongoDB (hanya di server). Mengikuti PRD v2.0 Bagian 12.
// Data identitas (respondents) dipisah dari data belajar; keduanya terhubung lewat ID internal,
// dan analisis memakai ID peserta (participants.id_peserta).
import { MongoClient, ObjectId, type Db } from 'mongodb';
import { KOLEKSI, pastikanIndeks } from './indeks';
import type { NamaIlustrasi } from './skema';

// ---------- Akun responden ----------

export interface DokResponden {
  _id: ObjectId;
  nama: string;
  nomor_hp: string; // format seragam +628…
  token_hash: string;
  token_disimpan_pada: Date | null; // null = belum mencentang "Saya sudah menyimpan token"
  nomor_terverifikasi_pada: Date | null; // disiapkan untuk fase OTP
  aktif: boolean;
  persetujuan_pada: Date;
  kelayakan_pada: Date | null;
  mundur_pada: Date | null;
  dibuat_pada: Date;
  terakhir_aktif: Date;
}

export type StatusSampel = 'responden_penelitian' | 'bukan_sampel';

export interface DokPeserta {
  _id: ObjectId;
  respondent_id: ObjectId;
  id_peserta: string; // mis. DS-4827
  status_sampel: StatusSampel;
  pretest_selesai_pada: Date | null; // dipakai bila gerbang pretest diaktifkan
}

export type JenisRiwayatAkun =
  | 'token_dibuat'
  | 'token_diganti_responden'
  | 'token_direset_admin'
  | 'nomor_diganti'
  | 'nama_diganti'
  | 'mengundurkan_diri'
  | 'dinonaktifkan'
  | 'diaktifkan';

export interface DokRiwayatAkun {
  _id: ObjectId;
  respondent_id: ObjectId;
  jenis: JenisRiwayatAkun;
  oleh: string; // 'responden' atau email admin
  alasan?: string;
  waktu: Date;
}

// ---------- Admin ----------

export type PeranAdmin = 'admin' | 'super_admin';

export interface DokAdmin {
  _id: ObjectId;
  email: string;
  nama: string;
  password_hash: string;
  totp_rahasia: string | null; // base32; null = belum mengatur 2FA
  totp_aktif: boolean;
  peran: PeranAdmin;
  aktif: boolean;
  dibuat_pada: Date;
}

export interface DokUndanganAdmin {
  _id: ObjectId;
  email: string;
  peran: PeranAdmin;
  token_hash: string;
  dibuat_oleh: string;
  kedaluwarsa_pada: Date;
  dipakai_pada: Date | null;
}

export interface DokSesi {
  _id: ObjectId;
  token_hash: string;
  pemilik_id: ObjectId;
  jenis_pemilik: 'responden' | 'admin';
  tahap: 'penuh' | 'sandi'; // admin: 'sandi' = kata sandi benar, menunggu 2FA
  ingat: boolean;
  dibuat_pada: Date;
  terakhir_aktif: Date;
  kedaluwarsa_pada: Date;
}

export interface DokPengaturan {
  _id: 'utama';
  pendaftaran_dibuka: boolean;
  batas_tidak_aktif_hari: number;
  batas_intervensi_hari: number;
  wajib_pernyataan_kelayakan: boolean;
  gerbang_pretest: boolean;
  mode_kuis_bawaan: 'A' | 'B';
  batas_lulus_bawaan: number;
  nomor_whatsapp_peneliti: string;
  versi_aktif_id: ObjectId | null;
  diubah_pada: Date;
  diubah_oleh: string;
}

// ---------- Konten ----------

export type StatusVersi = 'draf' | 'siap_ditinjau' | 'terbit' | 'dikunci' | 'arsip';

export interface DokVersi {
  _id: ObjectId;
  label: string;
  status: StatusVersi;
  jenis: 'biasa' | 'perbaikan';
  dasar_id: ObjectId | null;
  alasan?: string;
  dibuat_oleh: string;
  dibuat_pada: Date;
  diubah_pada: Date;
  ditandai_siap_oleh?: string;
  ditandai_siap_pada?: Date;
  diterbitkan_oleh?: string;
  diterbitkan_pada?: Date;
  dikunci_oleh?: string;
  dikunci_pada?: Date;
  contoh?: boolean; // konten contoh dari skrip benih; tidak boleh dikunci, dapat dihapus super admin
}

export type GambarModul =
  | { jenis: 'bawaan'; nama: NamaIlustrasi; alt: string }
  | { jenis: 'unggah'; id: string; alt: string };

export interface DokModul {
  _id: ObjectId;
  version_id: ObjectId;
  kunci: string; // tetap sama di semua versi
  urutan: number;
  judul: string;
  deskripsi: string;
  tujuan: string[];
  gambar: GambarModul;
  diarsipkan: boolean;
}

export interface DokMateri {
  _id: ObjectId;
  version_id: ObjectId;
  kunci: string;
  modul_kunci: string;
  urutan: number;
  judul: string;
  tujuan: string[];
  isi: string; // Markdown + blok khusus
  poin_penting: string[];
  rangkuman: string;
  estimasi_menit: number | null; // null = dihitung otomatis
  sumber: string[];
  diarsipkan: boolean;
}

export interface DokKuis {
  _id: ObjectId;
  version_id: ObjectId;
  kunci: string;
  materi_kunci: string;
  judul: string;
  petunjuk: string;
  mode: 'A' | 'B';
  batas_lulus: number; // persen, dipakai pada Mode B
}

export interface PilihanSoal {
  kunci: string;
  teks: string;
  benar: boolean;
}

export interface DokSoal {
  _id: ObjectId;
  version_id: ObjectId;
  kunci: string;
  kuis_kunci: string;
  urutan: number;
  teks: string;
  gambar: { id: string; alt: string } | null;
  penjelasan: string;
  pilihan: PilihanSoal[];
}

// ---------- Progres ----------

export interface DokProgresMateri {
  _id: ObjectId;
  respondent_id: ObjectId;
  materi_kunci: string;
  version_id: ObjectId; // versi saat pertama dibuka
  dibuka_pada: Date | null;
  selesai_pada: Date | null; // kuis selesai sesuai aturan
  versi_selesai_id: ObjectId | null;
  detik_baca: number;
  buka_manual: { oleh: string; alasan: string; waktu: Date } | null;
}

export interface JawabanPercobaan {
  soal_id: ObjectId;
  soal_kunci: string;
  pilihan_kunci: string;
  benar: boolean;
  dijawab_pada: Date;
}

export interface DokPercobaanKuis {
  _id: ObjectId;
  respondent_id: ObjectId;
  kuis_kunci: string;
  materi_kunci: string;
  version_id: ObjectId;
  percobaan_ke: number;
  pertama: boolean;
  mode: 'A' | 'B';
  batas_lulus: number;
  urutan_soal: string[]; // kunci soal sesuai urutan saat percobaan dimulai
  mulai_pada: Date;
  selesai_pada: Date | null;
  benar: number;
  total: number;
  skor: number | null; // persen
  lulus: boolean | null;
  jawaban: JawabanPercobaan[];
}

// ---------- Lain-lain ----------

export interface DokPercobaanLogin {
  _id: ObjectId;
  kunci: string;
  waktu: Date;
}

export interface DokLogAudit {
  _id: ObjectId;
  waktu: Date;
  admin: string;
  aksi: string;
  objek?: string;
  alasan?: string;
  keterangan?: string;
}

const globalUntukMongo = globalThis as unknown as {
  _klienMongo?: Promise<MongoClient>;
  _indeksMongo?: Promise<void>;
};

function klien(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI belum diatur. Isi di .env.local (lihat README).');
  // Disimpan di globalThis agar hot reload saat pengembangan tidak membuka koneksi baru terus.
  globalUntukMongo._klienMongo ??= new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    appName: 'dash-sehat',
  }).connect();
  return globalUntukMongo._klienMongo;
}

export async function ambilKlien(): Promise<MongoClient> {
  return klien();
}

export async function ambilDb(): Promise<Db> {
  const namaDb = process.env.MONGODB_DB;
  if (!namaDb) throw new Error('MONGODB_DB belum diatur. Isi di .env.local (lihat README).');
  const db = (await klien()).db(namaDb);
  globalUntukMongo._indeksMongo ??= pastikanIndeks(db);
  await globalUntukMongo._indeksMongo;
  return db;
}

export async function koleksi() {
  const db = await ambilDb();
  return {
    responden: db.collection<DokResponden>(KOLEKSI.responden),
    peserta: db.collection<DokPeserta>(KOLEKSI.peserta),
    riwayatAkun: db.collection<DokRiwayatAkun>(KOLEKSI.riwayatAkun),
    admin: db.collection<DokAdmin>(KOLEKSI.admin),
    undangan: db.collection<DokUndanganAdmin>(KOLEKSI.undangan),
    sesi: db.collection<DokSesi>(KOLEKSI.sesi),
    pengaturan: db.collection<DokPengaturan>(KOLEKSI.pengaturan),
    versi: db.collection<DokVersi>(KOLEKSI.versi),
    modul: db.collection<DokModul>(KOLEKSI.modul),
    materi: db.collection<DokMateri>(KOLEKSI.materi),
    kuis: db.collection<DokKuis>(KOLEKSI.kuis),
    soal: db.collection<DokSoal>(KOLEKSI.soal),
    progres: db.collection<DokProgresMateri>(KOLEKSI.progres),
    percobaan: db.collection<DokPercobaanKuis>(KOLEKSI.percobaan),
    percobaanLogin: db.collection<DokPercobaanLogin>(KOLEKSI.percobaanLogin),
    logAudit: db.collection<DokLogAudit>(KOLEKSI.logAudit),
  };
}

export type Koleksi = Awaited<ReturnType<typeof koleksi>>;

// Log aktivitas admin: hanya tambah, tidak pernah diubah atau dihapus.
export async function catatAudit(entri: Omit<DokLogAudit, '_id' | 'waktu'>): Promise<void> {
  const { logAudit } = await koleksi();
  await logAudit.insertOne({ _id: new ObjectId(), waktu: new Date(), ...entri });
}

export function keObjectId(id: string): ObjectId | null {
  return /^[a-f0-9]{24}$/i.test(id) ? new ObjectId(id) : null;
}
