import { wajibAdmin } from '@/lib/auth';
import { catatAudit } from '@/lib/db';
import { daftarPeserta, keCsv } from '@/lib/peserta-admin';

export async function GET() {
  const admin = await wajibAdmin('peneliti');
  const baris = await daftarPeserta();
  await catatAudit({ admin: admin.username, aksi: 'unduh_data_peserta', keterangan: `${baris.length} peserta` });
  const tanggal = new Date().toISOString().slice(0, 10);
  return new Response(keCsv(baris), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="progres-peserta-dash-sehat-${tanggal}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
