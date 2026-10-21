import Link from 'next/link';
import Logo from './Logo';
import MenuUtama from './MenuUtama';
import { NAMA_SITUS, SLOGAN, BATASAN_EDUKASI } from '@/data/situs';
import { labelVersiAktif } from '@/lib/konten';

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

// Tautan kaki halaman. Halaman info (Tentang, Sumber, Bantuan) hanya untuk responden yang sudah masuk;
// Privasi dan Ketentuan selalu publik karena dirujuk saat mendaftar.
const tautanDalam = [
  { href: '/tentang/', label: 'Tentang' },
  { href: '/privasi/', label: 'Privasi' },
  { href: '/ketentuan-penggunaan/', label: 'Ketentuan Penggunaan' },
  { href: '/tentang/#batasan', label: 'Batasan Edukasi' },
  { href: '/sumber/', label: 'Sumber Materi' },
  { href: '/tentang/#kontak', label: 'Kontak' },
];
const tautanPublik = [
  { href: '/privasi/', label: 'Privasi' },
  { href: '/ketentuan-penggunaan/', label: 'Ketentuan Penggunaan' },
  { href: '/lupa-token/', label: 'Lupa Kode Akses' },
];

// Kepala, isi utama, dan kaki halaman. `dalam` = area responden yang sudah masuk.
export default async function KerangkaPublik({ children, dalam = false }: { children: React.ReactNode; dalam?: boolean }) {
  return (
    <>
      <a className="lewati-konten" href="#konten-utama">
        Lewati ke konten utama
      </a>

      <header className="kepala">
        <div className="wadah kepala-isi">
          <Merek />
          <MenuUtama dalam={dalam} />
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
              {(dalam ? tautanDalam : tautanPublik).map((t) => (
                <li key={t.href}>
                  <Link href={t.href}>{t.label}</Link>
                </li>
              ))}
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
            <span>{await labelVersiAktif()}</span>
            <a href="/admin/masuk/" rel="nofollow">
              Masuk admin
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
