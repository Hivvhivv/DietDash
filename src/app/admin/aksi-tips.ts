'use server';

// Server Actions Kelola Tips. Setiap aksi memeriksa sesi admin di server dan tercatat di log.
import { redirect } from 'next/navigation';
import { wajibAdmin } from '@/lib/admin-auth';
import type { DokTips } from '@/lib/db';
import * as T from '@/lib/tips';
import type { StatusKonten } from './aksi-konten';

const teks = (fd: FormData, k: string) => String(fd.get(k) ?? '');

export async function aksiSimpanTips(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  const nilai = {
    judul: teks(fd, 'judul'),
    kategori: teks(fd, 'kategori'),
    masalah: teks(fd, 'masalah'),
    solusi: teks(fd, 'solusi'),
    catatan: teks(fd, 'catatan'),
    gambar_id: teks(fd, 'gambar_id'),
    gambar_alt: teks(fd, 'gambar_alt'),
    terbit: fd.get('terbit') === 'ya' ? 'ya' : '',
  };
  const v = T.skemaTips.safeParse(nilai);
  const galat: Record<string, string> = {};
  if (!v.success) for (const i of v.error.issues) galat[String(i.path[0] ?? 'umum')] ??= i.message;
  let gambar: DokTips['gambar'] = null;
  if (nilai.gambar_id) {
    if (!/^[a-f0-9]{24}$/.test(nilai.gambar_id)) galat.gambar_id = 'Gambar tidak valid. Unggah ulang.';
    if (!nilai.gambar_alt.trim()) galat.gambar_alt = 'Teks alternatif gambar wajib diisi.';
    gambar = { id: nilai.gambar_id, alt: nilai.gambar_alt.trim() };
  }
  if (!v.success || Object.keys(galat).length) {
    return { pesan: 'Ada isian yang perlu diperbaiki.', galat, nilai, percobaan: Date.now() };
  }
  const h = await T.simpanTips(admin, teks(fd, 'id') || null, { ...v.data, gambar, terbit: nilai.terbit === 'ya' });
  if (!h.ok) return { pesan: h.pesan, nilai, percobaan: Date.now() };
  redirect('/admin/tips/?pesan=tersimpan');
}

export async function aksiTerbitTips(fd: FormData): Promise<void> {
  const admin = await wajibAdmin();
  await T.aturTerbitTips(admin, teks(fd, 'id'), teks(fd, 'terbit') === 'ya');
  redirect('/admin/tips/');
}

export async function aksiGeserTips(fd: FormData): Promise<void> {
  const admin = await wajibAdmin();
  await T.geserTips(admin, teks(fd, 'id'), teks(fd, 'arah') === 'naik' ? -1 : 1);
  redirect('/admin/tips/');
}

export async function aksiHapusTips(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  await T.hapusTips(admin, teks(fd, 'id'));
  redirect('/admin/tips/?pesan=dihapus');
}

export async function aksiHapusTipsContoh(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  if (teks(fd, 'konfirmasi').trim().toUpperCase() !== 'HAPUS') return { pesan: 'Ketik HAPUS untuk mengonfirmasi.' };
  const n = await T.hapusTipsContoh(admin);
  redirect(`/admin/tips/?pesan=${n ? 'contoh-dihapus' : 'tidak-ada-contoh'}`);
}
