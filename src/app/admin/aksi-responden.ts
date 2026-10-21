'use server';

// Pengelolaan akun responden, buka kunci manual, dan pengaturan (PRD 10.6, 11.2).
import { revalidatePath } from 'next/cache';
import { wajibAdmin } from '@/lib/admin-auth';
import { catatAudit, koleksi } from '@/lib/db';
import { formatNomorHp, formatToken } from '@/lib/identitas';
import { strukturAktif } from '@/lib/konten';
import { simpanPengaturan } from '@/lib/pengaturan';
import { bukaKunciManual } from '@/lib/progres';
import { resetTokenOlehAdmin, ubahStatusAkun } from '@/lib/responden';

export interface StatusAksiAdmin {
  pesan?: string;
  sukses?: string;
  token?: string;
  nomor?: string;
}

const teks = (fd: FormData, k: string) => String(fd.get(k) ?? '');

async function cariResponden(idPeserta: string) {
  const { peserta } = await koleksi();
  return peserta.findOne({ id_peserta: idPeserta });
}

export async function aksiResetToken(_: StatusAksiAdmin | undefined, fd: FormData): Promise<StatusAksiAdmin> {
  const admin = await wajibAdmin();
  const p = await cariResponden(teks(fd, 'id_peserta'));
  if (!p) return { pesan: 'Responden tidak ditemukan.' };
  const h = await resetTokenOlehAdmin(p.respondent_id, admin.email, teks(fd, 'alasan'));
  if (!h.ok) return { pesan: h.pesan };
  return { sukses: 'Kode akses baru dibuat. Sampaikan langsung ke nomor HP terdaftar. Kode ini tidak akan ditampilkan lagi.', token: formatToken(h.token) };
}

export async function aksiStatusAkun(_: StatusAksiAdmin | undefined, fd: FormData): Promise<StatusAksiAdmin> {
  const admin = await wajibAdmin();
  const p = await cariResponden(teks(fd, 'id_peserta'));
  if (!p) return { pesan: 'Responden tidak ditemukan.' };
  const h = await ubahStatusAkun(p.respondent_id, teks(fd, 'aktif') === 'ya', admin.email, teks(fd, 'alasan'));
  if (!h.ok) return { pesan: h.pesan };
  revalidatePath(`/admin/responden/${p.id_peserta}/`);
  return { sukses: 'Status akun tersimpan.' };
}

export async function aksiStatusSampel(_: StatusAksiAdmin | undefined, fd: FormData): Promise<StatusAksiAdmin> {
  const admin = await wajibAdmin();
  const p = await cariResponden(teks(fd, 'id_peserta'));
  if (!p) return { pesan: 'Responden tidak ditemukan.' };
  const status = teks(fd, 'status') === 'bukan_sampel' ? 'bukan_sampel' : 'responden_penelitian';
  const { peserta } = await koleksi();
  await peserta.updateOne({ _id: p._id }, { $set: { status_sampel: status } });
  await catatAudit({ admin: admin.email, aksi: 'ubah_status_sampel', objek: p.id_peserta, keterangan: status, alasan: teks(fd, 'alasan') || undefined });
  revalidatePath(`/admin/responden/${p.id_peserta}/`);
  return { sukses: 'Status sampel tersimpan.' };
}

export async function aksiPretest(_: StatusAksiAdmin | undefined, fd: FormData): Promise<StatusAksiAdmin> {
  const admin = await wajibAdmin();
  const p = await cariResponden(teks(fd, 'id_peserta'));
  if (!p) return { pesan: 'Responden tidak ditemukan.' };
  const selesai = teks(fd, 'selesai') === 'ya';
  const { peserta } = await koleksi();
  await peserta.updateOne({ _id: p._id }, { $set: { pretest_selesai_pada: selesai ? new Date() : null } });
  await catatAudit({ admin: admin.email, aksi: selesai ? 'tandai_pretest_selesai' : 'batalkan_tanda_pretest', objek: p.id_peserta });
  revalidatePath(`/admin/responden/${p.id_peserta}/`);
  return { sukses: selesai ? 'Pretest ditandai selesai.' : 'Tanda pretest dibatalkan.' };
}

export async function aksiBukaKunci(_: StatusAksiAdmin | undefined, fd: FormData): Promise<StatusAksiAdmin> {
  const admin = await wajibAdmin();
  const p = await cariResponden(teks(fd, 'id_peserta'));
  const s = await strukturAktif();
  if (!p || !s) return { pesan: 'Responden atau konten aktif tidak ditemukan.' };
  const m = s.materi.find((x) => x.kunci === teks(fd, 'materi'));
  if (!m) return { pesan: 'Pilih materi yang ingin dibuka.' };
  const h = await bukaKunciManual(p.respondent_id, m.kunci, s.versi._id, admin.email, teks(fd, 'alasan'), p.id_peserta);
  if (!h.ok) return { pesan: h.pesan };
  revalidatePath(`/admin/responden/${p.id_peserta}/`);
  return { sukses: `Materi ${m.nomor} dibuka untuk ${p.id_peserta}.` };
}

// Nomor HP lengkap hanya tampil setelah diklik dan tercatat di log (PRD 11.2).
export async function aksiLihatNomor(_: StatusAksiAdmin | undefined, fd: FormData): Promise<StatusAksiAdmin> {
  const admin = await wajibAdmin();
  const p = await cariResponden(teks(fd, 'id_peserta'));
  if (!p) return { pesan: 'Responden tidak ditemukan.' };
  const { responden } = await koleksi();
  const r = await responden.findOne({ _id: p.respondent_id }, { projection: { nomor_hp: 1 } });
  if (!r) return { pesan: 'Responden tidak ditemukan.' };
  await catatAudit({ admin: admin.email, aksi: 'lihat_nomor_lengkap', objek: p.id_peserta });
  return { nomor: formatNomorHp(r.nomor_hp) };
}

export async function aksiPengaturan(_: StatusAksiAdmin | undefined, fd: FormData): Promise<StatusAksiAdmin> {
  const admin = await wajibAdmin();
  const angka = (k: string, min: number, maks: number, bawaan: number) => {
    const n = Math.round(Number(teks(fd, k)));
    return Number.isFinite(n) && n >= min && n <= maks ? n : bawaan;
  };
  const ubah = {
    pendaftaran_dibuka: fd.get('pendaftaran_dibuka') === 'ya',
    batas_tidak_aktif_hari: angka('batas_tidak_aktif_hari', 1, 90, 7),
    batas_intervensi_hari: angka('batas_intervensi_hari', 1, 180, 14),
    wajib_pernyataan_kelayakan: fd.get('wajib_pernyataan_kelayakan') === 'ya',
    gerbang_pretest: fd.get('gerbang_pretest') === 'ya',
    nomor_whatsapp_peneliti: teks(fd, 'nomor_whatsapp_peneliti').replace(/[^\d+]/g, '').slice(0, 20),
  };
  await simpanPengaturan(ubah, admin.email);
  await catatAudit({ admin: admin.email, aksi: 'ubah_pengaturan', keterangan: `Pendaftaran ${ubah.pendaftaran_dibuka ? 'dibuka' : 'ditutup'}; tidak aktif ${ubah.batas_tidak_aktif_hari} hari; intervensi ${ubah.batas_intervensi_hari} hari; kelayakan ${ubah.wajib_pernyataan_kelayakan ? 'wajib' : 'tidak'}; gerbang pretest ${ubah.gerbang_pretest ? 'aktif' : 'tidak'}` });
  revalidatePath('/', 'layout');
  return { sukses: 'Pengaturan tersimpan.' };
}
