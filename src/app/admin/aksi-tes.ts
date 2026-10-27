'use server';

// Server Actions Pretest & Posttest (admin). Setiap aksi memeriksa sesi admin dan tercatat di log.
import { revalidatePath } from 'next/cache';
import { wajibAdmin } from '@/lib/admin-auth';
import type { JenisTes } from '@/lib/db';
import { bukaPosttest, simpanInstrumen, skemaInstrumen } from '@/lib/tes';

export interface StatusTesAdmin {
  pesan?: string;
  sukses?: string;
}

const teks = (fd: FormData, k: string) => String(fd.get(k) ?? '');
const jenisDari = (fd: FormData): JenisTes => (teks(fd, 'jenis') === 'posttest' ? 'posttest' : 'pretest');

export async function aksiSimpanInstrumen(_: StatusTesAdmin | undefined, fd: FormData): Promise<StatusTesAdmin> {
  const admin = await wajibAdmin();
  let data: unknown;
  try {
    data = JSON.parse(teks(fd, 'data'));
  } catch {
    return { pesan: 'Data formulir tidak terbaca. Muat ulang halaman.' };
  }
  const v = skemaInstrumen.safeParse(data);
  if (!v.success) {
    const i = v.error.issues[0];
    const nomor = i.path[0] === 'soal' && typeof i.path[1] === 'number' ? `Soal nomor ${i.path[1] + 1}: ` : '';
    return { pesan: `${nomor}${i.message}` };
  }
  const jenis = jenisDari(fd);
  const h = await simpanInstrumen(admin, jenis, v.data);
  if (!h.ok) return { pesan: h.pesan };
  revalidatePath('/admin/tes/');
  return { sukses: `${jenis === 'pretest' ? 'Pretest' : 'Posttest'} tersimpan.` };
}

// Buka posttest untuk semua responden penelitian yang belum dibuka.
export async function aksiBukaPosttestSemua(_: StatusTesAdmin | undefined): Promise<StatusTesAdmin> {
  const admin = await wajibAdmin();
  const n = await bukaPosttest(admin, 'semua');
  revalidatePath('/admin/tes/');
  return { sukses: n ? `Posttest dibuka untuk ${n} responden penelitian.` : 'Semua responden penelitian sudah dibuka posttest-nya.' };
}

// Buka / tutup posttest untuk satu responden (halaman detail).
export async function aksiPosttestResponden(_: StatusTesAdmin | undefined, fd: FormData): Promise<StatusTesAdmin> {
  const admin = await wajibAdmin();
  const buka = teks(fd, 'buka') === 'ya';
  await bukaPosttest(admin, { idPeserta: teks(fd, 'id_peserta') }, buka);
  revalidatePath(`/admin/responden/${teks(fd, 'id_peserta')}/`);
  return { sukses: buka ? 'Posttest dibuka untuk responden ini.' : 'Posttest ditutup kembali.' };
}
