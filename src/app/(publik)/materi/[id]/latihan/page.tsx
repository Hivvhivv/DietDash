import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import KepalaHalaman from '@/components/KepalaHalaman';
import Kuis from '@/components/Kuis';
import SidebarModul from '@/components/SidebarModul';
import { soalUntukModul } from '@/data/kuis';
import { ambilSemuaModul, ringkas } from '@/lib/konten';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return (await ambilSemuaModul()).map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const modul = (await ambilSemuaModul()).find((m) => m.id === id);
  return modul ? { title: `Latihan Soal — Modul ${modul.urutan}` } : {};
}

export default async function LatihanModul({ params }: Props) {
  const { id } = await params;
  const semua = await ambilSemuaModul();
  const i = semua.findIndex((m) => m.id === id);
  if (i === -1) notFound();
  const modul = semua[i];
  const berikut = semua[i + 1];
  const soal = soalUntukModul(modul.id);

  return (
    <>
      <KepalaHalaman
        remah={[
          { href: '/materi/', label: 'Modul Pembelajaran' },
          { href: `/materi/${modul.id}/`, label: `Modul ${modul.urutan}` },
        ]}
        label={`Modul ${modul.urutan} · Latihan Soal`}
        judul={`Latihan Soal: ${modul.judul}`}
        ringkasan={`${soal.length} pertanyaan pilihan ganda tentang modul ini. Ini latihan, bukan ujian.`}
      />
      <div className="wadah tata-materi">
        <SidebarModul
          modulId={modul.id}
          urutan={modul.urutan}
          judul={modul.judul}
          materi={modul.materi.map((x) => ({ nomor: x.nomor, judul: x.judul }))}
          aktif="latihan"
        />
        <div className="kolom-materi">
          <div className="kartu kartu-kuis">
            <Kuis soal={soal} modul={semua.map(ringkas)} idLatihan={modul.id}>
              <p>
                Pilih satu jawaban, lalu tekan <strong>Periksa Jawaban</strong> untuk melihat
                penjelasannya.
              </p>
            </Kuis>
          </div>
          <nav className="navigasi-modul" aria-label="Navigasi setelah latihan">
            <div className="nav-baris">
              <Link className="tombol tombol-sekunder" href={`/materi/${modul.id}/${modul.materi.length}/`}>
                <span aria-hidden="true">←</span> Materi Terakhir
              </Link>
              {berikut ? (
                <Link className="tombol" href={`/materi/${berikut.id}/`}>
                  Modul Berikutnya <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <Link className="tombol" href="/rangkuman/">
                  Lihat Rangkuman Materi <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
            <p className="label-kecil nav-berikutnya">
              {berikut ? `Berikutnya: Modul ${berikut.urutan} — ${berikut.judul}` : 'Anda sudah sampai di modul terakhir.'}
            </p>
          </nav>
        </div>
      </div>
    </>
  );
}
