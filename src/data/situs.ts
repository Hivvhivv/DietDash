// Versi website & konten yang dipakai dalam penelitian.
// Naikkan versi setiap ada perubahan konten dan catat di CHANGELOG-KONTEN.md.
export const VERSI_KONTEN = '0.3.0';
export const STATUS_KONTEN = 'Draf — belum divalidasi ahli';

export const NAMA_SITUS = 'DASH Sehat';
export const SLOGAN = 'Langkah Sehat, Tekanan Darah Lebih Terkontrol';

export const BATASAN_EDUKASI =
  'Informasi di website ini untuk edukasi dan tidak menggantikan saran dokter atau tenaga kesehatan.';

// Kecepatan baca santai untuk pembaca dengan literasi beragam.
export const KATA_PER_MENIT = 150;

export function estimasiMenit(teks: string): number {
  const jumlahKata = teks
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/[#*_>|`\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(jumlahKata / KATA_PER_MENIT));
}
