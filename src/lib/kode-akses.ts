// Salinan terenkripsi kode akses responden agar super admin dapat membantu responden yang lupa
// (keputusan peneliti 2026-10-22). Masuk tetap memakai hash Argon2id; salinan ini hanya untuk dilihat super admin,
// setiap pembukaan tercatat di log. AES-256-GCM, kunci dari env KUNCI_KODE_AKSES (32 byte, base64), dan ID responden
// sebagai associated data sehingga salinan tidak bisa dipindahkan ke akun lain.
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { ObjectId } from 'mongodb';

function kunci(): Buffer | null {
  const k = process.env.KUNCI_KODE_AKSES;
  if (!k) return null;
  const b = Buffer.from(k, 'base64');
  return b.length === 32 ? b : null;
}

export const enkripsiAktif = () => kunci() !== null;

// null bila kunci belum diatur: akun tetap berfungsi, hanya kodenya tidak dapat dilihat.
export function enkripsiKode(kode: string, respondentId: ObjectId): string | null {
  const k = kunci();
  if (!k) return null;
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', k, iv);
  c.setAAD(Buffer.from(respondentId.toHexString()));
  const isi = Buffer.concat([c.update(kode, 'utf8'), c.final()]);
  return ['v1', iv.toString('base64'), c.getAuthTag().toString('base64'), isi.toString('base64')].join(':');
}

export function dekripsiKode(teks: string | null | undefined, respondentId: ObjectId): string | null {
  const k = kunci();
  if (!k || !teks) return null;
  const [versi, iv, tag, isi] = teks.split(':');
  if (versi !== 'v1' || !iv || !tag || !isi) return null;
  try {
    const d = createDecipheriv('aes-256-gcm', k, Buffer.from(iv, 'base64'));
    d.setAAD(Buffer.from(respondentId.toHexString()));
    d.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([d.update(Buffer.from(isi, 'base64')), d.final()]).toString('utf8');
  } catch {
    return null; // kunci berganti atau data rusak
  }
}
