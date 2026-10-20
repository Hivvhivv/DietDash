// Logika status progres tanpa akses database, dipakai di server maupun di peramban.

export interface DataProgres {
  materi: Record<string, string>; // "modul_id/nomor" → waktu pertama dibuka (ISO)
  latihan: Record<string, { benar: number; total: number; waktu: string }>; // terakhir per modul
}

export interface ModulUntukProgres {
  id: string;
  urutan: number;
  judul: string;
  ilustrasi: string;
  jumlah_materi: number;
  judul_materi: string[];
}

export type StatusModul = 'belum' | 'sedang' | 'selesai';

export const kunciMateri = (modulId: string, nomor: number) => `${modulId}/${nomor}`;

export function statusModul(m: ModulUntukProgres, data: DataProgres): { status: StatusModul; dibaca: number } {
  let dibaca = 0;
  for (let n = 1; n <= m.jumlah_materi; n++) if (data.materi[kunciMateri(m.id, n)]) dibaca++;
  return { dibaca, status: dibaca === 0 ? 'belum' : dibaca >= m.jumlah_materi ? 'selesai' : 'sedang' };
}

export function ringkasanProgres(modul: ModulUntukProgres[], data: DataProgres) {
  const total = modul.reduce((n, m) => n + m.jumlah_materi, 0);
  const dibaca = modul.reduce((n, m) => n + statusModul(m, data).dibaca, 0);
  // Materi pertama yang belum dibuka, sesuai urutan modul.
  let lanjut: { modulId: string; nomor: number; judul: string } | null = null;
  for (const m of modul) {
    for (let n = 1; n <= m.jumlah_materi && !lanjut; n++) {
      if (!data.materi[kunciMateri(m.id, n)]) lanjut = { modulId: m.id, nomor: n, judul: m.judul_materi[n - 1] };
    }
    if (lanjut) break;
  }
  return { total, dibaca, persen: total ? Math.round((dibaca / total) * 100) : 0, lanjut };
}
