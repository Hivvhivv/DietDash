// Akun peserta (email + kata sandi). Dipisahkan dari akun admin.
// Yang disimpan: email, hash argon2id kata sandi, waktu daftar/masuk, persetujuan kebijakan privasi.
// Materi tetap bisa dibaca tanpa akun; akun hanya untuk menyimpan progres belajar.
import { createHash, randomBytes } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { ObjectId } from 'mongodb';
import { cookies, headers } from 'next/headers';
import { koleksi } from './db';

export const NAMA_COOKIE_PESERTA = 'dash_peserta';
export const VERSI_KEBIJAKAN = '0.1';
const LAMA_SESI_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari, supaya tidak perlu sering masuk ulang
const LAMA_TOKEN_RESET_MS = 24 * 60 * 60 * 1000;
const BATAS_GAGAL_PER_AKUN = 5;
const BATAS_GAGAL_PER_IP = 20;
const JENDELA_MS = 15 * 60 * 1000;

export interface PesertaAktif {
  id: ObjectId;
  email: string;
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
let hashTiruan: Promise<string> | undefined;

export const normalkanEmail = (e: string) => e.trim().toLowerCase();

export function periksaEmail(email: string): string | null {
  if (!email) return 'Isi alamat email.';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return 'Format email belum benar. Contoh: nama@gmail.com';
  }
  return null;
}

// Aturan kata sandi: cukup panjang, tetapi tetap mudah diingat (boleh kalimat).
export function periksaSandi(sandi: string, email: string): string | null {
  if (sandi.length < 8) return 'Kata sandi minimal 8 karakter.';
  if (sandi.length > 128) return 'Kata sandi terlalu panjang (maksimal 128 karakter).';
  if (/^\d+$/.test(sandi)) {
    return 'Kata sandi jangan hanya angka. Hindari tanggal lahir atau nomor telepon.';
  }
  if (/(\+?62|0)8\d{7,}/.test(sandi)) return 'Kata sandi jangan memuat nomor telepon.';
  if (/\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/.test(sandi)) {
    return 'Kata sandi terlihat seperti tanggal. Gunakan kata sandi lain.';
  }
  const lokal = email.split('@')[0];
  if (lokal.length >= 4 && sandi.toLowerCase().includes(lokal)) {
    return 'Kata sandi jangan memuat alamat email Anda.';
  }
  return null;
}

async function alamatIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'tidak-diketahui';
}

async function buatSesi(pesertaId: ObjectId): Promise<void> {
  const { sesiPeserta } = await koleksi();
  const token = randomBytes(32).toString('base64url');
  const sekarang = new Date();
  const kedaluwarsa = new Date(sekarang.getTime() + LAMA_SESI_MS);
  await sesiPeserta.insertOne({
    _id: new ObjectId(),
    token_hash: sha256(token),
    peserta_id: pesertaId,
    dibuat_pada: sekarang,
    kedaluwarsa,
  });
  (await cookies()).set(NAMA_COOKIE_PESERTA, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: kedaluwarsa,
  });
}

export type Hasil = { ok: true } | { ok: false; pesan: string; kolom?: string };

export async function daftar(emailMentah: string, sandi: string): Promise<Hasil> {
  const email = normalkanEmail(emailMentah);
  const galatEmail = periksaEmail(email);
  if (galatEmail) return { ok: false, pesan: galatEmail, kolom: 'email' };
  const galatSandi = periksaSandi(sandi, email);
  if (galatSandi) return { ok: false, pesan: galatSandi, kolom: 'sandi' };

  const { peserta } = await koleksi();
  if (await peserta.findOne({ email })) {
    return {
      ok: false,
      kolom: 'email',
      pesan: 'Email ini sudah terdaftar. Silakan masuk, atau hubungi peneliti bila lupa kata sandi.',
    };
  }
  const sekarang = new Date();
  const id = new ObjectId();
  try {
    await peserta.insertOne({
      _id: id,
      email,
      password_hash: await hash(sandi),
      dibuat_pada: sekarang,
      terakhir_masuk: sekarang,
      setuju_privasi_pada: sekarang,
      versi_kebijakan: VERSI_KEBIJAKAN,
    });
  } catch {
    return { ok: false, kolom: 'email', pesan: 'Email ini sudah terdaftar. Silakan masuk.' };
  }
  await buatSesi(id);
  return { ok: true };
}

export async function masukPeserta(emailMentah: string, sandi: string): Promise<Hasil> {
  const email = normalkanEmail(emailMentah);
  const { peserta, percobaanLogin } = await koleksi();
  const kunciAkun = `peserta:${sha256(email)}`;
  const kunciIp = `peserta-ip:${sha256(await alamatIp())}`;
  const sejak = new Date(Date.now() - JENDELA_MS);
  const [gagalAkun, gagalIp] = await Promise.all([
    percobaanLogin.countDocuments({ kunci: kunciAkun, waktu: { $gte: sejak } }),
    percobaanLogin.countDocuments({ kunci: kunciIp, waktu: { $gte: sejak } }),
  ]);
  if (gagalAkun >= BATAS_GAGAL_PER_AKUN || gagalIp >= BATAS_GAGAL_PER_IP) {
    return { ok: false, pesan: 'Terlalu banyak percobaan masuk yang gagal. Tunggu 15 menit, lalu coba lagi.' };
  }

  const akun = await peserta.findOne({ email });
  hashTiruan ??= hash(randomBytes(16).toString('hex'));
  const cocok = akun
    ? await verify(akun.password_hash, sandi)
    : (await verify(await hashTiruan, sandi), false);
  if (!akun || !cocok) {
    const waktu = new Date();
    await percobaanLogin.insertMany([
      { _id: new ObjectId(), kunci: kunciAkun, waktu },
      { _id: new ObjectId(), kunci: kunciIp, waktu },
    ]);
    return { ok: false, pesan: 'Email atau kata sandi salah. Periksa kembali, lalu coba lagi.' };
  }
  await percobaanLogin.deleteMany({ kunci: kunciAkun });
  await peserta.updateOne({ _id: akun._id }, { $set: { terakhir_masuk: new Date() } });
  await buatSesi(akun._id);
  return { ok: true };
}

