'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Ikon, { type NamaIkon } from '../Ikon';

interface ItemMenu {
  href: string;
  label: string;
  pendek: string; // label di bilah bawah ponsel
  ikon: NamaIkon;
  cocok: (path: string) => boolean;
}

const MENU: ItemMenu[] = [
  { href: '/belajar/', label: 'Beranda', pendek: 'Beranda', ikon: 'rumah', cocok: (p) => p === '/belajar/' || p.startsWith('/belajar/selesai/') },
  {
    href: '/belajar/modul/',
    label: 'Modul Pembelajaran',
    pendek: 'Modul',
    ikon: 'buku',
    cocok: (p) => p.startsWith('/belajar/modul/') || p.startsWith('/belajar/materi/') || p.startsWith('/pengenalan/'),
  },
  { href: '/belajar/menu-sehat/', label: 'Menu Sehat', pendek: 'Menu Sehat', ikon: 'piring', cocok: (p) => p.startsWith('/belajar/menu-sehat/') },
  { href: '/belajar/tips/', label: 'Tips Sehari-hari', pendek: 'Tips', ikon: 'lampu', cocok: (p) => p.startsWith('/belajar/tips/') },
  { href: '/belajar/tes/', label: 'Pretest & Posttest', pendek: 'Tes', ikon: 'kuis', cocok: (p) => p.startsWith('/belajar/tes/') },
];

// Menu responden: bilah navigasi bawah ala aplikasi di ponsel/tablet, sebaris di navbar atas mulai 64rem (CSS, tanpa JS).
export default function MenuResponden() {
  const path = (usePathname() ?? '').replace(/\/?$/, '/');
  return (
    <>
      <nav className="navbar-menu" aria-label="Menu utama">
        <ul>
          {MENU.map((m) => (
            <li key={m.href}>
              <Link href={m.href} aria-current={m.cocok(path) ? 'page' : undefined}>
                <Ikon nama={m.ikon} ukuran={20} />
                <span className="navbar-menu-pendek">{m.pendek}</span>
                <span className="navbar-menu-panjang">{m.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav className="navbar-bawah" aria-label="Menu utama (bawah)">
        <ul>
          {MENU.map((m) => (
            <li key={m.href}>
              <Link href={m.href} aria-current={m.cocok(path) ? 'page' : undefined}>
                <span className="navbar-bawah-ikon">
                  <Ikon nama={m.ikon} ukuran={22} />
                </span>
                <span>{m.pendek}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
