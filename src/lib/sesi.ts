// Sesi masuk untuk responden dan admin. Token sesi acak disimpan sebagai hash SHA-256;
// cookie HttpOnly + SameSite=Lax (+ Secure di produksi). Token akses responden tidak pernah
// disimpan di cookie atau localStorage — hanya token sesi.
import { randomBytes } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { koleksi, type DokSesi } from './db';
import { sha256 } from './identitas';

export const COOKIE_RESPONDEN = 'dash_r';
export const COOKIE_ADMIN = 'dash_a';
export const SUFIKS_INGAT = '.i'; // penanda "ingat saya" agar proxy memperpanjang umur cookie

const MENIT = 60_000;
const HARI = 24 * 60 * MENIT;
export const LAMA_INGAT_RESPONDEN = 30 * HARI; // sejak terakhir aktif
const LAMA_SINGKAT_RESPONDEN = 12 * 60 * MENIT;
export const LAMA_IDLE_ADMIN = 30 * MENIT; // PRD 7.8
const LAMA_TAHAP_SANDI = 10 * MENIT;

type Jenis = DokSesi['jenis_pemilik'];
const namaCookie = (j: Jenis) => (j === 'admin' ? COOKIE_ADMIN : COOKIE_RESPONDEN);

function lama(jenis: Jenis, tahap: DokSesi['tahap'], ingat: boolean) {
  if (jenis === 'admin') return tahap === 'sandi' ? LAMA_TAHAP_SANDI : LAMA_IDLE_ADMIN;
  return ingat ? LAMA_INGAT_RESPONDEN : LAMA_SINGKAT_RESPONDEN;
}

export async function buatSesi(opsi: {
  pemilik_id: ObjectId;
  jenis: Jenis;
  tahap?: DokSesi['tahap'];
  ingat?: boolean;
}): Promise<void> {
  const { sesi } = await koleksi();
  const token = randomBytes(32).toString('base64url');
  const tahap = opsi.tahap ?? 'penuh';
  const ingat = opsi.ingat ?? false;
  const sekarang = new Date();
  await sesi.insertOne({
    _id: new ObjectId(),
    token_hash: sha256(token),
    pemilik_id: opsi.pemilik_id,
    jenis_pemilik: opsi.jenis,
    tahap,
    ingat,
    dibuat_pada: sekarang,
    terakhir_aktif: sekarang,
    kedaluwarsa_pada: new Date(sekarang.getTime() + lama(opsi.jenis, tahap, ingat)),
  });
  const pakaiIngat = opsi.jenis === 'responden' && ingat;
  (await cookies()).set(namaCookie(opsi.jenis), pakaiIngat ? token + SUFIKS_INGAT : token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Tanpa "ingat saya", cookie hilang saat peramban ditutup.
    ...(pakaiIngat ? { maxAge: LAMA_INGAT_RESPONDEN / 1000 } : {}),
  });
}

function tokenDariCookie(nilai: string | undefined): string | null {
  if (!nilai) return null;
  return nilai.endsWith(SUFIKS_INGAT) ? nilai.slice(0, -SUFIKS_INGAT.length) : nilai;
}

// Membaca sesi aktif dan memperpanjangnya (sesi bergeser sejak terakhir aktif).
export async function bacaSesi(jenis: Jenis): Promise<DokSesi | null> {
  const token = tokenDariCookie((await cookies()).get(namaCookie(jenis))?.value);
  if (!token) return null;
  const { sesi } = await koleksi();
  const sekarang = new Date();
  const dok = await sesi.findOne({
    token_hash: sha256(token),
    jenis_pemilik: jenis,
    kedaluwarsa_pada: { $gt: sekarang },
  });
  if (!dok) return null;
  const jeda = jenis === 'admin' ? MENIT : 5 * MENIT;
  if (dok.tahap === 'penuh' && sekarang.getTime() - dok.terakhir_aktif.getTime() > jeda) {
    await sesi.updateOne(
      { _id: dok._id },
      {
        $set: {
          terakhir_aktif: sekarang,
          kedaluwarsa_pada: new Date(sekarang.getTime() + lama(jenis, dok.tahap, dok.ingat)),
        },
      },
    );
  }
  return dok;
}

export async function hapusSesiIni(jenis: Jenis): Promise<void> {
  const toko = await cookies();
  const token = tokenDariCookie(toko.get(namaCookie(jenis))?.value);
  if (token) {
    const { sesi } = await koleksi();
    await sesi.deleteOne({ token_hash: sha256(token) });
  }
  toko.delete(namaCookie(jenis));
}

export async function hapusSemuaSesi(pemilikId: ObjectId): Promise<void> {
  const { sesi } = await koleksi();
  await sesi.deleteMany({ pemilik_id: pemilikId });
}
