import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FormMasukAdmin } from '@/components/admin/FormAdmin';
import HalamanAkun from '@/components/akun/HalamanAkun';
import KerangkaAkun from '@/components/akun/KerangkaAkun';
import PilihMasuk from '@/components/akun/PilihMasuk';
import { adminSaatIni } from '@/lib/admin-auth';

export const metadata: Metadata = { title: 'Masuk Admin' };

export default async function MasukAdmin({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  if (await adminSaatIni()) redirect('/admin/dashboard/');
  const { pesan } = await searchParams;
  return (
    <KerangkaAkun>
      <HalamanAkun
        ilustrasi="admin"
        judul="Masuk Admin"
        ringkasan="Khusus tim peneliti. Masuk dengan email dan kata sandi admin."
      >
        <PilihMasuk aktif="admin" />
        {pesan === 'akun-dibuat' && (
          <p className="pesan-sukses" role="status">
            Akun admin dibuat. Silakan masuk.
          </p>
        )}
        <FormMasukAdmin />
        <p className="akun-tautan-kecil">Lupa kata sandi? Hubungi super admin.</p>
      </HalamanAkun>
    </KerangkaAkun>
  );
}
