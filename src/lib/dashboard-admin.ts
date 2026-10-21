// Data tambahan dashboard admin: jumlah konten, aktivitas terbaru, dan penggunaan harian.
// Penggunaan harian dihitung dari catatan belajar yang sudah ada (tanpa pelacakan baru).
import { koleksi, type DokLogAudit } from './db';
import { ambilStruktur, versiAktif } from './konten';
import { versiKerja } from './konten-admin';
import { daftarResponden } from './monitor';

const ZONA = 'Asia/Jakarta';
const HARI_MS = 86_400_000;
const kunciHari = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: ZONA }); // YYYY-MM-DD

// ---------- Jumlah konten ----------

export async function jumlahKonten() {
  const v = (await versiAktif()) ?? (await versiKerja());
  const s = v ? await ambilStruktur(v._id) : null;
  return {
    label: v?.label ?? null,
    aktif: !!v && (v.status === 'terbit' || v.status === 'dikunci'),
    contoh: !!v?.contoh,
    modul: s?.modul.length ?? 0,
    materi: s?.materi.length ?? 0,
    soal: s?.materi.reduce((n, m) => n + (m.kuis?.jumlah_soal ?? 0), 0) ?? 0,
  };
}

// ---------- Aktivitas terbaru ----------

export type JenisAktivitas = 'konten' | 'kuis' | 'pengguna' | 'versi' | 'data' | 'akun';

export interface Aktivitas {
  teks: string;
  waktu: Date;
  jenis: JenisAktivitas;
}

const kutip = (s?: string) => (s ? `“${s}”` : '');

// Kalimat untuk setiap aksi di log. Aksi lain memakai nama aksinya apa adanya.
const KALIMAT: Record<string, (e: DokLogAudit) => [string, JenisAktivitas]> = {
  buat_modul: (e) => [`Modul ${kutip(e.objek)} dibuat`, 'konten'],
  ubah_modul: (e) => [`Modul ${kutip(e.objek)} diperbarui`, 'konten'],
  hapus_modul: (e) => [`Modul ${kutip(e.objek)} dihapus`, 'konten'],
  arsipkan_modul: (e) => [`Modul ${kutip(e.objek)} diarsipkan`, 'konten'],
  buat_materi: (e) => [`Materi ${kutip(e.objek)} dibuat`, 'konten'],
  ubah_materi: (e) => [`Materi ${kutip(e.objek)} diperbarui`, 'konten'],
  hapus_materi: (e) => [`Materi ${kutip(e.objek)} dihapus`, 'konten'],
  arsipkan_materi: (e) => [`Materi ${kutip(e.objek)} diarsipkan`, 'konten'],
  buat_soal: () => ['Pertanyaan kuis baru ditambahkan', 'kuis'],
  ubah_soal: () => ['Pertanyaan kuis diperbarui', 'kuis'],
  hapus_soal: () => ['Pertanyaan kuis dihapus', 'kuis'],
  benih_konten_contoh: (e) => [`Konten contoh diimpor dan diterbitkan (${e.keterangan ?? ''})`, 'versi'],
  hapus_konten_contoh: () => ['Konten contoh dihapus', 'versi'],
  duplikat_soal: () => ['Pertanyaan kuis diduplikasi', 'kuis'],
  ubah_kuis: (e) => [`Pengaturan ${e.objek ?? 'kuis'} diperbarui`, 'kuis'],
  terapkan_mode_kuis: (e) => [`Aturan selesai kuis diubah (${e.keterangan ?? ''})`, 'kuis'],
  buat_versi_kerja: () => ['Versi kerja konten dibuat', 'versi'],
  buat_versi_perbaikan: (e) => [`Versi perbaikan dibuat dari ${e.objek ?? 'versi terkunci'}`, 'versi'],
  tandai_siap_ditinjau: (e) => [`${e.objek ?? 'Versi'} ditandai siap ditinjau`, 'versi'],
  terbitkan_versi: (e) => [`${e.objek ?? 'Versi'} diterbitkan`, 'versi'],
  kunci_versi: (e) => [`Versi ${e.objek ?? ''} dikunci untuk penelitian`, 'versi'],
  benih_konten: (e) => [`Konten awal diimpor (${e.keterangan ?? ''})`, 'versi'],
  benih_konten_terbit_uji: (e) => [`Konten uji diimpor dan diterbitkan (${e.keterangan ?? ''})`, 'versi'],
  buat_super_admin: (e) => [`Super admin dibuat (${e.objek ?? ''})`, 'akun'],
  reset_token: (e) => [`Kode akses baru dibuat untuk ${e.objek ?? 'responden'}`, 'pengguna'],
  buka_kunci_manual: (e) => [`Materi dibuka manual untuk ${e.objek ?? 'responden'}`, 'pengguna'],
  ubah_status_sampel: (e) => [`Status sampel ${e.objek ?? ''} diubah`, 'pengguna'],
  ekspor_data: () => ['Data penelitian diekspor', 'data'],
  ubah_pengaturan: () => ['Pengaturan penelitian diubah', 'data'],
  undang_admin: (e) => [`Admin baru diundang (${e.objek ?? ''})`, 'akun'],
  terima_undangan: () => ['Admin baru bergabung', 'akun'],
};

