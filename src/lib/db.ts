// Koneksi MongoDB (hanya di server). Satu klien dipakai ulang selama proses berjalan.
import { MongoClient, ObjectId, type Db } from 'mongodb';
import { KOLEKSI, pastikanIndeks } from './indeks';
import type { DataModul, PeranAdmin, StatusVersi } from './skema';

export interface DokVersiModul {
  _id: ObjectId;
  modul_id: string;
  versi: string;
  status: StatusVersi;
  data: DataModul;
  isi: string;
  catatan: string;
  dibuat_oleh: string;
  dibuat_pada: Date;
  diubah_pada: Date;
  disetujui_oleh?: string;
  disetujui_pada?: Date;
}

export interface DokAdmin {
  _id: ObjectId;
  username: string;
  password_hash: string;
  peran: PeranAdmin;
  aktif: boolean;
  dibuat_pada: Date;
}

export interface DokSesi {
  _id: ObjectId;
  token_hash: string;
  admin_id: ObjectId;
  dibuat_pada: Date;
  kedaluwarsa: Date;
}

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
  modul_id?: string;
  versi?: string;
  keterangan?: string;
}

// ---------- Peserta (akun belajar) ----------

export interface DokPeserta {
  _id: ObjectId;
  email: string; // huruf kecil
  password_hash: string;
  dibuat_pada: Date;
  terakhir_masuk?: Date;
  setuju_privasi_pada: Date;
  versi_kebijakan: string;
}

export interface DokSesiPeserta {
  _id: ObjectId;
  token_hash: string;
  peserta_id: ObjectId;
  dibuat_pada: Date;
  kedaluwarsa: Date;
}

export interface DokProgres {
  _id: ObjectId;
  peserta_id: ObjectId;
  modul_id: string;
  materi: number;
  versi_modul: string;
  pertama_dibuka: Date;
  terakhir_dibuka: Date;
  jumlah_buka: number;
}

export interface DokHasilLatihan {
  _id: ObjectId;
  peserta_id: ObjectId;
  modul_id: string; // 'semua' untuk kuis lengkap
  benar: number;
  total: number;
  versi_kuis: string;
  waktu: Date;
}

export interface DokTokenReset {
  _id: ObjectId;
  token_hash: string;
  peserta_id: ObjectId;
  dibuat_oleh: string;
  kedaluwarsa: Date;
}

const globalUntukMongo = globalThis as unknown as {
  _klienMongo?: Promise<MongoClient>;
  _indeksMongo?: Promise<void>;
};

function klien(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI belum diatur. Isi di .env.local (lihat README).');
  }
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
    modulVersi: db.collection<DokVersiModul>(KOLEKSI.modulVersi),
    admin: db.collection<DokAdmin>(KOLEKSI.admin),
    sesi: db.collection<DokSesi>(KOLEKSI.sesi),
    percobaanLogin: db.collection<DokPercobaanLogin>(KOLEKSI.percobaanLogin),
    logAudit: db.collection<DokLogAudit>(KOLEKSI.logAudit),
    peserta: db.collection<DokPeserta>(KOLEKSI.peserta),
    sesiPeserta: db.collection<DokSesiPeserta>(KOLEKSI.sesiPeserta),
    progres: db.collection<DokProgres>(KOLEKSI.progres),
    hasilLatihan: db.collection<DokHasilLatihan>(KOLEKSI.hasilLatihan),
    tokenReset: db.collection<DokTokenReset>(KOLEKSI.tokenReset),
  };
}

export type Koleksi = Awaited<ReturnType<typeof koleksi>>;

export async function catatAudit(entri: Omit<DokLogAudit, '_id' | 'waktu'>): Promise<void> {
  const { logAudit } = await koleksi();
  await logAudit.insertOne({ _id: new ObjectId(), waktu: new Date(), ...entri });
}

export function keObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) && /^[a-f0-9]{24}$/i.test(id) ? new ObjectId(id) : null;
}
