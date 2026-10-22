// Mengisi konten awal (benih) ke database sebagai VERSI KERJA berstatus draf.
// Sumber: scripts/benih/naskah-v2/*.md (6 modul, 20 materi). Kuis tidak dipakai sejak 2026-10-22.
// Setelah diimpor, konten disunting, ditinjau, dan diterbitkan lewat panel admin (/admin/konten/).
//
// Jalankan: npm run benih-konten
//   --ganti   buang versi kerja yang ada lalu isi ulang
//   --terbit  langsung terbitkan (HANYA untuk database uji berakhiran _uji)
//   --contoh  terbitkan sebagai KONTEN CONTOH (boleh di database asli) agar website bisa dicoba;
//             tidak bisa dikunci, dan super admin menghapusnya lewat Versi Konten → Hapus Konten Contoh
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient, ObjectId } from 'mongodb';
import { parse as parseYaml } from 'yaml';
import { buatKunci } from '../src/lib/identitas.ts';
import { KOLEKSI, pastikanIndeks } from '../src/lib/indeks.ts';
import { NAMA_ILUSTRASI, skemaMateri, skemaModul } from '../src/lib/skema.ts';
import { daftarSumber } from './benih/sumber-v1.ts';

const { MONGODB_URI, MONGODB_DB } = process.env;
if (!MONGODB_URI || !MONGODB_DB) {
  console.error('✗ MONGODB_URI / MONGODB_DB belum diisi di .env.local');
  process.exit(1);
}
const ganti = process.argv.includes('--ganti');
const contoh = process.argv.includes('--contoh');
const terbit = process.argv.includes('--terbit') || contoh;
if (terbit && !contoh && !/_uji$/.test(MONGODB_DB)) {
  console.error('✗ --terbit hanya untuk database uji. Terbitkan konten asli lewat panel admin setelah validasi ahli.');
  process.exit(1);
}

const folder = fileURLToPath(new URL('./benih/naskah-v2/', import.meta.url));

function sitasi(id) {
  const s = daftarSumber.find((x) => x.id === id);
  if (!s) throw new Error(`Sumber tidak dikenal: ${id}`);
  return s.url ? `${s.sitasi} [Tautan](${s.url})` : s.sitasi;
}

function bacaNaskah(berkas) {
  const teks = readFileSync(join(folder, berkas), 'utf8').replace(/\r\n/g, '\n');
  const fm = teks.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) throw new Error(`${berkas}: frontmatter tidak ditemukan`);
  const kepala = parseYaml(fm[1]);
  const modul = skemaModul.parse({ judul: kepala.judul, deskripsi: kepala.deskripsi, tujuan: kepala.tujuan });
  if (!NAMA_ILUSTRASI.includes(kepala.ilustrasi)) throw new Error(`${berkas}: ilustrasi "${kepala.ilustrasi}" tidak dikenal`);
  const bagian = teks.slice(fm[0].length).split(/^## /m).slice(1);
  const materi = bagian.map((b, i) => {
    const judul = b.slice(0, b.indexOf('\n')).trim();
    const lokasi = `${berkas} › ${judul}`;
    const meta = b.match(/```meta\n([\s\S]*?)\n```\n?/);
    if (!meta) throw new Error(`${lokasi}: blok meta tidak ditemukan`);
    const m = parseYaml(meta[1]);
    const isi = b.slice(b.indexOf('\n') + 1).replace(meta[0], '').trim();
    const v = skemaMateri.parse({
      judul,
      tujuan: m.tujuan,
      isi,
      poin_penting: m.poin_penting,
      rangkuman: m.rangkuman,
      estimasi_menit: null,
      sumber: (m.sumber ?? []).map(sitasi),
    });
    return { ...v, urutan: i + 1 };
  });
  return { ...modul, ilustrasi: kepala.ilustrasi, alt: kepala.alt, materi };
}

const naskah = readdirSync(folder)
  .filter((f) => f.endsWith('.md'))
  .sort()
  .map(bacaNaskah);

