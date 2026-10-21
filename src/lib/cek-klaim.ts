// Pemeriksaan klaim terlarang pada teks konten (PRD 13). Sama dengan scripts/cek-klaim.mjs,
// dipakai validasi versi di panel admin sebelum konten dapat ditinjau dan diterbitkan.
const POLA_TERLARANG = [
  /menyembuhkan/gi,
  /\bsembuh\b/gi,
  /pasti\s+turun/gi,
  /(ganti|menggantikan|pengganti)\s+obat/gi,
  /(berhenti|menghentikan|stop)\s+(minum\s+)?obat/gi,
  /tidak\s+perlu\s+(minum\s+)?obat/gi,
];
// Kata penyangkal di depan klaim membuat kalimat aman, mis. "tidak menyembuhkan".
const PENYANGKAL = /(tidak|bukan|jangan|tanpa)\s+(\S+\s+){0,3}$/i;

export function cariKlaimTerlarang(teks: string): string[] {
  const temuan: string[] = [];
  for (const baris of teks.split('\n')) {
    if (baris.includes('cek-klaim: abaikan')) continue;
    for (const pola of POLA_TERLARANG) {
      for (const m of baris.matchAll(pola)) {
        const sebelum = baris.slice(Math.max(0, (m.index ?? 0) - 40), m.index);
        if (!PENYANGKAL.test(sebelum)) temuan.push(m[0]);
      }
    }
  }
  return temuan;
}
