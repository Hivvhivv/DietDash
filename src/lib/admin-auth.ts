// Akun admin: email + kata sandi (Argon2id) + autentikasi dua faktor TOTP wajib (PRD v2.0 Bagian 7.8).
// Admin tidak bisa mendaftar sendiri; akun dibuat lewat undangan super admin (berlaku 48 jam).
import { randomBytes } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { ObjectId } from 'mongodb';
import { forbidden, notFound, redirect } from 'next/navigation';
import { alamatIp, catatPercobaan, hapusPercobaan, kunciBatas, sudahDibatasi } from './batas';
import { catatAudit, koleksi, type DokAdmin, type DokSesi, type PeranAdmin } from './db';
import { sha256 } from './identitas';
import { bacaSesi, buatSesi, hapusSemuaSesi, hapusSesiIni } from './sesi';
import { buatRahasiaTotp, cekKodeTotp } from './totp';

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

// Langkah 1: kata sandi. Berhasil → sesi tahap "sandi" (10 menit) untuk langkah 2FA.
export async function masukAdmin(emailMentah: string, sandi: string): Promise<Hasil<{ perluAtur2fa: boolean }>> {
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
  await buatSesi({ pemilik_id: akun._id, jenis: 'admin', tahap: 'sandi' });
  return { ok: true, perluAtur2fa: !akun.totp_aktif };
}

export async function adminTahapSandi(): Promise<{ sesi: DokSesi; akun: DokAdmin } | null> {
  const sesi = await bacaSesi('admin');
  if (!sesi || sesi.tahap !== 'sandi') return null;
  const { admin } = await koleksi();
  const akun = await admin.findOne({ _id: sesi.pemilik_id, aktif: true });
  return akun ? { sesi, akun } : null;
}

// Rahasia TOTP untuk pengaturan pertama (dibuat sekali, dipakai sampai 2FA aktif).
export async function rahasiaPengaturan2fa(akun: DokAdmin): Promise<string> {
  if (akun.totp_rahasia && !akun.totp_aktif) return akun.totp_rahasia;
  const rahasia = buatRahasiaTotp();
  const { admin } = await koleksi();
  await admin.updateOne({ _id: akun._id, totp_aktif: false }, { $set: { totp_rahasia: rahasia } });
  return rahasia;
}

// Langkah 2: kode 6 digit dari aplikasi autentikator. Berhasil → sesi baru tahap "penuh".
export async function verifikasi2fa(kode: string): Promise<Hasil> {
  const t = await adminTahapSandi();
  if (!t) return { ok: false, pesan: 'Sesi masuk sudah berakhir. Masukkan email dan kata sandi lagi.' };
  const kunci = kunciBatas('admin-2fa', t.akun._id.toHexString());
  if (await sudahDibatasi([{ kunci, batas: 5 }])) {
    return { ok: false, pesan: 'Terlalu banyak kode salah. Coba lagi dalam 15 menit.' };
  }
  if (!t.akun.totp_rahasia || !cekKodeTotp(t.akun.totp_rahasia, kode)) {
    await catatPercobaan([kunci]);
    return { ok: false, pesan: 'Kode belum cocok. Pastikan jam di HP benar, lalu ketik kode terbaru.' };
  }
  const { admin } = await koleksi();
  if (!t.akun.totp_aktif) {
    await admin.updateOne({ _id: t.akun._id }, { $set: { totp_aktif: true } });
    await catatAudit({ admin: t.akun.email, aksi: 'aktifkan_2fa' });
  }
  await hapusPercobaan(kunci);
  await hapusSesiIni('admin'); // ganti token sesi setelah 2FA (cegah session fixation)
  await buatSesi({ pemilik_id: t.akun._id, jenis: 'admin', tahap: 'penuh' });
  await catatAudit({ admin: t.akun.email, aksi: 'masuk' });
  return { ok: true };
}

export async function adminSaatIni(): Promise<AdminAktif | null> {
  const sesi = await bacaSesi('admin');
  if (!sesi || sesi.tahap !== 'penuh') return null;
  const { admin } = await koleksi();
  const akun = await admin.findOne({ _id: sesi.pemilik_id, aktif: true, totp_aktif: true });
  return akun ? { id: akun._id, email: akun.email, nama: akun.nama, peran: akun.peran } : null;
}

// Wajib di setiap halaman, Server Action, dan Route Handler admin.
// Tanpa sesi admin → 404 (responden yang membuka /admin tidak diberi tahu halamannya ada).
// Admin biasa di area super admin → 403.
export async function wajibAdmin(peran?: 'super_admin'): Promise<AdminAktif> {
  const a = await adminSaatIni();
  if (!a) {
    if (await adminTahapSandi()) redirect('/admin/masuk/verifikasi/');
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
    totp_rahasia: null,
    totp_aktif: false,
    peran: u.peran,
    aktif: true,
    dibuat_pada: new Date(),
  });
  await catatAudit({ admin: u.email, aksi: 'terima_undangan', keterangan: `Peran ${u.peran}` });
  return { ok: true };
}

export async function ubahAdmin(
  id: ObjectId,
  tindakan: 'nonaktifkan' | 'aktifkan' | 'reset_2fa',
  oleh: AdminAktif,
): Promise<Hasil> {
  if (id.equals(oleh.id)) return { ok: false, pesan: 'Anda tidak dapat mengubah akun Anda sendiri dari sini.' };
  const { admin } = await koleksi();
  const akun = await admin.findOne({ _id: id });
  if (!akun) return { ok: false, pesan: 'Admin tidak ditemukan.' };
  const set =
    tindakan === 'reset_2fa'
      ? { totp_aktif: false, totp_rahasia: null }
      : { aktif: tindakan === 'aktifkan' };
  await admin.updateOne({ _id: id }, { $set: set });
  if (tindakan !== 'aktifkan') await hapusSemuaSesi(id);
  await catatAudit({ admin: oleh.email, aksi: `${tindakan}_admin`, objek: akun.email });
  return { ok: true };
}
