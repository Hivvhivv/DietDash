// Data peserta untuk admin berperan PENELITI. Pemanggil wajib lolos wajibAdmin('peneliti').
import type { ObjectId } from 'mongodb';
import { koleksi, type DokHasilLatihan, type DokProgres } from './db';
import { ambilSemuaModul } from './konten';
import { untukProgres } from './progres';
import { statusModul, type DataProgres, type ModulUntukProgres } from './status-progres';

export interface BarisPeserta {
  id: string;
  email: string;
  dibuat_pada: Date;
  terakhir_masuk?: Date;
  terakhir_aktif?: Date;
  dibaca: number;
  total: number;
  persen: number;
  modul: { id: string; urutan: number; dibaca: number; jumlah: number; status: string; latihan?: string }[];
  kuis_lengkap?: string;
}

function keDataProgres(progres: DokProgres[], latihan: DokHasilLatihan[]): DataProgres {
  const d: DataProgres = { materi: {}, latihan: {} };
  for (const x of progres) d.materi[`${x.modul_id}/${x.materi}`] = x.pertama_dibuka.toISOString();
  for (const x of [...latihan].sort((a, b) => a.waktu.getTime() - b.waktu.getTime())) {
    d.latihan[x.modul_id] = { benar: x.benar, total: x.total, waktu: x.waktu.toISOString() };
  }
  return d;
}

function susunBaris(
  p: { _id: ObjectId; email: string; dibuat_pada: Date; terakhir_masuk?: Date },
  modul: ModulUntukProgres[],
  progres: DokProgres[],
  latihan: DokHasilLatihan[],
): BarisPeserta {
  const data = keDataProgres(progres, latihan);
  const total = modul.reduce((n, m) => n + m.jumlah_materi, 0);
  const perModul = modul.map((m) => {
    const s = statusModul(m, data);
    const l = data.latihan[m.id];
    return {
      id: m.id,
      urutan: m.urutan,
      dibaca: s.dibaca,
      jumlah: m.jumlah_materi,
      status: s.status,
      latihan: l ? `${l.benar}/${l.total}` : undefined,
    };
  });
  const dibaca = perModul.reduce((n, m) => n + m.dibaca, 0);
  const waktu = [
    ...progres.map((x) => x.terakhir_dibuka.getTime()),
    ...latihan.map((x) => x.waktu.getTime()),
  ];
  const kuis = data.latihan['semua'];
  return {
    id: p._id.toHexString(),
    email: p.email,
    dibuat_pada: p.dibuat_pada,
    terakhir_masuk: p.terakhir_masuk,
    terakhir_aktif: waktu.length ? new Date(Math.max(...waktu)) : undefined,
    dibaca,
    total,
    persen: total ? Math.round((dibaca / total) * 100) : 0,
    modul: perModul,
    kuis_lengkap: kuis ? `${kuis.benar}/${kuis.total}` : undefined,
  };
}

export async function daftarPeserta(): Promise<BarisPeserta[]> {
  const { peserta, progres, hasilLatihan } = await koleksi();
  const modul = (await ambilSemuaModul()).map(untukProgres);
  const [semuaPeserta, semuaProgres, semuaLatihan] = await Promise.all([
    peserta.find({}, { projection: { password_hash: 0 } }).sort({ dibuat_pada: 1 }).toArray(),
    progres.find({}).toArray(),
    hasilLatihan.find({}).toArray(),
  ]);
  return semuaPeserta.map((p) => {
    const id = p._id.toHexString();
    return susunBaris(
      p,
      modul,
      semuaProgres.filter((x) => x.peserta_id.toHexString() === id),
      semuaLatihan.filter((x) => x.peserta_id.toHexString() === id),
    );
  });
}

export async function detailPeserta(id: ObjectId) {
  const { peserta, progres, hasilLatihan } = await koleksi();
  const p = await peserta.findOne({ _id: id }, { projection: { password_hash: 0 } });
  if (!p) return null;
  const semuaModul = await ambilSemuaModul();
  const [prog, lat] = await Promise.all([
    progres.find({ peserta_id: id }).toArray(),
    hasilLatihan.find({ peserta_id: id }).sort({ waktu: -1 }).toArray(),
  ]);
  return {
    peserta: p,
    baris: susunBaris(p, semuaModul.map(untukProgres), prog, lat),
    modul: semuaModul,
    progres: prog,
    latihan: lat,
  };
}

// CSV aman untuk dibuka di Excel/Sheets (cegah formula injection).
function sel(v: unknown): string {
  let s = v instanceof Date ? v.toISOString() : v === undefined || v === null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function keCsv(baris: BarisPeserta[]): string {
  const modul = baris[0]?.modul ?? [];
  const kepala = [
    'email',
    'terdaftar',
    'terakhir_masuk',
    'terakhir_aktif',
    'materi_dibuka',
    'total_materi',
    'persen',
    ...modul.flatMap((m) => [`modul${m.urutan}_materi_dibuka`, `modul${m.urutan}_status`, `modul${m.urutan}_latihan`]),
    'kuis_lengkap',
  ];
  const isi = baris.map((b) =>
    [
      b.email,
      b.dibuat_pada,
      b.terakhir_masuk,
      b.terakhir_aktif,
      b.dibaca,
      b.total,
      b.persen,
      ...b.modul.flatMap((m) => [m.dibaca, m.status, m.latihan ?? '']),
      b.kuis_lengkap ?? '',
    ]
      .map(sel)
      .join(','),
  );
  return '﻿' + [kepala.join(','), ...isi].join('\r\n');
}

export async function hapusSemuaPeserta(): Promise<number> {
  const { peserta, sesiPeserta, progres, hasilLatihan, tokenReset } = await koleksi();
  const n = await peserta.countDocuments();
  await Promise.all([
    progres.deleteMany({}),
    hasilLatihan.deleteMany({}),
    sesiPeserta.deleteMany({}),
    tokenReset.deleteMany({}),
  ]);
  await peserta.deleteMany({});
  return n;
}
