// Nomor HP, kode akses (disebut token di kode), dan ID peserta (PRD v2.0 Bagian 7). Tanpa alias impor agar bisa dipakai skrip.
import { createHash, randomInt } from 'node:crypto';

// Kode akses 6 angka, mudah diingat lansia (keputusan peneliti 2026-10-21; PRD 7.2 semula 8 huruf+angka).
// Keamanan dijaga oleh hash Argon2id dan batas 5 percobaan per 15 menit per nomor HP dan per IP.
export const PANJANG_KODE = 6;

// Pola yang terlalu mudah ditebak tidak pernah dibuat: 111111, 123456, 987654, 121212, 123123.
export function kodeLemah(kode: string): boolean {
  if (/^(\d)\1+$/.test(kode)) return true;
  if ('01234567890123456789'.includes(kode) || '98765432109876543210'.includes(kode)) return true;
  return /^(\d\d)\1\1$/.test(kode) || /^(\d\d\d)\1$/.test(kode);
}

export function buatToken(): string {
  for (;;) {
    let t = '';
    for (let i = 0; i < PANJANG_KODE; i++) t += String(randomInt(10));
    if (!kodeLemah(t)) return t;
  }
}

// Spasi, tanda hubung, dan karakter lain diabaikan saat masuk.
export function normalkanToken(masukan: string): string {
  return masukan.replace(/\D/g, '');
}

// 482917 → "482 917"
export function formatToken(token: string): string {
  return `${token.slice(0, 3)} ${token.slice(3)}`;
}

// Menerima 08…, 628…, atau +628… (boleh ada spasi/tanda hubung). Hasil seragam: +628…
export function normalkanNomorHp(masukan: string): string | null {
  let d = masukan.replace(/[\s\-().]/g, '');
  if (d.startsWith('+62')) d = d.slice(3);
  else if (d.startsWith('62')) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  else return null;
  if (!/^8\d{7,11}$/.test(d)) return null;
  return `+62${d}`;
}

// +6281234567890 → 0812-3456-7890 (untuk konfirmasi saat daftar)
export function formatNomorHp(nomor: string): string {
  const lokal = nomor.startsWith('+62') ? `0${nomor.slice(3)}` : nomor;
  return lokal.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3');
}

// +6281234567890 → 0812****7890
export function samarkanNomorHp(nomor: string): string {
  const lokal = nomor.startsWith('+62') ? `0${nomor.slice(3)}` : nomor;
  return `${lokal.slice(0, 4)}${'*'.repeat(Math.max(3, lokal.length - 8))}${lokal.slice(-4)}`;
}

export function buatIdPeserta(digit = 4): string {
  const min = 10 ** (digit - 1);
  return `DS-${randomInt(min, 10 * min)}`;
}

// Kunci stabil untuk modul/materi/kuis/soal (dipertahankan saat versi diklon).
export function buatKunci(): string {
  const a = 'abcdefghijkmnpqrstuvwxyz23456789';
  let t = '';
  for (let i = 0; i < 10; i++) t += a[randomInt(a.length)];
  return t;
}

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
