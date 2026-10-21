import type { Metadata } from 'next';
import Link from 'next/link';
import { aksiTerapkanMode } from '../../../aksi-konten';
import { FormAksi } from '@/components/admin/FormAdmin';
import { wajibAdmin } from '@/lib/admin-auth';
import { ambilStruktur, versiAktif } from '@/lib/konten';
import { versiKerja } from '@/lib/konten-admin';
import { ambilPengaturan } from '@/lib/pengaturan';

export const metadata: Metadata = { title: 'Kelola Kuis' };
export const dynamic = 'force-dynamic';

export default async function KelolaKuis() {
  const admin = await wajibAdmin();
  const [kerja, aktif, atur] = await Promise.all([versiKerja(), versiAktif(), ambilPengaturan()]);
  const v = kerja ?? aktif;
  const s = v ? await ambilStruktur(v._id) : null;
  const bolehUbah = !!kerja && (kerja.jenis === 'biasa' || admin.peran === 'super_admin');
  const kurang = s?.materi.filter((m) => (m.kuis?.jumlah_soal ?? 0) < 3) ?? [];
  const totalSoal = s?.materi.reduce((n, m) => n + (m.kuis?.jumlah_soal ?? 0), 0) ?? 0;

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Kelola Kuis</h1>
        <p>
          {s ? `${s.materi.length} kuis · ${totalSoal} pertanyaan · ${v!.label}` : 'Belum ada konten.'}
          {!kerja && s && ' (hanya baca — buat versi kerja di Kelola Modul untuk mengedit)'}
        </p>
      </div>

      {kurang.length > 0 && (
        <p className="kotak kotak-peringatan">⚠ {kurang.length} kuis masih kurang dari 3 soal: {kurang.map((m) => m.nomor).join(', ')}.</p>
      )}

      {bolehUbah && (
        <section className="kartu-panel" aria-labelledby="judul-mode">
          <h2 id="judul-mode">Aturan Selesai Kuis (semua kuis)</h2>
          <p className="label-kecil">
            Saat ini: Mode {atur.mode_kuis_bawaan}
            {atur.mode_kuis_bawaan === 'B' ? `, skor minimal ${atur.batas_lulus_bawaan}%` : ''}. Mode harus sama untuk semua kuis
            selama penelitian.
          </p>
          <FormAksi aksi={aksiTerapkanMode} label="Terapkan ke semua kuis" konfirmasi="Terapkan aturan ini ke semua kuis di versi kerja?">
            <div className="bidang-baris">
              <div className="bidang">
                <label htmlFor="mode-semua">Mode</label>
                <select id="mode-semua" name="mode" defaultValue={atur.mode_kuis_bawaan}>
                  <option value="A">Mode A: selesai setelah semua soal dijawab (disarankan)</option>
                  <option value="B">Mode B: harus mencapai skor minimal</option>
                </select>
              </div>
              <div className="bidang">
                <label htmlFor="batas-semua">Skor minimal Mode B (%)</label>
                <input id="batas-semua" name="batas_lulus" type="number" min={1} max={100} defaultValue={atur.batas_lulus_bawaan} />
              </div>
            </div>
          </FormAksi>
        </section>
      )}

      {s && (
        <section className="kartu-panel" aria-labelledby="judul-daftar-kuis">
          <h2 id="judul-daftar-kuis">Daftar Kuis</h2>
          <div className="tabel-gulir">
            <table className="tabel-admin">
              <thead>
                <tr>
                  <th scope="col">Materi</th>
                  <th scope="col">Judul kuis</th>
                  <th scope="col">Soal</th>
                  <th scope="col">Aturan selesai</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {s.materi.map((m) => (
                  <tr key={m.kunci}>
                    <td>
                      <strong>{m.nomor}</strong> {m.judul}
                    </td>
                    <td>{m.kuis?.judul ?? '—'}</td>
                    <td>
                      {m.kuis?.jumlah_soal ?? 0}
                      {(m.kuis?.jumlah_soal ?? 0) < 3 && <span className="lencana lencana-peringatan">⚠ min. 3</span>}
                    </td>
                    <td>{m.kuis ? (m.kuis.mode === 'A' ? 'Mode A' : `Mode B (${m.kuis.batas_lulus}%)`) : '—'}</td>
                    <td>
                      <span className="grup-tautan">
                        {bolehUbah && <Link href={`/admin/konten/materi/${m.kunci}/kuis/`}>Kelola soal</Link>}
                        <Link href={`/admin/konten/pratinjau/${m.kunci}/`}>Pratinjau</Link>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
