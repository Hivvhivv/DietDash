import type { Metadata } from 'next';
import { aksiPengaturan } from '../../aksi-responden';
import { FormAksi } from '@/components/admin/FormAdmin';
import { wajibAdmin } from '@/lib/admin-auth';
import { ambilPengaturan } from '@/lib/pengaturan';
import { formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Pengaturan' };
export const dynamic = 'force-dynamic';

function Centang({ id, label, ket, aktif }: { id: string; label: string; ket: string; aktif: boolean }) {
  return (
    <div className="bidang">
      <label className="centang">
        <input type="checkbox" name={id} value="ya" defaultChecked={aktif} />
        <span>
          <strong>{label}</strong>
          <br />
          <span className="petunjuk">{ket}</span>
        </span>
      </label>
    </div>
  );
}

// Keputusan terbuka PRD Bagian 20 dijadikan pengaturan agar peneliti dapat menyesuaikan tanpa mengubah kode.
export default async function Pengaturan() {
  await wajibAdmin();
  const a = await ambilPengaturan();
  return (
    <>
      <h1>Pengaturan penelitian</h1>
      <p className="label-kecil">
        Terakhir diubah {formatWaktu(a.diubah_pada)} oleh {a.diubah_oleh}. Setiap perubahan tercatat di log.
      </p>
      <FormAksi aksi={aksiPengaturan} label="Simpan pengaturan">
        <fieldset>
          <legend>Pendaftaran</legend>
          <Centang id="pendaftaran_dibuka" label="Pendaftaran dibuka" ket="Bila ditutup, halaman Daftar menampilkan pemberitahuan dan akun baru tidak dapat dibuat. Responden lama tetap bisa masuk." aktif={a.pendaftaran_dibuka} />
          <Centang id="wajib_pernyataan_kelayakan" label="Wajib pernyataan kelayakan" ket="Calon responden mencentang bahwa dirinya dewasa dan memiliki hipertensi sesuai kriteria penelitian." aktif={a.wajib_pernyataan_kelayakan} />
          <Centang id="gerbang_pretest" label="Materi 1.1 terbuka setelah pretest ditandai" ket="Bila aktif, admin menandai pretest selesai di halaman detail responden sebelum materi pertama terbuka." aktif={a.gerbang_pretest} />
        </fieldset>
        <fieldset>
          <legend>Pemantauan</legend>
          <div className="bidang-baris">
            <div className="bidang">
              <label htmlFor="batas_tidak_aktif_hari">Dianggap tidak aktif setelah (hari)</label>
              <input id="batas_tidak_aktif_hari" name="batas_tidak_aktif_hari" type="number" min={1} max={90} defaultValue={a.batas_tidak_aktif_hari} />
            </div>
            <div className="bidang">
              <label htmlFor="batas_intervensi_hari">Lama intervensi (hari)</label>
              <input id="batas_intervensi_hari" name="batas_intervensi_hari" type="number" min={1} max={180} defaultValue={a.batas_intervensi_hari} />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Kontak</legend>
          <div className="bidang">
            <label htmlFor="nomor_whatsapp_peneliti">Nomor WhatsApp resmi penelitian</label>
            <p className="petunjuk">Dipakai di halaman Lupa Token dan Bantuan. Contoh: 081234567890.</p>
            <input id="nomor_whatsapp_peneliti" name="nomor_whatsapp_peneliti" type="tel" defaultValue={a.nomor_whatsapp_peneliti} />
          </div>
        </fieldset>
      </FormAksi>
      <p className="label-kecil">Aturan selesai kuis (Mode A/B) diatur di Kelola Kuis karena berlaku per versi konten.</p>
    </>
  );
}
