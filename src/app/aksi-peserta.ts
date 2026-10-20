'use server';

// Server Actions untuk peserta. Next.js menolak Server Action dari origin lain (perlindungan CSRF bawaan).
import { redirect } from 'next/navigation';
import {
  daftar,
  hapusAkunSendiri,
  keluarPeserta,
  masukPeserta,
  normalkanEmail,
  pakaiTokenReset,
  periksaEmail,
  periksaSandi,
  pesertaSaatIni,
  ubahSandi,
} from '@/lib/peserta';
import { ambilProgres, catatMateri, simpanLatihan, sinkronkan, type DataProgres } from '@/lib/progres';

export interface StatusFormPeserta {
  pesan?: string;
  kolom?: string;
  nilai?: Record<string, string>;
  sukses?: string;
}

const teks = (fd: FormData, k: string) => String(fd.get(k) ?? '');

// Hanya izinkan kembali ke alamat di situs ini (cegah open redirect).
function tujuanAman(lanjut: string): string {
  return /^\/(?!\/)[\w\-/]*$/.test(lanjut) ? lanjut : '/akun/';
}

export async function aksiDaftar(_: StatusFormPeserta | undefined, fd: FormData): Promise<StatusFormPeserta> {
  const email = teks(fd, 'email');
  const sandi = teks(fd, 'sandi');
  const nilai = { email };
  // Periksa isian berurutan dari atas ke bawah formulir.
  const galatEmail = periksaEmail(normalkanEmail(email));
  if (galatEmail) return { pesan: galatEmail, kolom: 'email', nilai };
  const galatSandi = periksaSandi(sandi, normalkanEmail(email));
  if (galatSandi) return { pesan: galatSandi, kolom: 'sandi', nilai };
  if (sandi !== teks(fd, 'ulang')) {
    return { pesan: 'Ulangi kata sandi belum sama. Ketik ulang kedua kolom kata sandi.', kolom: 'ulang', nilai };
  }
  if (fd.get('setuju') !== 'ya') {
    return {
      pesan: 'Centang persetujuan Kebijakan Privasi untuk membuat akun. Anda tetap bisa membaca materi tanpa akun.',
      kolom: 'setuju',
      nilai,
    };
  }
  const hasil = await daftar(email, sandi);
  if (!hasil.ok) return { pesan: hasil.pesan, kolom: hasil.kolom, nilai };
  redirect('/akun/?baru=1');
}

export async function aksiMasukPeserta(_: StatusFormPeserta | undefined, fd: FormData): Promise<StatusFormPeserta> {
  const email = teks(fd, 'email');
  const sandi = teks(fd, 'sandi');
  if (!email.trim() || !sandi) return { pesan: 'Isi email dan kata sandi.', nilai: { email } };
  const hasil = await masukPeserta(email, sandi);
  if (!hasil.ok) return { pesan: hasil.pesan, nilai: { email } };
  redirect(tujuanAman(teks(fd, 'lanjut')));
}

export async function aksiKeluarPeserta(): Promise<void> {
  await keluarPeserta();
  redirect('/?keluar=1');
}

export async function aksiUbahSandi(_: StatusFormPeserta | undefined, fd: FormData): Promise<StatusFormPeserta> {
  const p = await pesertaSaatIni();
  if (!p) redirect('/masuk/?lanjut=/akun/');
  if (teks(fd, 'baru') !== teks(fd, 'ulang')) {
    return { pesan: 'Ulangi kata sandi baru belum sama.', kolom: 'ulang' };
  }
  const hasil = await ubahSandi(p, teks(fd, 'lama'), teks(fd, 'baru'));
  if (!hasil.ok) return { pesan: hasil.pesan, kolom: hasil.kolom };
  return { sukses: 'Kata sandi berhasil diubah.' };
}

export async function aksiHapusAkun(_: StatusFormPeserta | undefined, fd: FormData): Promise<StatusFormPeserta> {
  const p = await pesertaSaatIni();
  if (!p) redirect('/masuk/');
  const hasil = await hapusAkunSendiri(p, teks(fd, 'sandi'));
  if (!hasil.ok) return { pesan: hasil.pesan, kolom: hasil.kolom };
  redirect('/?akun-dihapus=1');
}

export async function aksiResetSandi(_: StatusFormPeserta | undefined, fd: FormData): Promise<StatusFormPeserta> {
  if (teks(fd, 'baru') !== teks(fd, 'ulang')) {
    return { pesan: 'Ulangi kata sandi baru belum sama.', kolom: 'ulang' };
  }
  const hasil = await pakaiTokenReset(teks(fd, 'token'), teks(fd, 'baru'));
  if (!hasil.ok) return { pesan: hasil.pesan, kolom: hasil.kolom };
  redirect('/akun/?sandi-baru=1');
}

// ---------- Dipanggil dari komponen klien ----------

export async function aksiStatusPeserta(): Promise<{ masuk: boolean }> {
  return { masuk: !!(await pesertaSaatIni()) };
}

export async function aksiCatatMateri(modulId: string, nomor: number): Promise<{ masuk: boolean }> {
  const p = await pesertaSaatIni();
  if (!p) return { masuk: false };
  await catatMateri(p, String(modulId), Number(nomor));
  return { masuk: true };
}

export async function aksiSimpanLatihan(modulId: string, benar: number, total: number): Promise<{ masuk: boolean }> {
  const p = await pesertaSaatIni();
  if (!p) return { masuk: false };
  await simpanLatihan(p, String(modulId), Number(benar), Number(total));
  return { masuk: true };
}

export async function aksiProgresSaya(): Promise<{ masuk: boolean; data?: DataProgres }> {
  const p = await pesertaSaatIni();
  if (!p) return { masuk: false };
  return { masuk: true, data: await ambilProgres(p.id) };
}

export async function aksiSinkronProgres(lokal: DataProgres): Promise<{ masuk: boolean }> {
  const p = await pesertaSaatIni();
  if (!p) return { masuk: false };
  if (lokal && typeof lokal === 'object' && lokal.materi && typeof lokal.materi === 'object') {
    await sinkronkan(p, lokal);
  }
  return { masuk: true };
}
