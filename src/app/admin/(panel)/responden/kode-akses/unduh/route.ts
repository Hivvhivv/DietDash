// Unduh daftar kode akses (khusus super admin) untuk membagikan kode kepada responden.
// Berisi nama + nomor HP tersamar + kode; bukan berkas analisis (yang memakai ID peserta saja). Tercatat di log.
import { wajibAdmin } from '@/lib/admin-auth';
import { catatAudit } from '@/lib/db';
import { formatToken } from '@/lib/identitas';
import { daftarResponden } from '@/lib/monitor';
import { kodeBeberapaResponden } from '@/lib/responden';
import { buatCsv } from '@/lib/xlsx';

export async function GET() {
  const admin = await wajibAdmin('super_admin');
  const { baris } = await daftarResponden();
  const kode = await kodeBeberapaResponden(baris.map((b) => b.id));
  const isi = [
    ['id_peserta', 'nama', 'nomor_hp_tersamar', 'kode_akses', 'status_akun', 'kelompok'],
    ...baris
      .slice()
      .sort((a, b) => a.id_peserta.localeCompare(b.id_peserta))
      .map((b) => {
        const k = kode.get(b.id.toHexString());
        return [b.id_peserta, b.nama, b.nomor_samar, k ? formatToken(k) : '(belum tersedia - buat kode baru)', b.status_akun, b.status_sampel === 'responden_penelitian' ? 'penelitian' : 'bukan sampel'];
      }),
  ];
  const tanggal = new Date().toISOString().slice(0, 10);
  await catatAudit({ admin: admin.email, aksi: 'unduh_daftar_kode', keterangan: `${kode.size} kode dari ${baris.length} responden` });
  return new Response(buatCsv(isi), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="daftar-kode-akses_${tanggal}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
