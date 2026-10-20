import type { Metadata } from 'next';
import Link from 'next/link';
import KepalaHalaman from '@/components/KepalaHalaman';
import { VERSI_KEBIJAKAN } from '@/lib/peserta';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Data apa yang disimpan DASH Sehat, untuk apa, dan bagaimana menghapusnya.',
};

export default function KebijakanPrivasi() {
  return (
    <>
      <KepalaHalaman
        remah={[{ href: '/tentang/', label: 'Tentang' }]}
        label={`Versi ${VERSI_KEBIJAKAN} · Draf`}
        judul="Kebijakan Privasi"
        ringkasan="Penjelasan sederhana tentang data yang kami simpan, untuk apa, siapa yang bisa melihatnya, dan cara menghapusnya."
      />
      <div className="wadah-baca bagian-isi teks-kebijakan">
        <div className="kotak kotak-peringatan">
          <p>
            Draf ini perlu disesuaikan dengan persetujuan etik penelitian sebelum website dipakai
            untuk pengambilan data.
          </p>
        </div>

        <section className="kartu bagian-kartu">
          <h2>1. Tanpa akun, tidak ada data yang disimpan</h2>
          <p>
            Semua materi dan latihan soal bisa dibuka tanpa akun. Bila Anda tidak masuk, progres
            belajar hanya disimpan di perangkat Anda sendiri (penyimpanan peramban) dan tidak
            dikirim ke server kami.
          </p>
        </section>

        <section className="kartu bagian-kartu">
          <h2>2. Data yang disimpan bila Anda membuat akun</h2>
          <ul>
            <li>
              <strong>Email</strong>, untuk masuk ke akun.
            </li>
            <li>
              <strong>Kata sandi dalam bentuk acak (hash)</strong>. Kata sandi asli tidak disimpan dan
              tidak bisa dilihat oleh siapa pun, termasuk tim peneliti.
            </li>
            <li>
              <strong>Materi yang Anda buka</strong>: modul, nomor materi, waktu pertama dan terakhir
              dibuka, serta berapa kali dibuka.
            </li>
            <li>
              <strong>Hasil latihan soal</strong>: jumlah jawaban benar dan waktunya.
            </li>
            <li>
              <strong>Waktu pendaftaran, waktu terakhir masuk</strong>, dan tanggal Anda menyetujui
              kebijakan ini.
            </li>
          </ul>
          <p>
            Kami <strong>tidak</strong> meminta nama, NIK, nomor telepon, alamat, tanggal lahir, nilai
            tekanan darah, obat yang diminum, atau data kesehatan lainnya. Website ini juga tidak
            memakai alat pelacak atau iklan pihak ketiga.
          </p>
        </section>

        <section className="kartu bagian-kartu">
          <h2>3. Untuk apa data dipakai</h2>
          <p>
            Data progres dipakai tim peneliti untuk mengetahui sejauh mana materi edukasi dipelajari
            dalam penelitian ini. Data tidak dipakai untuk iklan, tidak dijual, dan tidak dibagikan
            kepada pihak lain di luar tim peneliti.
          </p>
          <p>
            Progres belajar bukan penilaian kesehatan Anda. Hasil latihan soal tidak memengaruhi
            pelayanan kesehatan yang Anda terima.
          </p>
        </section>

        <section className="kartu bagian-kartu">
          <h2>4. Siapa yang bisa melihat data</h2>
          <p>
            Hanya anggota tim peneliti yang diberi akses sebagai peneliti. Peserta lain tidak bisa
            melihat data Anda.
          </p>
        </section>

        <section className="kartu bagian-kartu">
          <h2>5. Lama penyimpanan dan penghapusan</h2>
          {/* TODO: isi lama penyimpanan sesuai keputusan pembimbing/izin etik. */}
          <p>
            Lama penyimpanan data akan ditetapkan sesuai persetujuan etik penelitian dan dicantumkan
            di sini. Setelah masa itu berakhir, seluruh data peserta akan dihapus.
          </p>
          <p>
            Anda dapat menghapus akun dan seluruh data belajar Anda kapan saja melalui halaman{' '}
            <Link href="/akun/">Akun Saya</Link> → <em>Hapus akun dan data saya</em>, atau dengan
            menghubungi tim peneliti.
          </p>
        </section>

        <section className="kartu bagian-kartu">
          <h2>6. Keamanan dan lokasi data</h2>
          {/* TODO: sebutkan penyedia & lokasi server basis data sesuai izin etik. */}
          <p>
            Data dikirim melalui koneksi terenkripsi (HTTPS) dan disimpan di layanan basis data
            daring dengan akses terbatas. Kata sandi disimpan dengan algoritma hash modern. Lokasi
            server akan dicantumkan di sini.
          </p>
        </section>

        <section className="kartu bagian-kartu">
          <h2>7. Hak Anda</h2>
          <p>
            Anda berhak menanyakan data apa yang kami simpan tentang Anda, meminta perbaikan, dan
            meminta penghapusan. Hubungi kami melalui <Link href="/tentang/#kontak">kontak penelitian</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
