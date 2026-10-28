import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Ikon, { type NamaIkon } from '@/components/Ikon';
import { progresPerModul, type StatusModul } from '@/lib/beranda-responden';
import { strukturAktif } from '@/lib/konten';
import { statusResponden, type StatusMateri } from '@/lib/progres';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Modul' };

// Status selalu ikon + teks (PRD 14); warna hanya penguat.
const LENCANA_MATERI: Record<StatusMateri, { kelas: string; teks: string; ikon: NamaIkon }> = {
  selesai: { kelas: 'selesai', teks: 'Selesai dibaca', ikon: 'centang-bulat' },
  tersedia: { kelas: 'tersedia', teks: 'Siap dipelajari', ikon: 'putar' },
  terkunci: { kelas: 'terkunci', teks: 'Terkunci', ikon: 'gembok' },
};

const LENCANA_MODUL: Record<StatusModul, { kelas: string; teks: string }> = {
  selesai: { kelas: 'selesai', teks: 'Modul selesai' },
  berjalan: { kelas: 'sedang', teks: 'Sedang dipelajari' },
  belum: { kelas: 'tersedia', teks: 'Siap dimulai' },
  terkunci: { kelas: 'terkunci', teks: 'Terkunci' },
};

// Kalimat pertama rangkuman sebagai deskripsi singkat kartu materi.
function deskripsiSingkat(rangkuman: string, cadangan?: string) {
  const teks = (rangkuman || cadangan || '').trim();
  const kalimat = teks.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? teks;
  return kalimat.length > 160 ? `${kalimat.slice(0, 157).trimEnd()}…` : kalimat;
}

