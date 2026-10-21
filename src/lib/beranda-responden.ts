// Data halaman responden: progres per modul, status setiap kuis, dan aktivitas belajar sendiri.
// Hanya data milik responden yang sedang masuk. Progres = keterlaksanaan belajar, bukan hasil kesehatan.
import type { ObjectId } from 'mongodb';
import { koleksi, type DokPercobaanKuis } from './db';
import type { MateriTerurut, ModulTerurut, StrukturVersi } from './konten';
import type { RingkasanBelajar, StatusMateri } from './progres';

export type StatusModul = 'selesai' | 'berjalan' | 'belum' | 'terkunci';

export interface ProgresModul {
  modul: ModulTerurut;
  selesai: number;
  total: number;
  persen: number;
  status: StatusModul;
  lanjut: MateriTerurut | null; // materi pertama yang belum selesai dan sudah terbuka
}

export function progresPerModul(struktur: StrukturVersi, r: RingkasanBelajar): ProgresModul[] {
  return struktur.modul.map((md) => {
    const isi = r.daftar.filter((d) => d.materi.modul.kunci === md.kunci);
    const selesai = isi.filter((d) => d.status === 'selesai').length;
    const total = isi.length;
    const status: StatusModul =
      total > 0 && selesai === total
        ? 'selesai'
        : isi.some((d) => d.status === 'sedang' || d.status === 'selesai')
          ? 'berjalan'
          : isi.some((d) => d.status === 'tersedia')
            ? 'belum'
            : 'terkunci';
    return {
      modul: md,
      selesai,
      total,
      persen: total ? Math.round((selesai / total) * 100) : 0,
      status,
      lanjut: isi.find((d) => d.status === 'sedang' || d.status === 'tersedia')?.materi ?? null,
    };
  });
}

// ---------- Kuis ----------

export type StatusKuis = 'selesai' | 'berjalan' | 'siap' | 'terkunci';

export interface KuisResponden {
  materi: MateriTerurut;
  statusMateri: StatusMateri;
  status: StatusKuis;
  jumlahSoal: number;
  percobaan: number;
  skorPertama: number | null;
  skorTerbaik: number | null;
}

export async function kuisResponden(respondentId: ObjectId, r: RingkasanBelajar): Promise<KuisResponden[]> {
  const { percobaan } = await koleksi();
  const semua = await percobaan.find({ respondent_id: respondentId }).toArray();
  const perKuis = new Map<string, DokPercobaanKuis[]>();
  for (const p of semua) perKuis.set(p.kuis_kunci, [...(perKuis.get(p.kuis_kunci) ?? []), p]);
  return r.daftar
    .filter((d) => d.materi.kuis)
    .map((d) => {
      const milik = perKuis.get(d.materi.kuis!.kunci) ?? [];
      const selesaiSemua = milik.filter((x) => x.selesai_pada);
      const status: StatusKuis =
        d.status === 'selesai' ? 'selesai' : d.status === 'terkunci' ? 'terkunci' : d.percobaan_aktif ? 'berjalan' : 'siap';
      return {
        materi: d.materi,
        statusMateri: d.status,
        status,
        jumlahSoal: d.materi.kuis!.jumlah_soal,
        percobaan: milik.length,
        skorPertama: milik.find((x) => x.pertama && x.selesai_pada)?.skor ?? null,
        skorTerbaik: selesaiSemua.length ? Math.max(...selesaiSemua.map((x) => x.skor ?? 0)) : null,
      };
    });
}

// ---------- Aktivitas belajar sendiri ----------

export interface AktivitasBelajar {
  teks: string;
  waktu: Date;
  jenis: 'baca' | 'kuis' | 'selesai';
}

export async function aktivitasBelajar(respondentId: ObjectId, struktur: StrukturVersi, jumlah = 5): Promise<AktivitasBelajar[]> {
  const { progres, percobaan } = await koleksi();
  const [pr, pc] = await Promise.all([
    progres.find({ respondent_id: respondentId }).toArray(),
    percobaan.find({ respondent_id: respondentId, selesai_pada: { $ne: null } }).sort({ selesai_pada: -1 }).limit(jumlah).toArray(),
  ]);
  const nama = new Map(struktur.materi.map((m) => [m.kunci, `Materi ${m.nomor} “${m.judul}”`]));
  const daftar: AktivitasBelajar[] = [];
  for (const p of pr) {
    const n = nama.get(p.materi_kunci);
    if (!n) continue;
    if (p.dibuka_pada) daftar.push({ teks: `Mulai membaca ${n}`, waktu: p.dibuka_pada, jenis: 'baca' });
    if (p.selesai_pada) daftar.push({ teks: `${n} selesai`, waktu: p.selesai_pada, jenis: 'selesai' });
  }
  for (const x of pc) {
    const n = nama.get(x.materi_kunci);
    if (!n || !x.selesai_pada) continue;
    daftar.push({ teks: `Mengerjakan kuis ${n.replace(/^Materi /, '')}: benar ${x.benar} dari ${x.total}`, waktu: x.selesai_pada, jenis: 'kuis' });
  }
  return daftar.sort((a, b) => b.waktu.getTime() - a.waktu.getTime()).slice(0, jumlah);
}
