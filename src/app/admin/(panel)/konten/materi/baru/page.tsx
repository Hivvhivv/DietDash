import type { Metadata } from 'next';
import Link from 'next/link';
import { FormMateri } from '@/components/admin/FormKonten';
import { wajibAdmin } from '@/lib/admin-auth';
import { ambilModulKerja } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Materi baru' };
export const dynamic = 'force-dynamic';

export default async function MateriBaru({ searchParams }: { searchParams: Promise<{ modul?: string }> }) {
  await wajibAdmin();
  const { modul } = await searchParams;
  const md = modul ? await ambilModulKerja(modul) : null;
  return (
    <>
      <p>
        <Link href={md ? `/admin/konten/modul/${md.kunci}/` : '/admin/konten/'}>← {md ? md.judul : 'Konten'}</Link>
      </p>
      <h1>Materi baru{md ? ` di ${md.judul}` : ''}</h1>
      {md ? (
        <>
          <FormMateri awal={{ kunci: '', modul_kunci: md.kunci, judul: '', tujuan: [], isi: '', poin_penting: [], rangkuman: '', estimasi_menit: null, sumber: [], gambar_id: '', gambar_alt: '' }} />
        </>
      ) : (
        <p>Pilih modul dari halaman <Link href="/admin/konten/">Konten</Link>.</p>
      )}
    </>
  );
}
