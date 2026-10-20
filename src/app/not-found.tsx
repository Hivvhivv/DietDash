import type { Metadata } from 'next';
import Link from 'next/link';
import KepalaHalaman from '@/components/KepalaHalaman';
import KerangkaPublik from '@/components/KerangkaPublik';

export const metadata: Metadata = { title: 'Halaman tidak ditemukan' };

export default function TidakDitemukan() {
  return (
    <KerangkaPublik>
      <KepalaHalaman
        label="Galat 404"
        judul="Halaman tidak ditemukan"
        ringkasan="Maaf, halaman yang Anda cari tidak ada. Mungkin alamatnya salah ketik atau sudah dipindahkan."
        gambar={{ src: '/gambar/ilustrasi/langkah.png', width: 140, height: 110 }}
      >
        <div className="grup-tombol">
          <Link className="tombol" href="/">
            Ke Beranda
          </Link>
          <Link className="tombol tombol-sekunder" href="/materi/">
            Lihat Materi
          </Link>
        </div>
      </KepalaHalaman>
    </KerangkaPublik>
  );
}
