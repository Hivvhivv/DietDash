import type { Metadata } from 'next';
import KepalaHalaman from '@/components/KepalaHalaman';
import { daftarSumber } from '@/data/sumber';
import { ambilSemuaModul } from '@/lib/konten';
import { VERSI_KONTEN, STATUS_KONTEN } from '@/data/situs';

export const metadata: Metadata = {
  title: 'Sumber Materi',
  description: 'Daftar pedoman dan literatur yang menjadi dasar materi DASH Sehat.',
};

export default async function Sumber() {
  const modul = await ambilSemuaModul();
  const dipakaiDi = (id: string) =>
    modul.filter((m) => m.sumber.includes(id)).map((m) => `Modul ${m.urutan}`);

  return (
    <>
      <KepalaHalaman
        label="Rujukan"
        judul="Sumber Materi"
        ringkasan="Materi di DASH Sehat disusun berdasarkan pedoman diet DASH, pedoman gizi dan hipertensi di Indonesia, serta literatur ilmiah berikut."
        gambar={{ src: '/gambar/ilustrasi/langkah.png', width: 140, height: 110 }}
      >
        <p className="label-kecil">
          Versi konten {VERSI_KONTEN} · {STATUS_KONTEN}
        </p>
      </KepalaHalaman>

      <div className="wadah-baca bagian-isi">
        <ol className="daftar-sumber">
          {daftarSumber.map((s) => {
            const modulPakai = dipakaiDi(s.id);
            return (
              <li key={s.id} id={`sumber-${s.id}`} className="kartu">
                <p>{s.sitasi}</p>
                {s.url && (
                  <p>
                    <a href={s.url} rel="noopener noreferrer">
                      Buka sumber
                    </a>
                  </p>
                )}
                {modulPakai.length > 0 && (
                  <p className="label-kecil">Dipakai di: {modulPakai.join(', ')}</p>
                )}
              </li>
            );
          })}
        </ol>

        <div className="kotak kotak-peringatan">
          <p>
            Informasi di website ini bersifat umum untuk edukasi. Kebutuhan gizi setiap orang dapat
            berbeda sesuai kondisi kesehatannya. Konsultasikan dengan dokter atau ahli gizi untuk
            saran yang sesuai dengan kondisi Anda.
          </p>
        </div>
      </div>
    </>
  );
}
