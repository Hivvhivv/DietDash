import type { Metadata } from 'next';
import Link from 'next/link';
import TabelMonitor, { type BarisMonitor } from '@/components/admin/TabelMonitor';
import Ikon, { type NamaIkon } from '@/components/Ikon';
import { wajibAdmin } from '@/lib/admin-auth';
import { barisMonitorAdmin, barisMonitorResponden } from '@/lib/dashboard-admin';
import { koleksi } from '@/lib/db';
import { daftarResponden } from '@/lib/monitor';
import { ambilPengaturan } from '@/lib/pengaturan';

export const metadata: Metadata = { title: 'Manajemen Pengguna' };
export const dynamic = 'force-dynamic';

const HARI = 86_400_000;

function KartuRingkas({ judul, ikon, warna, angka, ket, catatan, href }: { judul: string; ikon: NamaIkon; warna: string; angka: React.ReactNode; ket: string; catatan: React.ReactNode; href?: string }) {
  return (
    <li className="kartu-pengguna">
      <div className="kartu-pengguna-kepala">
        <span className="kartu-pengguna-judul">{judul}</span>
        <span className={`ubin-ikon ubin-kecil ubin-${warna}`} aria-hidden="true">
          <Ikon nama={ikon} ukuran={18} />
        </span>
      </div>
      <p className="kartu-pengguna-angka">{angka}</p>
      <p className="label-kecil">{ket}</p>
      {href ? (
        <Link className="kartu-pengguna-catatan" href={href}>
          {catatan}
        </Link>
      ) : (
        <p className="kartu-pengguna-catatan">{catatan}</p>
      )}
    </li>
  );
}

// Manajemen Pengguna & Hak Akses (PRD 11.2). Nomor HP tampil tersamar; nomor lengkap hanya di halaman detail
// (tercatat di log). Pencarian nama/nomor dilakukan di peramban sehingga tidak masuk URL atau log.
export default async function ManajemenPengguna() {
  const admin = await wajibAdmin();
  const superAdmin = admin.peran === 'super_admin';
  const [{ baris }, atur, k] = await Promise.all([daftarResponden(), ambilPengaturan(), koleksi()]);
  const admins = await k.admin.find({}, { projection: { password_hash: 0 } }).sort({ dibuat_pada: 1 }).toArray();

  const sekarang = Date.now();
  const sampel = baris.filter((b) => b.status_sampel === 'responden_penelitian');
  const target = atur.target_responden;
  const rata = sampel.length ? Math.round(sampel.reduce((n, b) => n + b.persen, 0) / sampel.length) : 0;
  const tuntas = sampel.filter((b) => b.status_belajar === 'selesai').length;
  const akunAktif = baris.filter((b) => b.status_akun === 'aktif');
  const aktif7 = akunAktif.filter((b) => sekarang - b.terakhir_aktif.getTime() <= 7 * HARI).length;
  const persenAktif = akunAktif.length ? Math.round((aktif7 / akunAktif.length) * 1000) / 10 : 0;
  const nSuper = admins.filter((a) => a.peran === 'super_admin' && a.aktif).length;
  const nAdmin = admins.filter((a) => a.peran === 'admin' && a.aktif).length;

  // Daftar akun admin hanya untuk super admin (sama seperti halaman Akun Admin).
  const barisTabel: BarisMonitor[] = [
    ...baris.map((b) => barisMonitorResponden(b, sekarang)),
    ...(superAdmin ? admins.map((a) => barisMonitorAdmin(a)) : []),
  ];

  return (
    <>
      <div className="dasbor-bagian-kepala pengguna-kepala">
        <div>
          <p className="label-kecil dasbor-label">
            Manajemen Pengguna & Hak Akses{' '}
            <span className="lencana lencana-materi-selesai">● {baris.length + (superAdmin ? admins.length : 0)} akun terdaftar</span>
          </p>
          <h1 className="dasbor-judul-besar">Manajemen Pengguna</h1>
          <p className="label-kecil">
            Kelola akun responden penelitian{superAdmin ? ' dan tim peneliti (admin)' : ''}. Nomor HP tampil tersamar; nomor lengkap
            hanya dapat dibuka di halaman detail dan tercatat di log.
          </p>
        </div>
        <div className="grup-tombol">
          <Link className="tombol tombol-sekunder tombol-kecil" href="/admin/laporan/#ekspor">
            <Ikon nama="grafik" ukuran={18} /> Ekspor Data (.csv / Excel)
          </Link>
          {superAdmin && (
            <Link className="tombol tombol-kecil" href="/admin/responden/tambah/">
              <Ikon nama="tambah-orang" ukuran={18} /> Tambah Pengguna Baru
            </Link>
          )}
        </div>
      </div>

      <ul className="kisi-kartu-pengguna">
        <KartuRingkas
          judul="Total Responden"
          ikon="pengguna"
          warna="hijau"
          angka={
            <>
              {sampel.length}
              {target > 0 && <span className="kartu-pengguna-sub"> / {target} target</span>}
            </>
          }
          ket={`Responden penelitian · ${baris.length - sampel.length} bukan sampel`}
          catatan={target > 0 ? `${Math.round((sampel.length / target) * 100)}% kuota terisi` : 'Atur target kuota →'}
          href={target > 0 ? undefined : '/admin/pengaturan/'}
        />
        <KartuRingkas
          judul="Rata-rata Penyelesaian"
          ikon="grafik"
          warna="biru"
          angka={`${rata}%`}
          ket={`${tuntas} responden menuntaskan semua materi`}
          catatan="Keterlaksanaan intervensi →"
          href="/admin/laporan/"
        />
        <KartuRingkas
          judul="Tim Peneliti"
          ikon="perisai"
          warna="oranye"
          angka={nSuper + nAdmin}
          ket={`${nSuper} super admin · ${nAdmin} admin`}
          catatan={superAdmin ? 'Kelola akun admin →' : 'Akses panel admin'}
          href={superAdmin ? '/admin/admins/' : undefined}
        />
        <KartuRingkas
          judul="Keaktifan Mingguan"
          ikon="lonceng"
          warna="toska"
          angka={
            <>
              {aktif7}
              <span className="kartu-pengguna-sub"> / {akunAktif.length} akun</span>
            </>
          }
          ket="Responden aktif dalam 7 hari terakhir"
          catatan={`Tingkat keaktifan ${persenAktif.toLocaleString('id-ID')}%`}
        />
      </ul>

      <section className="kartu-panel" aria-label="Daftar pengguna">
        <TabelMonitor baris={barisTabel} lengkap lihatKode={superAdmin} />
      </section>
    </>
  );
}
