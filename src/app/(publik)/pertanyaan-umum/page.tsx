import type { Metadata } from 'next';
import Link from 'next/link';
import CariTanya from '@/components/CariTanya';
import KepalaHalaman from '@/components/KepalaHalaman';

export const metadata: Metadata = {
  title: 'Pertanyaan Umum',
  description: 'Jawaban singkat atas pertanyaan yang sering diajukan tentang diet DASH dan website DASH Sehat.',
};

const pertanyaan: { t: string; j: React.ReactNode }[] = [
  {
    t: 'Apa itu diet DASH?',
    j: (
      <>
        DASH adalah pola makan yang memperbanyak sayur, buah, biji-bijian utuh, kacang-kacangan,
        ikan, dan susu rendah lemak, serta mengurangi garam, gula, dan lemak jenuh. Pola ini membantu
        mengendalikan tekanan darah. Penjelasan lengkapnya ada di{' '}
        <Link href="/materi/mengenal-diet-dash/">Modul 2</Link>.
      </>
    ),
  },
  {
    t: 'Apakah diet DASH dapat menyembuhkan hipertensi?', // cek-klaim: abaikan (pertanyaan, dijawab "Tidak")
    j: 'Tidak. Diet DASH membantu mengendalikan tekanan darah, tetapi tidak membuat hipertensi hilang. Tetap ikuti pengobatan dan periksakan tekanan darah secara rutin.',
  },
  {
    t: 'Kalau sudah menjalani diet DASH, apakah obat darah tinggi masih perlu diminum?',
    j: 'Ya, tetap minum obat sesuai anjuran dokter. Diet DASH melengkapi pengobatan, bukan menggantikannya. Jangan menghentikan atau mengubah obat tanpa berbicara dengan dokter.',
  },
  {
    t: 'Berapa lama hasilnya dapat terlihat?',
    j: 'Dalam penelitian, penurunan tekanan darah mulai terlihat sekitar dua minggu setelah menjalankan pola makan DASH, terutama bila garam juga dikurangi. Namun, hasil setiap orang berbeda. Cara mengetahuinya adalah dengan memeriksa tekanan darah secara rutin.',
  },
  {
    t: 'Apakah diet DASH cocok untuk semua orang?',
    j: 'Pola makan DASH umumnya baik untuk orang dewasa. Namun, bila Anda memiliki penyakit ginjal, diabetes, sedang hamil, atau minum obat tertentu, kebutuhan gizi Anda bisa berbeda. Tanyakan dulu kepada dokter atau ahli gizi.',
  },
  {
    t: 'Bagaimana jika saya sulit menemukan bahan makanan yang dianjurkan?',
    j: (
      <>
        Pilih bahan yang mudah didapat di sekitar Anda. Sayur dan buah musiman, tempe, tahu, telur,
        dan ikan lokal sudah sesuai dengan prinsip DASH. Contoh pengganti makanan ada di{' '}
        <Link href="/materi/kebiasaan-sehat/">Modul 5</Link>.
      </>
    ),
  },
  {
    t: 'Apakah makanan sehat harus mahal?',
    j: 'Tidak harus. Tempe, tahu, telur, ikan lokal, serta sayur dan buah musiman mudah didapat dan terjangkau.',
  },
  {
    t: 'Apakah saya harus membuat akun?',
    j: 'Tidak wajib. Semua materi dan latihan soal bisa dibuka tanpa akun. Akun hanya dipakai untuk menyimpan progres belajar Anda agar bisa dilanjutkan di perangkat lain.',
  },
  {
    t: 'Data apa yang disimpan bila saya membuat akun?',
    j: (
      <>
        Email, kata sandi dalam bentuk acak (hash) yang tidak bisa dibaca siapa pun, materi yang Anda
        buka, dan jumlah jawaban benar pada latihan soal. Selengkapnya di{' '}
        <Link href="/kebijakan-privasi/">Kebijakan Privasi</Link>. Anda bisa menghapus akun kapan
        saja dari halaman Akun Saya.
      </>
    ),
  },
  {
    t: 'Saya lupa kata sandi. Apa yang harus dilakukan?',
    j: 'Hubungi tim peneliti. Peneliti akan memberikan tautan khusus untuk membuat kata sandi baru. Tautan berlaku 24 jam.',
  },
  {
    t: 'Bagaimana cara menggunakan website ini?',
    j: 'Buka menu Materi, lalu pelajari modul secara berurutan mulai dari Modul 1. Setiap modul berisi beberapa materi singkat dan latihan soal. Tekan tombol "Materi Berikutnya" untuk melanjutkan.',
  },
  {
    t: 'Apakah website ini menggantikan konsultasi dengan tenaga kesehatan?',
    j: 'Tidak. Website ini berisi edukasi dan tidak memberikan diagnosis atau saran pengobatan pribadi.',
  },
  {
    t: 'Ke mana saya bisa bertanya jika ada pertanyaan tentang kondisi kesehatan saya?',
    j: 'Silakan bertanya kepada dokter, perawat, atau ahli gizi di puskesmas atau fasilitas kesehatan terdekat.',
  },
];

export default function PertanyaanUmum() {
  return (
    <>
      <KepalaHalaman
        label="Bantuan"
        judul="Pertanyaan Umum"
        ringkasan="Temukan jawaban atas pertanyaan yang sering diajukan. Ketik kata kunci atau pilih pertanyaan."
        gambar={{ src: '/gambar/ilustrasi/kuis.png', width: 140, height: 110 }}
      />
      <div className="wadah-baca bagian-isi">
        <CariTanya>
          {pertanyaan.map((p) => (
            <details key={p.t} className="tanya">
              <summary>{p.t}</summary>
              <p>{p.j}</p>
            </details>
          ))}
        </CariTanya>
        <p>
          Belum menemukan jawaban? Lihat <Link href="/tentang/#kontak">kontak penelitian</Link>.
        </p>
      </div>
    </>
  );
}
