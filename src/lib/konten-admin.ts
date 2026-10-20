// Operasi konten untuk admin. Setiap fungsi di sini mengasumsikan pemanggil SUDAH lolos wajibAdmin().
//
// Aturan versi:
// - Hanya versi berstatus "draf" yang boleh diubah atau dihapus.
// - Menyetujui draf mengarsipkan versi yang sedang tayang; arsip tidak pernah dihapus,
//   supaya selalu bisa ditelusuri konten apa yang pernah diterima responden.
import { ObjectId } from 'mongodb';
import { ambilKlien, catatAudit, koleksi, type DokVersiModul } from './db';
import type { DataModul } from './skema';
import type { AdminAktif } from './auth';

export type HasilAksi = { ok: true; versiId?: string } | { ok: false; pesan: string };

export interface RingkasanAdminModul {
  modul_id: string;
  judul: string;
  urutan: number;
  versi_tayang?: string;
  jumlah_draf: number;
}

export async function daftarModulAdmin(): Promise<RingkasanAdminModul[]> {
  const { modulVersi } = await koleksi();
  const semua = await modulVersi
    .find({ status: { $in: ['draf', 'disetujui'] } }, { projection: { isi: 0 } })
    .sort({ dibuat_pada: -1 })
    .toArray();

  const peta = new Map<string, RingkasanAdminModul>();
  for (const v of semua) {
    const r = peta.get(v.modul_id) ?? {
      modul_id: v.modul_id,
      judul: v.data.judul,
      urutan: v.data.urutan,
      jumlah_draf: 0,
    };
    if (v.status === 'disetujui') {
      r.versi_tayang = v.versi;
      r.judul = v.data.judul;
      r.urutan = v.data.urutan;
    } else {
      r.jumlah_draf++;
    }
    peta.set(v.modul_id, r);
  }
  return [...peta.values()].sort((a, b) => a.urutan - b.urutan || a.judul.localeCompare(b.judul));
}

export async function daftarVersi(modulId: string): Promise<DokVersiModul[]> {
  const { modulVersi } = await koleksi();
  return modulVersi.find({ modul_id: modulId }, { projection: { isi: 0 } }).sort({ dibuat_pada: -1 }).toArray();
}

export async function ambilVersi(id: ObjectId): Promise<DokVersiModul | null> {
  const { modulVersi } = await koleksi();
  return modulVersi.findOne({ _id: id });
}

function naikkanVersi(versi: string): string {
  const [a, b, c] = versi.split('.').map(Number);
  return `${a}.${b}.${c + 1}`;
}

export async function usulanVersiBaru(modulId: string): Promise<string> {
  const { modulVersi } = await koleksi();
  const ada = new Set((await modulVersi.find({ modul_id: modulId }).toArray()).map((v) => v.versi));
  let usulan = '0.1.0';
  const terbaru = await modulVersi.find({ modul_id: modulId }).sort({ dibuat_pada: -1 }).limit(1).next();
  if (terbaru) usulan = naikkanVersi(terbaru.versi);
  while (ada.has(usulan)) usulan = naikkanVersi(usulan);
  return usulan;
}

export async function buatDrafDari(sumberId: ObjectId, admin: AdminAktif): Promise<HasilAksi> {
  const { modulVersi } = await koleksi();
  const sumber = await modulVersi.findOne({ _id: sumberId });
  if (!sumber) return { ok: false, pesan: 'Versi sumber tidak ditemukan.' };

  const sekarang = new Date();
  const dok: DokVersiModul = {
    _id: new ObjectId(),
    modul_id: sumber.modul_id,
    versi: await usulanVersiBaru(sumber.modul_id),
    status: 'draf',
    data: sumber.data,
    isi: sumber.isi,
    catatan: '',
    dibuat_oleh: admin.username,
    dibuat_pada: sekarang,
    diubah_pada: sekarang,
  };
  await modulVersi.insertOne(dok);
  await catatAudit({
    admin: admin.username,
    aksi: 'buat_draf',
    modul_id: dok.modul_id,
    versi: dok.versi,
    keterangan: `Disalin dari versi ${sumber.versi}`,
  });
  return { ok: true, versiId: dok._id.toHexString() };
}

export interface MasukanDraf {
  versi: string;
  data: DataModul;
  isi: string;
  catatan: string;
}

