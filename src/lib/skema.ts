// Skema validasi konten (PRD v2.0 Bagian 5 dan 10). Dipakai panel admin dan skrip benih.
// File ini sengaja tanpa alias impor (@/...) agar bisa dipakai langsung oleh skrip Node.
import { z } from 'zod';

export const NAMA_ILUSTRASI = ['jantung', 'piring', 'porsi', 'menu', 'langkah', 'kuis'] as const;
export type NamaIlustrasi = (typeof NAMA_ILUSTRASI)[number];

const teks = (label: string, maks = 2000) =>
  z.string().trim().min(1, `${label} wajib diisi.`).max(maks, `${label} terlalu panjang.`);
const daftar = (label: string, min: number, maks: number) =>
  z
    .array(z.string().trim().min(1))
    .min(min, `Tulis ${min}–${maks} ${label}.`)
    .max(maks, `Tulis ${min}–${maks} ${label}.`);

export const skemaModul = z.object({
  judul: teks('Judul', 120),
  deskripsi: teks('Deskripsi', 240),
  tujuan: daftar('tujuan modul', 1, 5),
});

export const skemaMateri = z.object({
  judul: teks('Judul', 160),
  tujuan: daftar('tujuan pembelajaran', 1, 5),
  isi: teks('Isi materi', 60_000),
  poin_penting: daftar('poin penting', 1, 6),
  rangkuman: teks('Rangkuman', 3000),
  estimasi_menit: z.number().int().min(1).max(120).nullable(),
  sumber: z.array(z.string().trim().min(1)).max(20),
});

export const PERAN_ADMIN = ['admin', 'super_admin'] as const;
