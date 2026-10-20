// Progres belajar peserta yang masuk: materi yang dibuka dan skor latihan soal.
import { ObjectId } from 'mongodb';
import { koleksi } from './db';
import { ambilSemuaModul, type Modul } from './konten';
import { VERSI_KUIS } from '@/data/kuis';
import type { PesertaAktif } from './peserta';

import { kunciMateri, type DataProgres, type ModulUntukProgres } from './status-progres';

export type { DataProgres } from './status-progres';

export function untukProgres(m: Modul): ModulUntukProgres {
  return {
    id: m.id,
    urutan: m.urutan,
    judul: m.judul,
    ilustrasi: m.ilustrasi,
    jumlah_materi: m.materi.length,
    judul_materi: m.materi.map((x) => x.judul),
  };
}

async function modulValid(modulId: string): Promise<Modul | undefined> {
  return (await ambilSemuaModul()).find((m) => m.id === modulId);
}

export async function catatMateri(p: PesertaAktif, modulId: string, nomor: number, waktu = new Date()) {
  const modul = await modulValid(modulId);
  if (!modul || !Number.isInteger(nomor) || nomor < 1 || nomor > modul.materi.length) return false;
  const { progres } = await koleksi();
  await progres.updateOne(
    { peserta_id: p.id, modul_id: modulId, materi: nomor },
    {
      $setOnInsert: { _id: new ObjectId() },
      $min: { pertama_dibuka: waktu },
      $set: { terakhir_dibuka: new Date(), versi_modul: modul.versi },
      $inc: { jumlah_buka: 1 },
    },
    { upsert: true },
  );
  return true;
}

export async function simpanLatihan(p: PesertaAktif, modulId: string, benar: number, total: number) {
  if (modulId !== 'semua' && !(await modulValid(modulId))) return false;
  if (!Number.isInteger(benar) || !Number.isInteger(total) || total < 1 || total > 100 || benar < 0 || benar > total) {
    return false;
  }
  const { hasilLatihan } = await koleksi();
  await hasilLatihan.insertOne({
    _id: new ObjectId(),
    peserta_id: p.id,
    modul_id: modulId,
    benar,
    total,
    versi_kuis: VERSI_KUIS,
    waktu: new Date(),
  });
  return true;
}

export async function ambilProgres(pesertaId: ObjectId): Promise<DataProgres> {
  const { progres, hasilLatihan } = await koleksi();
  const [materi, latihan] = await Promise.all([
    progres.find({ peserta_id: pesertaId }).toArray(),
    hasilLatihan.find({ peserta_id: pesertaId }).sort({ waktu: 1 }).toArray(),
  ]);
  const data: DataProgres = { materi: {}, latihan: {} };
  for (const x of materi) data.materi[kunciMateri(x.modul_id, x.materi)] = x.pertama_dibuka.toISOString();
  for (const x of latihan) {
    data.latihan[x.modul_id] = { benar: x.benar, total: x.total, waktu: x.waktu.toISOString() };
  }
  return data;
}

// Memindahkan progres yang tercatat di perangkat sebelum peserta masuk.
export async function sinkronkan(p: PesertaAktif, lokal: DataProgres): Promise<void> {
  const entri = Object.entries(lokal.materi ?? {}).slice(0, 200);
  for (const [kunci, iso] of entri) {
    const [modulId, nomorStr] = kunci.split('/');
    const waktu = new Date(iso);
    if (!modulId || Number.isNaN(waktu.getTime()) || waktu > new Date()) continue;
    await catatMateri(p, modulId, Number(nomorStr), waktu);
  }
}
