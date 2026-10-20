// Lapisan akses konten untuk HALAMAN PUBLIK.
//
// Semua halaman mengambil konten hanya lewat fungsi di file ini. Sumbernya koleksi
// `modul_versi` di MongoDB, dan yang ditampilkan HANYA versi berstatus "disetujui"
// (PRD bagian 13: semua responden menerima konten yang sama dan sudah disetujui peneliti).
import { koleksi, type DokVersiModul } from './db';
import { estimasiMenit } from '@/data/situs';
import { pecahMateri, type Materi } from './materi';
import type { DataModul } from './skema';

export { NAMA_ILUSTRASI, type NamaIlustrasi } from './skema';
export type { Materi } from './materi';

export interface Modul extends DataModul {
  id: string;
  versi: string;
  isi: string; // naskah lengkap dalam Markdown
  pengantar: string; // teks sebelum materi pertama
  materi: Materi[];
  estimasi_menit: number; // seluruh modul
}

// Estimasi modul dihitung dari seluruh teks yang dibaca pengguna.
export function keModul(dok: Pick<DokVersiModul, 'modul_id' | 'versi' | 'data' | 'isi'>): Modul {
  const d = dok.data;
  const teks = [d.judul, ...d.tujuan, dok.isi, ...d.poin_penting, d.rangkuman].join(' ');
  const { pengantar, materi } = pecahMateri(dok.isi, d.judul);
  return {
    ...d,
    id: dok.modul_id,
    versi: dok.versi,
    isi: dok.isi,
    pengantar,
    materi,
    estimasi_menit: estimasiMenit(teks),
  };
}

export async function ambilSemuaModul(): Promise<Modul[]> {
  const { modulVersi } = await koleksi();
  const dok = await modulVersi
    .find({ status: 'disetujui' })
    .sort({ 'data.urutan': 1 })
    .toArray();
  return dok.map(keModul);
}

export async function ambilModul(id: string): Promise<Modul | undefined> {
  const { modulVersi } = await koleksi();
  const dok = await modulVersi.findOne({ modul_id: id, status: 'disetujui' });
  return dok ? keModul(dok) : undefined;
}

export type RingkasanModul = Pick<Modul, 'id' | 'urutan' | 'judul'>;

export function ringkas(m: Modul): RingkasanModul {
  return { id: m.id, urutan: m.urutan, judul: m.judul };
}
