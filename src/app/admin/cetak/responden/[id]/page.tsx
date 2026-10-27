import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TombolCetak from '@/components/admin/TombolCetak';
import Logo from '@/components/Logo';
import { wajibAdmin } from '@/lib/admin-auth';
import { bacaBagian, BAGIAN_EKSPOR } from '@/lib/bagian-ekspor';
import { catatAudit } from '@/lib/db';
import { samarkanNomorHp } from '@/lib/identitas';
import { detailResponden, LABEL_RIWAYAT } from '@/lib/monitor';
import { jawabanResponden, type JawabanResponden } from '@/lib/tes';
import { formatDurasi, formatTanggal, formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Ekspor data responden' };
export const dynamic = 'force-dynamic';

const STATUS_MATERI = { selesai: 'Selesai', tersedia: 'Belum dibaca', terkunci: 'Terkunci' } as const;
const STATUS_MODUL = { selesai: 'Selesai', sedang: 'Sedang dibaca', tersedia: 'Belum dibaca', terkunci: 'Terkunci' } as const;

function TabelJawaban({ t, judul }: { t: JawabanResponden['pretest']; judul: string }) {
  return (
    <>
      <h3>{judul}</h3>
      {!t.jawaban ? (
        <p>Belum mengisi secara online.</p>
      ) : (
        <table className="cetak-tabel">
          <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">Soal</th>
              <th scope="col">Jawaban</th>
              <th scope="col">Hasil</th>
            </tr>
          </thead>
          <tbody>
            {t.butir.map((b) => (
              <tr key={b.nomor}>
                <td>{b.nomor}</td>
                <td>{b.teks}</td>
                <td>{b.jawaban}</td>
                <td>{b.hasil === 'benar' ? 'Benar' : b.hasil === 'salah' ? `Belum tepat (kunci: ${b.kunci_teks})` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// Ekspor PDF satu responden (dari "Ekspor Data" di halaman detail). Bagian dipilih lewat ?b=...; dicetak/disimpan sebagai PDF
// lewat jendela cetak peramban. Nama & nomor tersamar hanya bila bagian "identitas" dipilih; kode akses tidak pernah ikut.
export default async function CetakResponden({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ b?: string | string[] }> }) {
  const admin = await wajibAdmin();
  const [{ id }, { b }] = await Promise.all([params, searchParams]);
  const d = await detailResponden(id);
  if (!d) notFound();
  const bagian = bacaBagian(b);
  const ada = (x: (typeof bagian)[number]) => bagian.includes(x);
  const { r, p, ringkasan, modul, garisWaktu, riwayat, atur, totalDetik, hariKe } = d;
  const tes = ada('tes') || ada('jawaban') ? await jawabanResponden(r._id) : null;
  const sekarang = new Date();

  if (bagian.length) {
    await catatAudit({ admin: admin.email, aksi: 'ekspor_pdf_responden', objek: p.id_peserta, keterangan: `Bagian: ${bagian.join(', ')}` });
  }
  const statusAkun = r.mundur_pada ? 'Mengundurkan diri' : r.aktif ? 'Aktif' : 'Nonaktif';
  const teksTes = (t: JawabanResponden['pretest'] | undefined, manual: Date | null | undefined) =>
    t?.jawaban
      ? `Dikirim ${formatWaktu(t.jawaban.dikirim_pada)}${t.jawaban.skor === null ? '' : ` · skor ${t.jawaban.skor}/100 (${t.jawaban.benar}/${t.jawaban.total_berkunci} benar)`}`
      : manual
        ? `Ditandai manual ${formatWaktu(manual)}`
        : 'Belum mengisi';

  return (
    <main className="cetak">
      <div className="cetak-alat">
        <p>
          {bagian.length
            ? `Pilih “Simpan sebagai PDF” pada jendela cetak. Berisi: ${BAGIAN_EKSPOR.filter((x) => ada(x.id))
                .map((x) => x.label.toLowerCase())
                .join(', ')}.`
            : 'Tidak ada data yang dipilih. Tutup tab ini dan pilih data pada Ekspor Data.'}
        </p>
        {bagian.length > 0 && <TombolCetak label="Cetak / Simpan PDF" />}
      </div>
      {bagian.length > 0 && (
        <>
          <header className="cetak-kepala">
            <Logo ukuran={36} />
            <div>
              <h1>Data Responden {p.id_peserta}</h1>
              <p>
                DASH Sehat · dicetak {formatWaktu(sekarang)} oleh {admin.email}
                {d.struktur && ` · versi konten aktif ${d.struktur.versi.label}`}
              </p>
            </div>
          </header>

          {ada('identitas') && (
            <section className="cetak-bagian">
              <h2>Identitas responden</h2>
              <table className="cetak-tabel cetak-tabel-data">
                <tbody>
                  <tr>
                    <th scope="row">Nama</th>
                    <td>{r.nama}</td>
                  </tr>
                  <tr>
                    <th scope="row">Nomor HP (tersamar)</th>
                    <td>{samarkanNomorHp(r.nomor_hp)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="cetak-catatan">Dokumen ini memuat data pribadi. Simpan di tempat aman dan jangan dibagikan.</p>
            </section>
          )}

          {ada('akun') && (
            <section className="cetak-bagian">
              <h2>Status peserta</h2>
              <table className="cetak-tabel cetak-tabel-data">
                <tbody>
                  <tr>
                    <th scope="row">ID peserta</th>
                    <td>{p.id_peserta}</td>
                  </tr>
                  <tr>
                    <th scope="row">Kelompok</th>
                    <td>{p.status_sampel === 'responden_penelitian' ? 'Responden penelitian' : 'Bukan sampel'}</td>
                  </tr>
                  <tr>
                    <th scope="row">Status akun</th>
                    <td>{statusAkun}</td>
                  </tr>
                  <tr>
                    <th scope="row">Tanggal daftar</th>
                    <td>{formatWaktu(r.dibuat_pada)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Terakhir aktif</th>
                    <td>{formatWaktu(r.terakhir_aktif)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Hari intervensi</th>
                    <td>
                      Hari ke-{hariKe} dari batas {atur.batas_intervensi_hari} hari
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Materi dibuka</th>
                    <td>{ringkasan ? `${ringkasan.selesai}/${ringkasan.total} (${ringkasan.persen}%)` : '—'}</td>
                  </tr>
                  <tr>
                    <th scope="row">Total durasi belajar</th>
                    <td>{formatDurasi(totalDetik)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {ada('modul') && (
            <section className="cetak-bagian">
              <h2>Progres per modul</h2>
              <table className="cetak-tabel">
                <thead>
                  <tr>
                    <th scope="col">Modul</th>
                    <th scope="col">Status</th>
                    <th scope="col">Materi dibuka</th>
                    <th scope="col">Progres</th>
                    <th scope="col">Lama baca</th>
                    <th scope="col">Terakhir dibuka</th>
                  </tr>
                </thead>
                <tbody>
                  {modul.map((m) => (
                    <tr key={m.kunci}>
                      <td>
                        M{m.nomor} {m.judul}
                      </td>
                      <td>{STATUS_MODUL[m.status]}</td>
                      <td>
                        {m.selesai}/{m.total}
                      </td>
                      <td>{m.persen}%</td>
                      <td>{formatDurasi(m.detik_baca)}</td>
                      <td>{formatWaktu(m.terakhir_dibuka)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {ada('materi') && (
            <section className="cetak-bagian">
              <h2>Rincian per materi</h2>
              <table className="cetak-tabel">
                <thead>
                  <tr>
                    <th scope="col">Materi</th>
                    <th scope="col">Status</th>
                    <th scope="col">Dibuka</th>
                    <th scope="col">Lama baca</th>
                    <th scope="col">Versi</th>
                    <th scope="col">Buka manual</th>
                  </tr>
                </thead>
                <tbody>
                  {garisWaktu.map((g) => (
                    <tr key={g.materi.kunci}>
                      <td>
                        {g.materi.nomor} {g.materi.judul}
                      </td>
                      <td>{STATUS_MATERI[g.status]}</td>
                      <td>{formatWaktu(g.dibuka_pada)}</td>
                      <td>{formatDurasi(g.detik_baca)}</td>
                      <td>{g.versi}</td>
                      <td>{g.buka_manual?.alasan ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {ada('tes') && (
            <section className="cetak-bagian">
              <h2>Ringkasan pretest & posttest</h2>
              <table className="cetak-tabel cetak-tabel-data">
                <tbody>
                  <tr>
                    <th scope="row">Pretest</th>
                    <td>{teksTes(tes?.pretest, p.pretest_selesai_pada)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Posttest</th>
                    <td>
                      {teksTes(tes?.posttest, p.posttest_selesai_pada)}
                      {!tes?.posttest.jawaban && !p.posttest_selesai_pada && (p.posttest_dibuka_pada ? ` (dibuka ${formatWaktu(p.posttest_dibuka_pada)})` : ' (belum dibuka)')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {ada('jawaban') && tes && (
            <section className="cetak-bagian">
              <h2>Jawaban pretest & posttest per soal</h2>
              <TabelJawaban t={tes.pretest} judul="Pretest" />
              <TabelJawaban t={tes.posttest} judul="Posttest" />
            </section>
          )}

          {ada('riwayat') && (
            <section className="cetak-bagian">
              <h2>Riwayat akun</h2>
              {riwayat.length === 0 ? (
                <p>Belum ada catatan.</p>
              ) : (
                <table className="cetak-tabel">
                  <thead>
                    <tr>
                      <th scope="col">Waktu</th>
                      <th scope="col">Kejadian</th>
                      <th scope="col">Oleh</th>
                      <th scope="col">Alasan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayat.map((x) => (
                      <tr key={x._id.toHexString()}>
                        <td>{formatWaktu(x.waktu)}</td>
                        <td>{LABEL_RIWAYAT[x.jenis] ?? x.jenis}</td>
                        <td>{x.oleh}</td>
                        <td>{x.alasan ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          <p className="cetak-catatan">
            Progres = materi yang sudah dibuka (keterlaksanaan intervensi), bukan hasil klinis. Skor pretest/posttest hanya untuk peneliti.
            Dicetak {formatTanggal(sekarang)}.
          </p>
        </>
      )}
    </main>
  );
}
