import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormTips from '@/components/admin/FormTips';
import { wajibAdmin } from '@/lib/admin-auth';
import { LABEL_KATEGORI_TIPS, ambilTips } from '@/lib/tips';

export const metadata: Metadata = { title: 'Edit tips' };
export const dynamic = 'force-dynamic';

export default async function EditTips({ params }: { params: Promise<{ id: string }> }) {
  await wajibAdmin();
  const t = await ambilTips((await params).id);
  if (!t) notFound();
  return (
    <>
      <p>
        <Link href="/admin/tips/">← Kelola Tips</Link>
      </p>
      <h1>Edit tips</h1>
      {t.contoh && <p className="kotak-info">Ini tips contoh. Setelah Anda menyimpan perubahan, tips tetap bertanda contoh.</p>}
      <FormTips
        kategori={Object.entries(LABEL_KATEGORI_TIPS)}
        awal={{
          id: t._id.toHexString(),
          judul: t.judul,
          kategori: t.kategori,
          masalah: t.masalah,
          solusi: t.solusi,
          catatan: t.catatan,
          gambar_id: t.gambar?.id ?? '',
          gambar_alt: t.gambar?.alt ?? '',
          terbit: t.terbit,
        }}
      />
    </>
  );
}
