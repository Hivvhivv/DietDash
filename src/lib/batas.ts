// Pembatasan jumlah percobaan (masuk, daftar, 2FA) per kunci dan per alamat IP.
import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';
import { koleksi } from './db';
import { sha256 } from './identitas';

export const JENDELA_15_MENIT = 15 * 60 * 1000;

export async function alamatIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'tidak-diketahui';
}

export const kunciBatas = (jenis: string, nilai: string) => `${jenis}:${sha256(nilai)}`;

// true bila salah satu kunci sudah mencapai batasnya dalam jendela waktu.
export async function sudahDibatasi(
  aturan: { kunci: string; batas: number }[],
  jendelaMs = JENDELA_15_MENIT,
): Promise<boolean> {
  const { percobaanLogin } = await koleksi();
  const sejak = new Date(Date.now() - jendelaMs);
  const jumlah = await Promise.all(
    aturan.map((a) => percobaanLogin.countDocuments({ kunci: a.kunci, waktu: { $gte: sejak } })),
  );
  return jumlah.some((n, i) => n >= aturan[i].batas);
}

export async function catatPercobaan(kunci: string[]): Promise<void> {
  const { percobaanLogin } = await koleksi();
  const waktu = new Date();
  await percobaanLogin.insertMany(kunci.map((k) => ({ _id: new ObjectId(), kunci: k, waktu })));
}

export async function hapusPercobaan(kunci: string): Promise<void> {
  const { percobaanLogin } = await koleksi();
  await percobaanLogin.deleteMany({ kunci });
}
