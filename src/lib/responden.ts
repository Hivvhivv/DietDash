// Akun responden: daftar mandiri dengan nama + nomor HP, token akses dibuat sistem (PRD v2.0 Bagian 7).
// Token hanya ditampilkan sekali dan disimpan sebagai hash Argon2id; admin pun tidak dapat melihatnya.
import { hash, verify } from '@node-rs/argon2';
import { MongoServerError, ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { alamatIp, catatPercobaan, hapusPercobaan, kunciBatas, sudahDibatasi } from './batas';
import { catatAudit, koleksi, type DokPeserta, type DokResponden, type JenisRiwayatAkun } from './db';
import { dekripsiKode, enkripsiAktif, enkripsiKode } from './kode-akses';
import { buatIdPeserta, buatToken, normalkanNomorHp, normalkanToken, PANJANG_KODE } from './identitas';
import { ambilPengaturan } from './pengaturan';
import { bacaSesi, buatSesi, hapusSemuaSesi, hapusSesiIni } from './sesi';

export const PESAN = {
  namaKosong: 'Silakan isi nama Anda. Nama panggilan juga boleh.',
  namaPanjang: 'Nama terlalu panjang. Tulis 2–50 karakter.',
  nomorTidakValid: 'Nomor HP belum sesuai. Contoh yang benar: 081234567890.',
  nomorTerdaftar: 'Nomor ini sudah punya akun. Silakan masuk. Jika Anda belum pernah mendaftar, hubungi peneliti.',
  belumSimpan: 'Simpan kode akses Anda dulu. Kode ini dibutuhkan saat masuk lagi.',
  salah: 'Nomor HP atau kode akses belum cocok. Periksa kembali kode akses yang Anda simpan.',
  terlaluBanyak: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit atau hubungi peneliti.',
  ditutup: 'Pendaftaran sudah ditutup. Hubungi peneliti jika Anda merasa ini keliru.',
  tidakAktif: 'Akun ini sudah tidak aktif. Hubungi peneliti bila ada pertanyaan.',
  belumSetuju: 'Centang persetujuan penelitian dan kebijakan privasi untuk mendaftar.',
  belumLayak: 'Centang pernyataan kelayakan untuk mendaftar. Bila Anda ragu, hubungi peneliti.',
} as const;

export type Hasil<T = object> = ({ ok: true } & T) | { ok: false; pesan: string; kolom?: string };

export interface RespondenAktif {
  r: DokResponden;
  p: DokPeserta;
}

async function catatRiwayat(id: ObjectId, jenis: JenisRiwayatAkun, oleh: string, alasan?: string) {
  const { riwayatAkun } = await koleksi();
  await riwayatAkun.insertOne({ _id: new ObjectId(), respondent_id: id, jenis, oleh, alasan, waktu: new Date() });
}

export function periksaNama(nama: string): string | null {
  const n = nama.trim();
  if (n.length < 2) return PESAN.namaKosong;
  if (n.length > 50) return PESAN.namaPanjang;
  return null;
}

// Hash untuk masuk + salinan terenkripsi untuk dilihat super admin.
async function kolomKode(token: string, id: ObjectId) {
  return { token_hash: await hash(token), kode_terenkripsi: enkripsiKode(token, id) };
}

// Super admin melihat kode akses responden (membantu yang lupa). Selalu tercatat di log.
export async function lihatKodeAkses(respondentId: ObjectId, adminEmail: string, idPeserta: string): Promise<Hasil<{ kode: string }>> {
  if (!enkripsiAktif()) return { ok: false, pesan: 'Fitur lihat kode belum aktif: atur KUNCI_KODE_AKSES di server.' };
  const { responden } = await koleksi();
  const akun = await responden.findOne({ _id: respondentId }, { projection: { kode_terenkripsi: 1 } });
  const kode = dekripsiKode(akun?.kode_terenkripsi, respondentId);
  if (!kode) return { ok: false, pesan: 'Kode akun ini tidak tersedia (dibuat sebelum fitur ini aktif). Buat kode akses baru dari halaman detail responden.' };
  await catatAudit({ admin: adminEmail, aksi: 'lihat_kode_akses', objek: idPeserta });
  return { ok: true, kode };
}

// ---------- Daftar ----------

export async function daftar(masukan: {
  nama: string;
  nomor: string;
  setuju: boolean;
  layak: boolean;
}): Promise<Hasil<{ token: string; id_peserta: string; nomor_hp: string }>> {
  const atur = await ambilPengaturan();
  if (!atur.pendaftaran_dibuka) return { ok: false, pesan: PESAN.ditutup };

  const galatNama = periksaNama(masukan.nama);
  if (galatNama) return { ok: false, pesan: galatNama, kolom: 'nama' };
  const nomor = normalkanNomorHp(masukan.nomor);
  if (!nomor) return { ok: false, pesan: PESAN.nomorTidakValid, kolom: 'nomor' };
  if (atur.wajib_pernyataan_kelayakan && !masukan.layak) {
    return { ok: false, pesan: PESAN.belumLayak, kolom: 'layak' };
  }
  if (!masukan.setuju) return { ok: false, pesan: PESAN.belumSetuju, kolom: 'setuju' };

  const kunciIp = kunciBatas('daftar-ip', await alamatIp());
  if (await sudahDibatasi([{ kunci: kunciIp, batas: 10 }], 60 * 60 * 1000)) {
    return { ok: false, pesan: PESAN.terlaluBanyak };
  }
  await catatPercobaan([kunciIp]);

  const { responden } = await koleksi();
  if (await responden.findOne({ nomor_hp: nomor })) {
    return { ok: false, pesan: PESAN.nomorTerdaftar, kolom: 'nomor' };
  }

  const h = await buatAkun({ nama: masukan.nama, nomor, layak: masukan.layak, tokenDisimpan: false, sampel: 'responden_penelitian' });
  if (!h.ok) return h;
  await catatRiwayat(h.id, 'token_dibuat', 'responden');
  await buatSesi({ pemilik_id: h.id, jenis: 'responden', ingat: true });
  return { ok: true, token: h.token, id_peserta: h.id_peserta, nomor_hp: nomor };
}

// Menyimpan akun responden baru + ID peserta unik. Dipakai daftar mandiri dan "Tambah Pengguna" oleh super admin.
async function buatAkun(m: {
  nama: string;
  nomor: string;
  layak: boolean;
  tokenDisimpan: boolean;
  sampel: DokPeserta['status_sampel'];
}): Promise<Hasil<{ id: ObjectId; token: string; id_peserta: string }>> {
  const { responden, peserta } = await koleksi();
  const nomor = m.nomor;
  const token = buatToken();
  const sekarang = new Date();
  const id = new ObjectId();
  try {
    await responden.insertOne({
      _id: id,
      nama: m.nama.trim(),
      nomor_hp: nomor,
      token_hash: await hash(token),
      kode_terenkripsi: enkripsiKode(token, id),
      token_disimpan_pada: m.tokenDisimpan ? sekarang : null,
      nomor_terverifikasi_pada: null,
      aktif: true,
      persetujuan_pada: sekarang,
      kelayakan_pada: m.layak ? sekarang : null,
      mundur_pada: null,
      dibuat_pada: sekarang,
      terakhir_aktif: sekarang,
    });
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      return { ok: false, pesan: PESAN.nomorTerdaftar, kolom: 'nomor' };
    }
    throw e;
  }

  // ID peserta unik DS-xxxx; bila sangat penuh, beralih ke 5 digit.
  let idPeserta = '';
  for (let i = 0; i < 40 && !idPeserta; i++) {
    const calon = buatIdPeserta(i < 30 ? 4 : 5);
    try {
      await peserta.insertOne({
        _id: new ObjectId(),
        respondent_id: id,
        id_peserta: calon,
        status_sampel: m.sampel,
        pretest_selesai_pada: null,
      });
      idPeserta = calon;
    } catch (e) {
      if (!(e instanceof MongoServerError && e.code === 11000)) throw e;
    }
  }
  return { ok: true, id, token, id_peserta: idPeserta };
}

