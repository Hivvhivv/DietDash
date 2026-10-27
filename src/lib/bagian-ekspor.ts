// Bagian yang bisa dipilih pada "Ekspor Data" di detail responden (PDF lewat jendela cetak peramban).
// Hanya nama bagian yang masuk URL (?b=...), tidak pernah nama, nomor, atau kode akses.
export const BAGIAN_EKSPOR = [
  { id: 'akun', label: 'Status peserta', ket: 'Status akun, kelompok, tanggal daftar, terakhir aktif, hari ke-, total durasi belajar', awal: true },
  { id: 'modul', label: 'Progres per modul', ket: 'Materi dibuka per modul, persentase, dan lama membaca', awal: true },
  { id: 'materi', label: 'Rincian per materi', ket: 'Waktu dibuka, lama membaca, versi konten, buka manual', awal: true },
  { id: 'tes', label: 'Ringkasan pretest & posttest', ket: 'Waktu kirim dan skor (hanya untuk peneliti)', awal: true },
  { id: 'jawaban', label: 'Jawaban pretest & posttest per soal', ket: 'Jawaban responden dan hasil soal pilihan ganda', awal: false },
  { id: 'riwayat', label: 'Riwayat akun', ket: 'Kode dibuat/direset, nomor/nama diganti, nonaktif', awal: false },
  { id: 'identitas', label: 'Identitas responden', ket: 'Nama dan nomor HP tersamar. Pilih hanya bila perlu; PDF ini jadi data pribadi.', awal: false },
] as const;

export type BagianEkspor = (typeof BAGIAN_EKSPOR)[number]['id'];

export function bacaBagian(nilai: string | string[] | undefined): BagianEkspor[] {
  const dipilih = new Set(Array.isArray(nilai) ? nilai : nilai ? [nilai] : []);
  return BAGIAN_EKSPOR.filter((b) => dipilih.has(b.id)).map((b) => b.id);
}
