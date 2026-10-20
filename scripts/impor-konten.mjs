// Impor naskah modul dari src/content/modul/*.md ke MongoDB sebagai versi "disetujui".
// Modul yang SUDAH punya versi apa pun di database dilewati (tidak pernah ditimpa).
// Jalankan: npm run impor-konten
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient, ObjectId } from 'mongodb';
import { parse as parseYaml } from 'yaml';
import { skemaFrontmatter, pisahFrontmatter } from '../src/lib/skema.ts';
import { KOLEKSI, pastikanIndeks } from '../src/lib/indeks.ts';

const folder = fileURLToPath(new URL('../src/content/modul/', import.meta.url));
const { MONGODB_URI, MONGODB_DB } = process.env;
if (!MONGODB_URI || !MONGODB_DB) {
  console.error('✗ MONGODB_URI / MONGODB_DB belum diisi di .env.local');
  process.exit(1);
}

const klien = new MongoClient(MONGODB_URI, { appName: 'dash-sehat-impor' });
try {
  await klien.connect();
  const db = klien.db(MONGODB_DB);
  await pastikanIndeks(db);
  const modulVersi = db.collection(KOLEKSI.modulVersi);
  const logAudit = db.collection(KOLEKSI.logAudit);

  const file = (await readdir(folder)).filter((f) => f.endsWith('.md')).sort();
  let diimpor = 0;
  for (const f of file) {
    const modulId = f.replace(/\.md$/, '');
    const bagian = pisahFrontmatter(await readFile(join(folder, f), 'utf8'));
    if (!bagian) throw new Error(`Frontmatter tidak ditemukan di ${f}`);
    const hasil = skemaFrontmatter.safeParse(parseYaml(bagian.yaml));
    if (!hasil.success) throw new Error(`Frontmatter tidak valid di ${f}: ${hasil.error.message}`);

    if (await modulVersi.findOne({ modul_id: modulId })) {
      console.log(`- ${modulId}: sudah ada di database, dilewati`);
      continue;
    }

    const { versi, ...data } = hasil.data;
    const sekarang = new Date();
    const catatan = `Impor awal dari berkas ${f}.`;
    await modulVersi.insertOne({
      _id: new ObjectId(),
      modul_id: modulId,
      versi,
      status: 'disetujui',
      data,
      isi: bagian.isi,
      catatan,
      dibuat_oleh: 'impor-awal',
      dibuat_pada: sekarang,
      diubah_pada: sekarang,
      disetujui_oleh: 'impor-awal',
      disetujui_pada: sekarang,
    });
    await logAudit.insertOne({
      _id: new ObjectId(),
      waktu: sekarang,
      admin: 'impor-awal',
      aksi: 'impor',
      modul_id: modulId,
      versi,
      keterangan: catatan,
    });
    console.log(`✓ ${modulId}: versi ${versi} diimpor & disetujui`);
    diimpor++;
  }
  console.log(`\nSelesai. ${diimpor} modul diimpor.`);
} finally {
  await klien.close();
}