// Super admin menambahkan responden (mis. lansia yang dibantu peneliti mendaftar). Kelayakan dan persetujuan
// dinyatakan langsung kepada peneliti; kode akses tampil sekali dan diserahkan langsung ke responden.
export async function tambahRespondenOlehAdmin(
  adminEmail: string,
  masukan: { nama: string; nomor: string; sampel: DokPeserta['status_sampel']; konfirmasi: boolean },
): Promise<Hasil<{ token: string; id_peserta: string; nomor_hp: string }>> {
  const galatNama = periksaNama(masukan.nama);
  if (galatNama) return { ok: false, pesan: galatNama, kolom: 'nama' };
  const nomor = normalkanNomorHp(masukan.nomor);
  if (!nomor) return { ok: false, pesan: PESAN.nomorTidakValid, kolom: 'nomor' };
  if (!masukan.konfirmasi) {
    return { ok: false, pesan: 'Centang konfirmasi bahwa calon responden memenuhi kriteria dan sudah menyetujui ikut penelitian.', kolom: 'konfirmasi' };
  }
  const h = await buatAkun({ nama: masukan.nama, nomor, layak: true, tokenDisimpan: true, sampel: masukan.sampel });
  if (!h.ok) return h.kolom === 'nomor' ? { ok: false, pesan: 'Nomor ini sudah terdaftar sebagai responden. Cari di Manajemen Pengguna untuk melihat akunnya.', kolom: 'nomor' } : h;
  await catatRiwayat(h.id, 'dibuat_admin', adminEmail);
  await catatAudit({ admin: adminEmail, aksi: 'tambah_responden', objek: h.id_peserta, keterangan: masukan.sampel === 'bukan_sampel' ? 'Bukan sampel' : 'Responden penelitian' });
  return { ok: true, token: h.token, id_peserta: h.id_peserta, nomor_hp: nomor };
}

