import type { Metadata } from 'next';
import IsiMarkdown from '@/components/IsiMarkdown';
import KepalaHalaman from '@/components/KepalaHalaman';
import { daftarPustakaAktif, versiAktif } from '@/lib/konten';

import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = {
  title: 'Sumber Materi',
  description: 'Daftar pustaka dan pedoman yang menjadi dasar materi DASH Sehat.',
};

export default async function Sumber() {
  await wajibResponden();
  const [pustaka, versi] = await Promise.all([daftarPustakaAktif(), versiAktif()]);
  return (
    <>
      <KepalaHalaman
        label="Rujukan"
        judul="Sumber Materi"
        ringkasan="Daftar pustaka dan pedoman yang menjadi dasar konten. Setiap materi juga mencantumkan sumbernya sendiri."
        gambar={{ src: '/gambar/ilustrasi/langkah.png', width: 140, height: 110 }}
      >
        {versi && <p className="label-kecil">Versi konten {versi.label}</p>}
      </KepalaHalaman>
      <div className="wadah-baca bagian-isi">
        {pustaka.length === 0 ? (
          <p className="kotak">Daftar pustaka akan tampil setelah konten diterbitkan.</p>
        ) : (
          <ol className="daftar-sumber">
            {pustaka.map((s) => (
              <li key={s.sitasi} className="kartu">
                <p>
                  <IsiMarkdown isi={s.sitasi} sebaris />
                </p>
                <p className="label-kecil">Dipakai di materi {s.materi.join(', ')}</p>
              </li>
            ))}
          </ol>
        )}
        <div className="kotak kotak-peringatan">
          <p>
            Informasi di website ini bersifat umum untuk edukasi. Kebutuhan gizi setiap orang dapat berbeda sesuai kondisi
            kesehatannya. Konsultasikan dengan dokter atau ahli gizi untuk saran yang sesuai dengan kondisi Anda.
          </p>
        </div>
      </div>
    </>
  );
}
