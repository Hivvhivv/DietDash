'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Ikon from '../Ikon';

// Menu akun di navbar (avatar + nama ▾ → Profil, Keluar). Memakai <details> agar tetap bisa dibuka tanpa JavaScript;
// dengan JavaScript, menu menutup saat pindah halaman atau klik di luar.
export default function AkunMenu({ nama, peran, children }: { nama: string; peran: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const path = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [path]);
  useEffect(() => {
    const tutup = (e: MouseEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    document.addEventListener('click', tutup);
    return () => document.removeEventListener('click', tutup);
  }, []);

  return (
    <details className="akun-menu" ref={ref}>
      <summary aria-label={`Menu akun ${nama}`}>
        <span className="panel-avatar" aria-hidden="true">
          {nama.trim().charAt(0).toUpperCase() || 'R'}
        </span>
        <span className="panel-akun-teks">
          <span className="panel-akun-nama">{nama}</span>
          <span className="panel-akun-peran">{peran}</span>
        </span>
        <svg className="akun-menu-panah" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="akun-menu-isi">
        <Link href="/profil/" className="navbar-akun-tautan">
          <Ikon nama="orang" ukuran={20} />
          Profil
        </Link>
        {children}
      </div>
    </details>
  );
}
