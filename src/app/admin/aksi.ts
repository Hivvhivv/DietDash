'use server';

// Server Actions admin. Setiap aksi memeriksa sesi lewat wajibAdmin() sebelum berbuat apa pun.
// Next.js juga menolak Server Action dari origin lain (perlindungan CSRF bawaan).
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { keluar, masuk, wajibAdmin } from '@/lib/auth';
import { catatAudit, keObjectId, koleksi } from '@/lib/db';
import { buatTokenReset, hapusPeserta } from '@/lib/peserta';
import { hapusSemuaPeserta } from '@/lib/peserta-admin';
import {
  buatDrafDari,
  buatModulBaru,
  hapusDraf,
  setujuiDraf,
  simpanDraf,
  type MasukanDraf,
} from '@/lib/konten-admin';
import { periksaBlokKhusus } from '@/lib/blok-khusus';
import { hitungJudulMateri } from '@/lib/materi';
import { POLA_ID_MODUL, skemaDataModul, skemaVersi } from '@/lib/skema';

export interface StatusForm {
  pesan?: string;
  galat?: Record<string, string>;
  nilai?: Record<string, string | string[]>;
  percobaan?: number;
}

const teks = (fd: FormData, k: string) => String(fd.get(k) ?? '');
const baris = (s: string) =>
  s
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

// ---------- Masuk & keluar ----------

export async function aksiMasuk(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const username = teks(fd, 'username');
  const password = teks(fd, 'password');
  if (!username.trim() || !password) {
    return { pesan: 'Isi nama pengguna dan kata sandi.', nilai: { username } };
  }
  const hasil = await masuk(username, password);
  if (!hasil.ok) return { pesan: hasil.pesan, nilai: { username } };
  redirect('/admin/');
}

export async function aksiKeluar(): Promise<void> {
  await keluar();
  redirect('/admin/masuk/');
}

// ---------- Formulir modul ----------

function bacaFormModul(fd: FormData): {
  masukan?: MasukanDraf;
  status?: StatusForm;
  nilai: Record<string, string | string[]>;
} {
  const nilai: Record<string, string | string[]> = {
    versi: teks(fd, 'versi'),
    urutan: teks(fd, 'urutan'),
    judul: teks(fd, 'judul'),
    deskripsi_kartu: teks(fd, 'deskripsi_kartu'),
    ilustrasi: teks(fd, 'ilustrasi'),
    ilustrasi_alt: teks(fd, 'ilustrasi_alt'),
    tujuan: teks(fd, 'tujuan'),
    poin_penting: teks(fd, 'poin_penting'),
    rangkuman: teks(fd, 'rangkuman'),
    sumber: fd.getAll('sumber').map(String),
    isi: teks(fd, 'isi'),
    catatan: teks(fd, 'catatan'),
    modul_id: teks(fd, 'modul_id'),
  };

  const galat: Record<string, string> = {};
  const versi = skemaVersi.safeParse(nilai.versi);
  if (!versi.success) galat.versi = versi.error.issues[0].message;

  const data = skemaDataModul.safeParse({
    urutan: Number(nilai.urutan),
    judul: nilai.judul,
    deskripsi_kartu: nilai.deskripsi_kartu,
    ilustrasi: nilai.ilustrasi,
    ilustrasi_alt: nilai.ilustrasi_alt,
    tujuan: baris(nilai.tujuan as string),
    poin_penting: baris(nilai.poin_penting as string),
    rangkuman: nilai.rangkuman,
    sumber: nilai.sumber,
  });
  if (!data.success) {
    for (const masalah of data.error.issues) {
      const kunci = String(masalah.path[0]);
      galat[kunci] ??= kunci === 'urutan' ? 'Urutan harus angka 1–20.' : masalah.message;
    }
  }

  const isi = (nilai.isi as string).trim();
  if (isi.length < 50) galat.isi = 'Isi materi terlalu pendek (minimal 50 karakter).';
  else if (hitungJudulMateri(isi) < 2) {
    galat.isi = 'Tulis minimal 2 materi. Awali setiap materi dengan baris "## Judul Materi".';
  } else {
    const galatBlok = periksaBlokKhusus(isi);
    if (galatBlok) galat.isi = galatBlok;
  }
  const catatan = (nilai.catatan as string).trim();
  if (catatan.length < 5) galat.catatan = 'Tulis catatan perubahan singkat (minimal 5 karakter).';

  if (Object.keys(galat).length || !versi.success || !data.success) {
    return {
      nilai,
      status: {
        pesan: 'Ada isian yang perlu diperbaiki. Lihat pesan di bawah setiap kolom.',
        galat,
        nilai,
        percobaan: Date.now(),
      },
    };
  }
  return { nilai, masukan: { versi: versi.data, data: data.data, isi, catatan } };
}

