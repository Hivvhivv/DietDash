import type { Metadata } from 'next';
import Link from 'next/link';
import Ikon from '@/components/Ikon';
import { kuisResponden, type StatusKuis } from '@/lib/beranda-responden';
import { strukturAktif } from '@/lib/konten';
import { statusResponden } from '@/lib/progres';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Kuis' };

// Status selalu ikon + teks (PRD 6, 14).
const STATUS: Record<StatusKuis, { kelas: string; teks: string }> = {
  selesai: { kelas: 'selesai', teks: '✓ Selesai' },
  berjalan: { kelas: 'sedang', teks: '◐ Sedang dikerjakan' },
  siap: { kelas: 'tersedia', teks: '▶ Siap dikerjakan' },
  terkunci: { kelas: 'terkunci', teks: '🔒 Terkunci' },
};

const persen = (n: number | null) => (n === null ? '—' : `${n}%`);
// Judul yang sudah berakhir tanda tanya/seru tidak diberi titik lagi.
const kalimat = (s: string) => (/[.?!]$/.test(s) ? s : `${s}.`);

export default async function DaftarKuis() {
  const a = await wajibResponden();
  const struktur = await strukturAktif();
  if (!struktur) {
    return (
      <>
        <div className="dasbor-kepala">
          <h1>Kuis</h1>
        </div>
        <p className="kotak">Kuis sedang disiapkan oleh tim peneliti.</p>
      </>
    );
  }
  const r = await statusResponden(a, struktur);
  const kuis = await kuisResponden(a.r._id, r);
  const belum = kuis.filter((k) => k.status !== 'selesai');
  const siap = kuis.filter((k) => k.status === 'siap' || k.status === 'berjalan');
  const selesai = kuis.length - belum.length;
  const berikut = siap[0];

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Kuis</h1>
        <p>Setiap materi diakhiri kuis singkat. Kuis ini latihan, bukan ujian; setiap jawaban diberi penjelasan.</p>
      </div>

      <section className={`kartu-lanjut${belum.length ? '' : ' kartu-lanjut-selesai'}`} aria-labelledby="judul-kuis-berikut" role="status">
        <div>
          <h2 id="judul-kuis-berikut">
            {belum.length ? `Ada ${belum.length} kuis yang belum diselesaikan` : 'Semua kuis sudah selesai!'}
          </h2>
          <p>
            {berikut
              ? kalimat(`${berikut.status === 'berjalan' ? 'Lanjutkan' : 'Kerjakan'} kuis Materi ${berikut.materi.nomor}: ${berikut.materi.judul}`)
              : belum.length
                ? 'Kuis berikutnya terbuka setelah materi sebelumnya selesai.'
                : 'Terima kasih sudah berlatih. Anda tetap boleh mengulang kuis kapan saja.'}
          </p>
        </div>
        {berikut && (
          <Link
            className="tombol tombol-besar"
            href={`/belajar/materi/${berikut.materi.kunci}/${berikut.status === 'berjalan' || berikut.statusMateri === 'sedang' ? 'kuis/' : ''}`}
          >
            {berikut.status === 'berjalan' ? 'Lanjutkan Kuis' : berikut.statusMateri === 'sedang' ? 'Kerjakan Kuis' : 'Baca Materi Dulu'}
            <Ikon nama="panah-kanan" />
          </Link>
        )}
      </section>

      <ul className="kartu-stat">
        <li>
          <div className="kartu-stat-isi">
            <span className="ubin-ikon ubin-oranye">
              <Ikon nama="tanya" ukuran={24} />
            </span>
            <span className="kartu-stat-angka">{belum.length}</span>
            <span className="kartu-stat-label">Belum Selesai</span>
            <span className="kartu-stat-ket">dari {kuis.length} kuis</span>
          </div>
        </li>
        <li>
          <div className="kartu-stat-isi">
            <span className="ubin-ikon ubin-biru">
              <Ikon nama="kuis" ukuran={24} />
            </span>
            <span className="kartu-stat-angka">{siap.length}</span>
            <span className="kartu-stat-label">Siap Dikerjakan</span>
            <span className="kartu-stat-ket">materinya sudah terbuka</span>
          </div>
        </li>
        <li>
          <div className="kartu-stat-isi">
            <span className="ubin-ikon ubin-hijau">
              <Ikon nama="perisai" ukuran={24} />
            </span>
            <span className="kartu-stat-angka">{selesai}</span>
            <span className="kartu-stat-label">Selesai</span>
            <span className="kartu-stat-ket">kuis sudah dikerjakan</span>
          </div>
        </li>
      </ul>

      {struktur.modul.map((md) => {
        const milik = kuis.filter((k) => k.materi.modul.kunci === md.kunci);
        const belumModul = milik.filter((k) => k.status !== 'selesai').length;
        return (
          <section key={md.kunci} className="kartu-panel" aria-labelledby={`kuis-modul-${md.kunci}`}>
            <div className="kartu-panel-kepala">
              <h2 id={`kuis-modul-${md.kunci}`}>
                Modul {md.nomor}. {md.judul}
              </h2>
              <span className="label-kecil">{belumModul ? `${belumModul} kuis belum selesai` : '✓ Semua kuis selesai'}</span>
            </div>
            <ul className="daftar-kuis-responden">
              {milik.map((k) => {
                const st = STATUS[k.status];
                return (
                  <li key={k.materi.kunci} className={`kuis-${k.status}`}>
                    <div className="daftar-kuis-teks">
                      <strong>
                        Kuis {k.materi.nomor} · {k.materi.judul}
                      </strong>
                      <span className="label-kecil">
                        {k.jumlahSoal} soal
                        {k.percobaan > 0 && ` · skor pertama ${persen(k.skorPertama)} · terbaik ${persen(k.skorTerbaik)}`}
                        {k.status === 'terkunci' && ' · selesaikan kuis materi sebelumnya dulu'}
                      </span>
                    </div>
                    <span className={`lencana lencana-materi-${st.kelas}`}>{st.teks}</span>
                    {k.status === 'berjalan' && (
                      <Link className="tombol tombol-kecil" href={`/belajar/materi/${k.materi.kunci}/kuis/`}>
                        Lanjutkan
                      </Link>
                    )}
                    {k.status === 'siap' &&
                      (k.statusMateri === 'sedang' ? (
                        <Link className="tombol tombol-kecil" href={`/belajar/materi/${k.materi.kunci}/kuis/`}>
                          Kerjakan
                        </Link>
                      ) : (
                        // Materi belum dibuka: baca dulu, tombol "Kerjakan Kuis" ada di akhir materi (PRD 6).
                        <Link className="tombol tombol-kecil" href={`/belajar/materi/${k.materi.kunci}/`}>
                          Baca Materi
                        </Link>
                      ))}
                    {k.status === 'selesai' && (
                      <Link className="tombol tombol-sekunder tombol-kecil" href={`/belajar/materi/${k.materi.kunci}/kuis/`}>
                        Ulangi
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
