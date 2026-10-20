// Blok khusus di dalam naskah Markdown modul.
//
// ```galeri
// 🥦 | Brokoli | keterangan (opsional)
// ```
//
// ```menu
// - waktu: Sarapan
//   emoji: 🍳
//   nama: Nasi merah dan telur rebus
//   bahan: [Nasi merah ½ gelas, Telur rebus 1 butir]
//   alasan: [Beras merah kaya serat]
//   catatan: Pilihan lain ... (opsional)
// ```
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

export interface ItemGaleri {
  emoji: string;
  nama: string;
  keterangan?: string;
}

export function parseGaleri(teks: string): ItemGaleri[] {
  return teks
    .split(/\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const [emoji = '', nama = '', keterangan] = b.split('|').map((x) => x.trim());
      return { emoji, nama, keterangan: keterangan || undefined };
    })
    .filter((x) => x.nama);
}

const daftarTeks = z.array(z.coerce.string().trim().min(1)).min(1);

const skemaMenu = z
  .array(
    z.object({
      waktu: z.string().trim().min(1),
      emoji: z.string().trim().optional(),
      nama: z.string().trim().min(1),
      bahan: daftarTeks,
      alasan: daftarTeks.optional(),
      catatan: z.string().trim().optional(),
    }),
  )
  .min(1);

export type ItemMenu = z.infer<typeof skemaMenu>[number];

export function parseMenu(teks: string): { ok: true; menu: ItemMenu[] } | { ok: false; pesan: string } {
  try {
    const hasil = skemaMenu.safeParse(parseYaml(teks));
    if (!hasil.success) {
      const m = hasil.error.issues[0];
      return { ok: false, pesan: `Blok menu tidak lengkap (${m.path.join('.')}): ${m.message}` };
    }
    return { ok: true, menu: hasil.data };
  } catch (e) {
    return { ok: false, pesan: `Blok menu tidak bisa dibaca: ${(e as Error).message.split('\n')[0]}` };
  }
}

// Validasi semua blok khusus dalam naskah (dipakai formulir admin).
export function periksaBlokKhusus(isi: string): string | null {
  const pola = /^```(galeri|menu)[ \t]*\r?\n([\s\S]*?)^```/gm;
  for (const m of isi.matchAll(pola)) {
    if (m[1] === 'galeri' && parseGaleri(m[2]).length === 0) {
      return 'Blok galeri kosong. Tulis satu makanan per baris, contoh: 🥦 | Brokoli';
    }
    if (m[1] === 'menu') {
      const r = parseMenu(m[2]);
      if (!r.ok) return r.pesan;
    }
  }
  return null;
}
