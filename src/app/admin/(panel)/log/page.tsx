import type { Metadata } from 'next';
import { wajibAdmin } from '@/lib/auth';
import { ambilLogAudit } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Log audit' };

const LABEL_AKSI: Record<string, string> = {
  impor: 'Impor awal',
  buat_admin: 'Buat akun admin',
  masuk: 'Masuk',
  keluar: 'Keluar',
  gagal_masuk: 'Gagal masuk',
  buat_draf: 'Buat draf',
  ubah_draf: 'Ubah draf',
  hapus_draf: 'Hapus draf',
  buat_modul: 'Buat modul baru',
  setujui: 'Setujui & tayangkan',
  buat_tautan_reset: 'Buat tautan reset sandi peserta',
  hapus_peserta: 'Hapus akun peserta',
  hapus_semua_peserta: 'Hapus semua data peserta',
  unduh_data_peserta: 'Unduh data peserta (CSV)',
};

export default async function LogAudit() {
  await wajibAdmin();
  const log = await ambilLogAudit(200);

  return (
    <>
      <h1>Log audit</h1>
      <p>
        Catatan siapa melakukan apa dan kapan. Gunakan untuk menelusuri versi konten yang diterima
        responden. Menampilkan 200 entri terbaru.
      </p>
      <p>
        <a className="tombol tombol-sekunder" href="/admin/log/unduh/">
          Unduh seluruh log (JSON)
        </a>
      </p>
      <div className="tabel-gulir">
        <table className="tabel-admin">
          <caption className="sr-only">Log audit</caption>
          <thead>
            <tr>
              <th scope="col">Waktu (WIB)</th>
              <th scope="col">Admin</th>
              <th scope="col">Aksi</th>
              <th scope="col">Modul</th>
              <th scope="col">Versi</th>
              <th scope="col">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {log.map((l) => (
              <tr key={l._id.toHexString()}>
                <td>
                  {l.waktu.toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                    timeZone: 'Asia/Jakarta',
                  })}
                </td>
                <td>{l.admin}</td>
                <td>{LABEL_AKSI[l.aksi] ?? l.aksi}</td>
                <td>{l.modul_id ?? '—'}</td>
                <td>{l.versi ?? '—'}</td>
                <td>{l.keterangan ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
