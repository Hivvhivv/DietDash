import type { Metadata } from 'next';
import Link from 'next/link';
import FormImpor from '@/components/admin/FormImpor';
import { wajibAdmin } from '@/lib/admin-auth';

export const metadata: Metadata = { title: 'Impor Responden' };
export const dynamic = 'force-dynamic';

// Impor banyak responden dari CSV (khusus super admin). Setiap akun mendapat kode akses 6 angka.
export default async function ImporResponden() {
  await wajibAdmin('super_admin');
  return (
    <>
      <p>
        <Link href="/admin/responden/">← Manajemen Pengguna</Link>
      </p>
      <div className="dasbor-kepala">
        <h1>Impor Responden (CSV)</h1>
        <p>Buat banyak akun responden sekaligus. Kode akses hasil impor tampil sekali di halaman ini; setelah itu kode tetap bisa dilihat lewat “Tampilkan”.</p>
      </div>
      <FormImpor />
    </>
  );
}
