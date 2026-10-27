import type { Metadata } from 'next';
import Link from 'next/link';
import { aksiBukaPosttestSemua } from '../../aksi-tes';
import { FormAksi } from '@/components/admin/FormAdmin';
import { wajibAdmin } from '@/lib/admin-auth';
import { koleksi, type JenisTes } from '@/lib/db';
import { LABEL_TES, hasilTes } from '@/lib/tes';
import { formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Pretest & Posttest' };
export const dynamic = 'force-dynamic';

const JENIS: JenisTes[] = ['pretest', 'posttest'];

// Pretest & posttest online (keputusan peneliti 2026-10-27). Skor hanya untuk peneliti.
export default async function KelolaTes() {
  await wajibAdmin();
  const { peserta } = await koleksi();
  const [hasil, totalPenelitian, dibuka] = await Promise.all([
    Promise.all(JENIS.map((j) => hasilTes(j))),
    peserta.countDocuments({ status_sampel: 'responden_penelitian' }),
    peserta.countDocuments({ status_sampel: 'responden_penelitian', posttest_dibuka_pada: { $ne: null } }),
  ]);

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Pretest &amp; Posttest</h1>
        <p>Buat soal pilihan ganda, skala, atau isian. Pretest wajib diisi responden sebelum memakai website; posttest muncul setelah Anda membukanya.</p>
      </div>
      <p className="kotak-info">
        Skor pilihan ganda dihitung dari kunci jawaban dan hanya terlihat di panel admin serta ekspor — responden tidak melihat skor
        maupun kunci. Setelah ada responden yang menjawab, soal dikunci agar semua responden mengisi instrumen yang sama.
      </p>

      <ul className="tes-kartu-kisi">
        {JENIS.map((j, n) => {
          const { instrumen: i, baris, rataSkor } = hasil[n];
          const penelitian = baris.filter((b) => b.sampel === 'responden_penelitian').length;
          return (
            <li key={j} className="kartu-panel tes-kartu">
              <span className={`lencana ${i.aktif ? 'lencana-materi-selesai' : 'lencana-materi-terkunci'}`}>{i.aktif ? '✓ Aktif' : '○ Belum aktif'}</span>
              <h2>
                {LABEL_TES[j]}
                {i.judul !== LABEL_TES[j] && <span className="label-kecil"> — {i.judul}</span>}
              </h2>
              <dl className="tes-angka">
                <div>
                  <dt>Soal</dt>
                  <dd>{i.soal.length}</dd>
                </div>
                <div>
                  <dt>Sudah mengisi</dt>
                  <dd>
                    {penelitian}/{totalPenelitian}
                  </dd>
                </div>
                <div>
                  <dt>Rata-rata skor</dt>
                  <dd>{rataSkor === null ? '—' : `${rataSkor}%`}</dd>
                </div>
              </dl>
              <p className="label-kecil">
                {i.diubah_oleh === 'sistem' ? 'Belum pernah disimpan.' : `Diubah ${formatWaktu(i.diubah_pada)} oleh ${i.diubah_oleh}.`} Hitungan hanya responden penelitian.
              </p>
              <div className="grup-tombol">
                <Link className="tombol" href={`/admin/tes/${j}/`}>
                  {baris.length ? 'Lihat soal' : 'Kelola soal'}
                </Link>
                {baris.length > 0 && (
                  <a className="tombol tombol-sekunder" href={`/admin/tes/${j}/ekspor/`}>
                    Unduh jawaban (CSV)
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <section className="bagian-kartu" aria-labelledby="judul-buka-posttest">
        <h2 id="judul-buka-posttest">Buka posttest</h2>
        <p>
          Posttest sudah dibuka untuk {dibuka} dari {totalPenelitian} responden penelitian. Setelah dibuka, responden diminta mengisi
          posttest saat membuka website berikutnya. Anda juga bisa membuka atau menutup posttest per responden di halaman detail
          responden.
        </p>
        {!hasil[1].instrumen.aktif && <p className="kotak kotak-peringatan">Posttest belum aktif. Aktifkan posttest agar responden yang sudah dibuka dapat mengisinya.</p>}
        <FormAksi
          aksi={aksiBukaPosttestSemua}
          label="Buka posttest untuk semua responden penelitian"
          konfirmasi="Buka posttest untuk semua responden penelitian yang belum dibuka?"
        />
      </section>
    </>
  );
}
