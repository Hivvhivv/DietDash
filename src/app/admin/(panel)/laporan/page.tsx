import type { Metadata } from 'next';
import { wajibAdmin } from '@/lib/admin-auth';
import { ringkasanDashboard } from '@/lib/monitor';

export const metadata: Metadata = { title: 'Laporan & Statistik' };
export const dynamic = 'force-dynamic';

const JENIS_EKSPOR = [
  { nilai: 'ringkasan', judul: 'Ringkasan per responden', ket: 'Satu baris per responden: status, materi selesai, waktu baca total, tanda pretest.' },
  { nilai: 'progres', judul: 'Progres per materi', ket: 'Satu baris per responden per materi: status, waktu dibuka, waktu baca, versi konten.' },
];

// PRD 11.1 (keterlaksanaan per materi) dan 11.3 (ekspor data). Kuis tidak dipakai sejak 2026-10-22.
export default async function Laporan() {
  await wajibAdmin();
  const { perMateri, kartu } = await ringkasanDashboard();
  const terendah = [...perMateri].sort((a, b) => a.persen - b.persen)[0];

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Laporan & Statistik</h1>
        <p>Keterlaksanaan per materi dan ekspor data penelitian. Angka memakai responden penelitian saja.</p>
      </div>

      <section className="kartu-panel" aria-labelledby="judul-keterlaksanaan">
        <h2 id="judul-keterlaksanaan">Keterlaksanaan per Materi</h2>
        <p className="label-kecil">
          Materi dihitung selesai saat dibuka responden. Ini ukuran keterlaksanaan intervensi (fidelity), bukan efektivitas
          edukasi. Responden penelitian: {kartu.sampel}.
          {terendah && ` Penyelesaian terendah saat ini: Materi ${terendah.nomor} (${terendah.persen}%).`}
        </p>
        <div className="tabel-gulir">
          <table className="tabel-admin">
            <thead>
              <tr>
                <th scope="col">Materi</th>
                <th scope="col">Sudah membaca</th>
                <th scope="col">Persentase</th>
                <th scope="col">Rata-rata lama baca</th>
              </tr>
            </thead>
            <tbody>
              {perMateri.map((m) => (
                <tr key={m.kunci}>
                  <th scope="row">
                    {m.nomor} {m.judul}
                  </th>
                  <td>{m.selesai}</td>
                  <td>{m.persen}%</td>
                  <td>{m.rata_menit_baca === null ? '—' : `${m.rata_menit_baca} menit`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="kartu-panel" id="ekspor" aria-labelledby="judul-ekspor">
        <h2 id="judul-ekspor">Ekspor Data</h2>
        <p className="kotak-info">
          Berkas ekspor memakai <strong>ID peserta</strong> saja, tanpa nama dan nomor HP. Bawaannya hanya responden penelitian.
          Setiap unduhan tercatat di log. Simpan berkas di tempat yang aman sesuai protokol etik.
        </p>
        <div className="kisi-ekspor">
          {JENIS_EKSPOR.map((j) => (
            <form key={j.nilai} method="get" action="/admin/ekspor/unduh/" className="form-admin kartu">
              <h3>{j.judul}</h3>
              <p className="label-kecil">{j.ket}</p>
              <input type="hidden" name="jenis" value={j.nilai} />
              <div className="bidang">
                <label htmlFor={`format-${j.nilai}`}>Format</label>
                <select id={`format-${j.nilai}`} name="format" defaultValue="xlsx">
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>
              <div className="bidang">
                <label htmlFor={`cakupan-${j.nilai}`}>Cakupan</label>
                <select id={`cakupan-${j.nilai}`} name="cakupan" defaultValue="sampel">
                  <option value="sampel">Responden penelitian saja</option>
                  <option value="semua">Semua akun (termasuk bukan sampel)</option>
                </select>
              </div>
              <button type="submit" className="tombol">
                Unduh
              </button>
            </form>
          ))}
        </div>
      </section>
    </>
  );
}
