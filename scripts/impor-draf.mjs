// Memasukkan naskah src/content/modul/*.md sebagai DRAF baru untuk modul yang sudah ada di database,
// bila nomor versinya belum ada. Draf baru tayang setelah disetujui peneliti di halaman admin.
// Jalankan: npm run impor-draf -- "catatan perubahan"
// Tambahkan --ganti-draf untuk menghapus draf lama (yang belum pernah disetujui) dari modul yang mendapat draf baru.
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient, ObjectId } from 'mongodb';
import { parse as parseYaml } from 'yaml';
import { skemaFrontmatter, pisahFrontmatter } from '../src/lib/skema.ts';
import { KOLEKSI, pastikanIndeks } from '../src/lib/indeks.ts';

const argumen = process.argv.slice(2);
const gantiDraf = argumen.includes('--ganti-draf');
const catatan = argumen.filter((a) => !a.startsWith('--')).join(' ').trim();
if (catatan.length < 5) {
  console.error('✗ Tulis catatan perubahan, contoh: npm run impor-draf -- "Memecah modul menjadi beberapa materi"');
  process.exit(1);
}
const folder = fileURLToPath(new URL('../src/content/modul/', import.meta.url));
const { MONGODB_URI, MONGODB_DB } = process.env;
if (!MONGODB_URI || !MONGODB_DB) {
  console.error('✗ MONGODB_URI / MONGODB_DB belum diisi di .env.local');
  process.exit(1);
}

const klien = new MongoClient(MONGODB_URI, { appName: 'dash-sehat-impor-draf' });
try {
  await klien.connect();
  const db = klien.db(MONGODB_DB);
  await pastikanIndeks(db);
  const modulVersi = db.collection(KOLEKSI.modulVersi);
  const logAudit = db.collection(KOLEKSI.logAudit);

  let dibuat = 0;
  for (const f of (await readdir(folder)).filter((x) => x.endsWith('.md')).sort()) {
    const modulId = f.replace(/\.md$/, '');
    const bagian = pisahFrontmatter(await readFile(join(folder, f), 'utf8'));
    if (!bagian) throw new Error(`Frontmatter tidak ditemukan di ${f}`);
    const hasil = skemaFrontmatter.safeParse(parseYaml(bagian.yaml));
    if (!hasil.success) throw new Error(`Frontmatter tidak valid di ${f}: ${hasil.error.message}`);
    const { versi, ...data } = hasil.data;

    if (!(await modulVersi.findOne({ modul_id: modulId }))) {
      console.log(`- ${modulId}: belum ada di database (pakai npm run impor-konten), dilewati`);
      continue;
    }
    if (await modulVersi.findOne({ modul_id: modulId, versi })) {
      console.log(`- ${modulId}: versi ${versi} sudah ada, dilewati`);
      continue;
    }
    const sekarang = new Date();
    if (gantiDraf) {
      const lama = await modulVersi.find({ modul_id: modulId, status: 'draf' }).toArray();
      for (const d of lama) {
        await modulVersi.deleteOne({ _id: d._id, status: 'draf' });
        await logAudit.insertOne({
          _id: new ObjectId(),
          waktu: sekarang,
          admin: 'impor-berkas',
          aksi: 'hapus_draf',
          modul_id: modulId,
          versi: d.versi,
          keterangan: `Diganti draf versi ${versi}`,
        });
        console.log(`  ↳ ${modulId}: draf lama versi ${d.versi} dihapus`);
      }
    }
    await modulVersi.insertOne({
      _id: new ObjectId(),
      modul_id: modulId,
      versi,
      status: 'draf',
      data,
      isi: bagian.isi,
      catatan,
      dibuat_oleh: 'impor-berkas',
      dibuat_pada: sekarang,
      diubah_pada: sekarang,
    });
    await logAudit.insertOne({
      _id: new ObjectId(),
      waktu: sekarang,
      admin: 'impor-berkas',
      aksi: 'buat_draf',
      modul_id: modulId,
      versi,
      keterangan: `Dari berkas ${f}. ${catatan}`,
    });
    console.log(`✓ ${modulId}: draf versi ${versi} dibuat`);
    dibuat++;
  }
  const jumlahPeneliti = await db.collection(KOLEKSI.admin).countDocuments({ peran: 'peneliti', aktif: true });
  console.log(`\nSelesai. ${dibuat} draf dibuat. Akun admin berperan peneliti: ${jumlahPeneliti}.`);
  if (dibuat) console.log('Setujui draf di /admin/ agar tampil di website.');
} finally {
  await klien.close();
}
