// Data halaman responden: progres per modul dan aktivitas belajar sendiri.
// Hanya data milik responden yang sedang masuk. Progres = keterlaksanaan belajar, bukan hasil kesehatan.
import type { ObjectId } from 'mongodb';
import { koleksi } from './db';
import type { MateriTerurut, ModulTerurut, StrukturVersi } from './konten';
import type { RingkasanBelajar } from './progres';

export type StatusModul = 'selesai' | 'berjalan' | 'belum' | 'terkunci';

export interface ProgresModul {
  modul: ModulTerurut;
  selesai: number;
  total: number;
  persen: number;
  status: StatusModul;
  lanjut: MateriTerurut | null; // materi pertama yang sudah terbuka tetapi belum dibaca
}

export function progresPerModul(struktur: StrukturVersi, r: RingkasanBelajar): ProgresModul[] {
  return struktur.modul.map((md) => {
    const isi = r.daftar.filter((d) => d.materi.modul.kunci === md.kunci);
    const selesai = isi.filter((d) => d.status === 'selesai').length;
    const total = isi.length;
    const status: StatusModul =
      total > 0 && selesai === total ? 'selesai' : selesai > 0 ? 'berjalan' : isi.some((d) => d.status === 'tersedia') ? 'belum' : 'terkunci';
    return {
      modul: md,
      selesai,
      total,
      persen: total ? Math.round((selesai / total) * 100) : 0,
      status,
      lanjut: isi.find((d) => d.status === 'tersedia')?.materi ?? null,
    };
  });
}

// ---------- Aktivitas belajar sendiri ----------

export interface AktivitasBelajar {
  teks: string;
  waktu: Date;
}

export async function aktivitasBelajar(respondentId: ObjectId, struktur: StrukturVersi, jumlah = 5): Promise<AktivitasBelajar[]> {
  const { progres } = await koleksi();
  const pr = await progres.find({ respondent_id: respondentId, dibuka_pada: { $ne: null } }).sort({ dibuka_pada: -1 }).limit(jumlah).toArray();
  const nama = new Map(struktur.materi.map((m) => [m.kunci, `Materi ${m.nomor} “${m.judul}”`]));
  return pr.flatMap((p) => {
    const n = nama.get(p.materi_kunci);
    return n && p.dibuka_pada ? [{ teks: `Membaca ${n}`, waktu: p.dibuka_pada }] : [];
  });
}
