'use server';

// Server Actions responden. Next.js menolak Server Action dari origin lain (perlindungan CSRF bawaan).
import { redirect } from 'next/navigation';
import { formatToken } from '@/lib/identitas';
import { strukturAktif } from '@/lib/konten';
import { tandaiDibuka } from '@/lib/progres';
import {
  buatUlangTokenBelumDisimpan,
  daftar,
  gantiNama,
  gantiNomor,
  gantiToken,
  keluar,
  konfirmasiTokenDisimpan,
  masuk,
  mengundurkanDiri,
  PESAN,
  respondenSaatIni,
  wajibResponden,
} from '@/lib/responden';

export interface StatusForm {
  pesan?: string;
  kolom?: string;
  sukses?: string;
  nilai?: Record<string, string>;
  token?: string; // kode akses baru, ditampilkan sekali
  nama?: string;
}

const teks = (fd: FormData, k: string) => String(fd.get(k) ?? '');

export async function aksiDaftar(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const nilai = { nama: teks(fd, 'nama'), nomor: teks(fd, 'nomor') };
  const h = await daftar({
    nama: nilai.nama,
    nomor: nilai.nomor,
    setuju: fd.get('setuju') === 'ya',
    layak: fd.get('layak') === 'ya',
  });
  if (!h.ok) return { pesan: h.pesan, kolom: h.kolom, nilai };
  return { token: formatToken(h.token), nama: nilai.nama.trim() };
}

export async function aksiMasuk(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const nilai = { nomor: teks(fd, 'nomor') };
  const h = await masuk(nilai.nomor, teks(fd, 'token'), fd.get('ingat') === 'ya');
  if (!h.ok) return { pesan: h.pesan, nilai };
  redirect('/belajar/');
}

export async function aksiKeluar(): Promise<void> {
  await keluar();
  redirect('/masuk/?keluar=1');
}

export async function aksiKonfirmasiToken(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const a = await wajibResponden({ izinkanBelumSimpan: true });
  if (fd.get('sudah_simpan') !== 'ya') return { pesan: PESAN.belumSimpan, kolom: 'sudah_simpan' };
  await konfirmasiTokenDisimpan(a);
  redirect(teks(fd, 'tujuan') === 'profil' ? '/profil/?pesan=token-baru' : '/selamat-datang/');
}

export async function aksiBuatUlangToken(): Promise<StatusForm> {
  const a = await wajibResponden({ izinkanBelumSimpan: true });
  const h = await buatUlangTokenBelumDisimpan(a);
  if (!h.ok) return { pesan: h.pesan };
  return { token: formatToken(h.token), nama: a.r.nama };
}

export async function aksiGantiToken(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const a = await wajibResponden();
  const h = await gantiToken(a, teks(fd, 'token_lama'));
  if (!h.ok) return { pesan: h.pesan, kolom: h.kolom };
  return { token: formatToken(h.token), nama: a.r.nama };
}

export async function aksiGantiNomor(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const a = await wajibResponden();
  const h = await gantiNomor(a, teks(fd, 'token'), teks(fd, 'nomor'));
  if (!h.ok) return { pesan: h.pesan, kolom: h.kolom, nilai: { nomor: teks(fd, 'nomor') } };
  return { sukses: 'Nomor HP berhasil diganti. Gunakan nomor baru saat masuk.' };
}

export async function aksiGantiNama(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const a = await wajibResponden();
  const h = await gantiNama(a, teks(fd, 'nama'));
  if (!h.ok) return { pesan: h.pesan, kolom: h.kolom };
  return { sukses: 'Nama tersimpan.' };
}

export async function aksiMundur(_: StatusForm | undefined, fd: FormData): Promise<StatusForm> {
  const a = await wajibResponden();
  if (fd.get('yakin') !== 'ya') return { pesan: 'Centang pernyataan bahwa Anda ingin mengundurkan diri.', kolom: 'yakin' };
  await mengundurkanDiri(a, teks(fd, 'alasan'));
  redirect('/masuk/?mundur=1');
}

// Untuk menu di header (halaman publik tetap statis; status dibaca dari peramban).
export async function aksiStatusResponden(): Promise<{ masuk: boolean }> {
  return { masuk: !!(await respondenSaatIni()) };
}

// ---------- Belajar ----------

// Membuka materi = materi selesai (tanpa kuis). `baru` memberi tahu halaman agar memuat ulang daftar & navigasi.
export async function aksiBukaMateri(materiKunci: string): Promise<{ ok: boolean; baru: boolean }> {
  const a = await respondenSaatIni();
  const s = await strukturAktif();
  if (!a || !a.r.token_disimpan_pada || !s) return { ok: false, baru: false };
  return tandaiDibuka(a, s, String(materiKunci));
}