// ---------- Masuk & sesi ----------

export async function masuk(nomorMentah: string, tokenMentah: string, ingat: boolean): Promise<Hasil> {
  const nomor = normalkanNomorHp(nomorMentah);
  const kunciIp = kunciBatas('masuk-ip', await alamatIp());
  const kunciNomor = kunciBatas('masuk-hp', nomor ?? nomorMentah);
  if (await sudahDibatasi([{ kunci: kunciNomor, batas: 5 }, { kunci: kunciIp, batas: 20 }])) {
    return { ok: false, pesan: PESAN.terlaluBanyak };
  }
  const { responden } = await koleksi();
  const akun = nomor ? await responden.findOne({ nomor_hp: nomor }) : null;
  const token = normalkanToken(tokenMentah);
  const cocok = akun && token.length === PANJANG_KODE ? await verify(akun.token_hash, token) : false;
  if (!akun || !cocok) {
    await catatPercobaan([kunciNomor, kunciIp]);
    return { ok: false, pesan: PESAN.salah };
  }
  if (!akun.aktif) return { ok: false, pesan: PESAN.tidakAktif };
  await hapusPercobaan(kunciNomor);
  await responden.updateOne({ _id: akun._id }, { $set: { terakhir_aktif: new Date() } });
  await buatSesi({ pemilik_id: akun._id, jenis: 'responden', ingat });
  return { ok: true };
}

export async function respondenSaatIni(): Promise<RespondenAktif | null> {
  const sesi = await bacaSesi('responden');
  if (!sesi) return null;
  const { responden, peserta } = await koleksi();
  const r = await responden.findOne({ _id: sesi.pemilik_id, aktif: true });
  if (!r) return null;
  const p = await peserta.findOne({ respondent_id: r._id });
  if (!p) return null;
  if (Date.now() - r.terakhir_aktif.getTime() > 5 * 60_000) {
    await responden.updateOne({ _id: r._id }, { $set: { terakhir_aktif: new Date() } });
  }
  return { r, p };
}

// Dipakai di setiap halaman belajar. Responden yang belum mengonfirmasi token diarahkan menyimpannya dulu.
export async function wajibResponden(opsi: { izinkanBelumSimpan?: boolean } = {}): Promise<RespondenAktif> {
  const a = await respondenSaatIni();
  if (!a) redirect('/masuk/');
  if (!opsi.izinkanBelumSimpan && !a.r.token_disimpan_pada) redirect('/simpan-token/');
  return a;
}

export async function keluar(): Promise<void> {
  await hapusSesiIni('responden');
}

// ---------- Token ----------

export async function konfirmasiTokenDisimpan(a: RespondenAktif): Promise<void> {
  const { responden } = await koleksi();
  await responden.updateOne({ _id: a.r._id }, { $set: { token_disimpan_pada: new Date() } });
}

// Hanya untuk token yang belum dikonfirmasi tersimpan (mis. halaman tertutup sebelum mencentang).
export async function buatUlangTokenBelumDisimpan(a: RespondenAktif): Promise<Hasil<{ token: string }>> {
  if (a.r.token_disimpan_pada) return { ok: false, pesan: 'Kode akses Anda sudah tersimpan. Ganti kode dari halaman Profil.' };
  const token = buatToken();
  const { responden } = await koleksi();
  await responden.updateOne({ _id: a.r._id }, { $set: await kolomKode(token, a.r._id) });
  await catatRiwayat(a.r._id, 'token_dibuat', 'responden', 'Dibuat ulang sebelum disimpan');
  return { ok: true, token };
}

