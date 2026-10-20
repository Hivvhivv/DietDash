import Link from 'next/link';
import Logo from './Logo';
import MenuUtama from './MenuUtama';
import { NAMA_SITUS, SLOGAN, BATASAN_EDUKASI, VERSI_KONTEN, STATUS_KONTEN } from '@/data/situs';

function Merek() {
  return (
    <Link className="merek" href="/" aria-label={`${NAMA_SITUS} — ke beranda`}>
      <Logo />
      <span className="merek-teks">
        <span className="merek-nama">{NAMA_SITUS}</span>
        <span className="merek-slogan">{SLOGAN}</span>
      </span>
    </Link>
  );
}

// Kepala, isi utama, dan kaki halaman untuk seluruh halaman publik.
export default function KerangkaPublik({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="lewati-konten" href="#konten-utama">
        Lewati ke konten utama
      </a>

      <header className="kepala">
        <div className="wadah kepala-isi">
          <Merek />
          <MenuUtama />
        </div>
      </header>

      <main id="konten-utama" tabIndex={-1}>
        {children}
      </main>

      <footer className="kaki">
        <div className="wadah kaki-isi">
          <Merek />
          <nav aria-label="Tautan kaki halaman">
            <ul className="kaki-tautan">
              <li>
                <Link href="/tentang/">Tentang</Link>
              </li>
              <li>
                <Link href="/kebijakan-privasi/">Kebijakan Privasi</Link>
              </li>
              <li>
                <Link href="/ketentuan-penggunaan/">Ketentuan Penggunaan</Link>
              </li>
              <li>
                <Link href="/tentang/#batasan">Batasan Edukasi</Link>
              </li>
              <li>
                <Link href="/rangkuman/">Rangkuman Materi</Link>
              </li>
              <li>
                <Link href="/sumber/">Sumber Materi</Link>
              </li>
              <li>
                <Link href="/tentang/#kontak">Kontak</Link>
              </li>
            </ul>
          </nav>
          <div className="kaki-hak">
            <p>
              © {new Date().getFullYear()} {NAMA_SITUS}
            </p>
            <p>{BATASAN_EDUKASI}</p>
          </div>
        </div>
        <div className="wadah">
          <p className="kaki-versi">
            <span>
              Versi konten {VERSI_KONTEN} ({STATUS_KONTEN})
            </span>
            <a href="/admin/masuk/" rel="nofollow">
              Masuk admin
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
