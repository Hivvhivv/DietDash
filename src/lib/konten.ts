// Membaca struktur konten satu versi: Modul → Materi (PRD v2.0 Bagian 5; kuis tidak dipakai sejak 2026-10-22).
// Responden selalu membaca versi aktif (app_settings.versi_aktif_id); admin dapat membaca versi mana pun untuk pratinjau.
import type { ObjectId } from 'mongodb';
import { koleksi, type DokMateri, type DokModul, type DokVersi } from './db';
import { ambilPengaturan } from './pengaturan';
import { estimasiMenit } from '@/data/situs';

export interface MateriTerurut extends DokMateri {
  nomor: string; // "2.1"
  indeks: number; // urutan global, mulai 0
  urutan_dalam_modul: number; // mulai 1
  jumlah_dalam_modul: number;
  modul: Pick<DokModul, 'kunci' | 'judul' | 'urutan' | 'gambar'> & { nomor: number };
  menit: number;
}

export interface ModulTerurut extends DokModul {
  nomor: number;
  materi: MateriTerurut[];
}

export interface StrukturVersi {
  versi: DokVersi;
  modul: ModulTerurut[];
  materi: MateriTerurut[]; // urutan belajar lintas modul
}

export function menitBaca(m: Pick<DokMateri, 'estimasi_menit' | 'judul' | 'tujuan' | 'isi' | 'poin_penting' | 'rangkuman'>): number {
  if (m.estimasi_menit) return m.estimasi_menit;
  return estimasiMenit([m.judul, ...m.tujuan, m.isi, ...m.poin_penting, m.rangkuman].join(' '));
}

export async function ambilStruktur(versionId: ObjectId): Promise<StrukturVersi | null> {
  const k = await koleksi();
  const versi = await k.versi.findOne({ _id: versionId });
  if (!versi) return null;
  const [modul, materi] = await Promise.all([
    k.modul.find({ version_id: versionId, diarsipkan: false }).sort({ urutan: 1 }).toArray(),
    k.materi.find({ version_id: versionId, diarsipkan: false }).sort({ urutan: 1 }).toArray(),
  ]);

  const hasilModul: ModulTerurut[] = [];
  const urut: MateriTerurut[] = [];
  modul.forEach((md, i) => {
    const nomorModul = i + 1;
    const milik = materi.filter((x) => x.modul_kunci === md.kunci);
    const daftar = milik.map((x, j) => {
      const m: MateriTerurut = {
        ...x,
        nomor: `${nomorModul}.${j + 1}`,
        indeks: urut.length + j,
        urutan_dalam_modul: j + 1,
        jumlah_dalam_modul: milik.length,
        modul: { kunci: md.kunci, judul: md.judul, urutan: md.urutan, gambar: md.gambar, nomor: nomorModul },
        menit: menitBaca(x),
      };
      return m;
    });
    urut.push(...daftar);
    hasilModul.push({ ...md, nomor: nomorModul, materi: daftar });
  });
  return { versi, modul: hasilModul, materi: urut };
}

export async function versiAktif(): Promise<DokVersi | null> {
  const atur = await ambilPengaturan();
  if (!atur.versi_aktif_id) return null;
  const { versi } = await koleksi();
  return versi.findOne({ _id: atur.versi_aktif_id });
}

// Teks versi konten untuk kaki halaman (mis. 'Versi konten v1.0 (dikunci untuk penelitian)').
export async function labelVersiAktif(): Promise<string> {
  const v = await versiAktif();
  if (!v) return 'Konten belum diterbitkan';
  return `Versi konten ${v.label}${v.status === 'dikunci' ? ' (dikunci untuk penelitian)' : ''}`;
}

export async function strukturAktif(): Promise<StrukturVersi | null> {
  const v = await versiAktif();
  return v ? ambilStruktur(v._id) : null;
}

// Daftar pustaka gabungan dari seluruh materi versi aktif (untuk halaman Sumber Materi).
export async function daftarPustakaAktif(): Promise<{ sitasi: string; materi: string[] }[]> {
  const s = await strukturAktif();
  if (!s) return [];
  const peta = new Map<string, string[]>();
  for (const m of s.materi) for (const sumber of m.sumber) peta.set(sumber, [...(peta.get(sumber) ?? []), m.nomor]);
  return [...peta.entries()].map(([sitasi, materi]) => ({ sitasi, materi })).sort((a, b) => a.sitasi.localeCompare(b.sitasi));
}
