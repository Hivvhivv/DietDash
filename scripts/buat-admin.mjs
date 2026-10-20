// Membuat akun admin baru (tidak ada pendaftaran admin lewat website).
// Jalankan di terminal: npm run buat-admin
// Kata sandi diketik tersembunyi dan hanya disimpan dalam bentuk hash argon2id.
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { hash } from '@node-rs/argon2';
import { MongoClient, ObjectId } from 'mongodb';
import { KOLEKSI, pastikanIndeks } from '../src/lib/indeks.ts';
import { PERAN_ADMIN } from '../src/lib/skema.ts';

const { MONGODB_URI, MONGODB_DB } = process.env;
if (!MONGODB_URI || !MONGODB_DB) {
  console.error('✗ MONGODB_URI / MONGODB_DB belum diisi di .env.local');
  process.exit(1);
}

function tanyaTersembunyi(pertanyaan) {
  return new Promise((selesai) => {
    stdout.write(pertanyaan);
    let isi = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const saatTombol = (k) => {
      for (const c of k) {
        if (c === '\r' || c === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', saatTombol);
          stdout.write('\n');
          return selesai(isi);
        }
        if (c === '\u0003') process.exit(130); // Ctrl+C
        if (c === '\u0008' || c === '\u007f') isi = isi.slice(0, -1);
        else isi += c;
      }
    };
    stdin.on('data', saatTombol);
  });
}

function periksaSandi(sandi, username) {
  if (sandi.length < 12) return 'Kata sandi minimal 12 karakter.';
  if (/^\d+$/.test(sandi)) return 'Kata sandi tidak boleh hanya angka (hindari tanggal lahir atau nomor telepon).';
  if (/\d{1,2}[-/.]?\d{1,2}[-/.]?\d{2,4}/.test(sandi) && sandi.replace(/\D/g, '').length >= 6) {
    return 'Kata sandi terlihat seperti tanggal. Gunakan kalimat sandi yang lain.';
  }
  if (/(\+?62|0)8\d{7,}/.test(sandi)) return 'Kata sandi tidak boleh memuat nomor telepon.';
  if (sandi.toLowerCase().includes(username)) return 'Kata sandi tidak boleh memuat nama pengguna.';
  return null;
}

const rl = createInterface({ input: stdin, output: stdout });
const username = (await rl.question('Nama pengguna admin (huruf kecil/angka/titik/garis bawah): ')).trim().toLowerCase();
if (!/^[a-z0-9._]{3,32}$/.test(username)) {
  console.error('✗ Nama pengguna harus 3–32 karakter: huruf kecil, angka, titik, atau garis bawah.');
  process.exit(1);
}
const peran = (await rl.question(`Peran (${PERAN_ADMIN.join(' / ')}): `)).trim().toLowerCase();
if (!PERAN_ADMIN.includes(peran)) {
  console.error(`✗ Peran harus salah satu dari: ${PERAN_ADMIN.join(', ')}`);
  process.exit(1);
}
rl.close();

const sandi = await tanyaTersembunyi('Kata sandi (min. 12 karakter, tidak tampil): ');
const masalah = periksaSandi(sandi, username);
if (masalah) {
  console.error('✗ ' + masalah);
  process.exit(1);
}
const ulang = await tanyaTersembunyi('Ulangi kata sandi: ');
if (ulang !== sandi) {
  console.error('✗ Kata sandi tidak sama.');
  process.exit(1);
}

const klien = new MongoClient(MONGODB_URI, { appName: 'dash-sehat-buat-admin' });
try {
  await klien.connect();
  const db = klien.db(MONGODB_DB);
  await pastikanIndeks(db);
  const admin = db.collection(KOLEKSI.admin);
  if (await admin.findOne({ username })) {
    console.error(`✗ Admin "${username}" sudah ada.`);
    process.exitCode = 1;
  } else {
    const sekarang = new Date();
    await admin.insertOne({
      _id: new ObjectId(),
      username,
      password_hash: await hash(sandi),
      peran,
      aktif: true,
      dibuat_pada: sekarang,
    });
    await db.collection(KOLEKSI.logAudit).insertOne({
      _id: new ObjectId(),
      waktu: sekarang,
      admin: 'skrip-buat-admin',
      aksi: 'buat_admin',
      keterangan: `Admin "${username}" (${peran}) dibuat.`,
    });
    console.log(`✓ Admin "${username}" dengan peran ${peran} berhasil dibuat.`);
  }
} finally {
  await klien.close();
}
