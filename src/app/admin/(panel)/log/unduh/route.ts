// Unduh seluruh log aktivitas sebagai CSV (super admin). Unduhan ini sendiri tercatat di log.
import { wajibAdmin } from '@/lib/admin-auth';
import { catatAudit, koleksi } from '@/lib/db';
import { buatCsv } from '@/lib/xlsx';

export async function GET() {
  const admin = await wajibAdmin('super_admin');
  const { logAudit } = await koleksi();
  const entri = await logAudit.find({}).sort({ waktu: 1 }).toArray();
  await catatAudit({ admin: admin.email, aksi: 'unduh_log', keterangan: `${entri.length} entri` });
  const baris = [
    ['waktu', 'admin', 'aksi', 'objek', 'alasan', 'keterangan'],
    ...entri.map((e) => [e.waktu.toISOString(), e.admin, e.aksi, e.objek ?? '', e.alasan ?? '', e.keterangan ?? '']),
  ];
  const nama = `log-aktivitas_${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(buatCsv(baris), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nama}"`,
      'Cache-Control': 'no-store',
    },
  });
}
