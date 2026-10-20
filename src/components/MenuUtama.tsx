'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { aksiStatusPeserta } from '@/app/aksi-peserta';

const menu = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang/', label: 'Tentang' },
  { href: '/materi/', label: 'Materi' },
  { href: '/pertanyaan-umum/', label: 'Pertanyaan Umum' },
  { href: '/tentang/#kontak', label: 'Kontak' },
];

export default function MenuUtama() {
  const path = (usePathname() ?? '/').replace(/\/?$/, '/');
  const aktif = (href: string) =>
    href === '/' ? path === '/' : !href.includes('#') && path.startsWith(href);
  const [js, setJs] = useState(false);
  const [buka, setBuka] = useState(false);
  const [masuk, setMasuk] = useState<boolean | null>(null);

  // Tanpa JavaScript, daftar menu selalu tampil; tombol "Menu" hanya aktif setelah JS berjalan.
  useEffect(() => setJs(true), []);
  useEffect(() => setBuka(false), [path]);
  useEffect(() => {
    aksiStatusPeserta()
      .then((s) => setMasuk(s.masuk))
      .catch(() => setMasuk(false));
  }, [path]);

  return (
    <nav aria-label="Menu utama" className="menu-utama" data-js={js ? 'aktif' : undefined}>
      <button
        type="button"
        className="menu-tombol"
        aria-expanded={buka}
        aria-controls="daftar-menu"
        onClick={() => setBuka((b) => !b)}
      >
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
        {menu.map((m) => (
          <li key={m.href}>
            <Link href={m.href} aria-current={aktif(m.href) ? 'page' : undefined}>
              {m.label}
            </Link>
          </li>
        ))}
        {masuk === true && (
          <li className="menu-akun">
            <Link href="/akun/" className="tombol tombol-sekunder tombol-kecil" aria-current={aktif('/akun/') ? 'page' : undefined}>
              Akun Saya
            </Link>
          </li>
        )}
        {masuk === false && (
          <>
            <li className="menu-akun">
              <Link href="/masuk/" className="tombol tombol-sekunder tombol-kecil">
                Masuk
              </Link>
            </li>
            <li className="menu-akun">
              <Link href="/daftar/" className="tombol tombol-kecil">
                Daftar
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
