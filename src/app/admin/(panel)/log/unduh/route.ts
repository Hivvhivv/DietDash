import { wajibAdmin } from '@/lib/auth';
import { koleksi } from '@/lib/db';

export async function GET() {
  const admin = await wajibAdmin();
  const { logAudit } = await koleksi();
  const log = await logAudit.find({}, { projection: { _id: 0 } }).sort({ waktu: 1 }).toArray();
  const tanggal = new Date().toISOString().slice(0, 10);

  return new Response(
    JSON.stringify({ diunduh_oleh: admin.username, diunduh_pada: new Date(), log }, null, 2),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="log-audit-dash-sehat-${tanggal}.json"`,
        'Cache-Control': 'no-store',
      },
    },
  );
}
