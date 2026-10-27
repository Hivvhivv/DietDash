import type { Metadata } from 'next';
import Link from 'next/link';
import TabelResponden, { type BarisResponden as BarisTabel } from '@/components/admin/TabelResponden';
import Ikon, { type NamaIkon } from '@/components/Ikon';
import { wajibAdmin } from '@/lib/admin-auth';
import { waktuRelatif } from '@/lib/dashboard-admin';
import { koleksi } from '@/lib/db';
import { sha256 } from '@/lib/identitas';
import { statusKunci } from '@/lib/kode-akses';
import { daftarResponden } from '@/lib/monitor';
import { ambilPengaturan } from '@/lib/pengaturan';
import { formatWaktu } from '@/lib/waktu';

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
  // Responden yang punya salinan kode terenkripsi (bisa "Tampilkan"); isi kodenya tidak dibaca di sini.
  const punyaKode = new Set(
    (await k.responden.find({ kode_terenkripsi: { $type: 'string' } }, { projection: { _id: 1 } }).toArray()).map((r) => r._id.toHexString()),
  );
  const barisTabel: BarisTabel[] = baris.map((b) => ({
    id_peserta: b.id_peserta,
    nama: b.nama,
    nomor_samar: b.nomor_samar,
    hp_hash: sha256(b.nomor_hp),
    sampel: b.status_sampel === 'responden_penelitian',
    aktif: b.status_akun === 'aktif',
    status_akun: b.status_akun,
    status_belajar: b.status_belajar,
    hari_ke: b.hari_sejak_daftar + 1,
    batas_hari: atur.batas_intervensi_hari,
    selesai: b.selesai,
    total: b.total,
    persen: b.persen,
    pretest: b.pretest_selesai,
    posttest: b.posttest_selesai,
    terakhir_aktif: formatWaktu(b.terakhir_aktif),
    terakhir_relatif: waktuRelatif(b.terakhir_aktif, sekarang),
    waktu_aktif: b.terakhir_aktif.getTime(),
    waktu_daftar: b.dibuat_pada.getTime(),
    tidak_aktif: b.tidak_aktif,
    mendekati_batas: b.mendekati_batas,
    punya_kode: punyaKode.has(b.id.toHexString()),
  }));
  const kunci = superAdmin ? statusKunci() : 'aktif';
  const tanpaKode = baris.length - punyaKode.size;

  return (
    <>
      <div className="dasbor-bagian-kepala pengguna-kepala">
        <div>
          <p className="label-kecil dasbor-label">
            Manajemen Pengguna & Hak Akses{' '}
            <span className="lencana lencana-materi-selesai">● {baris.length} responden terdaftar</span>
          </p>
          <h1 className="dasbor-judul-besar">Manajemen Pengguna</h1>
          <p className="label-kecil">
            Kelola akun responden penelitian. Nomor HP tampil tersamar; nomor lengkap hanya di halaman detail. Akun admin dikelola di
            {superAdmin ? ' Akun Admin' : ' menu super admin'}. Membuka kode akses, mencetak kartu, dan mengunduh daftar kode tercatat di log.
          </p>
        </div>
        <div className="grup-tombol pengguna-alat">
          {superAdmin && (
            <>
              <Link className="tombol tombol-kecil" href="/admin/responden/tambah/">
                <Ikon nama="tambah-orang" ukuran={18} /> Tambah Responden
              </Link>
              <Link className="tombol tombol-sekunder tombol-kecil" href="/admin/responden/impor/">
                Impor CSV
              </Link>
              <a className="tombol tombol-sekunder tombol-kecil" href="/admin/responden/kode-akses/unduh/">
                Unduh daftar kode
              </a>
              <a className="tombol tombol-sekunder tombol-kecil" href="/admin/cetak/?mode=kartu" target="_blank" rel="noopener">
                Cetak semua kartu
              </a>
            </>
          )}
          <a className="tombol tombol-kecil" href="/admin/cetak/?mode=daftar" target="_blank" rel="noopener">
            Ekspor PDF
          </a>
        </div>
      </div>

      {kunci !== 'aktif' && (
        <div className="kotak kotak-peringatan" role="status">
          <p>
            <strong>Kode akses belum bisa ditampilkan.</strong>{' '}
            {kunci === 'kosong'
              ? 'Variabel KUNCI_KODE_AKSES belum diatur di server.'
              : 'Variabel KUNCI_KODE_AKSES sudah diisi, tetapi formatnya tidak valid (harus 32 byte dalam base64).'}{' '}
            Selama itu, akun baru tetap bisa masuk, tetapi salinan kodenya tidak disimpan sehingga tidak bisa dilihat di sini.
          </p>
          <p>
            Cara memperbaiki: buat kunci dengan perintah <code>node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;base64&apos;))&quot;</code>,
            isi ke <code>.env.local</code> dan Environment Variables di Vercel, lalu jalankan ulang server/deploy ulang. Akun yang
            sudah terdaftar perlu <strong>Reset Kode</strong> agar kodenya bisa dilihat.
          </p>
        </div>
      )}
      {kunci === 'aktif' && superAdmin && tanpaKode > 0 && (
        <p className="kotak-info">
          {tanpaKode} akun belum punya salinan kode (dibuat sebelum fitur lihat kode aktif). Gunakan <strong>Reset Kode</strong> pada akun
          tersebut bila kodenya perlu bisa dilihat.
        </p>
      )}

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

      <section className="kartu-panel" aria-labelledby="judul-list-responden">
        <h2 id="judul-list-responden" className="pengguna-judul-tabel">List Responden</h2>
        <TabelResponden baris={barisTabel} superAdmin={superAdmin} />
      </section>
    </>
  );
}
