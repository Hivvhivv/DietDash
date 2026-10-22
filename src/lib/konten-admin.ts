// Panel konten admin (PRD v2.0 Bagian 10). Semua modul dan materi dibuat di sini (kuis tidak dipakai sejak 2026-10-22).
//
// Model versi:
// - Hanya ada satu "versi kerja" (draf / siap_ditinjau) pada satu waktu; admin mengedit versi ini.
// - Super admin menerbitkan versi kerja (menjadi versi aktif responden), lalu menguncinya (mis. v1.0).
// - Versi dikunci tidak pernah diubah. Perbaikan mendesak = versi "perbaikan" baru (mis. v1.0.1)
//   yang hanya boleh diedit super admin, wajib beralasan, dan tercatat di log.
// Setiap item punya "kunci" yang sama di semua versi sehingga progres responden tetap tersambung.
import { ObjectId, type Collection, type Filter, type UpdateFilter } from 'mongodb';
import type { AdminAktif } from './admin-auth';
import {
  ambilKlien,
  catatAudit,
  koleksi,
  type DokMateri,
  type DokModul,
  type DokVersi,
  type GambarModul,
} from './db';
import { cariKlaimTerlarang } from './cek-klaim';
import { buatKunci } from './identitas';
import { ambilStruktur } from './konten';
import { ambilPengaturan, simpanPengaturan } from './pengaturan';

export type Hasil<T = object> = ({ ok: true } & T) | { ok: false; pesan: string };
const gagal = (pesan: string) => ({ ok: false as const, pesan });

// ---------- Versi ----------

export async function versiKerja(): Promise<DokVersi | null> {
  const { versi } = await koleksi();
  return versi.findOne({ status: { $in: ['draf', 'siap_ditinjau'] } });
}

export async function daftarVersi(): Promise<DokVersi[]> {
  const { versi } = await koleksi();
  return versi.find({}).sort({ dibuat_pada: -1 }).toArray();
}

const labelTanggal = () =>
  new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' });

async function klonIsi(dariId: ObjectId | null, keId: ObjectId): Promise<void> {
  if (!dariId) return;
  const k = await koleksi();
  const ganti = <T extends { _id: ObjectId; version_id: ObjectId }>(d: T): T => ({ ...d, _id: new ObjectId(), version_id: keId });
  const [modul, materi] = await Promise.all([
    k.modul.find({ version_id: dariId }).toArray(),
    k.materi.find({ version_id: dariId }).toArray(),
  ]);
  if (modul.length) await k.modul.insertMany(modul.map(ganti));
  if (materi.length) await k.materi.insertMany(materi.map(ganti));
}

export async function buatVersiKerja(admin: AdminAktif): Promise<Hasil<{ id: ObjectId }>> {
  if (await versiKerja()) return gagal('Sudah ada versi kerja. Lanjutkan mengedit versi itu.');
  const atur = await ambilPengaturan();
  const { versi } = await koleksi();
  const aktif = atur.versi_aktif_id ? await versi.findOne({ _id: atur.versi_aktif_id }) : null;
  if (aktif?.status === 'dikunci') {
    return gagal('Versi aktif sudah dikunci untuk penelitian. Perubahan hanya lewat versi perbaikan oleh super admin.');
  }
  const id = new ObjectId();
  const sekarang = new Date();
  await versi.insertOne({
    _id: id,
    label: `Draf ${labelTanggal()}`,
    status: 'draf',
    jenis: 'biasa',
    dasar_id: aktif?._id ?? null,
    dibuat_oleh: admin.email,
    dibuat_pada: sekarang,
    diubah_pada: sekarang,
  });
  await klonIsi(aktif?._id ?? null, id);
  await catatAudit({ admin: admin.email, aksi: 'buat_versi_kerja', objek: id.toHexString(), keterangan: aktif ? `Disalin dari ${aktif.label}` : 'Kosong' });
  return { ok: true, id };
}

