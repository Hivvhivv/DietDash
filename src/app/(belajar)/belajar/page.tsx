import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CincinProgres from '@/components/belajar/CincinProgres';
import { HatiSenyum, MangkukSehat } from '@/components/belajar/IlustrasiBeranda';
import Ikon from '@/components/Ikon';
import { srcGambarModul } from '@/data/gambar';
import { progresPerModul, type ProgresModul } from '@/lib/beranda-responden';
import { strukturAktif } from '@/lib/konten';
import { statusResponden } from '@/lib/progres';
import { wajibResponden } from '@/lib/responden';
import { tipsHariIni } from '@/lib/tips';

export const metadata: Metadata = { title: 'Beranda' };
export const dynamic = 'force-dynamic'; // "Tips hari ini" berganti setiap hari

const PESAN: Record<string, string> = {
  terkunci: 'Materi itu masih terkunci. Baca dulu materi sebelumnya secara berurutan.',
};

function TombolModul({ m }: { m: ProgresModul }) {
  const tujuan = m.lanjut ? `/belajar/materi/${m.lanjut.kunci}/` : `/belajar/modul/${m.modul.kunci}/`;
  if (m.status === 'berjalan') {
    return (
      <>
        <Link className="tombol tombol-lanjut-modul" href={tujuan}>
          Lanjutkan
        </Link>
        <div className="modul-beranda-progres">
          <div className="bilah-progres" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={m.persen} aria-label={`Progres Modul ${m.modul.nomor}`}>
            <div style={{ width: `${m.persen}%` }} />
          </div>
          <span>{m.persen}%</span>
        </div>
      </>
    );
  }
  if (m.status === 'selesai') {
    return (
      <>
        <Link className="tombol tombol-sekunder" href={`/belajar/modul/${m.modul.kunci}/`}>
          ✓ Baca Lagi
        </Link>
        <div className="modul-beranda-progres">
          <div className="bilah-progres" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100} aria-label={`Progres Modul ${m.modul.nomor}`}>
            <div style={{ width: '100%' }} />
          </div>
          <span>100%</span>
        </div>
      </>
    );
  }
  return (
    <Link className="tombol" href={m.status === 'belum' ? tujuan : `/belajar/modul/${m.modul.kunci}/`}>
      Buka Modul
    </Link>
  );
}