export async function gantiToken(a: RespondenAktif, tokenLama: string): Promise<Hasil<{ token: string }>> {
  if (!(await verify(a.r.token_hash, normalkanToken(tokenLama)))) {
    return { ok: false, pesan: 'Kode akses lama belum cocok. Periksa kembali kode yang Anda simpan.', kolom: 'token_lama' };
  }
  const token = buatToken();
  const { responden } = await koleksi();
  await responden.updateOne(
    { _id: a.r._id },
    { $set: { ...(await kolomKode(token, a.r._id)), token_disimpan_pada: null } },
  );
  await hapusSemuaSesi(a.r._id);
  await buatSesi({ pemilik_id: a.r._id, jenis: 'responden', ingat: true });
  await catatRiwayat(a.r._id, 'token_diganti_responden', 'responden');
  return { ok: true, token };
}

export async function gantiNomor(a: RespondenAktif, tokenSaatIni: string, nomorBaru: string): Promise<Hasil> {
  if (!(await verify(a.r.token_hash, normalkanToken(tokenSaatIni)))) {
    return { ok: false, pesan: 'Kode akses belum cocok. Ketik kode yang sedang Anda pakai.', kolom: 'token' };
  }
  const nomor = normalkanNomorHp(nomorBaru);
  if (!nomor) return { ok: false, pesan: PESAN.nomorTidakValid, kolom: 'nomor' };
  if (nomor === a.r.nomor_hp) return { ok: false, pesan: 'Nomor baru sama dengan nomor sekarang.', kolom: 'nomor' };
  const { responden } = await koleksi();
  if (await responden.findOne({ nomor_hp: nomor })) {
    return { ok: false, pesan: 'Nomor ini sudah dipakai akun lain.', kolom: 'nomor' };
  }
  await responden.updateOne({ _id: a.r._id }, { $set: { nomor_hp: nomor, nomor_terverifikasi_pada: null } });
  await catatRiwayat(a.r._id, 'nomor_diganti', 'responden');
  return { ok: true };
}

export async function gantiNama(a: RespondenAktif, nama: string): Promise<Hasil> {
  const galat = periksaNama(nama);
  if (galat) return { ok: false, pesan: galat, kolom: 'nama' };
  const { responden } = await koleksi();
  await responden.updateOne({ _id: a.r._id }, { $set: { nama: nama.trim() } });
  await catatRiwayat(a.r._id, 'nama_diganti', 'responden');
  return { ok: true };
}

export async function mengundurkanDiri(a: RespondenAktif, alasan: string): Promise<void> {
  const { responden } = await koleksi();
  await responden.updateOne({ _id: a.r._id }, { $set: { aktif: false, mundur_pada: new Date() } });
  await catatRiwayat(a.r._id, 'mengundurkan_diri', 'responden', alasan.trim().slice(0, 500) || undefined);
  await hapusSemuaSesi(a.r._id);
  await hapusSesiIni('responden');
}

// ---------- Tindakan admin terhadap akun responden ----------

export async function resetTokenOlehAdmin(respondentId: ObjectId, adminEmail: string, alasan: string): Promise<Hasil<{ token: string }>> {
  if (alasan.trim().length < 5) return { ok: false, pesan: 'Tulis alasan membuat kode akses baru (minimal 5 karakter).', kolom: 'alasan' };
  const { responden, peserta } = await koleksi();
  const akun = await responden.findOne({ _id: respondentId });
  if (!akun) return { ok: false, pesan: 'Responden tidak ditemukan.' };
  const token = buatToken();
  await responden.updateOne({ _id: respondentId }, { $set: await kolomKode(token, respondentId) });
  await hapusSemuaSesi(respondentId);
  await catatRiwayat(respondentId, 'token_direset_admin', adminEmail, alasan.trim());
  const p = await peserta.findOne({ respondent_id: respondentId });
  await catatAudit({ admin: adminEmail, aksi: 'reset_token', objek: p?.id_peserta, alasan: alasan.trim() });
  return { ok: true, token };
}

export async function ubahStatusAkun(respondentId: ObjectId, aktif: boolean, adminEmail: string, alasan: string): Promise<Hasil> {
  if (alasan.trim().length < 5) return { ok: false, pesan: 'Tulis alasan (minimal 5 karakter).', kolom: 'alasan' };
  const { responden, peserta } = await koleksi();
  await responden.updateOne({ _id: respondentId }, { $set: { aktif } });
  if (!aktif) await hapusSemuaSesi(respondentId);
  await catatRiwayat(respondentId, aktif ? 'diaktifkan' : 'dinonaktifkan', adminEmail, alasan.trim());
  const p = await peserta.findOne({ respondent_id: respondentId });
  await catatAudit({ admin: adminEmail, aksi: aktif ? 'aktifkan_responden' : 'nonaktifkan_responden', objek: p?.id_peserta, alasan: alasan.trim() });
  return { ok: true };
}
