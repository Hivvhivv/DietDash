import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CincinProgres from '@/components/belajar/CincinProgres';
import { OrangJempol } from '@/components/belajar/IlustrasiBeranda';
import Ikon, { type NamaIkon } from '@/components/Ikon';
import { srcGambarModul } from '@/data/gambar';
import { progresPerModul, type ProgresModul, type StatusModul } from '@/lib/beranda-responden';
import { strukturAktif } from '@/lib/konten';
import { statusResponden } from '@/lib/progres';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Modul Pembelajaran' };

// Status selalu ikon + teks. Modul terkunci tetap ditulis "Terkunci" agar tidak terkesan bisa langsung dimulai.
const LENCANA: Record<StatusModul, { kelas: string; teks: string; ikon: NamaIkon }> = {
  selesai: { kelas: 'selesai', teks: 'Selesai', ikon: 'centang-bulat' },
  berjalan: { kelas: 'sedang', teks: 'Sedang dipelajari', ikon: 'jam-pasir' },
  belum: { kelas: 'tersedia', teks: 'Siap dimulai', ikon: 'putar' },
  terkunci: { kelas: 'terkunci', teks: 'Terkunci', ikon: 'gembok' },
};

function TombolModul({ m }: { m: ProgresModul }) {
  const halamanModul = `/belajar/modul/${m.modul.kunci}/`;
  const tujuan = m.lanjut ? `/belajar/materi/${m.lanjut.kunci}/` : halamanModul;
  if (m.status === 'berjalan')
    return (
      <Link className="tombol" href={tujuan}>
        Lanjutkan Modul
        <Ikon nama="panah-kanan" />
      </Link>
    );
  if (m.status === 'belum')
    return (
      <Link className="tombol" href={tujuan}>
        <Ikon nama="putar" />
        Mulai Modul
      </Link>
    );
  return (
    <Link className="tombol tombol-lanjut-modul" href={halamanModul}>
      <Ikon nama="buku" />
      {m.status === 'selesai' ? 'Lihat Ulang Modul' : 'Lihat Isi Modul'}
    </Link>
  );
}

function pesanSemangat(modulSelesai: number, modulTotal: number, materiSelesai: number) {
  if (modulTotal > 0 && modulSelesai === modulTotal) return { judul: 'Hebat!', teks: 'Semua modul sudah Anda selesaikan.' };
  if (modulSelesai > 0) return { judul: 'Bagus!', teks: `Anda sudah menyelesaikan ${modulSelesai} modul. Terus semangat!` };
  if (materiSelesai > 0) return { judul: 'Bagus!', teks: `Anda sudah menyelesaikan ${materiSelesai} materi. Terus semangat!` };
  return { judul: 'Ayo mulai!', teks: 'Selesaikan materi pertama Anda hari ini.' };
}

