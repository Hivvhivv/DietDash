'use server';

// Server Actions panel konten (PRD 10). Setiap aksi memeriksa sesi admin di server.
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { wajibAdmin } from '@/lib/admin-auth';
import { keObjectId, type GambarModul } from '@/lib/db';
import * as K from '@/lib/konten-admin';
import { NAMA_ILUSTRASI, skemaMateri, skemaModul, type NamaIlustrasi } from '@/lib/skema';

export interface StatusKonten {
  pesan?: string;
  sukses?: string;
  galat?: Record<string, string>;
  nilai?: Record<string, unknown>;
  percobaan?: number;
}

const teks = (fd: FormData, k: string) => String(fd.get(k) ?? '');
const baris = (s: string) =>
  s
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

function galatZod(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const g: Record<string, string> = {};
  for (const i of issues) g[String(i.path[0] ?? 'umum')] ??= i.message;
  return g;
}

// Halaman publik memakai konten versi aktif; perbarui setelah penerbitan.
const segarkanPublik = () => revalidatePath('/', 'layout');

// ---------- Versi ----------

export async function aksiBuatVersiKerja(): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  const h = await K.buatVersiKerja(admin);
  if (!h.ok) return { pesan: h.pesan };
  redirect('/admin/konten/?pesan=versi-dibuat');
}

export async function aksiBuatPerbaikan(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin('super_admin');
  const h = await K.buatVersiPerbaikan(admin, teks(fd, 'alasan'));
  if (!h.ok) return { pesan: h.pesan };
  redirect('/admin/konten/?pesan=perbaikan-dibuat');
}

export async function aksiTandaiSiap(): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  const h = await K.tandaiSiapDitinjau(admin);
  if (!h.ok) return { pesan: h.pesan };
  return { sukses: 'Versi ditandai siap ditinjau. Super admin dapat menerbitkannya setelah validasi ahli.' };
}

export async function aksiKembaliDraf(): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  const h = await K.kembalikanKeDraf(admin);
  if (!h.ok) return { pesan: h.pesan };
  return { sukses: 'Versi dikembalikan ke draf.' };
}

export async function aksiBuangVersiKerja(): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  const h = await K.hapusVersiKerja(admin);
  if (!h.ok) return { pesan: h.pesan };
  redirect('/admin/konten/?pesan=versi-dibuang');
}

export async function aksiTerbitkan(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin('super_admin');
  const id = keObjectId(teks(fd, 'id'));
  if (!id) return { pesan: 'Versi tidak valid.' };
  const h = await K.terbitkan(admin, id, teks(fd, 'alasan'));
  if (!h.ok) return { pesan: h.pesan };
  segarkanPublik();
  return { sukses: 'Versi diterbitkan dan sekarang terlihat oleh responden.' };
}

export async function aksiHapusKontenContoh(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin('super_admin');
  const id = keObjectId(teks(fd, 'id'));
  if (!id) return { pesan: 'Versi tidak valid.' };
  const h = await K.hapusKontenContoh(admin, id, teks(fd, 'alasan'));
  if (!h.ok) return { pesan: h.pesan };
  segarkanPublik();
  return {
    sukses: h.wasAktif
      ? 'Konten contoh dihapus. Responden belum melihat materi sampai konten baru diterbitkan. Mulai versi konten baru di Kelola Modul.'
      : 'Konten contoh dihapus.',
  };
}

export async function aksiKunciVersi(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin('super_admin');
  const id = keObjectId(teks(fd, 'id'));
  if (!id) return { pesan: 'Versi tidak valid.' };
  const h = await K.kunciVersi(admin, id, teks(fd, 'label'));
  if (!h.ok) return { pesan: h.pesan };
  segarkanPublik();
  return { sukses: 'Versi dikunci untuk penelitian. Konten ini tidak dapat diedit lagi.' };
}

// ---------- Modul ----------

export async function aksiSimpanModul(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  const nilai = {
    judul: teks(fd, 'judul'),
    deskripsi: teks(fd, 'deskripsi'),
    tujuan: teks(fd, 'tujuan'),
    jenis_gambar: teks(fd, 'jenis_gambar'),
    ilustrasi: teks(fd, 'ilustrasi'),
    gambar_id: teks(fd, 'gambar_id'),
    gambar_alt: teks(fd, 'gambar_alt'),
  };
  const v = skemaModul.safeParse({ judul: nilai.judul, deskripsi: nilai.deskripsi, tujuan: baris(nilai.tujuan) });
  const galat = v.success ? {} : galatZod(v.error.issues);
  if (!nilai.gambar_alt.trim()) galat.gambar_alt = 'Teks alternatif ilustrasi wajib diisi.';
  let gambar: GambarModul;
  if (nilai.jenis_gambar === 'unggah') {
    if (!/^[a-f0-9]{24}$/.test(nilai.gambar_id)) galat.gambar_id = 'Unggah gambar sampul terlebih dahulu.';
    gambar = { jenis: 'unggah', id: nilai.gambar_id, alt: nilai.gambar_alt.trim() };
  } else {
    const nama = (NAMA_ILUSTRASI as readonly string[]).includes(nilai.ilustrasi) ? (nilai.ilustrasi as NamaIlustrasi) : 'piring';
    gambar = { jenis: 'bawaan', nama, alt: nilai.gambar_alt.trim() };
  }
  if (!v.success || Object.keys(galat).length) {
    return { pesan: 'Ada isian yang perlu diperbaiki.', galat, nilai, percobaan: Date.now() };
  }
  const kunci = teks(fd, 'kunci') || null;
  const h = await K.simpanModul(admin, kunci, { ...v.data, gambar });
  if (!h.ok) return { pesan: h.pesan, nilai, percobaan: Date.now() };
  redirect(`/admin/konten/modul/${h.kunci}/?pesan=tersimpan`);
}

