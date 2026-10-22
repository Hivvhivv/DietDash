import type { Metadata } from 'next';
import Link from 'next/link';
import { wajibAdmin } from '@/lib/admin-auth';
import { ambilStruktur, versiAktif } from '@/lib/konten';
import { versiKerja } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Kelola Materi' };
export const dynamic = 'force-dynamic';

export default async function KelolaMateri() {
  const admin = await wajibAdmin();
  const [kerja, aktif] = await Promise.all([versiKerja(), versiAktif()]);
  const v = kerja ?? aktif;
  const s = v ? await ambilStruktur(v._id) : null;
  const bolehUbah = !!kerja && (kerja.jenis === 'biasa' || admin.peran === 'super_admin');

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Kelola Materi</h1>
        <p>
          {s ? `${s.materi.length} materi dalam ${s.modul.length} modul · ${v!.label}` : 'Belum ada konten.'}
          {!kerja && s && ' (hanya baca — buat versi kerja di Kelola Modul untuk mengedit)'}
        </p>
      </div>
      {!s && (
        <p>
          Mulai dari <Link href="/admin/konten/">Kelola Modul</Link>.
        </p>
      )}
      {s?.modul.map((md) => (
        <section key={md.kunci} className="kartu-panel" aria-labelledby={`modul-${md.kunci}`}>
          <div className="kartu-panel-kepala">
            <h2 id={`modul-${md.kunci}`}>
              Modul {md.nomor}. {md.judul}
            </h2>
            {bolehUbah && (
              <Link className="tombol tombol-sekunder tombol-kecil" href={`/admin/konten/materi/baru/?modul=${md.kunci}`}>
                + Tambah materi
              </Link>
            )}
          </div>
          <div className="tabel-gulir">
            <table className="tabel-admin">
              <thead>
                <tr>
                  <th scope="col">No.</th>
                  <th scope="col">Judul materi</th>
                  <th scope="col">Waktu baca</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {md.materi.map((m) => (
                  <tr key={m.kunci}>
                    <td>{m.nomor}</td>
                    <th scope="row">{m.judul}</th>
                    <td>±{m.menit} mnt</td>
                    <td>
                      <span className="grup-tautan">
                        {bolehUbah && <Link href={`/admin/konten/materi/${m.kunci}/`}>Edit</Link>}
                        <Link href={`/admin/konten/pratinjau/${m.kunci}/`}>Pratinjau</Link>
                      </span>
                    </td>
                  </tr>
                ))}
                {md.materi.length === 0 && (
                  <tr>
                    <td colSpan={4}>Belum ada materi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
