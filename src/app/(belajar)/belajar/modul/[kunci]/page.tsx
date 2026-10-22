import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LencanaStatusMateri from '@/components/belajar/StatusMateri';
import KepalaHalaman from '@/components/KepalaHalaman';
import { srcGambarModul } from '@/data/gambar';
import { strukturAktif } from '@/lib/konten';
import { statusResponden } from '@/lib/progres';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Modul' };

export default async function HalamanModul({ params }: { params: Promise<{ kunci: string }> }) {
  const a = await wajibResponden();
  const { kunci } = await params;
  const struktur = await strukturAktif();
  const modul = struktur?.modul.find((m) => m.kunci === kunci);
  if (!struktur || !modul) notFound();
  const r = await statusResponden(a, struktur);
  const daftar = r.daftar.filter((d) => d.materi.modul.kunci === kunci);

  return (
    <>
      <KepalaHalaman
        remah={[{ href: '/belajar/modul/', label: 'Modul Pembelajaran' }]}
        label={`Modul ${modul.nomor} dari ${struktur.modul.length}`}
        judul={modul.judul}
        ringkasan={modul.deskripsi}
        gambar={{ src: srcGambarModul(modul.gambar), width: 140, height: 110, alt: modul.gambar.alt }}
      />
      <div className="wadah-baca bagian-isi">
        <section className="kotak kotak-tujuan" aria-labelledby="judul-tujuan">
          <h2 id="judul-tujuan" className="kotak-judul">Tujuan modul</h2>
          <ul>
            {modul.tujuan.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <h2>Materi dalam modul ini</h2>
        <ol className="daftar-materi">
          {daftar.map((d) => {
            const m = d.materi;
            const sebelum = r.daftar[m.indeks - 1]?.materi;
            return (
              <li key={m.kunci}>
                <div className={`kartu kartu-status kartu-status-${d.status}`}>
                  <span className="daftar-materi-nomor" aria-hidden="true">
                    {d.status === 'terkunci' ? '🔒' : d.status === 'selesai' ? '✓' : m.nomor}
                  </span>
                  <div className="daftar-materi-teks">
                    <strong>
                      Materi {m.nomor} · {m.judul}
                    </strong>
                    <span className="label-kecil">±{m.menit} menit</span>
                    <LencanaStatusMateri status={d.status} />
                    {d.status === 'terkunci' && (
                      <span className="label-kecil">
                        {d.alasan_kunci === 'pretest'
                          ? 'Terbuka setelah pretest Anda dicatat peneliti.'
                          : `Baca dulu Materi ${sebelum?.nomor ?? ''}.`}
                      </span>
                    )}
                  </div>
                  {d.status !== 'terkunci' && (
                    <Link className={d.status === 'selesai' ? 'tombol tombol-sekunder' : 'tombol'} href={`/belajar/materi/${m.kunci}/`}>
                      {d.status === 'selesai' ? 'Baca Lagi' : 'Mulai Materi'}
                      <span className="sr-only"> {m.nomor}</span>
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <p>
          <Link href="/belajar/">← Kembali ke dashboard</Link>
        </p>
      </div>
    </>
  );
}
