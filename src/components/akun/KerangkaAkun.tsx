import Link from 'next/link';
import { BATASAN_EDUKASI } from '@/data/situs';

// Kerangka halaman masuk (responden & admin), daftar, simpan kode, dan lupa kode akses: tanpa menu, fokus pada satu tugas.
// Merek ditampilkan di panel ilustrasi (HalamanAkun).
export default function KerangkaAkun({ children }: { children: React.ReactNode }) {
  return (
    <div className="akun">
      <a className="lewati-konten" href="#konten-utama">
        Lewati ke konten utama
      </a>
      <main id="konten-utama" tabIndex={-1} className="akun-utama">
        {children}
      </main>
      <footer className="akun-kaki">
        <nav aria-label="Tautan informasi">
          <Link href="/privasi/">Privasi</Link>
          <Link href="/ketentuan-penggunaan/">Ketentuan Penggunaan</Link>
        </nav>
        <p>{BATASAN_EDUKASI}</p>
      </footer>
    </div>
  );
}
