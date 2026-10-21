import type { Metadata } from 'next';
import Link from 'next/link';
import { FormTerimaUndangan } from '@/components/admin/FormAdmin';
import HalamanAkun from '@/components/akun/HalamanAkun';
import KerangkaAkun from '@/components/akun/KerangkaAkun';
import { cekUndangan } from '@/lib/admin-auth';

export const metadata: Metadata = { title: 'Undangan admin' };

export default async function Undangan({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const u = await cekUndangan(token);
  return (
    <KerangkaAkun>
      <HalamanAkun
        ilustrasi="admin"
        judul="Undangan Admin"
        ringkasan={
          u
            ? `Anda diundang sebagai ${u.peran === 'super_admin' ? 'super admin' : 'admin'}. Buat kata sandi, lalu atur autentikasi dua faktor.`
            : 'Undangan ini tidak dapat dipakai.'
        }
      >
        {u ? (
          <FormTerimaUndangan token={token} email={u.email} />
        ) : (
          <p className="galat-umum" role="alert">
            Undangan tidak ditemukan, sudah dipakai, atau sudah lewat 48 jam. Minta undangan baru kepada super admin.
          </p>
        )}
        <p className="akun-tautan-kecil">
          <Link href="/admin/masuk/">Ke Masuk Admin</Link>
        </p>
      </HalamanAkun>
    </KerangkaAkun>
  );
}
