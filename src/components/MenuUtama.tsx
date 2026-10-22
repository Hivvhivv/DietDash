'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { aksiStatusResponden } from '@/app/aksi-responden';

// Menu untuk responden yang sudah masuk. Tamu hanya melihat tombol Masuk dan Daftar.
const menuDalam = [
  { href: '/belajar/', label: 'Beranda' },
  { href: '/belajar/modul/', label: 'Modul' },
  { href: '/belajar/menu-sehat/', label: 'Menu Sehat' },
  { href: '/belajar/tips/', label: 'Tips' },
];

export default function MenuUtama({ dalam = false }: { dalam?: boolean }) {
  const path = (usePathname() ?? '/').replace(/\/?$/, '/');
  const aktif = (href: string) => path.startsWith(href);
  const [js, setJs] = useState(false);
  const [buka, setBuka] = useState(false);
  // Halaman di area belajar sudah diperiksa di server; halaman publik menanyakan status sesi.
  const [masuk, setMasuk] = useState<boolean | null>(dalam ? true : null);

  // Tanpa JavaScript, daftar menu selalu tampil; tombol "Menu" hanya aktif setelah JS berjalan.
  useEffect(() => setJs(true), []);
  useEffect(() => setBuka(false), [path]);
  useEffect(() => {
    if (dalam) return;
    aksiStatusResponden()
      .then((s) => setMasuk(s.masuk))
      .catch(() => setMasuk(false));
  }, [path, dalam]);

  if (masuk !== true) {
    return (
      <nav aria-label="Menu akun" className="menu-tamu">
        {masuk === false && (
          <ul className="menu">
            <li className="menu-akun">
              <Link href="/masuk/" className="tombol tombol-sekunder tombol-kecil" aria-current={aktif('/masuk/') ? 'page' : undefined}>
                Masuk
              </Link>
            </li>
            <li className="menu-akun">
              <Link href="/daftar/" className="tombol tombol-kecil" aria-current={aktif('/daftar/') ? 'page' : undefined}>
                Daftar
              </Link>
            </li>
          </ul>
        )}
      </nav>
    );
  }

  return (
    <nav aria-label="Menu utama" className="menu-utama" data-js={js ? 'aktif' : undefined}>
      <button type="button" className="menu-tombol" aria-expanded={buka} aria-controls="daftar-menu" onClick={() => setBuka((b) => !b)}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {buka ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          )}
        </svg>
        Menu
      </button>
      <ul id="daftar-menu" className="menu" data-buka={buka ? 'ya' : undefined}>
        {menuDalam.map((m) => (
          <li key={m.href}>
            <Link href={m.href} aria-current={aktif(m.href) ? 'page' : undefined}>
              {m.label}
            </Link>
          </li>
        ))}
        <li className="menu-akun">
          <Link href="/profil/" className="tombol tombol-sekunder tombol-kecil" aria-current={aktif('/profil/') ? 'page' : undefined}>
            Profil
          </Link>
        </li>
      </ul>
    </nav>
  );
}