const klien = new MongoClient(MONGODB_URI, { appName: 'dash-sehat-benih' });
try {
  await klien.connect();
  const db = klien.db(MONGODB_DB);
  await pastikanIndeks(db);
  const k = (n) => db.collection(KOLEKSI[n]);

  const kerja = await k('versi').findOne({ status: { $in: ['draf', 'siap_ditinjau'] } });
  if (kerja) {
    if (!ganti) {
      console.error(`✗ Sudah ada versi kerja "${kerja.label}". Jalankan dengan --ganti untuk membuangnya dan mengisi ulang.`);
      process.exit(1);
    }
    await Promise.all(['modul', 'materi'].map((n) => k(n).deleteMany({ version_id: kerja._id })));
    await k('versi').deleteOne({ _id: kerja._id });
    console.log(`  Versi kerja lama "${kerja.label}" dibuang.`);
  }

  const atur = await k('pengaturan').findOne({ _id: 'utama' });
  if (terbit && atur?.versi_aktif_id) {
    const aktif = await k('versi').findOne({ _id: atur.versi_aktif_id });
    if (aktif && !aktif.contoh) {
      console.error(`✗ Sudah ada konten terbit "${aktif.label}". Konten asli tidak ditimpa; hapus atau ganti lewat panel admin.`);
      process.exit(1);
    }
  }
  const vId = new ObjectId();
  const sekarang = new Date();
  await k('versi').insertOne({
    _id: vId,
    label: contoh ? 'Contoh (belum divalidasi)' : 'Benih v2 (perlu validasi ahli)',
    ...(contoh ? { contoh: true } : {}),
    status: terbit ? 'terbit' : 'draf',
    jenis: 'biasa',
    dasar_id: null,
    dibuat_oleh: 'skrip benih-konten',
    dibuat_pada: sekarang,
    diubah_pada: sekarang,
    ...(terbit ? { diterbitkan_oleh: contoh ? 'skrip benih-konten (contoh)' : 'skrip benih-konten (uji)', diterbitkan_pada: sekarang } : {}),
  });

  let nMateri = 0;
  for (const [i, md] of naskah.entries()) {
    const kunciModul = buatKunci();
    await k('modul').insertOne({
      _id: new ObjectId(),
      version_id: vId,
      kunci: kunciModul,
      urutan: i + 1,
      judul: md.judul,
      deskripsi: md.deskripsi,
      tujuan: md.tujuan,
      gambar: { jenis: 'bawaan', nama: md.ilustrasi, alt: md.alt },
      diarsipkan: false,
    });
    for (const m of md.materi) {
      const kunciMateri = buatKunci();
      await k('materi').insertOne({ _id: new ObjectId(), version_id: vId, kunci: kunciMateri, modul_kunci: kunciModul, ...m, diarsipkan: false });
      nMateri++;
    }
  }

  if (terbit) {
    const lama = atur?.versi_aktif_id;
    if (lama) await k('versi').updateOne({ _id: lama, status: 'terbit' }, { $set: { status: 'arsip' } });
    await k('pengaturan').updateOne(
      { _id: 'utama' },
      { $set: { versi_aktif_id: vId, diubah_pada: sekarang, diubah_oleh: contoh ? 'skrip benih-konten (contoh)' : 'skrip benih-konten (uji)' } },
      { upsert: true },
    );
  }
  await k('logAudit').insertOne({
    _id: new ObjectId(),
    waktu: sekarang,
    admin: 'skrip benih-konten',
    aksi: contoh ? 'benih_konten_contoh' : terbit ? 'benih_konten_terbit_uji' : 'benih_konten',
    objek: vId.toHexString(),
    keterangan: `${naskah.length} modul, ${nMateri} materi`,
  });
  console.log(`✓ ${naskah.length} modul, ${nMateri} materi diimpor sebagai ${contoh ? 'KONTEN CONTOH (terbit)' : terbit ? 'versi TERBIT (uji)' : 'versi kerja draf'}.`);
  if (contoh) console.log('  Responden bisa langsung mencoba. Sebelum penelitian: super admin → Versi Konten → Hapus Konten Contoh.');
  if (!terbit) console.log('  Tinjau di /admin/konten/, tandai siap ditinjau, lalu super admin menerbitkannya setelah validasi ahli.');
} finally {
  await klien.close();
}
