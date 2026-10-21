import type { Metadata } from 'next';
import { aksiUbahAdmin } from '../../aksi-akun';
import { FormAksi, FormUndangAdmin } from '@/components/admin/FormAdmin';
import { wajibAdmin } from '@/lib/admin-auth';
import { koleksi } from '@/lib/db';
import { formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Kelola admin' };
export const dynamic = 'force-dynamic';

export default async function KelolaAdmin() {
  const saya = await wajibAdmin('super_admin');
  const { admin, undangan } = await koleksi();
  const [daftar, menunggu] = await Promise.all([
    admin.find({}, { projection: { password_hash: 0, totp_rahasia: 0 } }).sort({ dibuat_pada: 1 }).toArray(),
    undangan.find({ dipakai_pada: null, kedaluwarsa_pada: { $gt: new Date() } }).sort({ kedaluwarsa_pada: 1 }).toArray(),
  ]);

  return (
    <>
      <h1>Kelola admin</h1>
      <section className="bagian-kartu" aria-labelledby="judul-undang">
        <h2 id="judul-undang">Undang admin baru</h2>
        <p className="label-kecil">
          Website tidak mengirim email. Setelah undangan dibuat, salin tautannya dan kirim sendiri ke email calon admin. Tautan berlaku
          48 jam dan hanya bisa dipakai sekali.
        </p>
        <FormUndangAdmin />
        {menunggu.length > 0 && (
          <>
            <h3>Undangan menunggu</h3>
            <ul>
              {menunggu.map((u) => (
                <li key={u._id.toHexString()}>
                  {u.email} ({u.peran === 'super_admin' ? 'super admin' : 'admin'}) — berlaku sampai {formatWaktu(u.kedaluwarsa_pada)}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="bagian-kartu" aria-labelledby="judul-daftar-admin">
        <h2 id="judul-daftar-admin">Daftar admin</h2>
        <div className="tabel-gulir">
          <table className="tabel-admin">
            <thead>
              <tr>
                <th scope="col">Nama & email</th>
                <th scope="col">Peran</th>
                <th scope="col">Status</th>
                <th scope="col">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((a) => {
                const id = a._id.toHexString();
                const diriSendiri = a._id.equals(saya.id);
                return (
                  <tr key={id}>
                    <th scope="row">
                      {a.nama}
                      <div className="label-kecil">{a.email}</div>
                    </th>
                    <td>{a.peran === 'super_admin' ? 'Super admin' : 'Admin'}</td>
                    <td>
                      {a.aktif ? 'Aktif' : '⛔ Nonaktif'}
                      <div className="label-kecil">{a.totp_aktif ? '✓ 2FA aktif' : '⚠ 2FA belum diatur'}</div>
                    </td>
                    <td className="sel-aksi">
                      {diriSendiri ? (
                        <span className="label-kecil">Akun Anda</span>
                      ) : (
                        <>
                          <FormAksi
                            aksi={aksiUbahAdmin}
                            data={{ id, tindakan: a.aktif ? 'nonaktifkan' : 'aktifkan' }}
                            label={a.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                            bahaya={a.aktif}
                            konfirmasi={a.aktif ? `Nonaktifkan ${a.email}? Semua sesinya akan keluar.` : undefined}
                          />
                          {a.totp_aktif && (
                            <FormAksi
                              aksi={aksiUbahAdmin}
                              data={{ id, tindakan: 'reset_2fa' }}
                              label="Reset 2FA"
                              sekunder
                              konfirmasi={`Reset 2FA ${a.email}? Admin ini harus mengatur ulang aplikasi autentikator saat masuk berikutnya.`}
                            />
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
