import type { NamaIlustrasi } from '@/lib/skema';

// Ilustrasi kartu modul (berkas di public/gambar/ilustrasi/).
// Ganti berkasnya dengan versi beresolusi lebih tinggi tanpa mengubah nama.
export const GAMBAR_ILUSTRASI: Record<NamaIlustrasi, string> = {
  jantung: '/gambar/ilustrasi/jantung.png',
  piring: '/gambar/ilustrasi/piring.png',
  porsi: '/gambar/ilustrasi/porsi.png',
  menu: '/gambar/ilustrasi/menu.png',
  langkah: '/gambar/ilustrasi/langkah.png',
  kuis: '/gambar/ilustrasi/kuis.png',
};

export const UKURAN_ILUSTRASI = { width: 140, height: 110 };
