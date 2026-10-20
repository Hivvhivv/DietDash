// Skema konten modul. Dipakai bersama oleh pembaca berkas Markdown, skrip impor,
// dan formulir admin, supaya aturan validasinya selalu sama.
// File ini sengaja tanpa alias impor (@/...) agar bisa dipakai langsung oleh skrip Node.
import { z } from 'zod';

export const NAMA_ILUSTRASI = ['jantung', 'piring', 'porsi', 'menu', 'langkah', 'kuis'] as const;
export type NamaIlustrasi = (typeof NAMA_ILUSTRASI)[number];

export const POLA_VERSI = /^\d+\.\d+\.\d+$/;
export const POLA_ID_MODUL = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const teks = (label: string) => z.string().trim().min(1, `${label} wajib diisi.`);

export const skemaDataModul = z.object({
  urutan: z.number().int().min(1, 'Urutan minimal 1.').max(20, 'Urutan maksimal 20.'),
  judul: teks('Judul'),
  deskripsi_kartu: teks('Deskripsi kartu'),
  ilustrasi: z.enum(NAMA_ILUSTRASI, 'Pilih salah satu ilustrasi.'),
  ilustrasi_alt: teks('Teks alternatif ilustrasi'),
  tujuan: z
    .array(z.string().trim().min(1))
    .min(2, 'Tulis 2–4 tujuan pembelajaran.')
    .max(4, 'Tulis 2–4 tujuan pembelajaran.'),
  poin_penting: z
    .array(z.string().trim().min(1))
    .min(3, 'Tulis 3–5 poin penting.')
    .max(5, 'Tulis 3–5 poin penting.'),
  rangkuman: teks('Rangkuman'),
  sumber: z.array(z.string()).min(1, 'Pilih minimal satu sumber.'),
});

export type DataModul = z.infer<typeof skemaDataModul>;

export const skemaVersi = z
  .string()
  .trim()
  .regex(POLA_VERSI, 'Format versi harus angka.angka.angka, misalnya 0.2.0.');

// Frontmatter berkas Markdown = data modul + nomor versi.
export const skemaFrontmatter = skemaDataModul.extend({ versi: skemaVersi });

export const STATUS_VERSI = ['draf', 'disetujui', 'diarsipkan'] as const;
export type StatusVersi = (typeof STATUS_VERSI)[number];

export const PERAN_ADMIN = ['peneliti', 'editor'] as const;
export type PeranAdmin = (typeof PERAN_ADMIN)[number];

export function pisahFrontmatter(mentah: string): { yaml: string; isi: string } | null {
  const cocok = mentah.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return cocok ? { yaml: cocok[1], isi: cocok[2] } : null;
}
