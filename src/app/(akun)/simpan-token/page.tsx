import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import HalamanAkun from '@/components/akun/HalamanAkun';
import { BuatUlangToken } from '@/components/belajar/FormAkun';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Simpan Kode Akses', robots: { index: false, follow: false } };

// Untuk responden yang menutup halaman sebelum mencentang "Saya sudah menyimpan kode akses saya".
// Kode lama tidak dapat ditampilkan lagi (hanya hash), jadi dibuat kode baru.
export default async function SimpanTokenUlang() {
  const a = await wajibResponden({ izinkanBelumSimpan: true });
  if (a.r.token_disimpan_pada) redirect('/belajar/');
  return (
    <HalamanAkun
      ilustrasi="daftar"
      judul="Simpan Kode Akses Anda"
      ringkasan="Demi keamanan, kode akses hanya ditampilkan satu kali. Buat kode baru, lalu simpan baik-baik sebelum melanjutkan."
    >
      <BuatUlangToken />
    </HalamanAkun>
  );
}