export default async function HalamanModul({ params }: { params: Promise<{ kunci: string }> }) {
  const a = await wajibResponden();
  const { kunci } = await params;
  const struktur = await strukturAktif();
  const modul = struktur?.modul.find((m) => m.kunci === kunci);
  if (!struktur || !modul) notFound();
  const r = await statusResponden(a, struktur);
  const daftar = r.daftar.filter((d) => d.materi.modul.kunci === kunci);
  const pm = progresPerModul(struktur, r).find((x) => x.modul.kunci === kunci)!;
  const lm = LENCANA_MODUL[pm.status];
  const menit = daftar.reduce((n, d) => n + d.materi.menit, 0);
  const berikut = daftar.find((d) => d.status === 'tersedia')?.materi ?? null;
  const modulBerikut = struktur.modul.find((m) => m.nomor === modul.nomor + 1) ?? null;

  return (
    <div className="modul-detail">
      <nav aria-label="Lokasi halaman" className="remah modul-detail-remah">
        <Link href="/belajar/">
          <Ikon nama="rumah" ukuran={18} />
          Beranda
        </Link>
        <span className="remah-item">
          <span aria-hidden="true">›</span>
          <Link href="/belajar/modul/">Modul Pembelajaran</Link>
        </span>
        <span className="remah-item">
          <span aria-hidden="true">›</span>
          <span aria-current="page">Modul {modul.nomor}</span>
        </span>
      </nav>

      <section className="modul-detail-kepala" aria-labelledby="judul-halaman">
        <div className="modul-detail-kepala-teks">
          <p className="modul-detail-lencana">
            <span className="lencana lencana-modul-nomor">
              Modul {modul.nomor} dari {struktur.modul.length}
            </span>
            <span className={`lencana lencana-materi-${lm.kelas}`}>{lm.teks}</span>
          </p>
          <h1 id="judul-halaman">{modul.judul}</h1>
          {modul.deskripsi && <p className="modul-detail-deskripsi">{modul.deskripsi}</p>}
          <ul className="modul-detail-meta">
            <li>
              <Ikon nama="jam" ukuran={18} /> Estimasi ± {menit} menit
            </li>
            <li>
              <Ikon nama="daftar" ukuran={18} /> {daftar.length} materi
            </li>
            <li>
              <Ikon nama="centang-bulat" ukuran={18} /> Materi selesai saat dibaca
            </li>
          </ul>
        </div>
        <div className="modul-detail-progres">
          <p className="modul-detail-progres-judul">
            Progres Pembelajaran <strong>{pm.persen}%</strong>
          </p>
          <div
            className="bilah-progres"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pm.persen}
            aria-label={`Progres Modul ${modul.nomor}`}
          >
            <div style={{ width: `${pm.persen}%` }} />
          </div>
          <p className="label-kecil">
            {pm.selesai} dari {pm.total} materi diselesaikan
          </p>
        </div>
      </section>

      {modul.tujuan.length > 0 && (
        <section className="modul-detail-tujuan" aria-labelledby="judul-tujuan">
          <h2 id="judul-tujuan">
            <Ikon nama="target" ukuran={20} /> Tujuan modul
          </h2>
          <ul>
            {modul.tujuan.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="judul-daftar-materi">
        <div className="modul-detail-daftar-kepala">
          <div>
            <h2 id="judul-daftar-materi">Daftar Materi pada Modul Ini</h2>
            <p className="label-kecil">Baca materi secara berurutan. Materi berikutnya terbuka setelah materi sebelumnya dibaca.</p>
          </div>
          <span className="lencana lencana-materi-tersedia">
            <Ikon nama="daftar" ukuran={16} /> Berurutan
          </span>
        </div>

        <ol className="daftar-materi-modul">
          {daftar.map((d) => {
            const m = d.materi;
            const l = LENCANA_MATERI[d.status];
            const sebelum = r.daftar[m.indeks - 1]?.materi;
            const aktif = d.status === 'tersedia';
            return (
              <li key={m.kunci} className={`kartu-materi-modul status-${d.status}${aktif ? ' kartu-materi-aktif' : ''}`}>
                <span className="kartu-materi-modul-nomor" aria-hidden="true">
                  {d.status === 'selesai' ? '✓' : d.status === 'terkunci' ? <Ikon nama="gembok" ukuran={20} /> : m.urutan_dalam_modul}
                </span>
                <div className="kartu-materi-modul-teks">
                  <p className="kartu-materi-modul-label">
                    <span>Materi {m.nomor}</span>
                    <span className={`lencana lencana-materi-${l.kelas}`}>
                      <Ikon nama={l.ikon} ukuran={14} /> {l.teks}
                    </span>
                  </p>
                  <h3>
                    {m.urutan_dalam_modul}. {m.judul}
                  </h3>
                  <p className="kartu-materi-modul-deskripsi">{deskripsiSingkat(m.rangkuman, m.tujuan[0])}</p>
                  <p className="label-kecil kartu-materi-modul-menit">
                    <Ikon nama="jam" ukuran={16} /> {m.menit} menit baca
                  </p>
                </div>
                <div className="kartu-materi-modul-aksi">
                  {d.status === 'selesai' && (
                    <Link className="tombol tombol-sekunder" href={`/belajar/materi/${m.kunci}/`}>
                      <Ikon nama="putar" ukuran={18} /> Baca Ulang<span className="sr-only"> Materi {m.nomor}</span>
                    </Link>
                  )}
                  {aktif && (
                    <Link className="tombol" href={`/belajar/materi/${m.kunci}/`}>
                      Mulai Pelajari<span className="sr-only"> Materi {m.nomor}</span> <Ikon nama="panah-kanan" ukuran={18} />
                    </Link>
                  )}
                  {d.status === 'terkunci' && (
                    <span className="kartu-materi-modul-kunci">
                      <Ikon nama="gembok" ukuran={16} />{' '}
                      {d.alasan_kunci === 'pretest' ? 'Terbuka setelah Anda mengisi pretest' : `Baca dulu Materi ${sebelum?.nomor ?? ''}`}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="modul-detail-bawah">
        <Link className="tombol tombol-sekunder" href="/belajar/modul/">
          <span aria-hidden="true">←</span> Kembali ke Daftar Modul
        </Link>
        {berikut ? (
          <Link className="tombol" href={`/belajar/materi/${berikut.kunci}/`}>
            Lanjut ke Materi {berikut.nomor} <Ikon nama="panah-kanan" ukuran={18} />
          </Link>
        ) : (
          pm.status === 'selesai' &&
          modulBerikut && (
            <Link className="tombol" href={`/belajar/modul/${modulBerikut.kunci}/`}>
              Lanjut ke Modul {modulBerikut.nomor} <Ikon nama="panah-kanan" ukuran={18} />
            </Link>
          )
        )}
      </div>
    </div>
  );
}
