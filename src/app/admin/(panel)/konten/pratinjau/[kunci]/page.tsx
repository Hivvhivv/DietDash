import type { Metadata } from 'next';
import Link from 'next/link';
import TampilanMateri from '@/components/belajar/TampilanMateri';
import { wajibAdmin } from '@/lib/admin-auth';
import { ambilSoalKuis, ambilStruktur, versiAktif } from '@/lib/konten';
import { versiKerja } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Pratinjau materi' };
export const dynamic = 'force-dynamic';

const HURUF = 'ABCD';

// Pratinjau materi seperti yang dilihat responden (versi kerja, atau versi aktif bila tidak ada versi kerja).
export default async function Pratinjau({ params }: { params: Promise<{ kunci: string }> }) {
  await wajibAdmin();
  const { kunci } = await params;
  const v = (await versiKerja()) ?? (await versiAktif());
  const s = v ? await ambilStruktur(v._id) : null;
  const m = s?.materi.find((x) => x.kunci === kunci);
  if (!s || !m) {
    return (
      <>
        <h1>Materi tidak ditemukan</h1>
        <p>
          <Link href="/admin/konten/">Kembali ke Konten</Link>
        </p>
      </>
    );
  }
  const soal = m.kuis ? await ambilSoalKuis(s.versi._id, m.kuis.kunci) : [];
  const sebelum = s.materi[m.indeks - 1];
  const sesudah = s.materi[m.indeks + 1];

  return (
    <>
      <p className="grup-tautan">
        <Link href={`/admin/konten/materi/${m.kunci}/`}>← Edit materi ini</Link>
        {sebelum && <Link href={`/admin/konten/pratinjau/${sebelum.kunci}/`}>‹ Materi {sebelum.nomor}</Link>}
        {sesudah && <Link href={`/admin/konten/pratinjau/${sesudah.kunci}/`}>Materi {sesudah.nomor} ›</Link>}
      </p>
      <div className="admin-pratinjau">
        <p className="admin-pratinjau-label">Pratinjau · {s.versi.label} · tampilan responden</p>
        <TampilanMateri m={m} remah={[{ href: '/admin/konten/', label: 'Konten' }]}>
          <section className="kartu kartu-kuis" aria-labelledby="judul-pratinjau-kuis">
            <h2 id="judul-pratinjau-kuis">{m.kuis?.judul ?? 'Kuis belum ada'}</h2>
            {m.kuis && (
              <p className="label-kecil">
                {m.kuis.petunjuk} · Mode {m.kuis.mode}
                {m.kuis.mode === 'B' && `, skor minimal ${m.kuis.batas_lulus}%`} · Kunci jawaban hanya tampil di pratinjau admin.
              </p>
            )}
            <ol>
              {soal.map((x) => (
                <li key={x.kunci}>
                  <p>{x.teks}</p>
                  {x.gambar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="gambar-materi" src={`/gambar-konten/${x.gambar.id}/`} alt={x.gambar.alt} />
                  )}
                  <ul>
                    {x.pilihan.map((p, j) => (
                      <li key={p.kunci}>
                        {HURUF[j]}. {p.teks} {p.benar && <strong className="teks-benar">✓</strong>}
                      </li>
                    ))}
                  </ul>
                  <p className="label-kecil">Penjelasan: {x.penjelasan}</p>
                </li>
              ))}
            </ol>
          </section>
        </TampilanMateri>
      </div>
    </>
  );
}
