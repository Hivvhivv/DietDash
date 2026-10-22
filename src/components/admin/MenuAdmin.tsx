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

const KONTEN = '/admin/konten/';

const MENU: ItemMenu[] = [
  { href: '/admin/dashboard/', label: 'Dashboard', ikon: 'dasbor', cocok: (p) => p.startsWith('/admin/dashboard/') },
  { href: KONTEN, label: 'Kelola Modul', ikon: 'buku', cocok: (p) => p === KONTEN || p.startsWith('/admin/konten/modul/') },
  {
    href: '/admin/konten/materi/',
    label: 'Kelola Materi',
    ikon: 'dokumen',
    cocok: (p) => p.startsWith('/admin/konten/materi/') || p.startsWith('/admin/konten/pratinjau/'),
  },
  { href: '/admin/tips/', label: 'Kelola Tips', ikon: 'lampu', cocok: (p) => p.startsWith('/admin/tips/') },
  { href: '/admin/responden/', label: 'Manajemen Pengguna', ikon: 'pengguna', cocok: (p) => p.startsWith('/admin/responden/') },
  { href: '/admin/laporan/', label: 'Laporan & Statistik', ikon: 'grafik', cocok: (p) => p.startsWith('/admin/laporan/') || p.startsWith('/admin/ekspor/') },
  { href: '/admin/pengaturan/', label: 'Pengaturan', ikon: 'gerigi', cocok: (p) => p.startsWith('/admin/pengaturan/') },
];

const MENU_SUPER: ItemMenu[] = [
  { href: '/admin/versi/', label: 'Versi Konten', ikon: 'lapisan', cocok: (p) => p.startsWith('/admin/versi/') },
  { href: '/admin/admins/', label: 'Akun Admin', ikon: 'perisai', cocok: (p) => p.startsWith('/admin/admins/') },
  { href: '/admin/log/', label: 'Log Aktivitas', ikon: 'daftar', cocok: (p) => p.startsWith('/admin/log/') },
];

// Menu samping panel admin. Layar sempit: tersembunyi di balik tombol "Menu".
export default function MenuAdmin({ superAdmin, children }: { superAdmin: boolean; children?: React.ReactNode }) {
  const path = (usePathname() ?? '').replace(/\/?$/, '/');
  const [buka, setBuka] = useState(false);
  const [js, setJs] = useState(false);
  useEffect(() => setJs(true), []);
  useEffect(() => setBuka(false), [path]);

  const daftar = (items: ItemMenu[]) =>
    items.map((m) => (
      <li key={m.href}>
        <Link href={m.href} aria-current={m.cocok(path) ? 'page' : undefined}>
          <Ikon nama={m.ikon} />
          {m.label}
        </Link>
      </li>
    ));

  return (
    <>
      {js && (
      <button type="button" className="panel-tombol-menu" aria-expanded={buka} aria-controls="menu-admin" onClick={() => setBuka((b) => !b)}>
        <Ikon nama={buka ? 'tutup' : 'menu'} />
        Menu
      </button>
      )}
      <nav id="menu-admin" className="panel-menu" aria-label="Menu admin" data-js={js ? 'aktif' : undefined} data-buka={buka ? 'ya' : undefined}>
        <ul>{daftar(MENU)}</ul>
        {superAdmin && (
          <>
            <p className="panel-menu-judul">Super admin</p>
            <ul>{daftar(MENU_SUPER)}</ul>
          </>
        )}
        <div className="panel-menu-bawah">{children}</div>
      </nav>
    </>
  );
}
