import type { Metadata } from 'next';
import Link from 'next/link';
import { FormMateri } from '@/components/admin/FormKonten';
import { wajibAdmin } from '@/lib/admin-auth';
import { koleksi } from '@/lib/db';
import { ambilMateriKerja, versiKerja } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Edit materi' };
export const dynamic = 'force-dynamic';

export default async function EditMateri({ params, searchParams }: { params: Promise<{ kunci: string }>; searchParams: Promise<{ pesan?: string }> }) {
  await wajibAdmin();
  const { kunci } = await params;
  const { pesan } = await searchParams;
  const d = await ambilMateriKerja(kunci);
  if (!d) {
    return (
      <>
        <h1>Materi tidak ditemukan</h1>
        <p>Materi hanya dapat diedit di versi kerja. <Link href="/admin/konten/">Kembali ke Konten</Link></p>
      </>
    );
  }
  const { materi: m, soal } = d;
  const v = await versiKerja();
  const { modul } = await koleksi();
  const md = await modul.findOne({ version_id: v!._id, kunci: m.modul_kunci });

  return (
    <>
      <p>
        <Link href={`/admin/konten/modul/${m.modul_kunci}/`}>← {md?.judul ?? 'Modul'}</Link>
      </p>
      <h1>Edit materi: {m.judul}</h1>
      {pesan === 'tersimpan' && (
        <p className="pesan-sukses" role="status">
          Materi tersimpan.
        </p>
      )}
      <p className="grup-tombol">
        <Link className="tombol tombol-sekunder" href={`/admin/konten/materi/${m.kunci}/kuis/`}>
          Kuis materi ({soal.length} soal{soal.length < 3 ? ' — minimal 3 ⚠' : ''})
        </Link>
        <Link className="tombol tombol-sekunder" href={`/admin/konten/pratinjau/${m.kunci}/`}>
          Pratinjau seperti responden
        </Link>
      </p>
      <FormMateri
        awal={{
          kunci: m.kunci,
          modul_kunci: m.modul_kunci,
          judul: m.judul,
          tujuan: m.tujuan,
          isi: m.isi,
          poin_penting: m.poin_penting,
          rangkuman: m.rangkuman,
          estimasi_menit: m.estimasi_menit,
          sumber: m.sumber,
        }}
      />
    </>
  );
}