export async function aksiGeserModul(fd: FormData): Promise<void> {
  const admin = await wajibAdmin();
  await K.geserModul(admin, teks(fd, 'kunci'), teks(fd, 'arah') === 'naik' ? -1 : 1);
  redirect('/admin/konten/');
}

export async function aksiHapusModul(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  const h = await K.hapusAtauArsipModul(admin, teks(fd, 'kunci'));
  if (!h.ok) return { pesan: h.pesan };
  redirect(`/admin/konten/?pesan=${h.diarsipkan ? 'modul-diarsipkan' : 'modul-dihapus'}`);
}

export async function aksiPulihkanModul(fd: FormData): Promise<void> {
  const admin = await wajibAdmin();
  await K.pulihkanModul(admin, teks(fd, 'kunci'));
  redirect('/admin/konten/');
}

// ---------- Materi ----------

export async function aksiSimpanMateri(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  const nilai = {
    judul: teks(fd, 'judul'),
    tujuan: teks(fd, 'tujuan'),
    isi: teks(fd, 'isi'),
    poin_penting: teks(fd, 'poin_penting'),
    rangkuman: teks(fd, 'rangkuman'),
    estimasi_menit: teks(fd, 'estimasi_menit'),
    sumber: teks(fd, 'sumber'),
    gambar_id: teks(fd, 'gambar_id'),
    gambar_alt: teks(fd, 'gambar_alt'),
  };
  const estimasi = nilai.estimasi_menit.trim() ? Number(nilai.estimasi_menit) : null;
  const v = skemaMateri.safeParse({
    judul: nilai.judul,
    tujuan: baris(nilai.tujuan),
    isi: nilai.isi,
    poin_penting: baris(nilai.poin_penting),
    rangkuman: nilai.rangkuman,
    estimasi_menit: estimasi === null || Number.isNaN(estimasi) ? null : Math.round(estimasi),
    sumber: baris(nilai.sumber),
  });
  const galat = v.success ? {} : galatZod(v.error.issues);
  if (/!\[\s*\]\(/.test(nilai.isi)) galat.isi = 'Ada gambar tanpa teks alternatif. Tulis keterangan di dalam ![…].';
  let gambar: K.MasukanMateri['gambar'] = null;
  if (nilai.gambar_id) {
    if (!/^[a-f0-9]{24}$/.test(nilai.gambar_id)) galat.gambar_id = 'Gambar tidak valid. Unggah ulang.';
    if (!nilai.gambar_alt.trim()) galat.gambar_alt = 'Teks alternatif gambar sampul wajib diisi.';
    gambar = { id: nilai.gambar_id, alt: nilai.gambar_alt.trim() };
  }
  if (!v.success || Object.keys(galat).length) return { pesan: 'Ada isian yang perlu diperbaiki.', galat, nilai, percobaan: Date.now() };
  const kunci = teks(fd, 'kunci') || null;
  const h = await K.simpanMateri(admin, kunci, teks(fd, 'modul_kunci'), { ...v.data, gambar });
  if (!h.ok) return { pesan: h.pesan, nilai, percobaan: Date.now() };
  redirect(`/admin/konten/materi/${h.kunci}/?pesan=tersimpan`);
}

export async function aksiGeserMateri(fd: FormData): Promise<void> {
  const admin = await wajibAdmin();
  await K.geserMateri(admin, teks(fd, 'kunci'), teks(fd, 'arah') === 'naik' ? -1 : 1);
  redirect(`/admin/konten/modul/${encodeURIComponent(teks(fd, 'modul'))}/`);
}

export async function aksiHapusMateri(_: StatusKonten | undefined, fd: FormData): Promise<StatusKonten> {
  const admin = await wajibAdmin();
  const h = await K.hapusAtauArsipMateri(admin, teks(fd, 'kunci'));
  if (!h.ok) return { pesan: h.pesan };
  redirect(`/admin/konten/modul/${h.modul_kunci}/?pesan=${h.diarsipkan ? 'materi-diarsipkan' : 'materi-dihapus'}`);
}