// Beranda responden (PRD 9 "Dashboard belajar"): sapaan, Lanjutkan Belajar, progres sederhana, modul.
// Tidak ada grafik kesehatan atau peringkat; progres bukan keberhasilan klinis.
export default async function Beranda({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  const a = await wajibResponden();
  const [struktur, sp, tips] = await Promise.all([strukturAktif(), searchParams, tipsHariIni()]);
  const r = struktur ? await statusResponden(a, struktur) : null;
  const modul = struktur && r ? progresPerModul(struktur, r) : [];
  const modulSelesai = modul.filter((m) => m.status === 'selesai').length;
  const persen = r?.persen ?? 0;

  return (
    <>
      {sp.pesan && PESAN[sp.pesan] && (
        <p className="kotak kotak-peringatan" role="status">
          {PESAN[sp.pesan]}
        </p>
      )}

      {/* Satu kartu: sapaan memudar (transparan) ke arah gambar, lalu progres di sisi kanan */}
      <section className="beranda-hero" aria-labelledby="judul-beranda">
        <div className="beranda-hero-utama">
          <div className="beranda-sapa">
            <h1 id="judul-beranda">Halo, {a.r.nama}!</h1>
            <p>Mari belajar bersama tentang diet DASH untuk membantu mengendalikan tekanan darah dan hidup lebih sehat.</p>
            {r ? (
              <Link className="tombol tombol-besar" href={r.lanjut?.url ?? '/belajar/selesai/'}>
                {r.lanjut ? 'Lanjutkan Belajar' : 'Lihat Halaman Selesai'}
                <Ikon nama="panah-kanan" />
              </Link>
            ) : (
              <p className="kotak">Materi sedang disiapkan oleh tim peneliti. Silakan kembali lagi nanti.</p>
            )}
            {r?.lanjut && <p className="label-kecil beranda-sapa-ket">{r.lanjut.label}: {r.lanjut.materi.judul}</p>}
          </div>
          <div className="beranda-gambar">
            <p className="beranda-kutipan">“Pola makan sehat, langkah sederhana untuk tekanan darah yang lebih terkontrol”</p>
            <MangkukSehat />
          </div>
        </div>
        {r && (
          <div className="beranda-progres" aria-labelledby="judul-progres-saya">
            <h2 id="judul-progres-saya">Progres Belajar Anda</h2>
            <div className="beranda-progres-isi">
              <CincinProgres persen={persen} />
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
            <Link className="tombol tombol-sekunder" href="/belajar/modul/">
              Lihat Detail Progres
              <Ikon nama="panah-kanan" />
            </Link>
          </div>
        )}
      </section>

      {r?.daftar[0]?.alasan_kunci === 'pretest' && (
        <p className="kotak kotak-peringatan">
          Materi pertama akan terbuka setelah peneliti mencatat bahwa Anda sudah mengikuti pretest. Ikuti pretest sesuai jadwal dari
          peneliti.
        </p>
      )}

      {modul.length > 0 && (
        <section aria-labelledby="judul-modul-beranda">
          <div className="beranda-bagian-kepala">
            <div>
              <h2 id="judul-modul-beranda">Modul Pembelajaran</h2>
              <p>Pelajari materi secara bertahap dengan bahasa yang mudah dipahami.</p>
            </div>
            <Link href="/belajar/modul/" className="tautan-panah-kanan">
              Lihat Semua Modul
              <Ikon nama="panah-kanan" ukuran={18} />
            </Link>
          </div>
          <ol className="kisi-modul-beranda-baru">
            {modul.map((m) => {
              const menit = m.modul.materi.reduce((n, x) => n + x.menit, 0);
              return (
                <li key={m.modul.kunci} className="modul-beranda">
                  <div className="modul-beranda-gambar">
                    <Image src={srcGambarModul(m.modul.gambar)} alt="" width={140} height={110} unoptimized={m.modul.gambar.jenis === 'unggah'} />
                    {m.status === 'terkunci' && (
                      <span className="lencana lencana-materi-terkunci modul-beranda-kunci">🔒 Terkunci</span>
                    )}
                    {m.status === 'selesai' && <span className="lencana lencana-materi-selesai modul-beranda-kunci">✓ Selesai</span>}
                  </div>
                  <h3>
                    <Link href={`/belajar/modul/${m.modul.kunci}/`}>{m.modul.judul}</Link>
                  </h3>
                  <p className="modul-beranda-deskripsi">{m.modul.deskripsi}</p>
                  <p className="modul-beranda-meta">
                    <span>
                      <Ikon nama="jam" ukuran={18} /> ± {menit} menit
                    </span>
                    <span>
                      <Ikon nama="dokumen" ukuran={18} /> {m.total} materi
                    </span>
                  </p>
                  <TombolModul m={m} />
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="beranda-bawah">
        <section className="beranda-kartu beranda-kartu-hati" aria-label="Kata penyemangat">
          <HatiSenyum />
          <p className="beranda-kutipan-hati">Tekanan darah terkontrol bisa dimulai dari pilihan makanan setiap hari.</p>
        </section>
        <Link href="/belajar/tips/" className="beranda-kartu beranda-kartu-tips">
          <span className="beranda-kartu-ikon" aria-hidden="true">
            <Ikon nama="lampu" ukuran={26} />
          </span>
          <span className="beranda-kartu-teks">
            <span className="beranda-kartu-judul">Tips Hari Ini</span>
            <span>
              {tips ? (
                <>
                  <strong>{tips.judul}.</strong> {tips.catatan || tips.solusi}
                </>
              ) : (
                'Langkah kecil setiap hari untuk pola makan yang lebih sehat.'
              )}
            </span>
          </span>
          <span className="beranda-kartu-panah" aria-hidden="true">
            <Ikon nama="panah-kanan" ukuran={18} />
          </span>
        </Link>
        <Link href="/tentang/#batasan" className="beranda-kartu beranda-kartu-info">
          <span className="beranda-kartu-ikon" aria-hidden="true">
            i
          </span>
          <span className="beranda-kartu-teks">
            <span className="beranda-kartu-judul">Informasi Penting</span>
            <span>Website ini berisi edukasi dan bukan pengganti konsultasi dengan tenaga kesehatan.</span>
          </span>
          <span className="beranda-kartu-panah" aria-hidden="true">
            <Ikon nama="panah-kanan" ukuran={18} />
          </span>
        </Link>
      </div>
    </>
  );
}
