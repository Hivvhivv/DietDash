import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { aksiBuatDraf } from '../../../aksi';
import LencanaStatus from '@/components/admin/LencanaStatus';
import { wajibAdmin } from '@/lib/auth';
import { daftarVersi } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Kelola modul' };

const waktu = (d?: Date) =>
  d ? d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) : '—';

const PESAN: Record<string, string> = { dihapus: 'Draf berhasil dihapus.' };

export default async function KelolaModul({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pesan?: string }>;
}) {
  await wajibAdmin();
  const { id } = await params;
  const { pesan } = await searchParams;
  const versi = await daftarVersi(id);
  if (versi.length === 0) notFound();

  const tayang = versi.find((v) => v.status === 'disetujui');
  const judul = (tayang ?? versi[0]).data.judul;
  const adaDraf = versi.some((v) => v.status === 'draf');

  return (
    <>
      <p>
        <Link href="/admin/">← Dasbor</Link>
      </p>
      <h1>{judul}</h1>
      <p className="label-kecil">
        ID modul: {id}
        {tayang && (
          <>
            {' '}
            · <a href={`/materi/${id}/`} target="_blank" rel="noopener">Lihat di website</a>
          </>
        )}
      </p>
      {pesan && PESAN[pesan] && (
        <p className="pesan-sukses" role="status">
          {PESAN[pesan]}
        </p>
      )}

      <h2>Riwayat versi</h2>
      <div className="tabel-gulir">
        <table className="tabel-admin">
          <caption className="sr-only">Riwayat versi modul {judul}</caption>
          <thead>
            <tr>
              <th scope="col">Versi</th>
              <th scope="col">Status</th>
              <th scope="col">Dibuat</th>
              <th scope="col">Disetujui</th>
              <th scope="col">Catatan</th>
              <th scope="col">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {versi.map((v) => (
              <tr key={v._id.toHexString()}>
                <td>
                  <strong>{v.versi}</strong>
                </td>
                <td>
                  <LencanaStatus status={v.status} />
                </td>
                <td>
                  {waktu(v.dibuat_pada)}
                  <br />
                  <span className="label-kecil">oleh {v.dibuat_oleh}</span>
                </td>
                <td>
                  {v.disetujui_pada ? (
                    <>
                      {waktu(v.disetujui_pada)}
                      <br />
                      <span className="label-kecil">oleh {v.disetujui_oleh}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td>{v.catatan || <span className="label-kecil">(belum diisi)</span>}</td>
                <td className="sel-aksi">
                  <Link href={`/admin/versi/${v._id.toHexString()}/`}>Pratinjau</Link>
                  {v.status === 'draf' && (
                    <Link href={`/admin/versi/${v._id.toHexString()}/ubah/`}>Ubah</Link>
                  )}
                  {v.status !== 'draf' && (
                    <form action={aksiBuatDraf}>
                      <input type="hidden" name="versi_id" value={v._id.toHexString()} />
                      <button type="submit" className="tautan-tombol">
                        Buat draf dari versi ini
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!adaDraf && (
        <p className="label-kecil">
          Untuk mengubah materi, pilih “Buat draf dari versi ini” pada versi yang sedang tayang.
        </p>
      )}
    </>
  );
}
