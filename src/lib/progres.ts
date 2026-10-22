// Progres berurutan responden (PRD v2.0 Bagian 6, disesuaikan keputusan peneliti 2026-10-22: tanpa kuis).
// Materi dianggap selesai saat dibuka; materi berikutnya terbuka hanya setelah materi sebelumnya dibuka —
// diperiksa di server. Progres memakai kunci materi yang stabil lintas versi dan mencatat versi konten yang dipakai.
import { ObjectId } from 'mongodb';
import { catatAudit, koleksi, type DokProgresMateri } from './db';
import type { MateriTerurut, StrukturVersi } from './konten';
import { ambilPengaturan } from './pengaturan';
import type { RespondenAktif } from './responden';

export type StatusMateri = 'terkunci' | 'tersedia' | 'selesai';

export interface StatusPerMateri {
  materi: MateriTerurut;
  status: StatusMateri;
  alasan_kunci?: 'materi_sebelumnya' | 'pretest';
  progres: DokProgresMateri | null;
}

export interface RingkasanBelajar {
  daftar: StatusPerMateri[];
  selesai: number;
  total: number;
  persen: number;
  lanjut: { url: string; label: string; materi: MateriTerurut } | null; // null = semua selesai
}

export async function hitungStatus(respondentId: ObjectId, struktur: StrukturVersi, pretestSelesai: boolean): Promise<RingkasanBelajar> {
  const { progres } = await koleksi();
  const [daftarProgres, atur] = await Promise.all([progres.find({ respondent_id: respondentId }).toArray(), ambilPengaturan()]);
  return susunStatus(struktur, daftarProgres, atur.gerbang_pretest, pretestSelesai);
}

// Materi selesai bila sudah dibuka (data lama tanpa selesai_pada tetap dihitung dari dibuka_pada).
export const sudahSelesai = (p: DokProgresMateri | null | undefined) => !!(p?.selesai_pada || p?.dibuka_pada);

// Fungsi murni: dipakai untuk satu responden maupun dashboard (banyak responden sekaligus).
export function susunStatus(
  struktur: StrukturVersi,
  daftarProgres: DokProgresMateri[],
  gerbangPretest: boolean,
  pretestSelesai: boolean,
): RingkasanBelajar {
  const peta = new Map(daftarProgres.map((p) => [p.materi_kunci, p]));
  const daftar: StatusPerMateri[] = [];
  struktur.materi.forEach((m, i) => {
    const p = peta.get(m.kunci) ?? null;
    const sebelumSelesai = i === 0 ? true : daftar[i - 1].status === 'selesai';
    const gerbang = i === 0 && gerbangPretest && !pretestSelesai;
    let status: StatusMateri;
    let alasan: StatusPerMateri['alasan_kunci'];
    if (sudahSelesai(p)) status = 'selesai';
    else if (p?.buka_manual || (sebelumSelesai && !gerbang)) status = 'tersedia';
    else {
      status = 'terkunci';
      alasan = gerbang ? 'pretest' : 'materi_sebelumnya';
    }
    daftar.push({ materi: m, status, alasan_kunci: alasan, progres: p });
  });

  const selesai = daftar.filter((d) => d.status === 'selesai').length;
  const berikut = daftar.find((d) => d.status === 'tersedia');
  let lanjut: RingkasanBelajar['lanjut'] = null;
  if (berikut) {
    const m = berikut.materi;
    lanjut = { url: `/belajar/materi/${m.kunci}/`, label: `Mulai Materi ${m.nomor}`, materi: m };
  } else if (selesai < daftar.length) {
    // Masih ada materi terkunci (mis. menunggu pretest): arahkan ke dashboard.
    const m = daftar[selesai].materi;
    lanjut = { url: '/belajar/', label: 'Lihat dashboard', materi: m };
  }
  return {
    daftar,
    selesai,
    total: daftar.length,
    persen: daftar.length ? Math.round((selesai / daftar.length) * 100) : 0,
    lanjut,
  };
}

export async function statusResponden(a: RespondenAktif, struktur: StrukturVersi) {
  return hitungStatus(a.r._id, struktur, !!a.p.pretest_selesai_pada);
}

// Membuka materi = materi selesai. `baru` true bila materi baru saja selesai (materi berikutnya ikut terbuka).
export async function tandaiDibuka(a: RespondenAktif, struktur: StrukturVersi, materiKunci: string): Promise<{ ok: boolean; baru: boolean }> {
  const r = await statusResponden(a, struktur);
  const s = r.daftar.find((d) => d.materi.kunci === materiKunci);
  if (!s || s.status === 'terkunci') return { ok: false, baru: false };
  const { progres } = await koleksi();
  const sekarang = new Date();
  if (s.progres) {
    const u = await progres.updateOne(
      { _id: s.progres._id, selesai_pada: null },
      { $set: { dibuka_pada: s.progres.dibuka_pada ?? sekarang, selesai_pada: sekarang, versi_selesai_id: struktur.versi._id } },
    );
    return { ok: true, baru: u.modifiedCount > 0 };
  }
  try {
    await progres.insertOne({
      _id: new ObjectId(),
      respondent_id: a.r._id,
      materi_kunci: materiKunci,
      version_id: struktur.versi._id,
      dibuka_pada: sekarang,
      selesai_pada: sekarang,
      versi_selesai_id: struktur.versi._id,
      detik_baca: 0,
      buka_manual: null,
    });
    return { ok: true, baru: true };
  } catch {
    // Sudah dibuat oleh permintaan lain yang bersamaan.
    return { ok: true, baru: false };
  }
}

// Lama membaca: hanya dikirim saat halaman aktif dan ada interaksi dalam 5 menit terakhir (dibatasi per kiriman).
export async function tambahDetikBaca(respondentId: ObjectId, materiKunci: string, detik: number): Promise<void> {
  const d = Math.max(0, Math.min(60, Math.round(detik)));
  if (!d) return;
  const { progres } = await koleksi();
  await progres.updateOne(
    { respondent_id: respondentId, materi_kunci: materiKunci, dibuka_pada: { $ne: null } },
    { $inc: { detik_baca: d } },
  );
}

// ---------- Tindakan admin ----------

export async function bukaKunciManual(respondentId: ObjectId, materiKunci: string, versionId: ObjectId, adminEmail: string, alasan: string, idPeserta: string) {
  if (alasan.trim().length < 5) return { ok: false as const, pesan: 'Tulis alasan membuka kunci (minimal 5 karakter).' };
  const { progres } = await koleksi();
  await progres.updateOne(
    { respondent_id: respondentId, materi_kunci: materiKunci },
    {
      $set: { buka_manual: { oleh: adminEmail, alasan: alasan.trim(), waktu: new Date() } },
      $setOnInsert: { _id: new ObjectId(), version_id: versionId, dibuka_pada: null, selesai_pada: null, versi_selesai_id: null, detik_baca: 0 },
    },
    { upsert: true },
  );
  await catatAudit({ admin: adminEmail, aksi: 'buka_kunci_manual', objek: `${idPeserta} · materi ${materiKunci}`, alasan: alasan.trim() });
  return { ok: true as const };
}
