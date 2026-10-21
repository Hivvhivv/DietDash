// Pengaturan aplikasi (app_settings). Nilai bawaan mengikuti saran PRD v2.0;
// keputusan terbuka di Bagian 20 dapat diubah peneliti tanpa mengubah kode.
import { koleksi, type DokPengaturan } from './db';

export const PENGATURAN_BAWAAN: Omit<DokPengaturan, '_id' | 'diubah_pada' | 'diubah_oleh'> = {
  pendaftaran_dibuka: true,
  batas_tidak_aktif_hari: 7,
  batas_intervensi_hari: 14,
  wajib_pernyataan_kelayakan: true,
  gerbang_pretest: false,
  mode_kuis_bawaan: 'A',
  batas_lulus_bawaan: 70,
  nomor_whatsapp_peneliti: '',
  versi_aktif_id: null,
};

export async function ambilPengaturan(): Promise<DokPengaturan> {
  const { pengaturan } = await koleksi();
  const dok = await pengaturan.findOne({ _id: 'utama' });
  return {
    _id: 'utama',
    diubah_pada: new Date(0),
    diubah_oleh: 'sistem',
    ...PENGATURAN_BAWAAN,
    ...(dok ?? {}),
  };
}

export async function simpanPengaturan(
  ubah: Partial<Omit<DokPengaturan, '_id'>>,
  oleh: string,
): Promise<void> {
  const { pengaturan } = await koleksi();
  await pengaturan.updateOne(
    { _id: 'utama' },
    {
      $set: { ...ubah, diubah_pada: new Date(), diubah_oleh: oleh },
      $setOnInsert: Object.fromEntries(
        Object.entries(PENGATURAN_BAWAAN).filter(([k]) => !(k in ubah)),
      ) as Partial<DokPengaturan>,
    },
    { upsert: true },
  );
}

// Tautan WhatsApp resmi penelitian (untuk "Hubungi Peneliti"). null bila belum diatur.
export function tautanWhatsapp(nomor: string, pesan = 'Halo, saya responden DASH Sehat.'): string | null {
  const angka = nomor.replace(/\D/g, '').replace(/^0/, '62');
  return angka.length >= 10 ? `https://wa.me/${angka}?text=${encodeURIComponent(pesan)}` : null;
}
