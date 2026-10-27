// Nama koleksi dan indeks MongoDB. Dipakai aplikasi dan skrip, jadi tanpa alias impor.
import type { Db } from 'mongodb';

export const KOLEKSI = {
  responden: 'respondents',
  peserta: 'participants',
  riwayatAkun: 'token_events',
  admin: 'admins',
  undangan: 'admin_invites',
  sesi: 'sessions',
  pengaturan: 'app_settings',
  versi: 'content_versions',
  modul: 'modules',
  materi: 'materials',
  progres: 'material_progress',
  percobaanLogin: 'percobaan_login',
  logAudit: 'log_audit',
  tips: 'tips',
  instrumen: 'instrumen_tes',
  jawabanTes: 'jawaban_tes',
} as const;

export async function pastikanIndeks(db: Db): Promise<void> {
  const k = (n: string) => db.collection(n);
  await Promise.all([
    k(KOLEKSI.responden).createIndex({ nomor_hp: 1 }, { unique: true, name: 'nomor_unik' }),
    k(KOLEKSI.peserta).createIndexes([
      { key: { id_peserta: 1 }, name: 'id_peserta_unik', unique: true },
      { key: { respondent_id: 1 }, name: 'satu_per_responden', unique: true },
    ]),
    k(KOLEKSI.riwayatAkun).createIndex({ respondent_id: 1, waktu: -1 }, { name: 'per_responden' }),
    k(KOLEKSI.admin).createIndex({ email: 1 }, { unique: true, name: 'email_unik' }),
    k(KOLEKSI.undangan).createIndexes([
      { key: { token_hash: 1 }, name: 'token_unik', unique: true },
      { key: { kedaluwarsa_pada: 1 }, name: 'hapus_kedaluwarsa', expireAfterSeconds: 7 * 24 * 3600 },
    ]),
    k(KOLEKSI.sesi).createIndexes([
      { key: { token_hash: 1 }, name: 'token_unik', unique: true },
      { key: { pemilik_id: 1 }, name: 'per_pemilik' },
      { key: { kedaluwarsa_pada: 1 }, name: 'hapus_kedaluwarsa', expireAfterSeconds: 0 },
    ]),
    k(KOLEKSI.versi).createIndex({ status: 1 }, { name: 'per_status' }),
    k(KOLEKSI.modul).createIndex({ version_id: 1, kunci: 1 }, { unique: true, name: 'kunci_per_versi' }),
    k(KOLEKSI.materi).createIndexes([
      { key: { version_id: 1, kunci: 1 }, name: 'kunci_per_versi', unique: true },
      { key: { version_id: 1, modul_kunci: 1, urutan: 1 }, name: 'urutan' },
    ]),
    k(KOLEKSI.progres).createIndex(
      { respondent_id: 1, materi_kunci: 1 },
      { unique: true, name: 'satu_per_materi' },
    ),
    k(KOLEKSI.percobaanLogin).createIndex({ kunci: 1, waktu: -1 }, { name: 'kunci_waktu' }),
    indeksTtl(db, KOLEKSI.percobaanLogin, 'hapus_percobaan_lama', 60 * 60),
    k(KOLEKSI.logAudit).createIndex({ waktu: -1 }, { name: 'waktu_terbaru' }),
    k(KOLEKSI.tips).createIndex({ terbit: 1, urutan: 1 }, { name: 'terbit_urutan' }),
    k(KOLEKSI.jawabanTes).createIndex({ respondent_id: 1, jenis: 1 }, { unique: true, name: 'satu_per_responden' }),
  ]);
}

// Indeks TTL: bila sudah ada dengan umur berbeda (mis. dari versi lama), buat ulang.
// Memakai dropIndex (termasuk hak readWrite), bukan collMod yang butuh hak dbAdmin.
async function indeksTtl(db: Db, koleksi: string, nama: string, detik: number): Promise<void> {
  try {
    await db.collection(koleksi).createIndex({ waktu: 1 }, { name: nama, expireAfterSeconds: detik });
  } catch (e) {
    if ((e as { code?: number }).code !== 85) throw e;
    // Beberapa proses bisa melakukan ini bersamaan (mis. saat build); abaikan bila sudah terhapus.
    await db.collection(koleksi).dropIndex(nama).catch((g: { code?: number }) => {
      if (g.code !== 27) throw g;
    });
    await db.collection(koleksi).createIndex({ waktu: 1 }, { name: nama, expireAfterSeconds: detik });
  }
}