export default async function ModulPembelajaran() {
  const a = await wajibResponden();
  const struktur = await strukturAktif();
  const r = struktur ? await statusResponden(a, struktur) : null;
  const modul = struktur && r ? progresPerModul(struktur, r) : [];
  const modulSelesai = modul.filter((m) => m.status === 'selesai').length;
  const semangat = pesanSemangat(modulSelesai, modul.length, r?.selesai ?? 0);

  return (
    <>
      <div className="modul-kepala">
        <div className="modul-kepala-teks">
          <nav aria-label="Lokasi halaman" className="remah">
            <Link href="/belajar/">
              <Ikon nama="rumah" ukuran={20} />
              Beranda
            </Link>
            <span className="remah-item">
              <span aria-hidden="true">›</span>
              <span aria-current="page">Modul Pembelajaran</span>
            </span>
          </nav>
          <h1>Modul Pembelajaran</h1>
          <p>
            Pelajari materi secara bertahap dengan bahasa yang mudah dipahami. Klik salah satu modul untuk memulai atau melanjutkan
            belajar.
          </p>
        </div>
        {r && (
          <section className="modul-progres" aria-labelledby="judul-progres-modul">
            <div className="modul-progres-angka">
              <h2 id="judul-progres-modul">Progres Belajar Anda</h2>
              <div className="beranda-progres-isi">
                <CincinProgres persen={r.persen} />
                <p>
                  <strong>
                    {modulSelesai} dari {modul.length} modul
                  </strong>{' '}
                  selesai
                  <span className="label-kecil">
                    {r.selesai} dari {r.total} materi
                  </span>
                </p>
              </div>
            </div>
            <div className="modul-progres-semangat">
              <OrangJempol />
              <p className="modul-progres-gelembung">
                <strong>{semangat.judul}</strong> {semangat.teks}
              </p>
            </div>
          </section>
        )}
      </div>

      {!r ? (
        <p className="kotak">Materi sedang disiapkan oleh tim peneliti. Silakan kembali lagi nanti.</p>
      ) : (
        <ol className="kisi-modul-belajar">
          {modul.map((m) => {
            const l = LENCANA[m.status];
            const menit = m.modul.materi.reduce((n, x) => n + x.menit, 0);
            return (
              <li key={m.modul.kunci} className={`kartu-modul-belajar status-${m.status}`}>
                <div className="kartu-modul-belajar-atas">
                  <div className="kartu-modul-belajar-gambar">
                    <Image
                      src={srcGambarModul(m.modul.gambar)}
                      alt=""
                      width={140}
                      height={110}
                      unoptimized={m.modul.gambar.jenis === 'unggah'}
                    />
                  </div>
                  <div className="kartu-modul-belajar-teks">
                    <div className="kartu-modul-belajar-judul">
                      <h2>
                        <Link href={`/belajar/modul/${m.modul.kunci}/`}>
                          {m.modul.nomor}. {m.modul.judul}
                        </Link>
                      </h2>
                      <span className={`lencana lencana-modul lencana-materi-${l.kelas}`}>
                        <Ikon nama={l.ikon} ukuran={18} />
                        {l.teks}
                      </span>
                    </div>
                    <p className="kartu-modul-belajar-deskripsi">{m.modul.deskripsi}</p>
                  </div>
                </div>
                <p className="kartu-modul-belajar-meta">
                  <span>
                    <Ikon nama="dokumen" ukuran={18} />
                    {m.status === 'selesai' ? `${m.total} materi` : `${m.selesai} dari ${m.total} materi`}
                  </span>
                  <span aria-hidden="true">|</span>
                  <span>± {menit} menit</span>
                </p>
                <div className="kartu-modul-belajar-progres">
                  <div
                    className="bilah-progres"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={m.persen}
                    aria-label={`Progres Modul ${m.modul.nomor}`}
                  >
                    <div style={{ width: `${m.persen}%` }} />
                  </div>
                  <strong>{m.persen}%</strong>
                </div>
                <TombolModul m={m} />
              </li>
            );
          })}
        </ol>
      )}

      {r?.daftar[0]?.alasan_kunci === 'pretest' && (
        <p className="kotak kotak-peringatan">
          Materi pertama akan terbuka setelah peneliti mencatat bahwa Anda sudah mengikuti pretest. Ikuti pretest sesuai jadwal dari
          peneliti.
        </p>
      )}

      <div className="modul-bawah">
        <section className="beranda-kartu beranda-kartu-info" aria-labelledby="judul-tips-modul">
          <span className="beranda-kartu-ikon" aria-hidden="true">
            <Ikon nama="lampu" ukuran={26} />
          </span>
          <div className="beranda-kartu-teks">
            <h2 id="judul-tips-modul" className="beranda-kartu-judul">
              Tips untuk Anda
            </h2>
            <span>
              Selesaikan modul secara berurutan agar lebih mudah dipahami. Anda bisa mengulang materi yang sudah selesai kapan saja.
            </span>
          </div>
        </section>
        <section className="beranda-kartu modul-kartu-bantuan" aria-labelledby="judul-bantuan-modul">
          <span className="beranda-kartu-ikon" aria-hidden="true">
            i
          </span>
          <div className="beranda-kartu-teks">
            <h2 id="judul-bantuan-modul" className="beranda-kartu-judul">
              Perlu Bantuan?
            </h2>
            <span>
              Jika ada kesulitan menggunakan website ini, silakan minta bantuan keluarga atau hubungi tim peneliti. Untuk pertanyaan
              tentang kesehatan Anda, tanyakan kepada tenaga kesehatan terdekat.
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
