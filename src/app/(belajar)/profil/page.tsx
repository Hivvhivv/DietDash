import type { Metadata } from 'next';
import Link from 'next/link';
import { aksiKeluar } from '@/app/aksi-responden';
import { FormGantiNomor, FormGantiToken, FormMundur, FormNama } from '@/components/belajar/FormAkun';
import KepalaHalaman from '@/components/KepalaHalaman';
import { samarkanNomorHp } from '@/lib/identitas';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Profil' };

export default async function Profil({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  // Kode akses baru dari profil belum dikonfirmasi saat halaman dirender ulang; jangan alihkan dulu.
  const a = await wajibResponden({ izinkanBelumSimpan: true });
  const { pesan } = await searchParams;
  return (
    <>
      <KepalaHalaman remah={[{ href: '/belajar/modul/', label: 'Modul Pembelajaran' }]} label="Akun" judul="Profil" ringkasan="Data akun Anda. Nomor HP ditampilkan tersamarkan." />
      <div className="wadah-baca bagian-isi">
        {pesan === 'token-baru' && (
          <p className="pesan-sukses" role="status">
            Kode akses baru tersimpan. Gunakan kode baru setiap kali masuk.
          </p>
        )}
        <dl className="kartu kartu-data">
          <div>
            <dt>Nama</dt>
            <dd>{a.r.nama}</dd>
          </div>
          <div>
            <dt>Nomor HP</dt>
            <dd>{samarkanNomorHp(a.r.nomor_hp)}</dd>
          </div>
        </dl>

        <section className="bagian-kartu" aria-labelledby="judul-pengaturan">
          <h2 id="judul-pengaturan">Pengaturan akun</h2>
          <details className="tanya">
            <summary>Ubah nama</summary>
            <div className="tanya-isi">
              <FormNama nama={a.r.nama} />
            </div>
          </details>
          <details className="tanya">
            <summary>Buat kode akses baru</summary>
            <div className="tanya-isi">
              <FormGantiToken />
            </div>
          </details>
          <details className="tanya">
            <summary>Ganti nomor HP</summary>
            <div className="tanya-isi">
              <FormGantiNomor />
            </div>
          </details>
          <details className="tanya bahaya">
            <summary>Mengundurkan diri dari penelitian</summary>
            <div className="tanya-isi">
              <FormMundur />
            </div>
          </details>
        </section>

        <p className="grup-tautan">
          <Link href="/belajar/">Dashboard</Link>
          <Link href="/privasi/">Privasi</Link>
        </p>
        <form action={aksiKeluar}>
          <button type="submit" className="tombol tombol-sekunder">
            Keluar
          </button>
        </form>
      </div>
    </>
  );
}
