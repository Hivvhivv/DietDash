import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Ikon from '@/components/Ikon';
import KepalaHalaman from '@/components/KepalaHalaman';
import { srcGambarModul } from '@/data/gambar';
import { strukturAktif } from '@/lib/konten';

import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = {
  title: 'Pengenalan Diet DASH',
  description: 'Pengenalan singkat tentang diet DASH sebagai gambaran sebelum mendaftar.',
};

const inti = [
  { kata: 'Perbanyak', isi: 'sayur, buah, biji-bijian utuh, tempe, tahu, kacang-kacangan, dan ikan.' },
  { kata: 'Pilih', isi: 'susu dan olahannya yang rendah lemak.' },
  { kata: 'Kurangi', isi: 'garam, makanan asin, gorengan, santan kental, dan minuman manis.' },
  { kata: 'Mulai', isi: 'dengan perubahan kecil yang bisa dijalankan setiap hari.' },
];

export default async function Pengenalan() {
  await wajibResponden();
  const struktur = await strukturAktif();
  return (
    <>
      <KepalaHalaman
        label="Pengenalan"
        judul="Pengenalan Diet DASH"
        ringkasan={
          <>
            <strong>DASH</strong> adalah singkatan dari <em>Dietary Approaches to Stop Hypertension</em>, yaitu pola makan yang
            disusun untuk membantu mengendalikan tekanan darah.
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
            Diet DASH membantu mengendalikan tekanan darah, tetapi tidak menyembuhkan hipertensi dan tidak menggantikan obat.
            Tetap minum obat sesuai anjuran dokter. Bila Anda memiliki penyakit ginjal, diabetes, atau kondisi lain,
            tanyakan dulu kepada dokter atau ahli gizi.
          </p>
        </div>

        <h2>Cara belajar di DASH Sehat</h2>
        <ol className="langkah-belajar">
          <li>
            <Link href="/daftar/">Daftar</Link> dengan nama dan nomor HP. Simpan kode akses 6 angka yang muncul.
          </li>
          <li>Ikuti pretest sesuai jadwal dari peneliti.</li>
          <li>Pelajari materi secara berurutan. Setiap materi ditutup kuis kecil.</li>
          <li>Setelah kuis selesai, materi berikutnya terbuka. Progres tersimpan otomatis.</li>
        </ol>

        {struktur && struktur.modul.length > 0 && (
          <>
            <h2>Modul yang akan Anda pelajari</h2>
            <ol className="daftar-modul-ringkas">
              {struktur.modul.map((m) => (
                <li key={m.kunci}>
                  <div className="kartu">
                    <Image src={srcGambarModul(m.gambar)} alt="" width={72} height={57} unoptimized={m.gambar.jenis === 'unggah'} />
                    <span>
                      <span className="label-kecil">
                        Modul {m.nomor} · {m.materi.length} materi
                      </span>
                      <br />
                      <strong>{m.judul}</strong>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}

        <div className="grup-tombol">
          <Link className="tombol tombol-besar" href="/daftar/">
            Daftar
          </Link>
          <Link className="tombol tombol-sekunder tombol-besar" href="/masuk/">
            Masuk
          </Link>
        </div>
      </div>
    </>
  );
}
