import type { Metadata } from 'next';
import Link from 'next/link';
import KepalaHalaman from '@/components/KepalaHalaman';

export const metadata: Metadata = {
  title: 'Ketentuan Penggunaan',
  description: 'Ketentuan menggunakan website edukasi DASH Sehat.',
};

export default function KetentuanPenggunaan() {
  return (
    <>
      <KepalaHalaman
        label="Draf"
        judul="Ketentuan Penggunaan"
        ringkasan="Dengan menggunakan DASH Sehat, Anda menyetujui ketentuan berikut."
      />
      <div className="wadah-baca bagian-isi teks-kebijakan">
        <section className="kartu bagian-kartu">
          <h2>1. Website edukasi, bukan layanan medis</h2>
          <p>
            DASH Sehat berisi informasi umum tentang pola makan DASH untuk keperluan edukasi dan
            penelitian. Website ini tidak memberikan diagnosis, resep, rekomendasi obat, atau rencana
            diet pribadi, dan tidak menggantikan konsultasi dengan dokter atau tenaga kesehatan.
          </p>
        </section>
        <section className="kartu bagian-kartu">
          <h2>2. Keputusan kesehatan tetap bersama tenaga kesehatan</h2>
          <p>
            Jangan menghentikan atau mengubah obat, dan jangan mengabaikan saran tenaga kesehatan,
            karena informasi di website ini. Bila mengalami keluhan berat seperti nyeri dada, sesak
            napas, atau lemah di satu sisi tubuh, segera ke fasilitas kesehatan terdekat.
          </p>
        </section>
        <section className="kartu bagian-kartu">
          <h2>3. Akun</h2>
          <ul>
            <li>Akun dibutuhkan untuk mempelajari materi agar progres dan urutan belajar tercatat.</li>
            <li>Jaga kerahasiaan kode akses Anda. Jangan berikan kode kepada siapa pun, termasuk orang yang mengaku petugas.</li>
            <li>Satu nomor HP untuk satu akun. Jangan membuat akun atas nama orang lain.</li>
            <li>Anda dapat mengundurkan diri kapan saja dari halaman Profil.</li>
          </ul>
        </section>
        <section className="kartu bagian-kartu">
          <h2>4. Penggunaan yang tidak diperbolehkan</h2>
          <p>
            Dilarang mencoba masuk ke akun orang lain, mengganggu kerja website, atau mengambil isi
            website secara otomatis dalam jumlah besar.
          </p>
        </section>
        <section className="kartu bagian-kartu">
          <h2>5. Perubahan materi dan ketentuan</h2>
          <p>
            Materi dapat diperbarui oleh tim peneliti. Setiap versi materi dicatat. Perubahan
            ketentuan ini akan diumumkan di halaman ini.
          </p>
        </section>
        <section className="kartu bagian-kartu">
          <h2>6. Data pribadi</h2>
          <p>
            Penggunaan data pribadi dijelaskan di <Link href="/privasi/">halaman Privasi</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
