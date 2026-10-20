import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import KepalaHalaman from '@/components/KepalaHalaman';
import { FormDaftar } from '@/components/peserta/FormPeserta';
import { pesertaSaatIni } from '@/lib/peserta';

export const metadata: Metadata = { title: 'Daftar', robots: { index: false, follow: false } };

export default async function Daftar() {
  if (await pesertaSaatIni()) redirect('/akun/');

  return (
    <>
      <KepalaHalaman
        label="Akun Peserta"
        judul="Buat Akun"
        ringkasan="Akun dipakai untuk menyimpan progres belajar Anda. Pendaftaran tidak wajib: semua materi tetap bisa dibaca tanpa akun."
      />
      <div className="wadah-baca bagian-isi">
        <div className="kotak">
          <p>
            Yang kami simpan hanya <strong>email</strong>, <strong>kata sandi yang sudah diacak
            (hash) sehingga tidak bisa dibaca siapa pun</strong>, <strong>materi yang Anda
            buka</strong>, dan{' '}
            <strong>skor latihan soal</strong>. Kami tidak meminta nama, nomor telepon, alamat, atau
            data kesehatan.
          </p>
        </div>
        <div className="kartu">
          <FormDaftar />
        </div>
        <p>
          Sudah punya akun? <Link href="/masuk/">Masuk di sini</Link>.
        </p>
      </div>
    </>
  );
}
