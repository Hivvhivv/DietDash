// Cek koneksi MongoDB tanpa menampilkan password.
// Jalankan: npm run cek-db
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const namaDb = process.env.MONGODB_DB;
if (!uri || !namaDb) {
  console.error('✗ MONGODB_URI atau MONGODB_DB belum diisi di .env.local');
  process.exit(1);
}

const host = new URL(uri).host;
const klien = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

try {
  await klien.connect();
  await klien.db('admin').command({ ping: 1 });
  console.log(`✓ Terhubung ke ${host}`);

  const status = await klien.db('admin').command({ connectionStatus: 1 });
  console.log(`  User: ${status.authInfo.authenticatedUsers.map((u) => u.user).join(', ')}`);
  const peran = status.authInfo.authenticatedUserRoles.map((r) => `${r.role}@${r.db}`);
  console.log(`  Peran user: ${peran.join(', ') || '(tidak ada)'}`);
  const terlaluLuas = peran.some((p) =>
    /^(atlasAdmin|root|readWriteAnyDatabase|dbAdminAnyDatabase|userAdminAnyDatabase)@/.test(p),
  );
  if (terlaluLuas) {
    console.log('  ⚠ Hak akses user ini mencakup SEMUA database di cluster. Sebaiknya batasi ke readWrite@' + namaDb);
  }

  try {
    const { databases } = await klien.db('admin').command({ listDatabases: 1, nameOnly: true });
    console.log(`  Database di cluster: ${databases.map((d) => d.name).join(', ')}`);
  } catch {
    console.log('  (User tidak berhak melihat daftar database — ini bagus untuk pembatasan akses.)');
  }
  console.log(`  Database aplikasi: ${namaDb}`);
} catch (e) {
  console.error(`✗ Gagal terhubung ke ${host}: ${e.message}`);
  process.exitCode = 1;
} finally {
  await klien.close();
}