export async function simpanDraf(
  id: ObjectId,
  masukan: MasukanDraf,
  admin: AdminAktif,
): Promise<HasilAksi> {
  const { modulVersi } = await koleksi();
  const lama = await modulVersi.findOne({ _id: id });
  if (!lama) return { ok: false, pesan: 'Draf tidak ditemukan.' };
  if (lama.status !== 'draf') {
    return { ok: false, pesan: 'Versi ini sudah disetujui atau diarsipkan, jadi tidak bisa diubah. Buat draf baru.' };
  }
  const bentrok = await modulVersi.findOne({ modul_id: lama.modul_id, versi: masukan.versi, _id: { $ne: id } });
  if (bentrok) return { ok: false, pesan: `Versi ${masukan.versi} sudah dipakai di modul ini. Gunakan nomor lain.` };

  const hasil = await modulVersi.updateOne(
    { _id: id, status: 'draf' },
    { $set: { ...masukan, diubah_pada: new Date() } },
  );
  if (hasil.matchedCount === 0) return { ok: false, pesan: 'Draf berubah status saat disimpan. Muat ulang halaman.' };
  await catatAudit({ admin: admin.username, aksi: 'ubah_draf', modul_id: lama.modul_id, versi: masukan.versi });
  return { ok: true, versiId: id.toHexString() };
}

export async function buatModulBaru(
  modulId: string,
  masukan: MasukanDraf,
  admin: AdminAktif,
): Promise<HasilAksi> {
  const { modulVersi } = await koleksi();
  if (await modulVersi.findOne({ modul_id: modulId })) {
    return { ok: false, pesan: `ID modul "${modulId}" sudah dipakai. Pilih ID lain.` };
  }
  const sekarang = new Date();
  const dok: DokVersiModul = {
    _id: new ObjectId(),
    modul_id: modulId,
    status: 'draf',
    ...masukan,
    dibuat_oleh: admin.username,
    dibuat_pada: sekarang,
    diubah_pada: sekarang,
  };
  await modulVersi.insertOne(dok);
  await catatAudit({ admin: admin.username, aksi: 'buat_modul', modul_id: modulId, versi: masukan.versi });
  return { ok: true, versiId: dok._id.toHexString() };
}

export async function hapusDraf(id: ObjectId, admin: AdminAktif): Promise<HasilAksi> {
  const { modulVersi } = await koleksi();
  const dok = await modulVersi.findOneAndDelete({ _id: id, status: 'draf' });
  if (!dok) return { ok: false, pesan: 'Hanya draf yang bisa dihapus.' };
  await catatAudit({ admin: admin.username, aksi: 'hapus_draf', modul_id: dok.modul_id, versi: dok.versi });
  return { ok: true };
}

export async function setujuiDraf(id: ObjectId, admin: AdminAktif): Promise<HasilAksi> {
  if (admin.peran !== 'peneliti') {
    return { ok: false, pesan: 'Hanya admin berperan peneliti yang dapat menyetujui versi.' };
  }
  const { modulVersi } = await koleksi();
  const draf = await modulVersi.findOne({ _id: id });
  if (!draf || draf.status !== 'draf') return { ok: false, pesan: 'Hanya draf yang bisa disetujui.' };
  if (!draf.catatan.trim()) {
    return { ok: false, pesan: 'Isi "catatan perubahan" pada draf sebelum menyetujuinya.' };
  }

  const urutanBentrok = await modulVersi.findOne({
    status: 'disetujui',
    'data.urutan': draf.data.urutan,
    modul_id: { $ne: draf.modul_id },
  });
  if (urutanBentrok) {
    return {
      ok: false,
      pesan: `Urutan ${draf.data.urutan} sudah dipakai oleh modul "${urutanBentrok.data.judul}". Ubah urutan pada draf.`,
    };
  }

  const klien = await ambilKlien();
  const sesi = klien.startSession();
  let versiLama: string | undefined;
  try {
    await sesi.withTransaction(async () => {
      const lama = await modulVersi.findOneAndUpdate(
        { modul_id: draf.modul_id, status: 'disetujui' },
        { $set: { status: 'diarsipkan' } },
        { session: sesi },
      );
      versiLama = lama?.versi;
      const hasil = await modulVersi.updateOne(
        { _id: id, status: 'draf' },
        { $set: { status: 'disetujui', disetujui_oleh: admin.username, disetujui_pada: new Date() } },
        { session: sesi },
      );
      if (hasil.matchedCount === 0) throw new Error('Draf berubah status saat disetujui.');
    });
  } finally {
    await sesi.endSession();
  }

  await catatAudit({
    admin: admin.username,
    aksi: 'setujui',
    modul_id: draf.modul_id,
    versi: draf.versi,
    keterangan: versiLama ? `Menggantikan versi ${versiLama}. ${draf.catatan}` : draf.catatan,
  });
  return { ok: true, versiId: id.toHexString() };
}

export async function ambilLogAudit(batas = 200) {
  const { logAudit } = await koleksi();
  return logAudit.find({}).sort({ waktu: -1 }).limit(batas).toArray();
}
