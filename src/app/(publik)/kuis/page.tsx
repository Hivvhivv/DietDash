import type { Metadata } from 'next';
import Link from 'next/link';
import KepalaHalaman from '@/components/KepalaHalaman';
import Kuis from '@/components/Kuis';
import { daftarSoal, VERSI_KUIS } from '@/data/kuis';
import { ambilSemuaModul, ringkas } from '@/lib/konten';

export const metadata: Metadata = {
  title: 'Kuis Latihan',
  description: 'Kuis latihan pilihan ganda tentang diet DASH dengan umpan balik.',
};

const HURUF = ['A', 'B', 'C', 'D'];

export default async function HalamanKuis() {
  const modul = (await ambilSemuaModul()).map(ringkas);

  return (
    <>
      <KepalaHalaman
        remah={[{ href: '/materi/', label: 'Daftar Materi' }]}
        label="Latihan"
        judul="Kuis Latihan"
        ringkasan={`${daftarSoal.length} pertanyaan pilihan ganda untuk memeriksa pemahaman Anda tentang diet DASH.`}
        gambar={{ src: '/gambar/ilustrasi/kuis.png', width: 140, height: 110 }}
      />

      <div className="wadah-baca bagian-isi">
        <div className="kartu kartu-kuis">
          <Kuis soal={daftarSoal} modul={modul} idLatihan="semua">
            <p>
              Setelah memilih jawaban, tekan <strong>Periksa Jawaban</strong> untuk melihat
              penjelasannya. Anda bisa mengulang kuis kapan saja.
            </p>
            <div className="kotak">
              <p>
                Ini hanya <strong>latihan</strong>, bukan ujian. Yang disimpan hanya jumlah jawaban
                benar: di akun Anda bila sudah masuk, atau di perangkat ini bila belum.
              </p>
            </div>
          </Kuis>

          <noscript>
            <h2>Daftar soal</h2>
            <p>
              Kuis interaktif membutuhkan JavaScript. Anda tetap bisa berlatih dengan membaca soal di
              bawah ini dan membuka jawabannya.
            </p>
            <ol>
              {daftarSoal.map((s) => (
                <li key={s.id}>
                  <p>{s.pertanyaan}</p>
                  <ul>
                    {s.pilihan.map((p, i) => (
                      <li key={p}>
                        {HURUF[i]}. {p}
                      </li>
                    ))}
                  </ul>
                  <details>
                    <summary>Lihat jawaban</summary>
                    <p>
                      Jawaban: {HURUF[s.jawaban]}. {s.umpan_balik}
                    </p>
                  </details>
                </li>
              ))}
            </ol>
            <p>
              <Link className="tombol" href="/materi/">
                Pelajari Kembali Materi
              </Link>
            </p>
          </noscript>
        </div>

        <p className="label-kecil kuis-catatan">
          Kuis latihan versi {VERSI_KUIS}. Kuis ini terpisah dari kuesioner penelitian (pretest dan
          posttest).
        </p>
      </div>
    </>
  );
}
