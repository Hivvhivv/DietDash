// Indeks MongoDB. Dipakai oleh aplikasi dan skrip, jadi tanpa alias impor.
import type { Db } from 'mongodb';

export const KOLEKSI = {
  modulVersi: 'modul_versi',
  admin: 'admin',
  sesi: 'sesi',
  percobaanLogin: 'percobaan_login',
  logAudit: 'log_audit',
  peserta: 'peserta',
  sesiPeserta: 'sesi_peserta',
  progres: 'progres',
  hasilLatihan: 'hasil_latihan',
  tokenReset: 'token_reset',
} as const;

export async function pastikanIndeks(db: Db): Promise<void> {
  await Promise.all([
    db.collection(KOLEKSI.modulVersi).createIndexes([
      { key: { modul_id: 1, versi: 1 }, name: 'versi_unik_per_modul', unique: true },
      {
        // Hanya boleh ada satu versi berstatus "disetujui" per modul.
        key: { modul_id: 1 },
        name: 'satu_disetujui_per_modul',
        unique: true,
        partialFilterExpression: { status: 'disetujui' },
      },
      { key: { status: 1, 'data.urutan': 1 }, name: 'status_urutan' },
    ]),
    db.collection(KOLEKSI.admin).createIndex({ username: 1 }, { unique: true, name: 'username_unik' }),
    db.collection(KOLEKSI.sesi).createIndexes([
      { key: { token_hash: 1 }, name: 'token_unik', unique: true },
      // Sesi kedaluwarsa dihapus otomatis oleh MongoDB.
      { key: { kedaluwarsa: 1 }, name: 'hapus_sesi_kedaluwarsa', expireAfterSeconds: 0 },
    ]),
    db.collection(KOLEKSI.percobaanLogin).createIndexes([
      { key: { kunci: 1, waktu: -1 }, name: 'kunci_waktu' },
      { key: { waktu: 1 }, name: 'hapus_percobaan_lama', expireAfterSeconds: 15 * 60 },
    ]),
    db.collection(KOLEKSI.logAudit).createIndex({ waktu: -1 }, { name: 'waktu_terbaru' }),
    db.collection(KOLEKSI.peserta).createIndex({ email: 1 }, { unique: true, name: 'email_unik' }),
    db.collection(KOLEKSI.sesiPeserta).createIndexes([
      { key: { token_hash: 1 }, name: 'token_unik', unique: true },
      { key: { peserta_id: 1 }, name: 'per_peserta' },
      { key: { kedaluwarsa: 1 }, name: 'hapus_sesi_kedaluwarsa', expireAfterSeconds: 0 },
    ]),
    db.collection(KOLEKSI.progres).createIndex(
      { peserta_id: 1, modul_id: 1, materi: 1 },
      { unique: true, name: 'satu_catatan_per_materi' },
    ),
    db.collection(KOLEKSI.hasilLatihan).createIndex({ peserta_id: 1, waktu: -1 }, { name: 'per_peserta_waktu' }),
    db.collection(KOLEKSI.tokenReset).createIndexes([
      { key: { token_hash: 1 }, name: 'token_unik', unique: true },
      { key: { kedaluwarsa: 1 }, name: 'hapus_token_kedaluwarsa', expireAfterSeconds: 0 },
    ]),
  ]);
}
