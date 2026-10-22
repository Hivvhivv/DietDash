// Akun admin: email + kata sandi (Argon2id), langsung masuk tanpa 2FA (keputusan peneliti 2026-10-22, menyimpang dari PRD 7.8).
// Admin tidak bisa mendaftar sendiri; akun dibuat lewat undangan super admin (berlaku 48 jam).
import { randomBytes } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { ObjectId } from 'mongodb';
import { forbidden, notFound } from 'next/navigation';
import { alamatIp, catatPercobaan, hapusPercobaan, kunciBatas, sudahDibatasi } from './batas';
import { catatAudit, koleksi, type PeranAdmin } from './db';
import { sha256 } from './identitas';
import { bacaSesi, buatSesi, hapusSemuaSesi, hapusSesiIni } from './sesi';

export type Hasil<T = object> = ({ ok: true } & T) | { ok: false; pesan: string; kolom?: string };

export interface AdminAktif {
  id: ObjectId;
  email: string;
  nama: string;
  peran: PeranAdmin;
}

let hashTiruan: Promise<string> | undefined;
const LAMA_UNDANGAN_MS = 48 * 60 * 60 * 1000;

export function periksaSandiAdmin(sandi: string, email: string): string | null {
  if (sandi.length < 12) return 'Kata sandi admin minimal 12 karakter.';
  if (sandi.length > 200) return 'Kata sandi terlalu panjang.';
  if (/^\d+$/.test(sandi)) return 'Kata sandi jangan hanya angka.';
  const lokal = email.split('@')[0]?.toLowerCase() ?? '';
  if (lokal.length >= 4 && sandi.toLowerCase().includes(lokal)) return 'Kata sandi jangan memuat alamat email.';
  return null;
}

export const normalkanEmail = (e: string) => e.trim().toLowerCase();

// Email + kata sandi benar → sesi admin penuh (idle 30 menit). Percobaan salah dibatasi per email dan per IP.
export async function masukAdmin(emailMentah: string, sandi: string): Promise<Hasil> {
  const email = normalkanEmail(emailMentah);
  const kunciEmail = kunciBatas('admin', email);
  const kunciIp = kunciBatas('admin-ip', await alamatIp());
  if (await sudahDibatasi([{ kunci: kunciEmail, batas: 5 }, { kunci: kunciIp, batas: 20 }])) {
    return { ok: false, pesan: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' };
  }
  const { admin } = await koleksi();
  const akun = await admin.findOne({ email, aktif: true });
  hashTiruan ??= hash(randomBytes(16).toString('hex'));
  const cocok = akun ? await verify(akun.password_hash, sandi) : (await verify(await hashTiruan, sandi), false);
  if (!akun || !cocok) {
    await catatPercobaan([kunciEmail, kunciIp]);
    await catatAudit({ admin: email || '(kosong)', aksi: 'gagal_masuk' });
    return { ok: false, pesan: 'Email atau kata sandi salah.' };
  }
  await hapusPercobaan(kunciEmail);
  await hapusSesiIni('admin'); // ganti token sesi setiap masuk (cegah session fixation)
  await buatSesi({ pemilik_id: akun._id, jenis: 'admin', tahap: 'penuh' });
  await catatAudit({ admin: akun.email, aksi: 'masuk' });
  return { ok: true };
}

export async function adminSaatIni(): Promise<AdminAktif | null> {
  const sesi = await bacaSesi('admin');
  if (!sesi || sesi.tahap !== 'penuh') return null;
  const { admin } = await koleksi();
  const akun = await admin.findOne({ _id: sesi.pemilik_id, aktif: true });
  return akun ? { id: akun._id, email: akun.email, nama: akun.nama, peran: akun.peran } : null;
}

// Wajib di setiap halaman, Server Action, dan Route Handler admin.
// Tanpa sesi admin → 404 (responden yang membuka /admin tidak diberi tahu halamannya ada).
// Admin biasa di area super admin → 403.
export async function wajibAdmin(peran?: 'super_admin'): Promise<AdminAktif> {
  const a = await adminSaatIni();
  if (!a) {
    notFound();
  }
  if (peran === 'super_admin' && a.peran !== 'super_admin') forbidden();
  return a;
}

export async function keluarAdmin(): Promise<void> {
  const a = await adminSaatIni();
  if (a) await catatAudit({ admin: a.email, aksi: 'keluar' });
  await hapusSesiIni('admin');
}

// ---------- Undangan & pengelolaan admin (super admin) ----------

export async function buatUndangan(emailMentah: string, peran: PeranAdmin, oleh: AdminAktif): Promise<Hasil<{ token: string }>> {
  const email = normalkanEmail(emailMentah);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, pesan: 'Format email belum benar.', kolom: 'email' };
  const { admin, undangan } = await koleksi();
  if (await admin.findOne({ email })) return { ok: false, pesan: 'Email ini sudah terdaftar sebagai admin.', kolom: 'email' };
  const token = randomBytes(24).toString('base64url');
  await undangan.updateMany({ email, dipakai_pada: null }, { $set: { kedaluwarsa_pada: new Date() } });
  await undangan.insertOne({
    _id: new ObjectId(),
    email,
    peran,
    token_hash: sha256(token),
    dibuat_oleh: oleh.email,
    kedaluwarsa_pada: new Date(Date.now() + LAMA_UNDANGAN_MS),
    dipakai_pada: null,
  });
  await catatAudit({ admin: oleh.email, aksi: 'undang_admin', objek: email, keterangan: `Peran ${peran}` });
  return { ok: true, token };
}

