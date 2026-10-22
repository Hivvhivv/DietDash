import Link from 'next/link';
import Ikon from '../Ikon';
import Logo from '../Logo';
import AkunMenu from './AkunMenu';
import MenuResponden from './MenuResponden';
import { aksiKeluar } from '@/app/aksi-responden';
import { BATASAN_EDUKASI, NAMA_SITUS, SLOGAN } from '@/data/situs';
import { labelVersiAktif, strukturAktif } from '@/lib/konten';
import { statusResponden } from '@/lib/progres';
import { respondenSaatIni } from '@/lib/responden';

// Kerangka area responden: navbar di atas (merek, menu, pemberitahuan materi berikutnya, menu akun) + isi + kaki halaman.
// Pemeriksaan akses tetap di setiap halaman (wajibResponden); kerangka ini hanya menampilkan.
export default async function KerangkaResponden({ children }: { children: React.ReactNode }) {
  const a = await respondenSaatIni();
  const struktur = a?.r.token_disimpan_pada ? await strukturAktif() : null;
  // Pemberitahuan: materi berikutnya yang sudah terbuka tetapi belum dibaca.
  const r = a && struktur ? await statusResponden(a, struktur) : null;
  const berikut = r?.daftar.find((d) => d.status === 'tersedia')?.materi ?? null;
  const nama = a?.r.nama ?? '';
  const keluar = (
    <form action={aksiKeluar}>
      <button type="submit" className="navbar-keluar">
        <Ikon nama="keluar" ukuran={20} />
        Keluar
      </button>
    </form>
  );

  return (
    <div className="panel-responden">
      <a className="lewati-konten" href="#konten-utama">
        Lewati ke konten utama
      </a>
      <header className="navbar">
        <div className="navbar-isi">
          <Link className="panel-merek" href="/belajar/">
            <Logo ukuran={42} />
            <span>
              <span className="panel-merek-nama">{NAMA_SITUS}</span>
              <span className="panel-merek-peran">{SLOGAN}</span>
            </span>
          </Link>
          <MenuResponden>
            <Link href="/profil/" className="navbar-akun-tautan">
              <Ikon nama="orang" ukuran={20} />
              Profil
            </Link>
            {keluar}
          </MenuResponden>
          <div className="navbar-kanan">
            <Link
              className="panel-lonceng"
              href={berikut ? `/belajar/materi/${berikut.kunci}/` : '/belajar/modul/'}
              aria-label={berikut ? `Materi ${berikut.nomor} siap dibaca` : 'Tidak ada materi baru'}
            >
              <Ikon nama="lonceng" />
              {berikut && (
                <span className="panel-lonceng-angka" aria-hidden="true">
                  1
                </span>
              )}
            </Link>
            {a && (
              <AkunMenu nama={nama} peran="Responden">
                {keluar}
              </AkunMenu>
            )}
          </div>
        </div>
      </header>
      <main id="konten-utama" tabIndex={-1} className="panel-isi">
        {children}
      </main>
      <footer className="kaki-responden">
        <nav aria-label="Tautan informasi">
          <Link href="/tentang/">Tentang</Link>
          <Link href="/sumber/">Sumber Materi</Link>
          <Link href="/privasi/">Privasi</Link>
          <Link href="/ketentuan-penggunaan/">Ketentuan Penggunaan</Link>
        </nav>
        <p>{BATASAN_EDUKASI}</p>
        <p>{await labelVersiAktif()}</p>
      </footer>
    </div>
  );
}
