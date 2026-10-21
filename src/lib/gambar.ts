// Gambar konten yang diunggah admin (PRD 10.2): JPG/PNG/WebP maks. 2 MB, dikecilkan otomatis,
// disimpan di MongoDB GridFS dalam format WebP. Teks alternatif wajib.
import { GridFSBucket, ObjectId } from 'mongodb';
import sharp from 'sharp';
import { ambilDb } from './db';

export const MAKS_BYTE = 2 * 1024 * 1024;
const TIPE_BOLEH = ['image/jpeg', 'image/png', 'image/webp'];
const LEBAR_MAKS = 1200;

async function wadah() {
  return new GridFSBucket(await ambilDb(), { bucketName: 'gambar' });
}

export async function simpanGambar(berkas: File, alt: string, oleh: string): Promise<{ ok: true; id: string } | { ok: false; pesan: string }> {
  if (!alt.trim()) return { ok: false, pesan: 'Isi teks alternatif gambar sebelum menyimpan.' };
  if (!TIPE_BOLEH.includes(berkas.type)) return { ok: false, pesan: 'Format gambar harus JPG, PNG, atau WebP.' };
  if (berkas.size > MAKS_BYTE) return { ok: false, pesan: 'Ukuran gambar maksimal 2 MB.' };
  let hasil: Buffer;
  try {
    hasil = await sharp(Buffer.from(await berkas.arrayBuffer()))
      .rotate()
      .resize({ width: LEBAR_MAKS, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return { ok: false, pesan: 'Berkas tidak bisa dibaca sebagai gambar.' };
  }
  const w = await wadah();
  const id = new ObjectId();
  await new Promise<void>((selesai, gagal) => {
    const unggah = w.openUploadStreamWithId(id, `${id.toHexString()}.webp`, {
      metadata: { alt: alt.trim(), oleh, tipe: 'image/webp', nama_asli: berkas.name.slice(0, 120) },
    });
    unggah.on('finish', () => selesai());
    unggah.on('error', gagal);
    unggah.end(hasil);
  });
  return { ok: true, id: id.toHexString() };
}

export async function bacaGambar(id: string): Promise<Buffer | null> {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const w = await wadah();
  const oid = new ObjectId(id);
  if (!(await w.find({ _id: oid }).hasNext())) return null;
  const potongan: Buffer[] = [];
  return new Promise((selesai, gagal) => {
    w.openDownloadStream(oid)
      .on('data', (c: Buffer) => potongan.push(c))
      .on('end', () => selesai(Buffer.concat(potongan)))
      .on('error', gagal);
  });
}
