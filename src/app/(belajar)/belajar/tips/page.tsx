import type { Metadata } from 'next';
import Link from 'next/link';
import { KATEGORI_TIPS, tipsHariIni } from '@/data/tips';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Tips Sehari-hari' };
export const dynamic = 'force-dynamic'; // "Tips hari ini" berganti setiap hari

export default async function Tips() {
  await wajibResponden();
  const hariIni = tipsHariIni();

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Tips Sehari-hari</h1>
        <p>Langkah kecil yang bisa langsung dicoba di rumah, saat belanja, dan saat makan di luar.</p>
      </div>

      <section className="kartu-lanjut kartu-tips-hari-ini" aria-labelledby="judul-tips-hari-ini">
        <span className="tips-emoji-besar" aria-hidden="true">
          {hariIni.emoji}
        </span>
        <div>
          <p className="label-kecil">Tips hari ini</p>
          <h2 id="judul-tips-hari-ini">{hariIni.judul}</h2>
          <p>{hariIni.teks}</p>
        </div>
      </section>

      <nav className="chip-kategori" aria-label="Kategori tips">
        {KATEGORI_TIPS.map((k) => (
          <a key={k.kunci} href={`#tips-${k.kunci}`}>
            {k.judul}
          </a>
        ))}
      </nav>

      {KATEGORI_TIPS.map((k) => (
        <section key={k.kunci} id={`tips-${k.kunci}`} className="kartu-panel" aria-labelledby={`judul-tips-${k.kunci}`}>
          <h2 id={`judul-tips-${k.kunci}`}>{k.judul}</h2>
          <ul className="daftar-tips">
            {k.tips.map((t) => (
              <li key={t.judul}>
                <span className="tips-emoji" aria-hidden="true">
                  {t.emoji}
                </span>
                <div>
                  <h3>{t.judul}</h3>
                  <p>{t.teks}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="label-kecil">
        Tips ini melengkapi materi di <Link href="/belajar/modul/">Modul Pembelajaran</Link> dan tidak menggantikan saran dokter atau
        tenaga kesehatan.
      </p>
    </>
  );
}
