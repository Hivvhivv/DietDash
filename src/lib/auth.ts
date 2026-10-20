// Autentikasi admin: hash argon2id, sesi di MongoDB, cookie HttpOnly, dan pembatasan percobaan login.
// Tidak ada akun untuk peserta/pengunjung; semua halaman publik tetap terbuka tanpa login.
import { createHash, randomBytes } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { ObjectId } from 'mongodb';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { catatAudit, koleksi } from './db';
import type { PeranAdmin } from './skema';

export const NAMA_COOKIE = 'dash_admin';
const LAMA_SESI_MS = 8 * 60 * 60 * 1000; // 8 jam
const BATAS_GAGAL_PER_AKUN = 5; // dalam 15 menit
const BATAS_GAGAL_PER_IP = 20; // dalam 15 menit
const JENDELA_MS = 15 * 60 * 1000;

export interface AdminAktif {
  id: string;
  username: string;
  peran: PeranAdmin;
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

// Hash tiruan agar waktu respons sama saat username tidak ditemukan.
let hashTiruan: Promise<string> | undefined;

async function alamatIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'tidak-diketahui';
}

export type HasilMasuk = { ok: true } | { ok: false; pesan: string };

export async function masuk(usernameMentah: string, password: string): Promise<HasilMasuk> {
  const username = usernameMentah.trim().toLowerCase();
  const { admin, sesi, percobaanLogin } = await koleksi();
  const ip = await alamatIp();
  const kunciAkun = `akun:${sha256(username)}`;
  const kunciIp = `ip:${sha256(ip)}`;
  const sejak = new Date(Date.now() - JENDELA_MS);

  const [gagalAkun, gagalIp] = await Promise.all([
    percobaanLogin.countDocuments({ kunci: kunciAkun, waktu: { $gte: sejak } }),
    percobaanLogin.countDocuments({ kunci: kunciIp, waktu: { $gte: sejak } }),
  ]);
  if (gagalAkun >= BATAS_GAGAL_PER_AKUN || gagalIp >= BATAS_GAGAL_PER_IP) {
    return {
      ok: false,
      pesan: 'Terlalu banyak percobaan masuk yang gagal. Tunggu 15 menit, lalu coba lagi.',
    };
  }

  const akun = await admin.findOne({ username, aktif: true });
  hashTiruan ??= hash(randomBytes(16).toString('hex'));
  const cocok = akun
    ? await verify(akun.password_hash, password)
    : (await verify(await hashTiruan, password), false);

  if (!akun || !cocok) {
    const waktu = new Date();
    await percobaanLogin.insertMany([
      { _id: new ObjectId(), kunci: kunciAkun, waktu },
      { _id: new ObjectId(), kunci: kunciIp, waktu },
    ]);
    await catatAudit({ admin: username || '(kosong)', aksi: 'gagal_masuk' });
    return {
      ok: false,
      pesan: 'Nama pengguna atau kata sandi salah. Periksa kembali, lalu coba lagi.',
    };
  }

  // Sesi baru setiap kali masuk (tidak memakai ulang token lama).
  const token = randomBytes(32).toString('base64url');
  const sekarang = new Date();
  const kedaluwarsa = new Date(sekarang.getTime() + LAMA_SESI_MS);
  await sesi.insertOne({
    _id: new ObjectId(),
    token_hash: sha256(token),
    admin_id: akun._id,
    dibuat_pada: sekarang,
    kedaluwarsa,
  });
  await percobaanLogin.deleteMany({ kunci: kunciAkun });

  const toko = await cookies();
  toko.set(NAMA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: kedaluwarsa,
  });
  await catatAudit({ admin: akun.username, aksi: 'masuk' });
  return { ok: true };
}

export async function keluar(): Promise<void> {
  const toko = await cookies();
  const token = toko.get(NAMA_COOKIE)?.value;
  if (token) {
    const { sesi } = await koleksi();
    const dok = await sesi.findOneAndDelete({ token_hash: sha256(token) });
    if (dok) {
      const { admin } = await koleksi();
      const akun = await admin.findOne({ _id: dok.admin_id });
      if (akun) await catatAudit({ admin: akun.username, aksi: 'keluar' });
    }
  }
  toko.delete(NAMA_COOKIE);
}

export async function adminSaatIni(): Promise<AdminAktif | null> {
  const token = (await cookies()).get(NAMA_COOKIE)?.value;
  if (!token) return null;
  const { sesi, admin } = await koleksi();
  const dok = await sesi.findOne({ token_hash: sha256(token), kedaluwarsa: { $gt: new Date() } });
  if (!dok) return null;
  const akun = await admin.findOne({ _id: dok.admin_id, aktif: true });
  if (!akun) return null;
  return { id: akun._id.toHexString(), username: akun.username, peran: akun.peran };
}

// Wajib dipanggil di SETIAP halaman admin, Server Action, dan Route Handler admin.
export async function wajibAdmin(peran?: PeranAdmin): Promise<AdminAktif> {
  const a = await adminSaatIni();
  if (!a) redirect('/admin/masuk/');
  if (peran && a.peran !== peran) redirect('/admin/?akses=ditolak');
  return a;
}