export async function aksiSimpanDraf(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const admin = await wajibAdmin();
  const id = keObjectId(teks(fd, 'versi_id'));
  if (!id) return { pesan: 'ID draf tidak valid.' };

  const { masukan, status, nilai } = bacaFormModul(fd);
  if (!masukan) return status!;
  const hasil = await simpanDraf(id, masukan, admin);
  if (!hasil.ok) return { pesan: hasil.pesan, nilai, percobaan: Date.now() };
  redirect(`/admin/versi/${id.toHexString()}/?pesan=tersimpan`);
}

export async function aksiBuatModul(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const admin = await wajibAdmin();
  const { masukan, status, nilai } = bacaFormModul(fd);
  const modulId = teks(fd, 'modul_id').trim();
  const galatId = !POLA_ID_MODUL.test(modulId)
    ? 'ID modul hanya huruf kecil, angka, dan tanda hubung, misalnya "minuman-sehat".'
    : modulId === 'baru'
      ? 'ID "baru" dipakai sistem. Pilih ID lain.'
      : undefined;

  if (!masukan || galatId) {
    return {
      pesan: 'Ada isian yang perlu diperbaiki. Lihat pesan di bawah setiap kolom.',
      nilai,
      galat: { ...status?.galat, ...(galatId ? { modul_id: galatId } : {}) },
      percobaan: Date.now(),
    };
  }
  const hasil = await buatModulBaru(modulId, masukan, admin);
  if (!hasil.ok) return { pesan: hasil.pesan, nilai, percobaan: Date.now() };
  redirect(`/admin/versi/${hasil.versiId}/?pesan=dibuat`);
}

// ---------- Aksi versi ----------

export async function aksiBuatDraf(fd: FormData): Promise<void> {
  const admin = await wajibAdmin();
  const id = keObjectId(teks(fd, 'versi_id'));
  if (!id) redirect('/admin/');
  const hasil = await buatDrafDari(id, admin);
  if (!hasil.ok) redirect('/admin/');
  redirect(`/admin/versi/${hasil.versiId}/ubah/`);
}

export async function aksiSetujui(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const admin = await wajibAdmin();
  const id = keObjectId(teks(fd, 'versi_id'));
  if (!id) return { pesan: 'ID versi tidak valid.' };
  const hasil = await setujuiDraf(id, admin);
  if (!hasil.ok) return { pesan: hasil.pesan };
  // Perbarui seluruh halaman publik agar memakai versi yang baru disetujui.
  revalidatePath('/', 'layout');
  redirect(`/admin/versi/${id.toHexString()}/?pesan=disetujui`);
}

// ---------- Data peserta (khusus peran peneliti) ----------

export async function aksiBuatTautanReset(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const admin = await wajibAdmin('peneliti');
  const id = keObjectId(teks(fd, 'peserta_id'));
  if (!id) return { pesan: 'ID peserta tidak valid.' };
  const akun = await (await koleksi()).peserta.findOne({ _id: id });
  if (!akun) return { pesan: 'Peserta tidak ditemukan.' };
  const token = await buatTokenReset(id, admin.username);
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  await catatAudit({ admin: admin.username, aksi: 'buat_tautan_reset', keterangan: `Untuk ${akun.email}` });
  return { pesan: `${proto}://${host}/reset-sandi/${token}/` };
}

export async function aksiHapusPeserta(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const admin = await wajibAdmin('peneliti');
  const id = keObjectId(teks(fd, 'peserta_id'));
  if (!id) return { pesan: 'ID peserta tidak valid.' };
  const akun = await (await koleksi()).peserta.findOne({ _id: id });
  if (!akun) return { pesan: 'Peserta tidak ditemukan.' };
  await hapusPeserta(id);
  await catatAudit({ admin: admin.username, aksi: 'hapus_peserta', keterangan: `Akun ${akun.email} dan datanya dihapus` });
  redirect('/admin/peserta/?pesan=dihapus');
}

export async function aksiHapusSemuaPeserta(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const admin = await wajibAdmin('peneliti');
  if (teks(fd, 'konfirmasi').trim() !== 'HAPUS SEMUA') {
    return { pesan: 'Ketik HAPUS SEMUA (huruf kapital) untuk mengonfirmasi.' };
  }
  const n = await hapusSemuaPeserta();
  await catatAudit({ admin: admin.username, aksi: 'hapus_semua_peserta', keterangan: `${n} akun peserta dan datanya dihapus` });
  redirect('/admin/peserta/?pesan=semua-dihapus');
}

export async function aksiHapusDraf(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const admin = await wajibAdmin();
  const id = keObjectId(teks(fd, 'versi_id'));
  const modulId = teks(fd, 'modul_id');
  if (!id) return { pesan: 'ID draf tidak valid.' };
  const hasil = await hapusDraf(id, admin);
  if (!hasil.ok) return { pesan: hasil.pesan };
  redirect(`/admin/modul/${encodeURIComponent(modulId)}/?pesan=dihapus`);
}