export async function pesertaSaatIni(): Promise<PesertaAktif | null> {
  const token = (await cookies()).get(NAMA_COOKIE_PESERTA)?.value;
  if (!token) return null;
  const { sesiPeserta, peserta } = await koleksi();
  const sesi = await sesiPeserta.findOne({ token_hash: sha256(token), kedaluwarsa: { $gt: new Date() } });
  if (!sesi) return null;
  const akun = await peserta.findOne({ _id: sesi.peserta_id }, { projection: { email: 1 } });
  return akun ? { id: akun._id, email: akun.email } : null;
}

export async function keluarPeserta(): Promise<void> {
  const toko = await cookies();
  const token = toko.get(NAMA_COOKIE_PESERTA)?.value;
  if (token) {
    const { sesiPeserta } = await koleksi();
    await sesiPeserta.deleteOne({ token_hash: sha256(token) });
  }
  toko.delete(NAMA_COOKIE_PESERTA);
}

export async function ubahSandi(p: PesertaAktif, lama: string, baru: string): Promise<Hasil> {
  const { peserta, sesiPeserta } = await koleksi();
  const akun = await peserta.findOne({ _id: p.id });
  if (!akun || !(await verify(akun.password_hash, lama))) {
    return { ok: false, kolom: 'lama', pesan: 'Kata sandi lama salah.' };
  }
  const galat = periksaSandi(baru, akun.email);
  if (galat) return { ok: false, kolom: 'baru', pesan: galat };
  await peserta.updateOne({ _id: p.id }, { $set: { password_hash: await hash(baru) } });
  // Keluarkan sesi di perangkat lain, lalu buat sesi baru di perangkat ini.
  await sesiPeserta.deleteMany({ peserta_id: p.id });
  await buatSesi(p.id);
  return { ok: true };
}

// Menghapus akun beserta SELURUH data belajarnya (hak peserta atas datanya).
export async function hapusPeserta(id: ObjectId): Promise<void> {
  const { peserta, sesiPeserta, progres, hasilLatihan, tokenReset } = await koleksi();
  await Promise.all([
    progres.deleteMany({ peserta_id: id }),
    hasilLatihan.deleteMany({ peserta_id: id }),
    sesiPeserta.deleteMany({ peserta_id: id }),
    tokenReset.deleteMany({ peserta_id: id }),
  ]);
  await peserta.deleteOne({ _id: id });
}

export async function hapusAkunSendiri(p: PesertaAktif, sandi: string): Promise<Hasil> {
  const { peserta } = await koleksi();
  const akun = await peserta.findOne({ _id: p.id });
  if (!akun || !(await verify(akun.password_hash, sandi))) {
    return { ok: false, kolom: 'sandi', pesan: 'Kata sandi salah. Akun tidak dihapus.' };
  }
  await hapusPeserta(p.id);
  (await cookies()).delete(NAMA_COOKIE_PESERTA);
  return { ok: true };
}

// ---------- Reset kata sandi lewat tautan dari peneliti ----------

export async function buatTokenReset(pesertaId: ObjectId, olehAdmin: string): Promise<string> {
  const { tokenReset } = await koleksi();
  await tokenReset.deleteMany({ peserta_id: pesertaId });
  const token = randomBytes(24).toString('base64url');
  await tokenReset.insertOne({
    _id: new ObjectId(),
    token_hash: sha256(token),
    peserta_id: pesertaId,
    dibuat_oleh: olehAdmin,
    kedaluwarsa: new Date(Date.now() + LAMA_TOKEN_RESET_MS),
  });
  return token;
}

export async function cekTokenReset(token: string): Promise<{ email: string } | null> {
  const { tokenReset, peserta } = await koleksi();
  const dok = await tokenReset.findOne({ token_hash: sha256(token), kedaluwarsa: { $gt: new Date() } });
  if (!dok) return null;
  const akun = await peserta.findOne({ _id: dok.peserta_id });
  return akun ? { email: akun.email } : null;
}

export async function pakaiTokenReset(token: string, baru: string): Promise<Hasil> {
  const { tokenReset, peserta, sesiPeserta } = await koleksi();
  const dok = await tokenReset.findOneAndDelete({ token_hash: sha256(token), kedaluwarsa: { $gt: new Date() } });
  if (!dok) return { ok: false, pesan: 'Tautan sudah tidak berlaku. Minta tautan baru kepada peneliti.' };
  const akun = await peserta.findOne({ _id: dok.peserta_id });
  if (!akun) return { ok: false, pesan: 'Akun tidak ditemukan.' };
  const galat = periksaSandi(baru, akun.email);
  if (galat) {
    // Kembalikan token agar peserta bisa mencoba lagi dengan kata sandi lain.
    await tokenReset.insertOne(dok);
    return { ok: false, kolom: 'baru', pesan: galat };
  }
  await peserta.updateOne({ _id: akun._id }, { $set: { password_hash: await hash(baru) } });
  await sesiPeserta.deleteMany({ peserta_id: akun._id });
  await buatSesi(akun._id);
  return { ok: true };
}
