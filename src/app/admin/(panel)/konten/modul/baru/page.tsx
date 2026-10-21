import type { Metadata } from 'next';
import Link from 'next/link';
import { FormModul } from '@/components/admin/FormKonten';
import { wajibAdmin } from '@/lib/admin-auth';
import { versiKerja } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Modul baru' };
export const dynamic = 'force-dynamic';

export default async function ModulBaru() {
  await wajibAdmin();
  const v = await versiKerja();
  return (
    <>
      <p>
        <Link href="/admin/konten/">← Konten</Link>
      </p>
      <h1>Modul baru</h1>
      {v ? (
        <FormModul awal={{ kunci: '', judul: '', deskripsi: '', tujuan: [], jenis_gambar: 'bawaan', ilustrasi: 'piring', gambar_id: '', gambar_alt: '' }} />
      ) : (
        <p>Buat versi kerja dulu di halaman <Link href="/admin/konten/">Konten</Link>.</p>
      )}
    </>
  );
}
