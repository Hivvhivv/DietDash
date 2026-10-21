import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FormKode2fa } from '@/components/admin/FormAdmin';
import HalamanAkun from '@/components/akun/HalamanAkun';
import KerangkaAkun from '@/components/akun/KerangkaAkun';
import { adminTahapSandi } from '@/lib/admin-auth';

export const metadata: Metadata = { title: 'Verifikasi dua langkah' };

export default async function Verifikasi() {
  const t = await adminTahapSandi();
  if (!t) redirect('/admin/masuk/');
  if (!t.akun.totp_aktif) redirect('/admin/masuk/atur-2fa/');
  return (
    <KerangkaAkun>
      <HalamanAkun ilustrasi="admin" judul="Verifikasi Dua Langkah" ringkasan={`Masukkan kode 6 digit dari aplikasi autentikator untuk akun ${t.akun.email}.`}>
        <FormKode2fa />
        <p className="akun-tautan-kecil">
          Tidak bisa membuka aplikasi autentikator? Minta super admin mereset 2FA Anda.{' '}
          <Link href="/admin/masuk/">Kembali ke Masuk Admin</Link>
        </p>
      </HalamanAkun>
    </KerangkaAkun>
  );
}
