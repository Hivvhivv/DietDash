import type { Metadata } from 'next';
import Link from 'next/link';
import { wajibAdmin } from '@/lib/admin-auth';
import { ringkasanDashboard } from '@/lib/monitor';

export const metadata: Metadata = { title: 'Laporan & Statistik' };
export const dynamic = 'force-dynamic';

const JENIS_EKSPOR = [
  { nilai: 'ringkasan', judul: 'Ringkasan per responden', ket: 'Satu baris per responden: status, progres, waktu baca total, rata-rata skor percobaan pertama.' },
  { nilai: 'progres', judul: 'Progres per materi', ket: 'Satu baris per responden per materi: waktu dibuka/selesai, waktu baca, jumlah percobaan, skor.' },
  { nilai: 'jawaban', judul: 'Jawaban kuis', ket: 'Satu baris per jawaban: soal, pilihan, benar/salah, percobaan ke-berapa, versi konten.' },
];

// PRD 11.1 (analisis kuis) dan 11.3 (ekspor data).
export default async function Laporan() {
  await wajibAdmin();
  const { analisis, perMateri } = await ringkasanDashboard();
  const terendah = [...perMateri].sort((a, b) => a.persen - b.persen)[0];

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Laporan & Statistik</h1>
        <p>Analisis kuis per materi dan ekspor data penelitian. Angka memakai responden penelitian saja.</p>
      </div>

      <section className="kartu-panel" aria-labelledby="judul-analisis">
        <div className="kartu-panel-kepala">
          <h2 id="judul-analisis">Analisis Kuis (Percobaan Pertama)</h2>
          <Link href="/admin/konten/kuis/">Kelola kuis →</Link>
        </div>
        <p className="label-kecil">
          Soal dengan jawaban benar di bawah 50% (minimal 3 jawaban) ditandai “Tinjau”, kemungkinan soalnya ambigu atau materinya
          kurang jelas. Kuis latihan ini bukan pretest/posttest.
          {terendah && ` Penyelesaian terendah saat ini: Materi ${terendah.nomor} (${terendah.persen}%).`}
        </p>
        <div className="tabel-gulir">
          <table className="tabel-admin">
            <thead>
              <tr>
                <th scope="col">Materi</th>
                <th scope="col">Percobaan pertama</th>
                <th scope="col">Rata-rata skor pertama</th>
                <th scope="col">Rata-rata percobaan</th>
                <th scope="col">Soal perlu ditinjau</th>
              </tr>
            </thead>
            <tbody>
              {analisis.map((a) => {
                const tinjau = a.soal.filter((s) => s.tinjau).length;
                return (
                  <tr key={a.nomor}>
                    <th scope="row">
                      {a.nomor} {a.judul}
                    </th>
                    <td>{a.jumlah_pertama}</td>
                    <td>{a.rata_skor_pertama === null ? '—' : `${a.rata_skor_pertama}%`}</td>
                    <td>{a.rata_percobaan ?? '—'}</td>
                    <td>{tinjau ? <span className="lencana lencana-peringatan">⚠ {tinjau}</span> : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <h3>Rincian per soal</h3>
        {analisis.map((a) => (
          <details key={a.nomor} className="tanya">
            <summary>
              Materi {a.nomor} {a.judul}
              {a.soal.some((s) => s.tinjau) && ' · ⚠ ada soal perlu ditinjau'}
            </summary>
            <div className="tanya-isi tabel-gulir">
              <table className="tabel-admin">
                <thead>
                  <tr>
                    <th scope="col">No.</th>
                    <th scope="col">Soal</th>
                    <th scope="col">Dijawab</th>
                    <th scope="col">Benar</th>
                  </tr>
                </thead>
                <tbody>
                  {a.soal.map((s) => (
                    <tr key={s.nomor}>
                      <td>{s.nomor}</td>
                      <td>{s.teks}</td>
                      <td>{s.dijawab}</td>
                      <td>
                        {s.persen === null ? '—' : `${s.persen}%`} {s.tinjau && <span className="lencana lencana-peringatan">⚠ Tinjau</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
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