// Aksi rutin yang tidak perlu tampil di ringkasan (tetap ada di Log Aktivitas).
const ABAIKAN = new Set(['masuk', 'keluar', 'gagal_masuk', 'aktifkan_2fa', 'lihat_nomor_lengkap', 'unggah_gambar', 'unduh_log', 'urutkan_modul', 'urutkan_materi']);

export async function aktivitasTerbaru(jumlah = 5): Promise<Aktivitas[]> {
  const k = await koleksi();
  const [log, baru] = await Promise.all([
    k.logAudit.find({ aksi: { $nin: [...ABAIKAN] } }).sort({ waktu: -1 }).limit(jumlah * 2).toArray(),
    k.responden.find({}, { projection: { dibuat_pada: 1 } }).sort({ dibuat_pada: -1 }).limit(jumlah).toArray(),
  ]);
  const idPeserta = new Map(
    (await k.peserta.find({ respondent_id: { $in: baru.map((r) => r._id) } }).toArray()).map((p) => [p.respondent_id.toHexString(), p.id_peserta]),
  );
  const daftar: Aktivitas[] = [
    ...log.map((e) => {
      const [teks, jenis] = KALIMAT[e.aksi]?.(e) ?? [`${e.aksi.replaceAll('_', ' ')}${e.objek ? ` — ${e.objek}` : ''}`, 'data' as const];
      return { teks, waktu: e.waktu, jenis };
    }),
    ...baru.map((r) => ({
      teks: `Responden baru mendaftar (${idPeserta.get(r._id.toHexString()) ?? 'ID belum ada'})`,
      waktu: r.dibuat_pada,
      jenis: 'pengguna' as const,
    })),
  ];
  return daftar.sort((a, b) => b.waktu.getTime() - a.waktu.getTime()).slice(0, jumlah);
}

// ---------- Penggunaan harian ----------

export interface TitikHarian {
  tanggal: string; // YYYY-MM-DD (WIB)
  label: string; // "21 Okt"
  aktif: number;
}

// Responden penelitian yang punya kegiatan belajar tercatat pada hari itu:
// mendaftar, membuka materi pertama kali, menyelesaikan materi, memulai atau menjawab kuis.
export async function penggunaanHarian(hari: number): Promise<TitikHarian[]> {
  const k = await koleksi();
  const mulai = new Date(Date.now() - (hari - 1) * HARI_MS);
  const batas = new Date(`${kunciHari(mulai)}T00:00:00+07:00`);
  const sampel = new Set(
    (await k.peserta.find({ status_sampel: 'responden_penelitian' }, { projection: { respondent_id: 1 } }).toArray()).map((p) => p.respondent_id.toHexString()),
  );
  const perHari = new Map<string, Set<string>>();
  const catat = (id: string, d: Date | null | undefined) => {
    if (!d || d < batas || !sampel.has(id)) return;
    const h = kunciHari(d);
    if (!perHari.has(h)) perHari.set(h, new Set());
    perHari.get(h)!.add(id);
  };
  const [responden, progres, percobaan] = await Promise.all([
    k.responden.find({ dibuat_pada: { $gte: batas } }, { projection: { dibuat_pada: 1 } }).toArray(),
    k.progres.find({ $or: [{ dibuka_pada: { $gte: batas } }, { selesai_pada: { $gte: batas } }] }).toArray(),
    k.percobaan.find({ $or: [{ mulai_pada: { $gte: batas } }, { 'jawaban.dijawab_pada': { $gte: batas } }] }).toArray(),
  ]);
  for (const r of responden) catat(r._id.toHexString(), r.dibuat_pada);
  for (const p of progres) {
    catat(p.respondent_id.toHexString(), p.dibuka_pada);
    catat(p.respondent_id.toHexString(), p.selesai_pada);
  }
  for (const x of percobaan) {
    catat(x.respondent_id.toHexString(), x.mulai_pada);
    for (const j of x.jawaban) catat(x.respondent_id.toHexString(), j.dijawab_pada);
  }
  return Array.from({ length: hari }, (_, i) => {
    const d = new Date(batas.getTime() + i * HARI_MS + 12 * 3_600_000);
    const tanggal = kunciHari(d);
    return {
      tanggal,
      label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: ZONA }),
      aktif: perHari.get(tanggal)?.size ?? 0,
    };
  });
}

// Jumlah responden penelitian aktif yang perlu perhatian (tidak aktif / mendekati batas intervensi), untuk lonceng.
export async function jumlahPerluPerhatian(): Promise<number> {
  const { baris } = await daftarResponden();
  return baris.filter((b) => b.status_sampel === 'responden_penelitian' && b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas)).length;
}

export function waktuRelatif(d: Date, sekarang = Date.now()): string {
  const detik = Math.round((d.getTime() - sekarang) / 1000);
  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
  const abs = Math.abs(detik);
  if (abs < 60) return 'baru saja';
  if (abs < 3600) return rtf.format(Math.round(detik / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(detik / 3600), 'hour');
  if (abs < 30 * 86_400) return rtf.format(Math.round(detik / 86_400), 'day');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: ZONA });
}
