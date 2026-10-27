import type { Metadata } from 'next';
import Link from 'next/link';
import KepalaHalaman from '@/components/KepalaHalaman';

export const metadata: Metadata = {
  title: 'Privasi',
  description: 'Data yang dikumpulkan DASH Sehat, tujuannya, siapa yang mengakses, lama penyimpanan, dan cara mengundurkan diri.',
};

const DATA = [
  { data: 'Nomor HP', tujuan: 'Masuk, mencegah akun ganda, menghubungi Anda saat membuat kode akses baru', akses: 'Sistem; peneliti hanya melihat versi tersamarkan, kecuali dibuka dan tercatat di log', lama: 'Dihapus paling lambat 6 bulan setelah penelitian selesai (usulan)' },
  { data: 'Nama', tujuan: 'Menyapa Anda dan mencocokkan identitas saat membuat kode akses baru', akses: 'Anda dan peneliti', lama: 'Sama dengan nomor HP (usulan)' },
  { data: 'Kode peserta internal (mis. DS-4827)', tujuan: 'Menyamarkan identitas dalam data belajar dan menghubungkannya dengan data pretest/posttest; tidak ditampilkan kepada Anda', akses: 'Peneliti', lama: 'Sesuai protokol etik' },
  { data: 'Jawaban pretest dan posttest', tujuan: 'Mengukur pengetahuan sebelum dan sesudah mengikuti materi untuk penelitian; nilai tidak ditampilkan kepada Anda', akses: 'Peneliti', lama: 'Sesuai protokol etik, dalam bentuk ID peserta' },
  { data: 'Progres belajar (materi yang dibuka dan lama membaca)', tujuan: 'Memantau keterlaksanaan intervensi edukasi', akses: 'Peneliti', lama: 'Sesuai protokol etik, dalam bentuk ID peserta' },
  { data: 'Waktu akses dan lama membaca', tujuan: 'Melihat keterlibatan belajar', akses: 'Peneliti', lama: 'Sesuai protokol etik' },
];

export default function Privasi() {
  return (
    <>
      <KepalaHalaman label="Informasi penelitian · Draf" judul="Privasi" ringkasan="Penjelasan data yang kami kumpulkan, untuk apa, siapa yang mengakses, berapa lama disimpan, dan cara mengundurkan diri." />
      <div className="wadah-baca bagian-isi teks-kebijakan">
        <div className="kotak kotak-peringatan">
          {/* TODO: samakan teks dengan dokumen persetujuan yang disetujui komisi etik. */}
          <p>Teks ini masih draf dan akan disamakan dengan dokumen yang disetujui komisi etik penelitian.</p>
        </div>

        <section className="kartu bagian-kartu">
          <h2>Data yang dikumpulkan</h2>
          <div className="tabel-gulir">
            <table>
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Tujuan</th>
                  <th scope="col">Siapa yang mengakses</th>
                  <th scope="col">Lama disimpan</th>
                </tr>
              </thead>
              <tbody>
                {DATA.map((d) => (
                  <tr key={d.data}>
                    <th scope="row">{d.data}</th>
                    <td>{d.tujuan}</td>
                    <td>{d.akses}</td>
                    <td>{d.lama}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Kami <strong>tidak</strong> meminta email, NIK, alamat, tanggal lahir, nomor rekam medis, angka tekanan darah, atau
            data kesehatan lain. Kode akses disimpan dalam bentuk acak (hash) untuk proses masuk. Agar dapat membantu bila Anda
            lupa, salinan kode juga disimpan terenkripsi dan hanya dapat dibuka oleh super admin (ketua tim peneliti); setiap
            pembukaan tercatat di log aktivitas.
          </p>
          <p>
            Centang pada “Checklist Harian” di menu Tips hanya tersimpan di perangkat Anda sendiri, tidak dikirim ke server
            atau tim peneliti, dan kembali kosong setiap hari.
          </p>
          <p>
            Perlu Anda ketahui: terdaftar sebagai responden berarti Anda memiliki hipertensi. Karena itu, daftar nomor HP
            responden kami perlakukan sebagai data sensitif.
          </p>
        </section>

        <section className="kartu bagian-kartu">
          <h2>Persetujuan</h2>
          <p>
            Saat mendaftar, Anda menyetujui informasi penelitian dan kebijakan ini. Waktu persetujuan dicatat. Pengelolaan
            data mengikuti persetujuan komisi etik dan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
          </p>
        </section>

        <section className="kartu bagian-kartu">
          <h2>Keamanan dan lokasi data</h2>
          {/* TODO: sebutkan penyedia & lokasi server basis data sesuai keputusan hosting dan izin etik. */}
          <p>
            Data dikirim lewat koneksi terenkripsi (HTTPS) dan disimpan di basis data dengan akses terbatas. Tidak ada pelacak
            iklan, piksel media sosial, atau analitik pihak ketiga. Lokasi server akan dicantumkan di sini.
          </p>
        </section>

        <section className="kartu bagian-kartu">
          <h2>Mengundurkan diri</h2>
          <p>
            Anda dapat mengundurkan diri kapan saja lewat menu <Link href="/profil/">Profil</Link> atau dengan menghubungi
            peneliti. Akun akan dinonaktifkan. Data yang sudah terkumpul ditangani sesuai protokol etik (dihapus atau
            dipertahankan secara anonim), sebagaimana dijelaskan dalam dokumen persetujuan.
          </p>
          {/* TODO: tetapkan penanganan data responden yang mundur sesuai keputusan komisi etik. */}
        </section>

        <section className="kartu bagian-kartu">
          <h2>Kontak</h2>
          <p>
            Pertanyaan tentang data Anda dapat diajukan kepada peneliti lewat WhatsApp resmi penelitian (tombol "Hubungi Peneliti" di halaman <Link href="/lupa-token/">Lupa Kode Akses</Link>).
          </p>
        </section>
      </div>
    </>
  );
}
