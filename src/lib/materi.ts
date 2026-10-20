// Memecah naskah modul (Markdown) menjadi beberapa materi.
// Aturan: setiap baris "## Judul" memulai satu materi baru. Teks sebelum "##" pertama
// menjadi pengantar modul. Subjudul di dalam materi memakai "###".
import { estimasiMenit } from '@/data/situs';

export interface Materi {
  nomor: number; // mulai dari 1
  judul: string;
  isi: string;
  estimasi_menit: number;
}

export interface HasilPecah {
  pengantar: string;
  materi: Materi[];
}

const POLA_JUDUL_MATERI = /^##[ \t]+(.+?)[ \t]*#*[ \t]*$/;

export function pecahMateri(isi: string, judulCadangan = 'Materi'): HasilPecah {
  const baris = isi.split(/\r?\n/);
  const pengantar: string[] = [];
  const bagian: { judul: string; baris: string[] }[] = [];
  let diDalamKode = false;

  for (const b of baris) {
    if (/^\s*(```|~~~)/.test(b)) diDalamKode = !diDalamKode;
    const cocok = !diDalamKode && b.match(POLA_JUDUL_MATERI);
    if (cocok) {
      bagian.push({ judul: cocok[1].trim(), baris: [] });
    } else if (bagian.length) {
      bagian[bagian.length - 1].baris.push(b);
    } else {
      pengantar.push(b);
    }
  }

  // Naskah tanpa "##" sama sekali tetap ditampilkan sebagai satu materi.
  if (bagian.length === 0) {
    const semua = pengantar.join('\n').trim();
    return {
      pengantar: '',
      materi: [{ nomor: 1, judul: judulCadangan, isi: semua, estimasi_menit: estimasiMenit(semua) }],
    };
  }

  return {
    pengantar: pengantar.join('\n').trim(),
    materi: bagian.map((x, i) => {
      const teks = x.baris.join('\n').trim();
      return {
        nomor: i + 1,
        judul: x.judul,
        isi: teks,
        estimasi_menit: estimasiMenit(`${x.judul} ${teks}`),
      };
    }),
  };
}

export function hitungJudulMateri(isi: string): number {
  let diDalamKode = false;
  let n = 0;
  for (const b of isi.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(b)) diDalamKode = !diDalamKode;
    if (!diDalamKode && POLA_JUDUL_MATERI.test(b)) n++;
  }
  return n;
}
