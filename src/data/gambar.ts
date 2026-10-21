import type { GambarModul } from '@/lib/db';
import type { NamaIlustrasi } from '@/lib/skema';

// Ilustrasi bawaan untuk sampul modul (berkas di public/gambar/ilustrasi/).
// Admin juga dapat mengunggah gambar sendiri (disimpan di basis data).
export const GAMBAR_ILUSTRASI: Record<NamaIlustrasi, string> = {
  jantung: '/gambar/ilustrasi/jantung.png',
  piring: '/gambar/ilustrasi/piring.png',
  porsi: '/gambar/ilustrasi/porsi.png',
  menu: '/gambar/ilustrasi/menu.png',
  langkah: '/gambar/ilustrasi/langkah.png',
  kuis: '/gambar/ilustrasi/kuis.png',
};

export const LABEL_ILUSTRASI: Record<NamaIlustrasi, string> = {
  jantung: 'Jantung & tekanan darah',
  piring: 'Piring makan',
  porsi: 'Sayur, buah & porsi',
  menu: 'Menu harian',
  langkah: 'Papan daftar (kebiasaan)',
  kuis: 'Lampu ide (rangkuman)',
};

export const UKURAN_ILUSTRASI = { width: 140, height: 110 };

export function srcGambarModul(g: GambarModul): string {
  return g.jenis === 'bawaan' ? GAMBAR_ILUSTRASI[g.nama] : `/gambar-konten/${g.id}/`;
}
