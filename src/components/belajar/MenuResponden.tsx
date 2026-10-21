'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Ikon, { type NamaIkon } from '../Ikon';

interface ItemMenu {
  href: string;
  label: string;
  ikon: NamaIkon;
  cocok: (path: string) => boolean;
}

const halamanKuis = (p: string) => p.startsWith('/belajar/kuis/') || /^\/belajar\/materi\/[^/]+\/kuis\//.test(p);

const MENU: ItemMenu[] = [
  { href: '/belajar/', label: 'Beranda', ikon: 'rumah', cocok: (p) => p === '/belajar/' || p.startsWith('/belajar/selesai/') },
  {
    href: '/belajar/modul/',
    label: 'Modul Pembelajaran',
    ikon: 'buku',
    cocok: (p) => p.startsWith('/belajar/modul/') || (p.startsWith('/belajar/materi/') && !halamanKuis(p)) || p.startsWith('/pengenalan/'),
  },
  { href: '/belajar/menu-sehat/', label: 'Menu Sehat', ikon: 'piring', cocok: (p) => p.startsWith('/belajar/menu-sehat/') },
  { href: '/belajar/tips/', label: 'Tips Sehari-hari', ikon: 'lampu', cocok: (p) => p.startsWith('/belajar/tips/') },
  { href: '/belajar/kuis/', label: 'Kuis', ikon: 'kuis', cocok: halamanKuis },
];

// Navbar atas responden. Layar sempit: daftar menu terlipat di balik tombol "Menu".
// children = tautan akun (Profil, Keluar) yang ikut tampil di daftar menu ponsel.
export default function MenuResponden({ kuisBelum, children }: { kuisBelum: number; children?: React.ReactNode }) {
  const path = (usePathname() ?? '').replace(/\/?$/, '/');
  const [buka, setBuka] = useState(false);
  const [js, setJs] = useState(false);
  useEffect(() => setJs(true), []);
  useEffect(() => setBuka(false), [path]);

  return (
    <>
      {js && (
        <button type="button" className="navbar-tombol" aria-expanded={buka} aria-controls="menu-responden" onClick={() => setBuka((b) => !b)}>
          <Ikon nama={buka ? 'tutup' : 'menu'} />
          <span className="navbar-tombol-teks">Menu</span>
        </button>
      )}
      <nav id="menu-responden" className="navbar-menu" aria-label="Menu utama" data-js={js ? 'aktif' : undefined} data-buka={buka ? 'ya' : undefined}>
        <ul>
          {MENU.map((m) => (
            <li key={m.href}>
              <Link href={m.href} aria-current={m.cocok(path) ? 'page' : undefined}>
                <Ikon nama={m.ikon} ukuran={20} />
                {m.label}
                {m.href === '/belajar/kuis/' && kuisBelum > 0 && (
                  <span className="navbar-angka" aria-label={`${kuisBelum} kuis belum selesai`}>
                    {kuisBelum}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="navbar-akun-ponsel">{children}</div>
      </nav>
    </>
  );
}
