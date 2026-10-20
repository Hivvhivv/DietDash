import Link from 'next/link';
import Ikon from './Ikon';
import IsiMarkdown from './IsiMarkdown';
import KepalaHalaman from './KepalaHalaman';
import { GAMBAR_ILUSTRASI, UKURAN_ILUSTRASI } from '@/data/gambar';
import { ambilSumber } from '@/data/sumber';
import type { Modul, RingkasanModul } from '@/lib/konten';

export const urlMateri = (modulId: string, nomor: number) => `/materi/${modulId}/${nomor}/`;

// Penunjuk urutan modul 1–6.
export function LangkahModul({ semua, aktif }: { semua: RingkasanModul[]; aktif: RingkasanModul }) {
  return (
    <nav aria-label="Urutan modul">
      <ol className="langkah-modul">
        {semua.map((m) => (
          <li key={m.id}>
            <Link
              href={`/materi/${m.id}/`}
              aria-current={m.id === aktif.id ? 'step' : undefined}
              className={m.urutan < aktif.urutan ? 'lewat' : undefined}
              title={m.judul}
            >
              <span className="sr-only">Modul </span>
              {m.urutan}
              <span className="sr-only">: {m.judul}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface Props {
  modul: Modul;
  semua: RingkasanModul[]; // seluruh modul berurutan
}

// Halaman ringkasan modul: tujuan, pengantar, dan daftar materi di dalamnya.
// Dipakai halaman publik dan pratinjau admin.
export default function TampilanModul({ modul, semua }: Props) {
  const i = semua.findIndex((m) => m.id === modul.id);
  const sebelum = semua[i - 1];
  const sumber = ambilSumber(modul.sumber);
  const jumlah = modul.materi.length;

  return (
    <article>
      <KepalaHalaman
        remah={[{ href: '/materi/', label: 'Modul Pembelajaran' }]}
        label={`Modul ${modul.urutan} dari ${semua.length}`}
        judul={modul.judul}
        ringkasan={modul.deskripsi_kartu}
        gambar={{ src: GAMBAR_ILUSTRASI[modul.ilustrasi], alt: modul.ilustrasi_alt, ...UKURAN_ILUSTRASI }}
      >
        <p className="materi-meta">
          <Ikon nama="jam" ukuran={20} />
          {jumlah} materi · ±{modul.estimasi_menit} menit
        </p>
        <LangkahModul semua={semua} aktif={modul} />
      </KepalaHalaman>

      <div className="wadah-baca materi">
        <section className="kotak kotak-tujuan" aria-labelledby="judul-tujuan">
          <h2 id="judul-tujuan" className="kotak-judul">
            <span className="kotak-ikon">
              <Ikon nama="target" />
            </span>
            Tujuan pembelajaran
          </h2>
          <p>Setelah mempelajari modul ini:</p>
          <ul>
            {modul.tujuan.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        {modul.pengantar && <IsiMarkdown isi={modul.pengantar} />}

        <section aria-labelledby="judul-daftar-materi">
          <h2 id="judul-daftar-materi">Materi dalam modul ini</h2>
          <ol className="daftar-materi">
            {modul.materi.map((x) => (
              <li key={x.nomor}>
                <Link href={urlMateri(modul.id, x.nomor)} className="kartu">
                  <span className="daftar-materi-nomor" aria-hidden="true">
                    {x.nomor}
                  </span>
                  <span className="daftar-materi-teks">
                    <span className="sr-only">Materi {x.nomor}: </span>
                    <strong>{x.judul}</strong>
                    <span className="label-kecil">±{x.estimasi_menit} menit</span>
                  </span>
                  <span className="daftar-materi-panah" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/materi/${modul.id}/latihan/`} className="kartu daftar-materi-latihan">
                <span className="daftar-materi-nomor" aria-hidden="true">
                  ✎
                </span>
                <span className="daftar-materi-teks">
                  <strong>Latihan Soal</strong>
                  <span className="label-kecil">Periksa pemahaman Anda setelah membaca semua materi</span>
                </span>
                <span className="daftar-materi-panah" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          </ol>
        </section>

        <div className="grup-tombol">
          <Link className="tombol tombol-besar" href={urlMateri(modul.id, 1)}>
            Mulai Materi 1 <span aria-hidden="true">→</span>
          </Link>
          {sebelum && (
            <Link className="tombol tombol-sekunder tombol-besar" href={`/materi/${sebelum.id}/`}>
              <span aria-hidden="true">←</span> Modul Sebelumnya
            </Link>
          )}
        </div>

        <section className="materi-sumber" aria-labelledby="judul-sumber">
          <h2 id="judul-sumber">Sumber materi</h2>
          <ul>
            {sumber.map((s) => (
              <li key={s.id}>
                {s.sitasi}
                {s.url && (
                  <>
                    {' '}
                    <a href={s.url} rel="noopener noreferrer">
                      Tautan
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
          <p className="label-kecil">
            Versi modul {modul.versi}. <Link href="/sumber/">Lihat semua sumber</Link>
          </p>
        </section>

        <p>
          <Link href="/materi/">Kembali ke Daftar Modul</Link>
        </p>
      </div>
    </article>
  );
}
