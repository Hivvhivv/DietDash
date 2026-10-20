'use client';

// Pencatatan progres dari sisi peramban.
// - Peserta yang masuk: dicatat di server.
// - Pengunjung tanpa akun: dicatat di perangkat ini saja (localStorage), tidak dikirim ke mana pun.
import {
  aksiCatatMateri,
  aksiProgresSaya,
  aksiSimpanLatihan,
  aksiSinkronProgres,
} from '@/app/aksi-peserta';
import type { DataProgres } from './status-progres';

const KUNCI = 'dash-sehat-progres-v1';

export function bacaLokal(): DataProgres {
  try {
    const d = JSON.parse(localStorage.getItem(KUNCI) ?? 'null');
    if (d && typeof d === 'object') return { materi: d.materi ?? {}, latihan: d.latihan ?? {} };
  } catch {}
  return { materi: {}, latihan: {} };
}

function tulisLokal(d: DataProgres) {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(d));
  } catch {}
}

export async function catatMateriDibuka(modulId: string, nomor: number) {
  try {
    const r = await aksiCatatMateri(modulId, nomor);
    if (r.masuk) return;
  } catch {}
  const d = bacaLokal();
  d.materi[`${modulId}/${nomor}`] ??= new Date().toISOString();
  tulisLokal(d);
}

export async function simpanHasilLatihan(modulId: string, benar: number, total: number) {
  try {
    const r = await aksiSimpanLatihan(modulId, benar, total);
    if (r.masuk) return;
  } catch {}
  const d = bacaLokal();
  d.latihan[modulId] = { benar, total, waktu: new Date().toISOString() };
  tulisLokal(d);
}

// Mengambil progres: dari server bila masuk (sekaligus memindahkan progres perangkat), selain itu dari perangkat.
export async function ambilProgresSaya(): Promise<{ masuk: boolean; data: DataProgres }> {
  try {
    const lokal = bacaLokal();
    if (Object.keys(lokal.materi).length) {
      const s = await aksiSinkronProgres(lokal);
      if (s.masuk) tulisLokal({ materi: {}, latihan: lokal.latihan });
    }
    const r = await aksiProgresSaya();
    if (r.masuk && r.data) return { masuk: true, data: r.data };
  } catch {}
  return { masuk: false, data: bacaLokal() };
}
