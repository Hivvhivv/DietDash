import Link from 'next/link';
import Ikon from '../Ikon';

// Pengalih halaman masuk: responden (nomor HP + kode akses) atau admin (email + kata sandi + 2FA).
export default function PilihMasuk({ aktif }: { aktif: 'responden' | 'admin' }) {
  const pilihan = [
    { kunci: 'responden', href: '/masuk/', label: 'Responden', ikon: 'orang' },
    { kunci: 'admin', href: '/admin/masuk/', label: 'Admin', ikon: 'gerigi' },
  ] as const;
  return (
    <nav className="pilih-masuk" aria-label="Pilih jenis akun untuk masuk">
      {pilihan.map((p) => (
        <Link key={p.kunci} href={p.href} aria-current={p.kunci === aktif ? 'page' : undefined}>
          <Ikon nama={p.ikon} ukuran={20} />
          <span className="sr-only">Masuk sebagai </span>
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
