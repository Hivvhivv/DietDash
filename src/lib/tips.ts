// Tips Sehari-hari: bacaan pendukung yang dikelola admin (tambah, ubah, sembunyikan, hapus).
// Tidak termasuk versi konten penelitian; setiap perubahan tercatat di log aktivitas.
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import type { AdminAktif } from './admin-auth';
import { cariKlaimTerlarang } from './cek-klaim';
import { KATEGORI_TIPS, catatAudit, keObjectId, koleksi, type DokTips, type KategoriTips } from './db';

export const LABEL_KATEGORI_TIPS: Record<KategoriTips, string> = {
  dapur: 'Di Dapur & Memasak',
  belanja: 'Belanja Hemat & Sehat',
  luar: 'Makan di Luar & Warung',
  keluarga: 'Bersama Keluarga',
  label: 'Membaca Label Makanan',
  kebiasaan: 'Kebiasaan Sehari-hari',
};

export const skemaTips = z.object({
  judul: z.string().trim().min(5, 'Judul minimal 5 karakter.').max(90, 'Judul maksimal 90 karakter.'),
  kategori: z.enum(KATEGORI_TIPS, { message: 'Pilih kategori.' }),
  masalah: z.string().trim().min(10, 'Tuliskan masalah yang sering dialami (minimal 10 karakter).').max(400, 'Maksimal 400 karakter.'),
  solusi: z.string().trim().min(10, 'Tuliskan solusi praktisnya (minimal 10 karakter).').max(700, 'Maksimal 700 karakter.'),
  catatan: z.string().trim().max(300, 'Maksimal 300 karakter.'),
});
export type IsiTips = z.infer<typeof skemaTips>;

type Hasil = { ok: true; id: string } | { ok: false; pesan: string };

export async function daftarTipsTerbit(): Promise<DokTips[]> {
  const { tips } = await koleksi();
  return tips.find({ terbit: true }).sort({ urutan: 1, _id: 1 }).toArray();
}

export async function semuaTips(): Promise<DokTips[]> {
  const { tips } = await koleksi();
  return tips.find().sort({ urutan: 1, _id: 1 }).toArray();
}

export async function ambilTips(id: string): Promise<DokTips | null> {
  const oid = keObjectId(id);
  if (!oid) return null;
  const { tips } = await koleksi();
  return tips.findOne({ _id: oid });
}

// Tips hari ini: berganti setiap hari (zona Asia/Jakarta), sama untuk semua responden.
export function pilihHariIni(daftar: DokTips[], tanggal = new Date()): DokTips | null {
  if (!daftar.length) return null;
  const hari = Math.floor((tanggal.getTime() + 7 * 3600_000) / 86_400_000);
  return daftar[hari % daftar.length];
}

export async function tipsHariIni(): Promise<DokTips | null> {
  return pilihHariIni(await daftarTipsTerbit());
}

export async function simpanTips(
  admin: AdminAktif,
  id: string | null,
  isi: IsiTips & { gambar: DokTips['gambar']; terbit: boolean },
): Promise<Hasil> {
  const klaim = cariKlaimTerlarang([isi.judul, isi.masalah, isi.solusi, isi.catatan].join('\n'));
  if (klaim.length) {
    return { ok: false, pesan: `Ada klaim yang tidak diperbolehkan: "${klaim[0]}". Diet DASH membantu, bukan menyembuhkan atau menggantikan obat.` };
  }
  const { tips } = await koleksi();
  const sekarang = new Date();
  if (id) {
    const oid = keObjectId(id);
    if (!oid) return { ok: false, pesan: 'Tips tidak ditemukan.' };
    const r = await tips.updateOne({ _id: oid }, { $set: { ...isi, diubah_pada: sekarang, diubah_oleh: admin.email } });
    if (!r.matchedCount) return { ok: false, pesan: 'Tips tidak ditemukan.' };
    await catatAudit({ admin: admin.email, aksi: 'ubah_tips', objek: isi.judul });
    return { ok: true, id };
  }
  const terakhir = await tips.find().sort({ urutan: -1 }).limit(1).next();
  const _id = new ObjectId();
  await tips.insertOne({
    _id,
    ...isi,
    urutan: (terakhir?.urutan ?? 0) + 1,
    contoh: false,
    dibuat_pada: sekarang,
    dibuat_oleh: admin.email,
    diubah_pada: sekarang,
    diubah_oleh: admin.email,
  });
  await catatAudit({ admin: admin.email, aksi: 'buat_tips', objek: isi.judul });
  return { ok: true, id: _id.toHexString() };
}

export async function aturTerbitTips(admin: AdminAktif, id: string, terbit: boolean): Promise<void> {
  const t = await ambilTips(id);
  if (!t) return;
  const { tips } = await koleksi();
  await tips.updateOne({ _id: t._id }, { $set: { terbit, diubah_pada: new Date(), diubah_oleh: admin.email } });
  await catatAudit({ admin: admin.email, aksi: terbit ? 'terbitkan_tips' : 'sembunyikan_tips', objek: t.judul });
}

export async function geserTips(admin: AdminAktif, id: string, arah: -1 | 1): Promise<void> {
  const semua = await semuaTips();
  const i = semua.findIndex((t) => t._id.toHexString() === id);
  const j = i + arah;
  if (i < 0 || j < 0 || j >= semua.length) return;
  [semua[i], semua[j]] = [semua[j], semua[i]];
  const { tips } = await koleksi();
  await tips.bulkWrite(semua.map((t, n) => ({ updateOne: { filter: { _id: t._id }, update: { $set: { urutan: n + 1 } } } })));
  await catatAudit({ admin: admin.email, aksi: 'urutkan_tips', objek: semua[j].judul });
}

export async function hapusTips(admin: AdminAktif, id: string): Promise<void> {
  const t = await ambilTips(id);
  if (!t) return;
  const { tips } = await koleksi();
  await tips.deleteOne({ _id: t._id });
  await catatAudit({ admin: admin.email, aksi: 'hapus_tips', objek: t.judul });
}

export async function hapusTipsContoh(admin: AdminAktif): Promise<number> {
  const { tips } = await koleksi();
  const r = await tips.deleteMany({ contoh: true });
  if (r.deletedCount) await catatAudit({ admin: admin.email, aksi: 'hapus_tips_contoh', keterangan: `${r.deletedCount} tips` });
  return r.deletedCount;
}