export async function buatVersiPerbaikan(admin: AdminAktif, alasan: string): Promise<Hasil<{ id: ObjectId }>> {
  if (admin.peran !== 'super_admin') return gagal('Hanya super admin yang dapat membuat versi perbaikan.');
  if (alasan.trim().length < 5) return gagal('Tulis alasan perbaikan (minimal 5 karakter).');
  if (await versiKerja()) return gagal('Masih ada versi kerja yang belum diterbitkan.');
  const atur = await ambilPengaturan();
  const { versi } = await koleksi();
  const aktif = atur.versi_aktif_id ? await versi.findOne({ _id: atur.versi_aktif_id }) : null;
  if (aktif?.status !== 'dikunci') return gagal('Versi perbaikan hanya dibuat dari versi aktif yang sudah dikunci.');
  const id = new ObjectId();
  const sekarang = new Date();
  await versi.insertOne({
    _id: id,
    label: `Perbaikan ${aktif.label}`,
    status: 'draf',
    jenis: 'perbaikan',
    dasar_id: aktif._id,
    alasan: alasan.trim(),
    dibuat_oleh: admin.email,
    dibuat_pada: sekarang,
    diubah_pada: sekarang,
  });
  await klonIsi(aktif._id, id);
  await catatAudit({ admin: admin.email, aksi: 'buat_versi_perbaikan', objek: aktif.label, alasan: alasan.trim() });
  return { ok: true, id };
}

// Memastikan versi kerja boleh diubah oleh admin ini; perubahan mengembalikan status ke draf.
async function siapkanUbah(admin: AdminAktif): Promise<Hasil<{ versi: DokVersi }>> {
  const v = await versiKerja();
  if (!v) return gagal('Belum ada versi kerja. Buat versi kerja dulu di halaman Konten.');
  if (v.jenis === 'perbaikan' && admin.peran !== 'super_admin') {
    return gagal('Versi perbaikan dari konten yang dikunci hanya dapat diedit super admin.');
  }
  const { versi } = await koleksi();
  await versi.updateOne({ _id: v._id }, { $set: { status: 'draf', diubah_pada: new Date() } });
  return { ok: true, versi: { ...v, status: 'draf' } };
}

async function adaProgres(materiKunci: string[]): Promise<boolean> {
  if (!materiKunci.length) return false;
  const { progres } = await koleksi();
  return !!(await progres.findOne({ materi_kunci: { $in: materiKunci } }));
}

async function rapikanUrutan<T extends { _id: ObjectId; urutan: number }>(kol: Collection<T>, filter: Filter<T>) {
  const daftar = (await kol.find(filter).sort({ urutan: 1 }).toArray()) as unknown as T[];
  await Promise.all(
    daftar.map((d, i) =>
      d.urutan !== i + 1
        ? kol.updateOne({ _id: d._id } as Filter<T>, { $set: { urutan: i + 1 } } as unknown as UpdateFilter<T>)
        : null,
    ),
  );
}

// ---------- Modul ----------

export interface MasukanModul {
  judul: string;
  deskripsi: string;
  tujuan: string[];
  gambar: GambarModul;
}

export async function simpanModul(admin: AdminAktif, kunci: string | null, m: MasukanModul): Promise<Hasil<{ kunci: string }>> {
  const s = await siapkanUbah(admin);
  if (!s.ok) return s;
  const { modul } = await koleksi();
  const vId = s.versi._id;
  if (kunci) {
    const r = await modul.updateOne({ version_id: vId, kunci }, { $set: m });
    if (r.matchedCount === 0) return gagal('Modul tidak ditemukan di versi kerja.');
    await catatAudit({ admin: admin.email, aksi: 'ubah_modul', objek: m.judul });
    return { ok: true, kunci };
  }
  const baru = buatKunci();
  const urutan = (await modul.countDocuments({ version_id: vId })) + 1;
  await modul.insertOne({ _id: new ObjectId(), version_id: vId, kunci: baru, urutan, ...m, diarsipkan: false });
  await catatAudit({ admin: admin.email, aksi: 'buat_modul', objek: m.judul });
  return { ok: true, kunci: baru };
}

