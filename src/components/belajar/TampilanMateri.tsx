import Image from 'next/image';
import Link from 'next/link';
import Ikon, { type NamaIkon } from '../Ikon';
import IsiMarkdown, { IsiMateriBagian } from '../IsiMarkdown';
import { srcGambarModul } from '@/data/gambar';
import type { MateriTerurut } from '@/lib/konten';
import type { StatusMateri } from '@/lib/progres';

export interface ItemNavigasiMateri {
  kunci: string;
  nomor: string;
  judul: string;
  status: StatusMateri;
  href: string | null; // null = terkunci (tidak bisa dibuka)
}

interface Props {
  m: MateriTerurut;
  remah: { href: string; label: string }[];
  daftar: ItemNavigasiMateri[]; // materi dalam modul yang sama
  progres?: { selesai: number; total: number }; // tidak ada di pratinjau admin
  navigasi?: React.ReactNode; // tombol Sebelumnya / Selanjutnya
  children?: React.ReactNode; // kartu tambahan di bawah isi
}

const STATUS: Record<StatusMateri, { ikon: NamaIkon; teks: string }> = {
  selesai: { ikon: 'centang-bulat', teks: 'Selesai' },
  tersedia: { ikon: 'putar', teks: 'Siap dibaca' },
  terkunci: { ikon: 'gembok', teks: 'Terkunci' },
};

function DaftarMateri({ m, daftar, progres }: Pick<Props, 'm' | 'daftar' | 'progres'>) {
  const persen = progres && progres.total ? Math.round((progres.selesai / progres.total) * 100) : 0;
  return (
    <>
      <p className="materi-sisi-modul">
        <span className="label-kecil">Modul {m.modul.nomor}</span>
        <strong>{m.modul.judul}</strong>
      </p>
      <ol className="materi-sisi-daftar">
        {daftar.map((d) => {
          const s = STATUS[d.status];
          const aktif = d.kunci === m.kunci;
          const isi = (
            <>
              <span className={`materi-sisi-ikon materi-sisi-${aktif ? 'aktif' : d.status}`}>
                <Ikon nama={aktif ? 'buku' : s.ikon} ukuran={16} />
              </span>
              <span>
                <span className="materi-sisi-judul">{d.judul}</span>
                <span className="label-kecil">{aktif ? 'Sedang dibaca' : s.teks}</span>
              </span>
            </>
          );
          return (
            <li key={d.kunci}>
              {d.href && !aktif ? (
                <Link href={d.href} className="materi-sisi-item">
                  {isi}
                </Link>
              ) : (
                <span className={`materi-sisi-item${aktif ? ' materi-sisi-item-aktif' : ''}`} aria-current={aktif ? 'page' : undefined}>
                  {isi}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {progres && (
        <div className="materi-sisi-progres">
          <p>
            <span>Progres modul</span>
            <strong>{persen}%</strong>
          </p>
          <div className="bilah-progres" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={persen} aria-label="Progres modul ini">
            <div style={{ width: `${persen}%` }} />
          </div>
          <p className="label-kecil">
            {progres.selesai} dari {progres.total} materi selesai
          </p>
        </div>
      )}
    </>
  );
}

// Urutan isi tetap (PRD 9): judul & nomor, tujuan, estimasi, isi (gambar & contoh penerapan),
// Poin Penting, rangkuman, sumber. Materi selesai saat dibuka (tanpa kuis). Dipakai halaman responden dan pratinjau admin.
export default function TampilanMateri({ m, remah, daftar, progres, navigasi, children }: Props) {
  const persenModul = progres ? `${progres.selesai}/${progres.total}` : `${daftar.length} materi`;
  return (
    <div className="materi-tata">
      <aside className="materi-sisi" aria-label={`Daftar materi Modul ${m.modul.nomor}`}>
        <DaftarMateri m={m} daftar={daftar} progres={progres} />
      </aside>

      <article className="materi-utama">
        <nav aria-label="Lokasi halaman" className="remah">
          {remah.map((r, i) => (
            <span key={r.href} className="remah-item">
              {i > 0 && <span aria-hidden="true">›</span>}
              <Link href={r.href}>{r.label}</Link>
            </span>
          ))}
        </nav>

        <details className="materi-sisi-lipat">
          <summary>
            <Ikon nama="daftar" ukuran={20} />
            Daftar materi Modul {m.modul.nomor} ({persenModul})
          </summary>
          <div className="materi-sisi-lipat-isi">
            <DaftarMateri m={m} daftar={daftar} progres={progres} />
          </div>
        </details>

        <header className="materi-kepala">
          <div className="materi-kepala-teks">
            <span className="tag-resep tag-resep-waktu">
              Modul {m.modul.nomor} · Materi {m.nomor}
            </span>
            <p className="materi-kepala-modul">{m.modul.judul}</p>
            <h1>{m.judul}</h1>
            <ul className="materi-kepala-meta">
              <li>
                <Ikon nama="jam" ukuran={18} /> Estimasi waktu ±{m.menit} menit
              </li>
              <li>
                <Ikon nama="dokumen" ukuran={18} /> Materi {m.urutan_dalam_modul} dari {m.jumlah_dalam_modul} di modul ini
              </li>
            </ul>
          </div>
          <div className="materi-kepala-gambar">
            {m.gambar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/gambar-konten/${m.gambar.id}/`} alt={m.gambar.alt} width={360} height={240} />
            ) : (
              <Image src={srcGambarModul(m.modul.gambar)} alt="" width={180} height={140} unoptimized={m.modul.gambar.jenis === 'unggah'} />
            )}
          </div>
        </header>

        <section className="materi-tujuan" aria-labelledby="judul-tujuan">
          <h2 id="judul-tujuan">
            <span className="materi-tujuan-ikon" aria-hidden="true">
              <Ikon nama="target" />
            </span>
            Tujuan Pembelajaran
          </h2>
          <p>Setelah mempelajari materi ini, Anda diharapkan dapat:</p>
          <ol>
            {m.tujuan.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </section>

        <IsiMateriBagian isi={m.isi} />

        <section className="kotak kotak-poin materi-poin" aria-labelledby="judul-poin">
          <h2 id="judul-poin" className="kotak-judul">
            <Ikon nama="lampu" />
            Poin Penting
          </h2>
          <ul>
            {m.poin_penting.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="bagian-materi rangkuman" aria-labelledby="judul-rangkuman">
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
        {navigasi}
      </article>
    </div>
  );
}
