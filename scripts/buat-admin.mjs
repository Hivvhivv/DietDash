// Membuat akun SUPER ADMIN pertama (tidak ada pendaftaran admin lewat website).
// Admin berikutnya diundang dari panel (/admin/kelola-admin/).
// Jalankan di terminal: npm run buat-admin
// Kata sandi diketik tersembunyi dan hanya disimpan sebagai hash Argon2id.
// Autentikasi dua faktor (TOTP) diatur saat masuk pertama kali.
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { hash } from '@node-rs/argon2';
import { MongoClient, ObjectId } from 'mongodb';
import { KOLEKSI, pastikanIndeks } from '../src/lib/indeks.ts';

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

// Sama dengan periksaSandiAdmin() di src/lib/admin-auth.ts.
function periksaSandi(sandi, email) {
  if (sandi.length < 12) return 'Kata sandi admin minimal 12 karakter.';
  if (sandi.length > 200) return 'Kata sandi terlalu panjang.';
  if (/^\d+$/.test(sandi)) return 'Kata sandi jangan hanya angka.';
  const lokal = email.split('@')[0] ?? '';
  if (lokal.length >= 4 && sandi.toLowerCase().includes(lokal)) return 'Kata sandi jangan memuat alamat email.';
  return null;
}

// Mode otomatis khusus pengujian di database uji (tanpa prompt).
const otomatis = process.env.BUAT_ADMIN_EMAIL && process.env.BUAT_ADMIN_SANDI;
if (otomatis && !/_uji$/.test(MONGODB_DB)) {
  console.error('✗ Mode otomatis hanya untuk database uji (nama berakhiran _uji).');
  process.exit(1);
}

let email, nama, sandi;
if (otomatis) {
  email = process.env.BUAT_ADMIN_EMAIL.trim().toLowerCase();
  nama = process.env.BUAT_ADMIN_NAMA ?? 'Admin Uji';
  sandi = process.env.BUAT_ADMIN_SANDI;
} else {
  const rl = createInterface({ input: stdin, output: stdout });
  email = (await rl.question('Email super admin: ')).trim().toLowerCase();
  nama = (await rl.question('Nama: ')).trim();
  rl.close();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    console.error('✗ Format email belum benar.');
    process.exit(1);
  }
  if (nama.length < 2) {
    console.error('✗ Isi nama.');
    process.exit(1);
  }
  sandi = await tanyaTersembunyi('Kata sandi (min. 12 karakter, tidak tampil): ');
  const ulang = await tanyaTersembunyi('Ulangi kata sandi: ');
  if (ulang !== sandi) {
    console.error('✗ Kata sandi tidak sama.');
    process.exit(1);
  }
}
const masalah = periksaSandi(sandi, email);
if (masalah) {
  console.error('✗ ' + masalah);
  process.exit(1);
}

const klien = new MongoClient(MONGODB_URI, { appName: 'dash-sehat-buat-admin' });
try {
  await klien.connect();
  const db = klien.db(MONGODB_DB);
  await pastikanIndeks(db);
  const admins = db.collection(KOLEKSI.admin);
  if (await admins.findOne({ email })) {
    console.error('✗ Email ini sudah terdaftar sebagai admin.');
    process.exitCode = 1;
  } else {
    await admins.insertOne({
      _id: new ObjectId(),
      email,
      nama,
      password_hash: await hash(sandi),
      totp_rahasia: null,
      totp_aktif: false,
      peran: 'super_admin',
      aktif: true,
      dibuat_pada: new Date(),
    });
    await db.collection(KOLEKSI.logAudit).insertOne({
      _id: new ObjectId(),
      waktu: new Date(),
      admin: 'skrip buat-admin',
      aksi: 'buat_super_admin',
      objek: email,
    });
    console.log(`✓ Super admin ${email} dibuat. Masuk di /admin/masuk/ lalu atur aplikasi autentikator (2FA).`);
  }
} finally {
  await klien.close();
}
