import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Ikon from '@/components/Ikon';
import KepalaHalaman from '@/components/KepalaHalaman';
import { GAMBAR_ILUSTRASI, UKURAN_ILUSTRASI } from '@/data/gambar';
import { ambilSemuaModul } from '@/lib/konten';

export const metadata: Metadata = {
  title: 'Pengenalan Diet DASH',
  description: 'Pengenalan singkat tentang diet DASH dan cara belajar di website DASH Sehat.',
};

const inti = [
  { kata: 'Perbanyak', isi: 'sayur, buah, biji-bijian utuh, tempe, tahu, kacang-kacangan, dan ikan.' },
  { kata: 'Pilih', isi: 'susu dan olahannya yang rendah lemak.' },
  { kata: 'Kurangi', isi: 'garam, makanan asin, gorengan, santan kental, dan minuman manis.' },
  { kata: 'Mulai', isi: 'dengan perubahan kecil yang bisa dijalankan setiap hari.' },
];

export default async function Pengenalan() {
  const modul = await ambilSemuaModul();

  return (
    <>
      <KepalaHalaman
        label="Pengenalan"
        judul="Pengenalan Diet DASH"
        ringkasan={
          <>
            <strong>DASH</strong> adalah singkatan dari <em>Dietary Approaches to Stop Hypertension</em>,
            yaitu pola makan yang disusun untuk membantu mengendalikan tekanan darah.
          </>
        }
        gambar={{ src: '/gambar/ilustrasi/porsi.png', width: 140, height: 110 }}
      />

      <div className="wadah-baca bagian-isi">
        <h2>Intinya dalam satu menit</h2>
        <ul className="kisi-inti">
          {inti.map((x) => (
            <li key={x.kata} className="kartu">
              <strong>{x.kata}</strong> {x.isi}
            </li>
          ))}
        </ul>

        <div className="kotak kotak-peringatan">
          <p className="kotak-judul">
            <span className="kotak-ikon">
              <Ikon nama="peringatan" />
            </span>
            Perlu diingat
          </p>
          <p>
            Diet DASH membantu mengendalikan tekanan darah, tetapi tidak menyembuhkan hipertensi dan
            tidak menggantikan obat. Tetap minum obat sesuai anjuran dokter. Bila Anda memiliki
            penyakit ginjal, diabetes, atau kondisi lain, tanyakan dulu kepada dokter atau ahli gizi.
          </p>
        </div>

        <h2>Cara belajar di website ini</h2>
        <ol className="langkah-belajar">
          <li>
            Buka <Link href="/materi/">Daftar Materi</Link>.
          </li>
          <li>Baca modul secara berurutan, mulai dari Modul 1.</li>
          <li>
            Di akhir setiap modul, tekan tombol <strong>Materi Berikutnya</strong>.
          </li>
          <li>
            Setelah selesai, kerjakan <Link href="/kuis/">Kuis Latihan</Link> untuk memeriksa
            pemahaman.
          </li>
        </ol>
        <p>Anda tidak perlu membuat akun. Anda bisa berhenti dan kembali kapan saja.</p>

        <h2>Enam modul pembelajaran</h2>
        <ol className="daftar-modul-ringkas">
          {modul.map((m) => (
            <li key={m.id}>
              <Link href={`/materi/${m.id}/`} className="kartu">
                <Image src={GAMBAR_ILUSTRASI[m.ilustrasi]} alt="" {...UKURAN_ILUSTRASI} />
                <span>
                  <span className="label-kecil">Modul {m.urutan}</span>
                  <br />
                  <strong>{m.judul}</strong>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="grup-tombol">
          <Link className="tombol tombol-besar" href={`/materi/${modul[0].id}/`}>
            Mulai Belajar
          </Link>
          <Link className="tombol tombol-sekunder tombol-besar" href="/materi/">
            Lihat Materi
          </Link>
        </div>
      </div>
    </>
  );
}
