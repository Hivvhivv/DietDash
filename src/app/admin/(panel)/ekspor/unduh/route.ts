// Ekspor data (PRD 11.3): CSV/Excel, memakai ID peserta, tanpa nama dan nomor HP,
// bawaan hanya responden penelitian. Nama berkas memuat versi konten dan tanggal. Tercatat di log.
import { wajibAdmin } from '@/lib/admin-auth';
import { catatAudit } from '@/lib/db';
import { dataEkspor, type JenisEkspor } from '@/lib/monitor';
import { buatCsv, buatXlsx } from '@/lib/xlsx';

const NAMA: Record<JenisEkspor, string> = { ringkasan: 'ringkasan', progres: 'progres' };

export async function GET(req: Request) {
  const admin = await wajibAdmin();
  const url = new URL(req.url);
  const jenis = (['ringkasan', 'progres'].includes(url.searchParams.get('jenis') ?? '') ? url.searchParams.get('jenis') : 'ringkasan') as JenisEkspor;
  const format = url.searchParams.get('format') === 'xlsx' ? 'xlsx' : 'csv';
  const semua = url.searchParams.get('cakupan') === 'semua';
  const { label, baris } = await dataEkspor(jenis, semua);
  const tanggal = new Date().toISOString().slice(0, 10);
  const nama = `${NAMA[jenis]}_${label.replace(/[^\w.-]+/g, '-')}_${tanggal}${semua ? '_semua-akun' : ''}.${format}`;
  await catatAudit({ admin: admin.email, aksi: 'ekspor_data', objek: nama, keterangan: `${baris.length - 1} baris` });
  const isi = format === 'xlsx' ? buatXlsx(NAMA[jenis], baris) : buatCsv(baris);
  return new Response(typeof isi === 'string' ? isi : new Uint8Array(isi), {
    headers: {
      'Content-Type': format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nama}"`,
      'Cache-Control': 'no-store',
    },
  });
}
