'use server';

// Masuk admin (kata sandi + 2FA), undangan, dan pengelolaan akun admin.
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  buatUndangan,
  keluarAdmin,
  masukAdmin,
  terimaUndangan,
  ubahAdmin,
  verifikasi2fa,
  wajibAdmin,
} from '@/lib/admin-auth';
import { keObjectId, type PeranAdmin } from '@/lib/db';

export interface StatusAdmin {
  pesan?: string;
  kolom?: string;
  sukses?: string;
  tautan?: string;
  nilai?: Record<string, string>;
}

const teks = (fd: FormData, k: string) => String(fd.get(k) ?? '');

export async function aksiMasukAdmin(_: StatusAdmin | undefined, fd: FormData): Promise<StatusAdmin> {
  const email = teks(fd, 'email');
  const h = await masukAdmin(email, teks(fd, 'sandi'));
  if (!h.ok) return { pesan: h.pesan, nilai: { email } };
  redirect(h.perluAtur2fa ? '/admin/masuk/atur-2fa/' : '/admin/masuk/verifikasi/');
}

export async function aksiVerifikasi2fa(_: StatusAdmin | undefined, fd: FormData): Promise<StatusAdmin> {
  const h = await verifikasi2fa(teks(fd, 'kode'));
  if (!h.ok) return { pesan: h.pesan };
  redirect('/admin/dashboard/');
}

export async function aksiKeluarAdmin(): Promise<void> {
  await keluarAdmin();
  redirect('/admin/masuk/');
}

export async function aksiTerimaUndangan(_: StatusAdmin | undefined, fd: FormData): Promise<StatusAdmin> {
  if (teks(fd, 'sandi') !== teks(fd, 'ulang')) return { pesan: 'Ulangi kata sandi belum sama.', kolom: 'ulang' };
  const h = await terimaUndangan(teks(fd, 'token'), teks(fd, 'nama'), teks(fd, 'sandi'));
  if (!h.ok) return { pesan: h.pesan, kolom: h.kolom };
  redirect('/admin/masuk/?pesan=akun-dibuat');
}

export async function aksiUndangAdmin(_: StatusAdmin | undefined, fd: FormData): Promise<StatusAdmin> {
  const admin = await wajibAdmin('super_admin');
  const peran = (teks(fd, 'peran') === 'super_admin' ? 'super_admin' : 'admin') as PeranAdmin;
  const h = await buatUndangan(teks(fd, 'email'), peran, admin);
  if (!h.ok) return { pesan: h.pesan, kolom: h.kolom, nilai: { email: teks(fd, 'email') } };
  const hd = await headers();
  const host = hd.get('x-forwarded-host') ?? hd.get('host') ?? 'localhost:3000';
  const proto = hd.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return { sukses: 'Undangan dibuat. Kirim tautan ini ke email calon admin. Berlaku 48 jam dan hanya ditampilkan sekali.', tautan: `${proto}://${host}/admin/undangan/${h.token}/` };
}

export async function aksiUbahAdmin(_: StatusAdmin | undefined, fd: FormData): Promise<StatusAdmin> {
  const admin = await wajibAdmin('super_admin');
  const id = keObjectId(teks(fd, 'id'));
  const t = teks(fd, 'tindakan');
  if (!id || !['nonaktifkan', 'aktifkan', 'reset_2fa'].includes(t)) return { pesan: 'Permintaan tidak valid.' };
  const h = await ubahAdmin(id, t as 'nonaktifkan' | 'aktifkan' | 'reset_2fa', admin);
  if (!h.ok) return { pesan: h.pesan };
  return { sukses: 'Tersimpan.' };
}