export async function geserModul(admin: AdminAktif, kunci: string, arah: -1 | 1): Promise<Hasil> {
  const s = await siapkanUbah(admin);
  if (!s.ok) return s;
  const { modul } = await koleksi();
  const daftar = await modul.find({ version_id: s.versi._id }).sort({ urutan: 1 }).toArray();
  const i = daftar.findIndex((d) => d.kunci === kunci);
  const j = i + arah;
  if (i < 0 || j < 0 || j >= daftar.length) return { ok: true };
  await modul.updateOne({ _id: daftar[i]._id }, { $set: { urutan: daftar[j].urutan } });
  await modul.updateOne({ _id: daftar[j]._id }, { $set: { urutan: daftar[i].urutan } });
  await catatAudit({ admin: admin.email, aksi: 'urutkan_modul', objek: daftar[i].judul });
  return { ok: true };
}

export async function hapusAtauArsipModul(admin: AdminAktif, kunci: string): Promise<Hasil<{ diarsipkan: boolean }>> {
  const s = await siapkanUbah(admin);
  if (!s.ok) return s;
  const k = await koleksi();
  const md = await k.modul.findOne({ version_id: s.versi._id, kunci });
  if (!md) return gagal('Modul tidak ditemukan.');
  const materi = await k.materi.find({ version_id: s.versi._id, modul_kunci: kunci }).toArray();
  if (await adaProgres(materi.map((m) => m.kunci))) {
    await k.modul.updateOne({ _id: md._id }, { $set: { diarsipkan: true } });
    await catatAudit({ admin: admin.email, aksi: 'arsipkan_modul', objek: md.judul });
    return { ok: true, diarsipkan: true };
  }
  await k.materi.deleteMany({ version_id: s.versi._id, modul_kunci: kunci });
  await k.modul.deleteOne({ _id: md._id });
  await rapikanUrutan(k.modul, { version_id: s.versi._id });
  await catatAudit({ admin: admin.email, aksi: 'hapus_modul', objek: md.judul });
  return { ok: true, diarsipkan: false };
}

export async function pulihkanModul(admin: AdminAktif, kunci: string): Promise<Hasil> {
  const s = await siapkanUbah(admin);
  if (!s.ok) return s;
  const { modul } = await koleksi();
  await modul.updateOne({ version_id: s.versi._id, kunci }, { $set: { diarsipkan: false } });
  await catatAudit({ admin: admin.email, aksi: 'pulihkan_modul', objek: kunci });
  return { ok: true };
}

// ---------- Materi ----------

export interface MasukanMateri {
  judul: string;
  tujuan: string[];
  isi: string;
  poin_penting: string[];
  rangkuman: string;
  estimasi_menit: number | null;
  sumber: string[];
  gambar: { id: string; alt: string } | null;
}

export async function simpanMateri(admin: AdminAktif, kunci: string | null, modulKunci: string, m: MasukanMateri): Promise<Hasil<{ kunci: string }>> {
  const s = await siapkanUbah(admin);
  if (!s.ok) return s;
  const k = await koleksi();
  const vId = s.versi._id;
  if (kunci) {
    const r = await k.materi.updateOne({ version_id: vId, kunci }, { $set: m });
    if (r.matchedCount === 0) return gagal('Materi tidak ditemukan di versi kerja.');
    await catatAudit({ admin: admin.email, aksi: 'ubah_materi', objek: m.judul });
    return { ok: true, kunci };
  }
  if (!(await k.modul.findOne({ version_id: vId, kunci: modulKunci }))) return gagal('Modul tidak ditemukan.');
  const baru = buatKunci();
  const urutan = (await k.materi.countDocuments({ version_id: vId, modul_kunci: modulKunci })) + 1;
  await k.materi.insertOne({ _id: new ObjectId(), version_id: vId, kunci: baru, modul_kunci: modulKunci, urutan, ...m, diarsipkan: false });
  await catatAudit({ admin: admin.email, aksi: 'buat_materi', objek: m.judul });
  return { ok: true, kunci: baru };
}

