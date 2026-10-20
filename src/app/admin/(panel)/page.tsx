import type { Metadata } from 'next';
import Link from 'next/link';
import { wajibAdmin } from '@/lib/auth';
import { daftarModulAdmin } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Dasbor' };

export default async function Dasbor({ searchParams }: { searchParams: Promise<{ akses?: string }> }) {
  const admin = await wajibAdmin();
  const modul = await daftarModulAdmin();
  const { akses } = await searchParams;

  return (
    <>
      <h1>Dasbor konten</h1>
      {akses === 'ditolak' && (
        <p className="galat-umum" role="alert">
          Halaman atau tindakan tadi hanya untuk admin berperan peneliti.
        </p>
      )}
      <p>
        Setiap perubahan dibuat sebagai <strong>draf</strong>. Pengunjung hanya melihat versi yang{' '}
        <strong>disetujui</strong>
        {admin.peran === 'peneliti'
          ? '. Sebagai peneliti, Anda dapat menyetujui draf.'
          : ' oleh admin berperan peneliti.'}
      </p>

      <div className="tabel-gulir">
        <table className="tabel-admin">
          <caption className="sr-only">Daftar modul</caption>
          <thead>
            <tr>
              <th scope="col">Urutan</th>
              <th scope="col">Modul</th>
              <th scope="col">Versi tayang</th>
              <th scope="col">Draf</th>
              <th scope="col">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {modul.map((m) => (
              <tr key={m.modul_id}>
                <td>{m.urutan}</td>
                <td>
                  <strong>{m.judul}</strong>
                  <br />
                  <span className="label-kecil">{m.modul_id}</span>
                </td>
                <td>{m.versi_tayang ?? <span className="lencana lencana-draf">Belum tayang</span>}</td>
                <td>{m.jumlah_draf > 0 ? `${m.jumlah_draf} draf` : '—'}</td>
                <td>
                  <Link href={`/admin/modul/${m.modul_id}/`}>Kelola</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="kotak kotak-peringatan">
        <p>
          <strong>Catatan penelitian:</strong> selama pengambilan data, semua responden harus
          menerima konten yang sama. Hindari menyetujui perubahan konten inti di tengah penelitian
          tanpa keputusan tim peneliti.
        </p>
      </div>

      <Link className="tombol tombol-sekunder" href="/admin/modul/baru/">
        Tambah modul baru
      </Link>
    </>
  );
}
