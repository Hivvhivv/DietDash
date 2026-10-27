// Ekspor jawaban pretest/posttest: satu baris per responden, memakai ID peserta (tanpa nama/nomor HP).
// Bawaan hanya responden penelitian; ?cakupan=semua menyertakan akun bukan sampel. Tercatat di log.
import { notFound } from 'next/navigation';
import { wajibAdmin } from '@/lib/admin-auth';
import { catatAudit } from '@/lib/db';
import { eksporTes } from '@/lib/tes';
import { buatCsv } from '@/lib/xlsx';

export async function GET(req: Request, { params }: { params: Promise<{ jenis: string }> }) {
  const admin = await wajibAdmin();
  const { jenis } = await params;
  if (jenis !== 'pretest' && jenis !== 'posttest') notFound();
  const semua = new URL(req.url).searchParams.get('cakupan') === 'semua';
  const { kepala, isi } = await eksporTes(jenis, semua);
  const nama = `${jenis}_${new Date().toISOString().slice(0, 10)}${semua ? '_semua-akun' : ''}.csv`;
  await catatAudit({ admin: admin.email, aksi: 'ekspor_data', objek: nama, keterangan: `${isi.length} baris` });
  return new Response(buatCsv([kepala, ...isi]), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nama}"`,
      'Cache-Control': 'no-store',
    },
  });
}
