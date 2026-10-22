import type { Metadata } from 'next';
import Link from 'next/link';
import FormTips from '@/components/admin/FormTips';
import { wajibAdmin } from '@/lib/admin-auth';
import { LABEL_KATEGORI_TIPS } from '@/lib/tips';

export const metadata: Metadata = { title: 'Tips baru' };
export const dynamic = 'force-dynamic';

export default async function TipsBaru() {
  await wajibAdmin();
  return (
    <>
      <p>
        <Link href="/admin/tips/">← Kelola Tips</Link>
      </p>
      <h1>Tips baru</h1>
      <FormTips
        kategori={Object.entries(LABEL_KATEGORI_TIPS)}
        awal={{ id: '', judul: '', kategori: '', masalah: '', solusi: '', catatan: '', gambar_id: '', gambar_alt: '', terbit: true }}
      />
    </>
  );
}
