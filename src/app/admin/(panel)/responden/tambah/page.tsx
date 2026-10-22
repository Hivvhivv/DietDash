import type { Metadata } from 'next';
import Link from 'next/link';
import FormTambahPengguna from '@/components/admin/FormTambahPengguna';
import { wajibAdmin } from '@/lib/admin-auth';

export const metadata: Metadata = { title: 'Tambah Pengguna Baru' };
export const dynamic = 'force-dynamic';

// Khusus super admin: menambah responden (kode akses sekali tampil) atau mengundang admin/super admin.
export default async function TambahPengguna() {
  await wajibAdmin('super_admin');
  return (
    <>
      <p>
        <Link href="/admin/responden/">← Manajemen Pengguna</Link>
      </p>
      <div className="dasbor-kepala">
        <h1>Tambah Pengguna Baru</h1>
        <p>Pilih role, lalu isi datanya. Setiap penambahan tercatat di log aktivitas.</p>
      </div>
      <FormTambahPengguna />
    </>
  );
}
