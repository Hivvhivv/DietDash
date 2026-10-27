import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { forbidden } from 'next/navigation';
import TombolCetak from '@/components/admin/TombolCetak';
import Logo from '@/components/Logo';
import { wajibAdmin } from '@/lib/admin-auth';
import { catatAudit } from '@/lib/db';
import { formatToken } from '@/lib/identitas';
import { daftarResponden } from '@/lib/monitor';
import { ambilPengaturan } from '@/lib/pengaturan';
import { kodeBeberapaResponden } from '@/lib/responden';
import { formatTanggal, formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Cetak' };
export const dynamic = 'force-dynamic';

// Halaman cetak (di luar kerangka panel agar rapi saat dicetak / disimpan sebagai PDF).
// mode=kartu → kartu masuk responden berisi kode akses (khusus super admin, tercatat di log; tanpa ID peserta).
// mode=daftar → daftar responden untuk "Ekspor PDF" (ID peserta & progres, tanpa nama, nomor, atau kode).
export default async function Cetak({ searchParams }: { searchParams: Promise<{ mode?: string; id?: string }> }) {
  const admin = await wajibAdmin();
  const { mode, id } = await searchParams;
  const kartu = mode === 'kartu';
  if (kartu && admin.peran !== 'super_admin') forbidden();
  const [{ baris }, atur, h] = await Promise.all([daftarResponden(), ambilPengaturan(), headers()]);
  const dipilih = baris
    .filter((b) => (id ? b.id_peserta === id : b.status_akun === 'aktif'))
    .sort((a, b) => a.id_peserta.localeCompare(b.id_peserta));
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  const sekarang = new Date();

  if (kartu) {
    const kode = await kodeBeberapaResponden(dipilih.map((b) => b.id));
    await catatAudit({ admin: admin.email, aksi: 'cetak_kartu', objek: id ?? undefined, keterangan: `${dipilih.length} kartu` });
    return (
      <main className="cetak">
        <div className="cetak-alat">
          <p>
            {dipilih.length} kartu masuk · berisi kode akses, simpan dan bagikan langsung kepada responden yang bersangkutan.
          </p>
          <TombolCetak />
        </div>
        <ul className="cetak-kartu-kisi">
          {dipilih.map((b) => {
            const k = kode.get(b.id.toHexString());
            return (
              <li key={b.id_peserta} className="cetak-kartu">
                <div className="cetak-kartu-merek">
                  <Logo ukuran={32} />
                  <span>
                    <strong>DASH Sehat</strong>
                    <span>Kartu Masuk Responden</span>
                  </span>
                </div>
                <dl>
                  <div>
                    <dt>Nama</dt>
                    <dd>{b.nama}</dd>
                  </div>
                  <div>
                    <dt>Nomor HP</dt>
                    <dd>{b.nomor_samar}</dd>
                  </div>
                  <div className="cetak-kartu-kode">
                    <dt>Kode akses</dt>
                    <dd>{k ? formatToken(k) : 'Belum tersedia — minta kode baru ke peneliti'}</dd>
                  </div>
                </dl>
                <p className="cetak-kartu-cara">
                  Buka <strong>{host}</strong> → <strong>Masuk</strong> → isi nomor HP Anda dan kode akses di atas.
                </p>
                <p className="cetak-kartu-pesan">Simpan kartu ini baik-baik. Jangan berikan kode akses kepada orang lain.</p>
              </li>
            );
          })}
        </ul>
        {dipilih.length === 0 && <p>Tidak ada responden aktif.</p>}
      </main>
    );
  }

  await catatAudit({ admin: admin.email, aksi: 'ekspor_pdf_responden', keterangan: `${dipilih.length} responden` });
  return (
    <main className="cetak">
      <div className="cetak-alat">
        <p>Pilih “Simpan sebagai PDF” pada jendela cetak untuk mengekspor. Daftar memakai ID peserta saja (tanpa nama, nomor HP, dan kode).</p>
        <TombolCetak label="Cetak / Simpan PDF" />
      </div>
      <header className="cetak-kepala">
        <Logo ukuran={36} />
        <div>
          <h1>Daftar Responden DASH Sehat</h1>
          <p>
            Dicetak {formatWaktu(sekarang)} oleh {admin.email} · {dipilih.length} responden aktif · lama intervensi {atur.batas_intervensi_hari} hari
          </p>
        </div>
      </header>
      <table className="cetak-tabel">
        <thead>
          <tr>
            <th scope="col">ID peserta</th>
            <th scope="col">Kelompok</th>
            <th scope="col">Tgl daftar</th>
            <th scope="col">Hari ke-</th>
            <th scope="col">Kelengkapan</th>
            <th scope="col">Pretest / Posttest</th>
            <th scope="col">Terakhir aktif</th>
          </tr>
        </thead>
        <tbody>
          {dipilih.map((b) => (
            <tr key={b.id_peserta}>
              <td>{b.id_peserta}</td>
              <td>{b.status_sampel === 'responden_penelitian' ? 'Penelitian' : 'Bukan sampel'}</td>
              <td>{formatTanggal(b.dibuat_pada)}</td>
              <td>{b.status_belajar === 'selesai' ? '—' : `${b.hari_sejak_daftar + 1}/${atur.batas_intervensi_hari}`}</td>
              <td>
                {b.selesai}/{b.total} ({b.persen}%)
              </td>
              <td>
                {b.pretest_selesai ? 'Selesai' : 'Belum'} / {b.posttest_selesai ? 'Selesai' : 'Belum'}
              </td>
              <td>{formatWaktu(b.terakhir_aktif)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="cetak-catatan">Kelengkapan = materi yang sudah dibuka (keterlaksanaan intervensi), bukan hasil klinis.</p>
    </main>
  );
}
