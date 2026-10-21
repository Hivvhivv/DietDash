import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import KepalaHalaman from '@/components/KepalaHalaman';
import { labelVersiAktif } from '@/lib/konten';

import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = {
  title: 'Tentang',
  description: 'Tujuan, batasan, dan informasi privasi website DASH Sehat.',
};

export default async function Tentang() {
  await wajibResponden();
  return (
    <>
      <KepalaHalaman
        label="Tentang Kami"
        judul="Tentang DASH Sehat"
        ringkasan="Website edukasi untuk membantu orang dewasa dengan hipertensi memahami dan menerapkan pola makan DASH dalam kehidupan sehari-hari."
        gambar={{ src: '/gambar/ilustrasi/jantung.png', width: 140, height: 110 }}
      />

      <div className="wadah-baca bagian-isi">
        <section className="kartu bagian-kartu" aria-labelledby="tujuan">
          <h2 id="tujuan">Tujuan edukasi</h2>
          <p>
            DASH Sehat dikembangkan sebagai media edukasi dalam sebuah penelitian. Materinya disusun
            berurutan dalam enam modul, dilengkapi contoh menu Indonesia dan kuis latihan.
          </p>
          <h3>Tim pengembang</h3>
          {/* TODO: isi identitas institusi/tim peneliti setelah disetujui. */}
          <p>Informasi tim peneliti dan institusi akan dicantumkan setelah mendapat persetujuan.</p>
        </section>

        <section className="catatan-nakes catatan-nakes-lebar" aria-labelledby="batasan">
          <Image src="/gambar/tenaga-kesehatan.png" alt="" width={188} height={182} />
          <div className="catatan-nakes-teks catatan-nakes-biasa">
            <h2 id="batasan">Batasan edukasi</h2>
            <p>
              Website ini <strong>bukan</strong> pengganti konsultasi dengan dokter atau tenaga
              kesehatan.
            </p>
            <ul>
              <li>Website ini tidak memberikan diagnosis.</li>
              <li>Website ini tidak memberikan rekomendasi atau perubahan dosis obat.</li>
              <li>Website ini tidak menyusun rencana diet pribadi.</li>
            </ul>
          </div>
        </section>

        <div className="kotak kotak-peringatan">
          <p>
            Jangan menghentikan atau mengubah obat tanpa berbicara dengan dokter. Bila Anda
            mengalami keluhan seperti nyeri dada, sesak napas, lemah di satu sisi tubuh, atau sakit
            kepala hebat, <strong>segera ke fasilitas kesehatan terdekat</strong>.
          </p>
        </div>

        <section className="kartu bagian-kartu" aria-labelledby="privasi">
          <h2 id="privasi">Privasi dan penggunaan data</h2>
          <ul>
            <li>Untuk belajar, responden mendaftar dengan nama dan nomor HP. Kode akses 6 angka dibuat oleh sistem.</li>
            <li>Yang disimpan: nama, nomor HP, kode peserta internal, progres belajar, dan jawaban kuis.</li>
            <li>Kami tidak meminta email, NIK, alamat, tanggal lahir, atau data tekanan darah.</li>
            <li>Website ini tidak memakai alat pelacak atau iklan dari pihak ketiga.</li>
          </ul>
          <p>
            Rincian lengkap ada di <Link href="/privasi/">halaman Privasi</Link>.
          </p>
        </section>

        <section className="kartu bagian-kartu" aria-labelledby="kebijakan">
          <h2 id="kebijakan">Kebijakan dan ketentuan</h2>
          <ul className="daftar-tautan">
            <li>
              <Link href="/privasi/">Privasi</Link>
            </li>
            <li>
              <Link href="/ketentuan-penggunaan/">Ketentuan Penggunaan</Link>
            </li>
            <li>
              <Link href="/tentang/#batasan">Batasan Edukasi (Disclaimer)</Link>
            </li>
            <li>
              <Link href="/sumber/">Sumber Materi (Daftar Pustaka)</Link>
            </li>
          </ul>
        </section>

        <section className="kartu bagian-kartu" aria-labelledby="kontak">
          <h2 id="kontak">Kontak</h2>
          {/* TODO: isi kontak resmi penelitian bila tersedia. */}
          <p>Kontak resmi penelitian akan dicantumkan di sini.</p>
          <p className="label-kecil">
            {await labelVersiAktif()}. <Link href="/sumber/">Lihat sumber materi</Link>
          </p>
        </section>
      </div>
    </>
  );
}
