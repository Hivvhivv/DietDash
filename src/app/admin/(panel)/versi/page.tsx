import type { Metadata } from 'next';
import Link from 'next/link';
import { aksiBuatPerbaikan, aksiHapusKontenContoh, aksiKunciVersi, aksiTerbitkan } from '../../aksi-konten';
import { FormAksi } from '@/components/admin/FormAdmin';
import LencanaVersi from '@/components/admin/LencanaVersi';
import { wajibAdmin } from '@/lib/admin-auth';
import { daftarVersi, validasiVersi, versiKerja } from '@/lib/konten-admin';
import { ambilPengaturan } from '@/lib/pengaturan';
import { formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Versi konten' };
export const dynamic = 'force-dynamic';

export default async function Versi() {
  await wajibAdmin('super_admin');
  const [semua, kerja, atur] = await Promise.all([daftarVersi(), versiKerja(), ambilPengaturan()]);
  const aktif = semua.find((v) => atur.versi_aktif_id?.equals(v._id)) ?? null;
  const masalahKerja = kerja ? await validasiVersi(kerja._id) : [];
  const usulanLabel = aktif?.status === 'dikunci' ? `${aktif.label}.1` : 'v1.0';

  return (
    <>
      <h1>Versi konten</h1>
      <p className="kotak-info">
        Terbitkan setelah konten divalidasi ahli. Kunci versi sebelum responden pertama mulai; setelah dikunci, konten tidak dapat
        diedit. Perbaikan mendesak (mis. salah ketik) dibuat sebagai versi perbaikan dengan alasan dan tercatat di log.
      </p>

      {kerja?.status === 'siap_ditinjau' && (
        <section className="bagian-kartu" aria-labelledby="judul-terbit">
          <h2 id="judul-terbit">Terbitkan {kerja.label}</h2>
          <p>
            Ditandai siap oleh {kerja.ditandai_siap_oleh} pada {formatWaktu(kerja.ditandai_siap_pada)}.{' '}
            <Link href="/admin/konten/">Tinjau isi di halaman Konten</Link>.
          </p>
          {masalahKerja.length > 0 ? (
            <p className="galat-umum">Versi ini belum lolos pemeriksaan ({masalahKerja.length} hal). Kembalikan ke draf dan lengkapi.</p>
          ) : (
            <FormAksi aksi={aksiTerbitkan} data={{ id: kerja._id.toHexString() }} label="Terbitkan untuk responden" konfirmasi="Terbitkan versi ini? Responden akan langsung melihat konten baru.">
              {aktif?.status === 'dikunci' && kerja.jenis !== 'perbaikan' && (
                <div className="bidang">
                  <label htmlFor="alasan-terbit">Alasan mengganti versi yang dikunci</label>
                  <p className="petunjuk">Versi aktif sedang dikunci untuk penelitian. Penggantian tercatat sebagai penyimpangan protokol.</p>
                  <input id="alasan-terbit" name="alasan" required minLength={5} />
                </div>
              )}
            </FormAksi>
          )}
        </section>
      )}

      {semua
        .filter((v) => v.contoh)
        .map((v) => (
          <section key={v._id.toHexString()} className="bagian-kartu kotak-contoh-hapus" aria-labelledby={`judul-contoh-${v._id.toHexString()}`}>
            <h2 id={`judul-contoh-${v._id.toHexString()}`}>🧪 Konten contoh: {v.label}</h2>
            <p>
              Konten ini dimasukkan otomatis agar website bisa dicoba{atur.versi_aktif_id?.equals(v._id) ? ' dan sedang dilihat responden' : ''}.
              Sebelum responden penelitian mulai, hapus konten contoh lalu terbitkan konten yang sudah divalidasi ahli. Konten contoh
              tidak bisa dikunci.
            </p>
            <p className="label-kecil">
              Yang dihapus: semua modul, materi, kuis, dan soal di versi ini. Akun dan progres responden uji coba tidak dihapus; tandai
              akun uji coba sebagai “bukan sampel” di Manajemen Pengguna.
            </p>
            <FormAksi
              aksi={aksiHapusKontenContoh}
              data={{ id: v._id.toHexString() }}
              label="Hapus Konten Contoh"
              bahaya
              konfirmasi="Hapus semua modul, materi, dan kuis contoh? Tindakan ini tidak bisa dibatalkan."
            >
              <div className="bidang">
                <label htmlFor={`alasan-contoh-${v._id.toHexString()}`}>Alasan</label>
                <input id={`alasan-contoh-${v._id.toHexString()}`} name="alasan" required minLength={5} defaultValue="Persiapan penelitian: konten contoh diganti konten tervalidasi" />
              </div>
            </FormAksi>
          </section>
        ))}

      {aktif?.status === 'terbit' && !aktif.contoh && (
        <section className="bagian-kartu" aria-labelledby="judul-kunci">
          <h2 id="judul-kunci">🔒 Kunci {aktif.label} untuk penelitian</h2>
          <FormAksi aksi={aksiKunciVersi} data={{ id: aktif._id.toHexString() }} label="Kunci versi" konfirmasi="Setelah dikunci, konten tidak dapat diedit lagi. Lanjutkan?">
            <div className="bidang">
              <label htmlFor="label-kunci">Label versi</label>
              <p className="petunjuk">Format v1.0 (versi utama) atau v1.0.1 (perbaikan).</p>
              <input id="label-kunci" name="label" defaultValue={usulanLabel} required pattern="v\d+(\.\d+){1,2}" />
            </div>
          </FormAksi>
        </section>
      )}

      {aktif?.status === 'dikunci' && !kerja && (
        <section className="bagian-kartu" aria-labelledby="judul-perbaikan">
          <h2 id="judul-perbaikan">Buat versi perbaikan dari {aktif.label}</h2>
          <p>Hanya untuk kesalahan yang perlu segera diperbaiki. Setiap perubahan tercatat, dan versi perbaikan dikunci dengan label baru (mis. {aktif.label}.1).</p>
          <FormAksi aksi={aksiBuatPerbaikan} label="Buat versi perbaikan">
            <div className="bidang">
              <label htmlFor="alasan-perbaikan">Alasan perbaikan</label>
              <input id="alasan-perbaikan" name="alasan" required minLength={5} />
            </div>
          </FormAksi>
        </section>
      )}

      <section className="bagian-kartu" aria-labelledby="judul-riwayat-versi">
        <h2 id="judul-riwayat-versi">Riwayat versi</h2>
        <div className="tabel-gulir">
          <table className="tabel-admin">
            <thead>
              <tr>
                <th scope="col">Versi</th>
                <th scope="col">Status</th>
                <th scope="col">Dibuat</th>
                <th scope="col">Diterbitkan</th>
                <th scope="col">Dikunci</th>
              </tr>
            </thead>
            <tbody>
              {semua.map((v) => (
                <tr key={v._id.toHexString()}>
                  <th scope="row">
                    {v.label}
                    {atur.versi_aktif_id?.equals(v._id) && <div className="label-kecil">● Dilihat responden</div>}
                    {v.jenis === 'perbaikan' && <div className="label-kecil">Perbaikan: {v.alasan}</div>}
                  </th>
                  <td>
                    <LencanaVersi status={v.status} />
                    {v.contoh && <span className="lencana lencana-peringatan">🧪 Contoh</span>}
                  </td>
                  <td>
                    {formatWaktu(v.dibuat_pada)}
                    <div className="label-kecil">{v.dibuat_oleh}</div>
                  </td>
                  <td>
                    {formatWaktu(v.diterbitkan_pada)}
                    {v.diterbitkan_oleh && <div className="label-kecil">{v.diterbitkan_oleh}</div>}
                  </td>
                  <td>
                    {formatWaktu(v.dikunci_pada)}
                    {v.dikunci_oleh && <div className="label-kecil">{v.dikunci_oleh}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