export async function geserMateri(admin: AdminAktif, kunci: string, arah: -1 | 1): Promise<Hasil> {
  const s = await siapkanUbah(admin);
  if (!s.ok) return s;
  const { materi } = await koleksi();
  const m = await materi.findOne({ version_id: s.versi._id, kunci });
  if (!m) return gagal('Materi tidak ditemukan.');
  const daftar = await materi.find({ version_id: s.versi._id, modul_kunci: m.modul_kunci }).sort({ urutan: 1 }).toArray();
  const i = daftar.findIndex((d) => d.kunci === kunci);
  const j = i + arah;
  if (j < 0 || j >= daftar.length) return { ok: true };
  await materi.updateOne({ _id: daftar[i]._id }, { $set: { urutan: daftar[j].urutan } });
  await materi.updateOne({ _id: daftar[j]._id }, { $set: { urutan: daftar[i].urutan } });
  await catatAudit({ admin: admin.email, aksi: 'urutkan_materi', objek: m.judul });
  return { ok: true };
}

export async function hapusAtauArsipMateri(admin: AdminAktif, kunci: string): Promise<Hasil<{ diarsipkan: boolean; modul_kunci: string }>> {
  const s = await siapkanUbah(admin);
  if (!s.ok) return s;
  const k = await koleksi();
  const m = await k.materi.findOne({ version_id: s.versi._id, kunci });
  if (!m) return gagal('Materi tidak ditemukan.');
  if (await adaProgres([kunci])) {
    await k.materi.updateOne({ _id: m._id }, { $set: { diarsipkan: true } });
    await catatAudit({ admin: admin.email, aksi: 'arsipkan_materi', objek: m.judul });
    return { ok: true, diarsipkan: true, modul_kunci: m.modul_kunci };
  }
  await k.materi.deleteOne({ _id: m._id });
  await rapikanUrutan(k.materi, { version_id: s.versi._id, modul_kunci: m.modul_kunci });
  await catatAudit({ admin: admin.email, aksi: 'hapus_materi', objek: m.judul });
  return { ok: true, diarsipkan: false, modul_kunci: m.modul_kunci };
}

// ---------- Validasi (PRD 10.4) ----------

export interface MasalahValidasi {
  lokasi: string;
  pesan: string;
  tautan?: string;
}

