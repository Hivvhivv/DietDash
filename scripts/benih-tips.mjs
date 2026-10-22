// Mengisi TIPS CONTOH ke database (koleksi `tips`) agar menu Tips Sehari-hari bisa dicoba.
// Boleh di database asli: tips bertanda `contoh` dan admin menghapusnya lewat Kelola Tips → Hapus Tips Contoh.
// Tidak menimpa apa pun: bila tips contoh sudah ada, skrip berhenti.
//
// Jalankan: npm run benih-tips
import { MongoClient, ObjectId } from 'mongodb';
import { cariKlaimTerlarang } from '../src/lib/cek-klaim.ts';
import { KOLEKSI, pastikanIndeks } from '../src/lib/indeks.ts';
import { TIPS_CONTOH } from './benih/tips-contoh.ts';

const { MONGODB_URI, MONGODB_DB } = process.env;
if (!MONGODB_URI || !MONGODB_DB) {
  console.error('✗ MONGODB_URI / MONGODB_DB belum diisi di .env.local');
  process.exit(1);
}

for (const t of TIPS_CONTOH) {
  const klaim = cariKlaimTerlarang([t.judul, t.masalah, t.solusi, t.catatan].join('\n'));
  if (klaim.length) {
    console.error(`✗ Klaim terlarang di tips "${t.judul}": ${klaim.join(', ')}`);
    process.exit(1);
  }
}

const klien = new MongoClient(MONGODB_URI);
try {
  await klien.connect();
  const db = klien.db(MONGODB_DB);
  await pastikanIndeks(db);
  const tips = db.collection(KOLEKSI.tips);
  if (await tips.countDocuments({ contoh: true })) {
    console.log('• Tips contoh sudah ada; tidak ada yang diubah.');
    process.exit(0);
  }
  const awal = (await tips.find().sort({ urutan: -1 }).limit(1).next())?.urutan ?? 0;
  const sekarang = new Date();
  const oleh = 'skrip benih-tips';
  await tips.insertMany(
    TIPS_CONTOH.map((t, i) => ({
      _id: new ObjectId(),
      ...t,
      gambar: null,
      urutan: awal + i + 1,
      terbit: true,
      contoh: true,
      dibuat_pada: sekarang,
      dibuat_oleh: oleh,
      diubah_pada: sekarang,
      diubah_oleh: oleh,
    })),
  );
  await db.collection(KOLEKSI.logAudit).insertOne({
    _id: new ObjectId(),
    waktu: sekarang,
    admin: oleh,
    aksi: 'benih_tips_contoh',
    keterangan: `${TIPS_CONTOH.length} tips`,
  });
  console.log(`✓ ${TIPS_CONTOH.length} tips contoh diimpor dan ditampilkan.`);
  console.log('  Sebelum penelitian: Kelola Tips → Hapus Tips Contoh (atau edit setelah ditinjau ahli).');
} finally {
  await klien.close();
}