export async function cekUndangan(token: string) {
  const { undangan } = await koleksi();
  return undangan.findOne({ token_hash: sha256(token), dipakai_pada: null, kedaluwarsa_pada: { $gt: new Date() } });
}

export async function terimaUndangan(token: string, nama: string, sandi: string): Promise<Hasil> {
  const u = await cekUndangan(token);
  if (!u) return { ok: false, pesan: 'Undangan sudah tidak berlaku. Minta undangan baru kepada super admin.' };
  if (nama.trim().length < 2) return { ok: false, pesan: 'Isi nama Anda.', kolom: 'nama' };
  const galat = periksaSandiAdmin(sandi, u.email);
  if (galat) return { ok: false, pesan: galat, kolom: 'sandi' };
  const { admin, undangan } = await koleksi();
  const tandai = await undangan.updateOne({ _id: u._id, dipakai_pada: null }, { $set: { dipakai_pada: new Date() } });
  if (tandai.modifiedCount === 0) return { ok: false, pesan: 'Undangan sudah dipakai.' };
  await admin.insertOne({
    _id: new ObjectId(),
    email: u.email,
    nama: nama.trim(),
    password_hash: await hash(sandi),
    peran: u.peran,
    aktif: true,
    dibuat_pada: new Date(),
  });
  await catatAudit({ admin: u.email, aksi: 'terima_undangan', keterangan: `Peran ${u.peran}` });
  return { ok: true };
}

export async function ubahAdmin(
  id: ObjectId,
  tindakan: 'nonaktifkan' | 'aktifkan',
  oleh: AdminAktif,
): Promise<Hasil> {
  if (id.equals(oleh.id)) return { ok: false, pesan: 'Anda tidak dapat mengubah akun Anda sendiri dari sini.' };
  const { admin } = await koleksi();
  const akun = await admin.findOne({ _id: id });
  if (!akun) return { ok: false, pesan: 'Admin tidak ditemukan.' };
  await admin.updateOne({ _id: id }, { $set: { aktif: tindakan === 'aktifkan' } });
  if (tindakan !== 'aktifkan') await hapusSemuaSesi(id);
  await catatAudit({ admin: oleh.email, aksi: `${tindakan}_admin`, objek: akun.email });
  return { ok: true };
}