const GAMBAR_TANPA_ALT = /!\[\s*\]\(/;

export async function validasiVersi(versionId: ObjectId): Promise<MasalahValidasi[]> {
  const st = await ambilStruktur(versionId);
  if (!st) return [{ lokasi: 'Versi', pesan: 'Versi tidak ditemukan.' }];
  const masalah: MasalahValidasi[] = [];
  if (st.modul.length === 0) masalah.push({ lokasi: 'Konten', pesan: 'Belum ada modul.' });
  for (const md of st.modul) {
    const lokasiModul = `Modul ${md.nomor}`;
    const tModul = `/admin/konten/modul/${md.kunci}/`;
    if (!md.judul.trim() || !md.deskripsi.trim() || md.tujuan.length === 0) {
      masalah.push({ lokasi: lokasiModul, pesan: 'Judul, deskripsi, dan tujuan modul wajib diisi.', tautan: tModul });
    }
    if (!md.gambar.alt.trim()) masalah.push({ lokasi: lokasiModul, pesan: 'Ilustrasi sampul belum punya teks alternatif.', tautan: tModul });
    if (md.materi.length === 0) masalah.push({ lokasi: lokasiModul, pesan: 'Modul belum berisi materi.', tautan: tModul });
    for (const m of md.materi) {
      const lokasi = `Materi ${m.nomor}`;
      const t = `/admin/konten/materi/${m.kunci}/`;
      if (!m.isi.trim()) masalah.push({ lokasi, pesan: 'Isi materi masih kosong.', tautan: t });
      if (m.tujuan.length === 0) masalah.push({ lokasi, pesan: 'Tujuan pembelajaran belum diisi.', tautan: t });
      if (!m.rangkuman.trim()) masalah.push({ lokasi, pesan: 'Rangkuman belum diisi.', tautan: t });
      if (GAMBAR_TANPA_ALT.test(m.isi)) masalah.push({ lokasi, pesan: 'Ada gambar di isi materi yang belum punya teks alternatif.', tautan: t });
      const klaim = cariKlaimTerlarang([m.judul, m.isi, ...m.poin_penting, m.rangkuman].join('\n'));
      if (klaim.length) masalah.push({ lokasi, pesan: `Ada kemungkinan klaim berlebihan: "${klaim.join('", "')}". Ubah kalimatnya (lihat PRD 13).`, tautan: t });
    }
  }
  return masalah;
}

// ---------- Siklus status (PRD 10.5) ----------

export async function tandaiSiapDitinjau(admin: AdminAktif): Promise<Hasil<{ masalah?: MasalahValidasi[] }>> {
  const v = await versiKerja();
  if (!v) return gagal('Belum ada versi kerja.');
  if (v.jenis === 'perbaikan' && admin.peran !== 'super_admin') return gagal('Versi perbaikan hanya untuk super admin.');
  const masalah = await validasiVersi(v._id);
  if (masalah.length) return { ok: false, pesan: `Masih ada ${masalah.length} hal yang perlu dilengkapi sebelum ditinjau.` };
  const { versi } = await koleksi();
  await versi.updateOne({ _id: v._id }, { $set: { status: 'siap_ditinjau', ditandai_siap_oleh: admin.email, ditandai_siap_pada: new Date() } });
  await catatAudit({ admin: admin.email, aksi: 'tandai_siap_ditinjau', objek: v.label });
  return { ok: true };
}

export async function terbitkan(admin: AdminAktif, versionId: ObjectId, alasan: string): Promise<Hasil> {
  if (admin.peran !== 'super_admin') return gagal('Hanya super admin yang dapat menerbitkan konten.');
  const { versi } = await koleksi();
  const v = await versi.findOne({ _id: versionId });
  if (!v || v.status !== 'siap_ditinjau') return gagal('Hanya versi berstatus "siap ditinjau" yang dapat diterbitkan.');
  if ((await validasiVersi(v._id)).length) return gagal('Versi tidak lolos validasi. Kembalikan ke draf dan lengkapi.');
  const atur = await ambilPengaturan();
  const lama = atur.versi_aktif_id ? await versi.findOne({ _id: atur.versi_aktif_id }) : null;
  if (lama?.status === 'dikunci' && v.jenis !== 'perbaikan' && alasan.trim().length < 5) {
    return gagal('Versi aktif sedang dikunci untuk penelitian. Tulis alasan bila tetap ingin mengganti (tercatat sebagai penyimpangan protokol).');
  }
  const klien = await ambilKlien();
  const sesi = klien.startSession();
  try {
    await sesi.withTransaction(async () => {
      if (lama && lama.status === 'terbit') await versi.updateOne({ _id: lama._id }, { $set: { status: 'arsip' } }, { session: sesi });
      await versi.updateOne({ _id: v._id }, { $set: { status: 'terbit', diterbitkan_oleh: admin.email, diterbitkan_pada: new Date() } }, { session: sesi });
    });
  } finally {
    await sesi.endSession();
  }
  await simpanPengaturan({ versi_aktif_id: v._id }, admin.email);
  await catatAudit({ admin: admin.email, aksi: 'terbitkan_versi', objek: v.label, alasan: alasan.trim() || undefined, keterangan: lama ? `Menggantikan ${lama.label}` : undefined });
  return { ok: true };
}

export async function kunciVersi(admin: AdminAktif, versionId: ObjectId, label: string): Promise<Hasil> {
  if (admin.peran !== 'super_admin') return gagal('Hanya super admin yang dapat mengunci versi.');
  const bersih = label.trim();
  if (!/^v\d+(\.\d+){1,2}$/.test(bersih)) return gagal('Label versi berformat v1.0 atau v1.0.1.');
  const { versi } = await koleksi();
  const atur = await ambilPengaturan();
  const v = await versi.findOne({ _id: versionId });
  if (!v || v.status !== 'terbit' || !atur.versi_aktif_id?.equals(v._id)) return gagal('Hanya versi aktif berstatus terbit yang dapat dikunci.');
  if (v.contoh) return gagal('Konten contoh tidak dapat dikunci untuk penelitian. Hapus konten contoh, lalu terbitkan dan kunci konten yang sudah divalidasi.');
  if (await versi.findOne({ label: bersih })) return gagal(`Label ${bersih} sudah dipakai.`);
  await versi.updateOne({ _id: v._id }, { $set: { status: 'dikunci', label: bersih, dikunci_oleh: admin.email, dikunci_pada: new Date() } });
  await catatAudit({ admin: admin.email, aksi: 'kunci_versi', objek: bersih, alasan: v.alasan });
  return { ok: true };
}

export async function kembalikanKeDraf(admin: AdminAktif): Promise<Hasil> {
  const v = await versiKerja();
  if (!v || v.status !== 'siap_ditinjau') return gagal('Tidak ada versi yang menunggu tinjauan.');
  const { versi } = await koleksi();
  await versi.updateOne({ _id: v._id }, { $set: { status: 'draf' } });
  await catatAudit({ admin: admin.email, aksi: 'kembalikan_ke_draf', objek: v.label });
  return { ok: true };
}

// Menghapus seluruh konten contoh (modul dan materi) sekaligus, termasuk bila sedang terbit.
// Data progres responden uji coba tidak dihapus; tandai akun uji coba sebagai "bukan sampel".
export async function hapusKontenContoh(admin: AdminAktif, versionId: ObjectId, alasan: string): Promise<Hasil<{ wasAktif: boolean }>> {
  if (admin.peran !== 'super_admin') return gagal('Hanya super admin yang dapat menghapus konten contoh.');
  if (alasan.trim().length < 5) return gagal('Tulis alasan (minimal 5 karakter).');
  const k = await koleksi();
  const v = await k.versi.findOne({ _id: versionId });
  if (!v?.contoh) return gagal('Versi ini bukan konten contoh.');
  const atur = await ambilPengaturan();
  const wasAktif = !!atur.versi_aktif_id?.equals(v._id);
  await Promise.all([
    k.modul.deleteMany({ version_id: v._id }),
    k.materi.deleteMany({ version_id: v._id }),
  ]);
  await k.versi.deleteOne({ _id: v._id, contoh: true });
  if (wasAktif) await simpanPengaturan({ versi_aktif_id: null }, admin.email);
  await catatAudit({ admin: admin.email, aksi: 'hapus_konten_contoh', objek: v.label, alasan: alasan.trim(), keterangan: wasAktif ? 'Konten contoh yang sedang terbit dihapus' : undefined });
  return { ok: true, wasAktif };
}

export async function hapusVersiKerja(admin: AdminAktif): Promise<Hasil> {
  const v = await versiKerja();
  if (!v) return gagal('Tidak ada versi kerja.');
  if (v.jenis === 'perbaikan' && admin.peran !== 'super_admin') return gagal('Versi perbaikan hanya untuk super admin.');
  const k = await koleksi();
  await Promise.all([
    k.modul.deleteMany({ version_id: v._id }),
    k.materi.deleteMany({ version_id: v._id }),
  ]);
  await k.versi.deleteOne({ _id: v._id, status: { $in: ['draf', 'siap_ditinjau'] } });
  await catatAudit({ admin: admin.email, aksi: 'buang_versi_kerja', objek: v.label });
  return { ok: true };
}

// Data untuk formulir.
export async function ambilModulKerja(kunci: string): Promise<DokModul | null> {
  const v = await versiKerja();
  if (!v) return null;
  const { modul } = await koleksi();
  return modul.findOne({ version_id: v._id, kunci });
}

export async function ambilMateriKerja(kunci: string): Promise<{ materi: DokMateri } | null> {
  const v = await versiKerja();
  if (!v) return null;
  const k = await koleksi();
  const materi = await k.materi.findOne({ version_id: v._id, kunci });
  return materi ? { materi } : null;
}
