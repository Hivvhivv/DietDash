import Link from 'next/link';
import Ikon from '../Ikon';
import IsiMarkdown from '../IsiMarkdown';
import KepalaHalaman from '../KepalaHalaman';
import type { MateriTerurut } from '@/lib/konten';

interface Props {
  m: MateriTerurut;
  remah: { href: string; label: string }[];
  children?: React.ReactNode; // bagian bawah (tombol kuis / navigasi)
}

// Urutan isi tetap (PRD 9): judul & nomor, tujuan, estimasi, isi (gambar & contoh penerapan),
// Poin Penting, rangkuman, lalu tombol kuis. Dipakai halaman responden dan pratinjau admin.
export default function TampilanMateri({ m, remah, children }: Props) {
  return (
    <article>
      <KepalaHalaman remah={remah} label={`Materi ${m.nomor} · ${m.urutan_dalam_modul} dari ${m.jumlah_dalam_modul} di Modul ${m.modul.nomor}`} judul={m.judul}>
        <p className="materi-meta">
          <Ikon nama="jam" ukuran={20} />
          Waktu membaca: ±{m.menit} menit
        </p>
      </KepalaHalaman>
      <div className="wadah-baca materi">
        <section className="kotak kotak-tujuan" aria-labelledby="judul-tujuan">
          <h2 id="judul-tujuan" className="kotak-judul">
            <span className="kotak-ikon">
              <Ikon nama="target" />
            </span>
            Tujuan pembelajaran
          </h2>
          <p>Setelah mempelajari materi ini:</p>
          <ul>
            {m.tujuan.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <IsiMarkdown isi={m.isi} />

        <section className="kotak kotak-poin" aria-labelledby="judul-poin">
          <h2 id="judul-poin" className="kotak-judul">
            <span className="kotak-ikon">
              <Ikon nama="bintang" />
            </span>
            Poin Penting
          </h2>
          <ul>
            {m.poin_penting.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="kartu rangkuman" aria-labelledby="judul-rangkuman">
          <h2 id="judul-rangkuman">Rangkuman</h2>
          <p>{m.rangkuman}</p>
        </section>

        {m.sumber.length > 0 && (
          <section className="materi-sumber" aria-labelledby="judul-sumber">
            <h2 id="judul-sumber">Sumber materi</h2>
            <ul>
              {m.sumber.map((s) => (
                <li key={s}>
                  <IsiMarkdown isi={s} sebaris />
                </li>
              ))}
            </ul>
          </section>
        )}

        {children}

        <p>
          <Link href={remah[remah.length - 1]?.href ?? '/belajar/'}>← Kembali ke {remah[remah.length - 1]?.label ?? 'dashboard'}</Link>
        </p>
      </div>
    </article>
  );
}
