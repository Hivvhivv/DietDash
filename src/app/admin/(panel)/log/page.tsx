import type { Metadata } from 'next';
import Link from 'next/link';
import { wajibAdmin } from '@/lib/admin-auth';
import { koleksi, type DokLogAudit } from '@/lib/db';
import { formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Log aktivitas' };
export const dynamic = 'force-dynamic';

const PER_HALAMAN = 100;

// Log aktivitas admin: hanya dapat dibaca dan diunduh, tidak dapat diubah atau dihapus (PRD 10.6).
export default async function Log({ searchParams }: { searchParams: Promise<{ q?: string; hal?: string }> }) {
  await wajibAdmin('super_admin');
  const { q = '', hal = '1' } = await searchParams;
  const halaman = Math.max(1, Number(hal) || 1);
  const { logAudit } = await koleksi();
  const cari = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = cari ? { $or: (['admin', 'aksi', 'objek', 'keterangan'] as const).map((k) => ({ [k]: { $regex: cari, $options: 'i' } })) } : {};
  const [entri, total] = await Promise.all([
    logAudit
      .find(filter as Partial<DokLogAudit>)
      .sort({ waktu: -1 })
      .skip((halaman - 1) * PER_HALAMAN)
      .limit(PER_HALAMAN)
      .toArray(),
    logAudit.countDocuments(filter as Partial<DokLogAudit>),
  ]);
  const jumlahHal = Math.max(1, Math.ceil(total / PER_HALAMAN));
  const tautan = (h: number) => `?${new URLSearchParams({ ...(q ? { q } : {}), hal: String(h) })}`;

  return (
    <>
      <h1>Log aktivitas</h1>
      <p className="label-kecil">Semua tindakan admin dan perubahan konten. Log tidak dapat diubah atau dihapus.</p>
      <div className="grup-tombol">
        <form method="get" className="form-admin form-saring" role="search">
          <div className="bidang">
            <label htmlFor="q">Cari (email, aksi, objek)</label>
            <input id="q" name="q" type="search" defaultValue={q} />
          </div>
          <button type="submit" className="tombol tombol-sekunder">
            Cari
          </button>
        </form>
        <a className="tombol tombol-sekunder" href="/admin/log/unduh/">
          Unduh CSV
        </a>
      </div>
      <p role="status">{total} entri</p>
      <div className="tabel-gulir">
        <table className="tabel-admin">
          <thead>
            <tr>
              <th scope="col">Waktu</th>
              <th scope="col">Admin</th>
              <th scope="col">Aksi</th>
              <th scope="col">Objek</th>
              <th scope="col">Alasan / keterangan</th>
            </tr>
          </thead>
          <tbody>
            {entri.map((e) => (
              <tr key={e._id.toHexString()}>
                <td>{formatWaktu(e.waktu)}</td>
                <td>{e.admin}</td>
                <td>{e.aksi.replaceAll('_', ' ')}</td>
                <td>{e.objek ?? '—'}</td>
                <td>{[e.alasan, e.keterangan].filter(Boolean).join(' · ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {jumlahHal > 1 && (
        <nav aria-label="Halaman log" className="grup-tautan">
          {halaman > 1 && <Link href={tautan(halaman - 1)}>‹ Sebelumnya</Link>}
          <span>
            Halaman {halaman} dari {jumlahHal}
          </span>
          {halaman < jumlahHal && <Link href={tautan(halaman + 1)}>Berikutnya ›</Link>}
        </nav>
      )}
    </>
  );
}
