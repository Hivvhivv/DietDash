import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import FormMasuk from '@/components/admin/FormMasuk';
import Logo from '@/components/Logo';
import { adminSaatIni } from '@/lib/auth';

export const metadata: Metadata = { title: 'Masuk' };

export default async function HalamanMasuk() {
  if (await adminSaatIni()) redirect('/admin/');

  return (
    <main id="konten-utama" className="wadah-baca admin-masuk">
      <p className="merek">
        <Logo />
        <span>DASH Sehat — Admin</span>
      </p>
      <h1>Masuk sebagai admin</h1>
      <p>
        Halaman ini khusus untuk tim peneliti yang mengelola materi. Pengunjung website tidak perlu
        masuk untuk belajar.
      </p>
      <FormMasuk />
      <p className="label-kecil">
        Lupa kata sandi? Minta admin berperan peneliti untuk membuat ulang akun Anda.{' '}
        <Link href="/">Kembali ke website</Link>
      </p>
    </main>
  );
}
