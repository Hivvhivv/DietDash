import Image from 'next/image';
import Link from 'next/link';
import KartuModul from '@/components/KartuModul';
import { ambilSemuaModul } from '@/lib/konten';

const keunggulan = [
  { ikon: 'buku', teks: 'Materi mudah dipahami' },
  { ikon: 'sendok', teks: 'Contoh menu sehari-hari' },
  { ikon: 'soal', teks: 'Latihan soal di setiap modul' },
  { ikon: 'jam', teks: 'Dapat diakses kapan saja' },
] as const;

// Kalimat manfaat sengaja memakai "membantu"/"mendukung": DASH melengkapi pengobatan, bukan menyembuhkan.
const manfaat = [
  { gambar: '/gambar/ikon-tekanan-darah.png', teks: 'Membantu mengontrol tekanan darah' },
  { gambar: '/gambar/ikon-jantung-sehat.png', teks: 'Menjaga kesehatan jantung' },
  { gambar: '/gambar/ikon-otak.png', teks: 'Membantu menurunkan risiko stroke' },
  { gambar: '/gambar/ikon-kualitas-hidup.png', teks: 'Mendukung kualitas hidup' },
];

function IkonKeunggulan({ nama }: { nama: (typeof keunggulan)[number]['ikon'] }) {
  const umum = { width: 30, height: 30, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false } as const;
  switch (nama) {
    case 'buku':
      return (
        <svg {...umum}>
          <path d="M3 5.5C5.5 4.5 8.5 4.5 11.2 6v13c-2.7-1.5-5.7-1.5-8.2-.5z" fill="currentColor" />
          <path d="M21 5.5c-2.5-1-5.5-1-8.2.5v13c2.7-1.5 5.7-1.5 8.2-.5z" fill="currentColor" />
        </svg>
      );
    case 'sendok':
      return (
        <svg {...umum}>
          <path d="M6 3v6a2 2 0 0 0 1.5 1.94V21h2V10.94A2 2 0 0 0 11 9V3H9.5v5h-.8V3H7.3v5h-.8V3z" fill="currentColor" />
          <path d="M16.5 3c-2 0-3 2.6-3 5.5 0 2 .9 3.3 2 3.8V21h2v-8.7c1.1-.5 2-1.8 2-3.8C19.5 5.6 18.5 3 16.5 3z" fill="currentColor" />
        </svg>
      );
    case 'jam':
      return (
        <svg {...umum}>
          <circle cx="12" cy="12" r="9.5" fill="currentColor" />
          <path d="M12 6.5V12l3.5 2.2" fill="none" stroke="#e6f4ec" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'soal':
      return (
        <svg {...umum}>
          <rect x="4" y="2.5" width="16" height="19" rx="3" fill="currentColor" />
          <path d="M8 9h8M8 13h4.5M8 17h6" stroke="#e6f4ec" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 6h3" stroke="#e6f4ec" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}

function Panah() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function Beranda() {
  const modul = await ambilSemuaModul();
  const pertama = modul[0];

  return (
    <>
      <section className="hero" aria-labelledby="judul-hero">
        <div className="wadah hero-isi">
          <div className="hero-teks">
            <p className="hero-lencana">Website Edukasi Diet DASH</p>
            <h1 id="judul-hero" className="hero-judul">
              <span className="hero-judul-utama">Mulai Kenali Diet DASH</span>{' '}
              <span className="hero-judul-sub">untuk Tekanan Darah yang Lebih Terkontrol</span>
            </h1>
            <p className="hero-lead">
              Pelajari cara makan sehat, mudah, dan sesuai dengan kebiasaan sehari-hari untuk
              membantu mengontrol tekanan darah dan menjaga kesehatan jantung.
            </p>
            <div className="grup-tombol">
              <Link className="tombol tombol-besar" href={`/materi/${pertama.id}/`}>
                Mulai Belajar <Panah />
              </Link>
              <Link className="tombol tombol-sekunder tombol-besar" href="/materi/">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M3 5.5C5.5 4.5 8.5 4.5 11.2 6v13c-2.7-1.5-5.7-1.5-8.2-.5zM21 5.5c-2.5-1-5.5-1-8.2.5v13c2.7-1.5 5.7-1.5 8.2-.5z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                Lihat Materi
              </Link>
            </div>
          </div>

          <figure className="hero-foto">
            <Image
              src="/gambar/beranda-hero.png"
              alt="Pasangan paruh baya tersenyum sambil belajar dari laptop, dengan sepiring sayur, ikan, dan buah di meja."
              width={612}
              height={438}
              sizes="(min-width: 60rem) 55vw, 100vw"
              preload
            />
            <blockquote className="hero-kutipan">
              <p>“Makan Sehat Hari Ini, Tekanan Darah Lebih Baik Esok Nanti”</p>
            </blockquote>
          </figure>
        </div>
      </section>

      <section className="wadah" aria-label="Yang Anda dapatkan">
        <ul className="keunggulan">
          {keunggulan.map((k) => (
            <li key={k.ikon}>
              <span className="keunggulan-ikon">
                <IkonKeunggulan nama={k.ikon} />
              </span>
              <span>{k.teks}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="wadah bagian" aria-labelledby="judul-modul">
        <div className="bagian-kepala">
          <div>
            <h2 id="judul-modul">Modul Pembelajaran</h2>
            <p>Pelajari materi secara bertahap, mulai dari Modul 1.</p>
          </div>
          <Link className="tautan-panah" href="/materi/">
            Lihat Semua Modul <Panah />
          </Link>
        </div>
        <ol className="kisi-modul-beranda">
          {modul.map((m) => (
            <li key={m.id}>
              <KartuModul modul={m} tingkatJudul="h3" />
            </li>
          ))}
        </ol>
      </section>

      <section className="wadah bagian" aria-labelledby="judul-apa-itu">
        <div className="apa-itu">
          <div>
            <h2 id="judul-apa-itu">Apa itu DASH Sehat?</h2>
            <p>
              DASH Sehat adalah website edukasi yang membantu Anda memahami dan menerapkan diet DASH
              untuk menjaga tekanan darah dan kesehatan secara keseluruhan. Materinya dibagi menjadi
              modul-modul singkat, lengkap dengan contoh menu Indonesia dan latihan soal.
            </p>
            <p>
              Semua materi bisa dibuka tanpa akun. Bila ingin menyimpan progres belajar, Anda bisa{' '}
              <Link href="/daftar/">membuat akun</Link>.
            </p>
            <p className="grup-tautan">
              <Link href="/tentang/">Tentang kami</Link>
              <Link href="/rangkuman/">Rangkuman materi</Link>
            </p>
          </div>
          <Image src="/gambar/belajar-laptop.png" alt="" width={136} height={122} />
        </div>
      </section>

      <div className="wadah bagian bagian-penting">
        <aside className="catatan-nakes" aria-label="Catatan penting">
          <Image src="/gambar/tenaga-kesehatan.png" alt="" width={188} height={182} />
          <p className="catatan-nakes-teks">
            Website ini berisi edukasi kesehatan dan bukan pengganti konsultasi dengan tenaga
            kesehatan.
          </p>
        </aside>

        <section aria-labelledby="judul-penting">
          <h2 id="judul-penting">Mengapa Diet DASH Penting?</h2>
          <ul className="manfaat">
            {manfaat.map((m) => (
              <li key={m.teks}>
                <Image src={m.gambar} alt="" width={56} height={54} />
                <span>{m.teks}</span>
              </li>
            ))}
          </ul>
          <p className="label-kecil">
            Diet DASH melengkapi pengobatan dari dokter, bukan menggantikannya.{' '}
            <Link href="/materi/mengenal-diet-dash/">Pelajari di Modul 2</Link>
          </p>
        </section>
      </div>
    </>
  );
}
