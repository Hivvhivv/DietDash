// TOTP (RFC 6238) untuk autentikasi dua faktor admin: 6 digit, periode 30 detik, HMAC-SHA1.
// Kompatibel dengan Google Authenticator, Microsoft Authenticator, Aegis, dsb.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function buatRahasiaTotp(): string {
  const bytes = randomBytes(20);
  let bit = 0;
  let nilai = 0;
  let hasil = '';
  for (const b of bytes) {
    nilai = (nilai << 8) | b;
    bit += 8;
    while (bit >= 5) {
      hasil += BASE32[(nilai >>> (bit - 5)) & 31];
      bit -= 5;
    }
  }
  if (bit > 0) hasil += BASE32[(nilai << (5 - bit)) & 31];
  return hasil;
}

function base32KeBuffer(rahasia: string): Buffer {
  const bersih = rahasia.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bit = 0;
  let nilai = 0;
  const hasil: number[] = [];
  for (const c of bersih) {
    nilai = (nilai << 5) | BASE32.indexOf(c);
    bit += 5;
    if (bit >= 8) {
      hasil.push((nilai >>> (bit - 8)) & 255);
      bit -= 8;
    }
  }
  return Buffer.from(hasil);
}

function kodePada(rahasia: Buffer, langkah: number): string {
  const pesan = Buffer.alloc(8);
  pesan.writeBigUInt64BE(BigInt(langkah));
  const h = createHmac('sha1', rahasia).update(pesan).digest();
  const offset = h[h.length - 1] & 0xf;
  const angka = (h.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return angka.toString().padStart(6, '0');
}

// Menerima kode dari periode sekarang ±1 (toleransi jam HP yang sedikit berbeda).
export function cekKodeTotp(rahasia: string, kode: string, waktu = Date.now()): boolean {
  const bersih = kode.replace(/\D/g, '');
  if (bersih.length !== 6) return false;
  const kunci = base32KeBuffer(rahasia);
  const langkah = Math.floor(waktu / 30_000);
  for (const d of [-1, 0, 1]) {
    const benar = Buffer.from(kodePada(kunci, langkah + d));
    if (timingSafeEqual(benar, Buffer.from(bersih))) return true;
  }
  return false;
}

export function kodeTotpSekarang(rahasia: string, waktu = Date.now()): string {
  return kodePada(base32KeBuffer(rahasia), Math.floor(waktu / 30_000));
}

export function uriOtpauth(rahasia: string, email: string): string {
  const label = encodeURIComponent(`DASH Sehat:${email}`);
  return `otpauth://totp/${label}?secret=${rahasia}&issuer=${encodeURIComponent('DASH Sehat')}&algorithm=SHA1&digits=6&period=30`;
}
