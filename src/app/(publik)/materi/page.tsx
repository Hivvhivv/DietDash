import type { Metadata } from 'next';
import KartuModul from '@/components/KartuModul';
import KepalaHalaman from '@/components/KepalaHalaman';
import { ambilSemuaModul } from '@/lib/konten';

export const metadata: Metadata = {
  title: 'Daftar Materi',
  description: 'Enam modul edukasi diet DASH yang disusun berurutan.',
};

export default async function DaftarMateri() {
  const modul = await ambilSemuaModul();
  const totalMenit = modul.reduce((n, m) => n + m.estimasi_menit, 0);

  return (
    <>
      <KepalaHalaman
        label="Modul Pembelajaran"
        judul="Daftar Materi"
        ringkasan={`${modul.length} modul, sekitar ${totalMenit} menit membaca. Pelajari secara berurutan, mulai dari Modul 1. Anda bisa berhenti kapan saja dan kembali lagi ke halaman ini.`}
        gambar={{ src: '/gambar/ilustrasi/piring.png', width: 140, height: 110 }}
      />
      <div className="wadah bagian-isi">
        <ol className="kisi-modul-beranda kisi-modul-materi">
          {modul.map((m) => (
            <li key={m.id}>
              <KartuModul modul={m} />
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
