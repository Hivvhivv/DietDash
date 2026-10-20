// Cek cepat klaim terlarang & penanda TODO pada konten edukasi.
// Jalankan: npm run cek-klaim
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = fileURLToPath(new URL('..', import.meta.url));

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

const temuan = [];
const todo = [];

function periksaTeks(teks, sumber) {
  teks.split('\n').forEach((baris, i) => {
    if (/TODO/.test(baris)) todo.push(`${sumber}:${i + 1}: ${baris.trim()}`);
    // Baris berisi pertanyaan yang sengaja memuat klaim (lalu dibantah) boleh ditandai "cek-klaim: abaikan".
    if (baris.includes('cek-klaim: abaikan')) return;
    for (const pola of POLA_TERLARANG) {
      for (const m of baris.matchAll(pola)) {
        const sebelum = baris.slice(Math.max(0, m.index - 40), m.index);
        if (!PENYANGKAL.test(sebelum)) {
          temuan.push(`${sumber}:${i + 1}: "${m[0]}" → ${baris.trim()}`);
        }
      }
    }
  });
}

const folderModul = join(akar, 'src', 'content', 'modul');
for (const f of readdirSync(folderModul).filter((f) => f.endsWith('.md'))) {
  const jalur = join(folderModul, f);
  periksaTeks(readFileSync(jalur, 'utf8'), relative(akar, jalur));
}

for (const folder of ['app', 'components']) {
  const dasar = join(akar, 'src', folder);
  for (const f of readdirSync(dasar, { recursive: true }).filter((f) => f.endsWith('.tsx'))) {
    const jalur = join(dasar, f);
    periksaTeks(readFileSync(jalur, 'utf8'), relative(akar, jalur));
  }
}

// Pada kuis, pilihan jawaban yang salah memang sengaja berisi klaim keliru,
// jadi yang diperiksa hanya pertanyaan dan umpan balik.
const { daftarSoal } = await import('../src/data/kuis.ts');
for (const s of daftarSoal) {
  periksaTeks(`${s.pertanyaan}\n${s.umpan_balik}`, `src/data/kuis.ts [${s.id}]`);
}

if (todo.length) {
  console.log(`\n⚠ ${todo.length} penanda TODO (harus diselesaikan sebelum versi dibekukan):`);
  todo.forEach((t) => console.log('  ' + t));
}

if (temuan.length) {
  console.log(`\n✗ ${temuan.length} kemungkinan klaim terlarang:`);
  temuan.forEach((t) => console.log('  ' + t));
  process.exit(1);
}

console.log('\n✓ Tidak ditemukan klaim terlarang.');
