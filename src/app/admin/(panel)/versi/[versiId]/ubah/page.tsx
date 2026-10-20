import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { aksiSimpanDraf } from '../../../../aksi';
import FormModul from '@/components/admin/FormModul';
import { wajibAdmin } from '@/lib/auth';
import { keObjectId } from '@/lib/db';
import { ambilVersi } from '@/lib/konten-admin';
import { daftarSumber } from '@/data/sumber';

export const metadata: Metadata = { title: 'Ubah draf' };

export default async function UbahDraf({ params }: { params: Promise<{ versiId: string }> }) {
  await wajibAdmin();
  const { versiId } = await params;
  const oid = keObjectId(versiId);
  const dok = oid ? await ambilVersi(oid) : null;
  if (!dok) notFound();
  // Versi yang sudah disetujui/diarsipkan tidak boleh diubah.
  if (dok.status !== 'draf') redirect(`/admin/versi/${versiId}/`);

  return (
    <>
      <p>
        <Link href={`/admin/versi/${versiId}/`}>← Pratinjau draf</Link>
      </p>
      <h1>Ubah draf: {dok.data.judul}</h1>
      <p>Perubahan baru tayang setelah draf disetujui oleh admin berperan peneliti.</p>
      <FormModul
        aksi={aksiSimpanDraf}
        versiId={versiId}
        labelSimpan="Simpan draf"
        daftarSumber={daftarSumber}
        awal={{ versi: dok.versi, ...dok.data, isi: dok.isi, catatan: dok.catatan }}
      />
    </>
  );
}
