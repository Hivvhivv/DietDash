import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import HalamanAkun from '@/components/akun/HalamanAkun';
import PilihMasuk from '@/components/akun/PilihMasuk';
import { FormMasuk } from '@/components/belajar/FormAkun';
import Ikon from '@/components/Ikon';
import { respondenSaatIni } from '@/lib/responden';

export const metadata: Metadata = { title: 'Masuk' };

const PESAN: Record<string, string> = {
  keluar: 'Anda sudah keluar. Sampai jumpa lagi.',
  mundur: 'Pengunduran diri Anda sudah tercatat dan akun dinonaktifkan. Terima kasih atas partisipasi Anda.',
};

// Halaman pertama website. Semua fitur belajar dan informasi ada di dalam setelah masuk.
export default async function Masuk({ searchParams }: { searchParams: Promise<{ keluar?: string; mundur?: string }> }) {
  if (await respondenSaatIni()) redirect('/belajar/');
  const q = await searchParams;
  const pesan = q.mundur ? PESAN.mundur : q.keluar ? PESAN.keluar : null;
  return (
    <HalamanAkun
      ilustrasi="masuk"
      sorotan={{
        judul: 'Pola Makan Sehat untuk Hidup Lebih Baik',
        teks: 'Pelajari diet DASH dengan materi yang mudah dipahami, contoh nyata, dan latihan soal.',
      }}
      kutipan="Langkah kecil untuk tekanan darah lebih terkontrol"
      judul="Masuk ke DASH Sehat"
      ringkasan="Masuk dengan nomor HP dan kode akses 6 angka Anda untuk belajar pola makan sehat bagi tekanan darah."
    >
      <PilihMasuk aktif="responden" />
      {pesan && (
        <p className="pesan-sukses" role="status">
          {pesan}
        </p>
      )}
      <FormMasuk />
      <p className="akun-tautan-kecil">
        <Link href="/lupa-token/">Lupa kode akses?</Link>
      </p>
      <div className="akun-pemisah">
        <span>Belum punya akun?</span>
      </div>
      <Link className="tombol tombol-sekunder tombol-besar" href="/daftar/">
        <Ikon nama="tambah-orang" />
        Daftar Sekarang
      </Link>
    </HalamanAkun>
  );
}
