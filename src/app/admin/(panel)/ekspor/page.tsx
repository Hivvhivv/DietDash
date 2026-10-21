import { redirect } from 'next/navigation';
import { wajibAdmin } from '@/lib/admin-auth';

// Ekspor kini bagian dari Laporan & Statistik. Rute unduhan tetap /admin/ekspor/unduh/.
export default async function Ekspor() {
  await wajibAdmin();
  redirect('/admin/laporan/#ekspor');
}
