import Link from 'next/link';
import Ikon from './Ikon';
import IsiMarkdown from './IsiMarkdown';
import KepalaHalaman from './KepalaHalaman';
import SidebarModul from './SidebarModul';
import { urlMateri } from './TampilanModul';
import type { Modul, RingkasanModul } from '@/lib/konten';

interface Props {
  modul: Modul;
  nomor: number;
  semua: RingkasanModul[]; // seluruh modul berurutan
  catat?: boolean; // catat sebagai sudah dibuka (false di pratinjau admin)
}

// Satu materi di dalam modul. Poin Penting dan Rangkuman tampil di materi terakhir.
export default function TampilanSubMateri({ modul, nomor, semua, catat = true }: Props) {
  const materi = modul.materi[nomor - 1];
  const jumlah = modul.materi.length;
  const terakhir = nomor === jumlah;
  const i = semua.findIndex((m) => m.id === modul.id);
  const modulBerikut = semua[i + 1];

  return (
    <article>
      <KepalaHalaman
        remah={[
          { href: '/materi/', label: 'Modul Pembelajaran' },
          { href: `/materi/${modul.id}/`, label: `Modul ${modul.urutan}` },
        ]}
        label={`Modul ${modul.urutan} · Materi ${nomor} dari ${jumlah}`}
        judul={materi.judul}
        ringkasan={
          <>
            Bagian dari modul <Link href={`/materi/${modul.id}/`}>{modul.judul}</Link>
          </>
        }
      >
        <p className="materi-meta">
          <Ikon nama="jam" ukuran={20} />
          Waktu membaca: ±{materi.estimasi_menit} menit
        </p>
      </KepalaHalaman>

      <div className="wadah tata-materi">
        <SidebarModul
          modulId={modul.id}
          urutan={modul.urutan}
          judul={modul.judul}
          materi={modul.materi.map((x) => ({ nomor: x.nomor, judul: x.judul }))}
          aktif={nomor}
          catat={catat}
        />
      <div className="materi kolom-materi">
        <IsiMarkdown isi={materi.isi} />

        {terakhir && (
          <>
            <section className="kotak kotak-poin" aria-labelledby="judul-poin">
              <h2 id="judul-poin" className="kotak-judul">
                <span className="kotak-ikon">
                  <Ikon nama="bintang" />
                </span>
                Poin Penting
              </h2>
              <ul>
                {modul.poin_penting.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>

            <section className="kartu rangkuman" aria-labelledby="judul-rangkuman">
              <h2 id="judul-rangkuman">Rangkuman modul</h2>
              <p>{modul.rangkuman}</p>
            </section>

            <div className="ajak-kuis">
              <p>
                <strong>Sudah selesai membaca Modul {modul.urutan}?</strong> Coba latihan soal
                singkat untuk memeriksa pemahaman Anda.
              </p>
              <Link className="tombol tombol-besar" href={`/materi/${modul.id}/latihan/`}>
                Mulai Latihan Soal
              </Link>
            </div>
          </>
        )}

        <nav className="navigasi-modul" aria-label="Navigasi antarmateri">
          <div className="nav-baris">
            {nomor > 1 ? (
              <Link className="tombol tombol-sekunder" href={urlMateri(modul.id, nomor - 1)}>
                <span aria-hidden="true">←</span> Materi Sebelumnya
              </Link>
            ) : (
              <Link className="tombol tombol-sekunder" href={`/materi/${modul.id}/`}>
                <span aria-hidden="true">←</span> Ringkasan Modul
              </Link>
            )}
            {!terakhir ? (
              <Link className="tombol" href={urlMateri(modul.id, nomor + 1)}>
                Materi Berikutnya <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <Link className="tombol" href={`/materi/${modul.id}/latihan/`}>
                Latihan Soal Modul {modul.urutan} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
          <p className="label-kecil nav-berikutnya">
            {!terakhir
              ? `Berikutnya: Materi ${nomor + 1} — ${modul.materi[nomor].judul}`
              : `Berikutnya: latihan soal, lalu ${modulBerikut ? `Modul ${modulBerikut.urutan} — ${modulBerikut.judul}` : 'selesai'}`}
          </p>
          <p>
            <Link href="/materi/">Kembali ke Daftar Modul</Link>
          </p>
        </nav>
      </div>
      </div>
    </article>
  );
}
