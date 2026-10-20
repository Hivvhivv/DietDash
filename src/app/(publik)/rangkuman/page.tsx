import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import KepalaHalaman from '@/components/KepalaHalaman';
import TabRangkuman from '@/components/TabRangkuman';
import { GAMBAR_ILUSTRASI } from '@/data/gambar';
import { ambilSemuaModul } from '@/lib/konten';

export const metadata: Metadata = {
  title: 'Rangkuman Materi',
  description: 'Poin-poin penting dari seluruh modul diet DASH.',
};

export default async function Rangkuman() {
  const modul = await ambilSemuaModul();

  return (
    <>
      <KepalaHalaman
        remah={[{ href: '/materi/', label: 'Modul Pembelajaran' }]}
        label="Rangkuman"
        judul="Rangkuman Materi"
        ringkasan="Poin-poin penting dari seluruh modul. Cocok untuk mengulang sebelum mengerjakan kuis."
        gambar={{ src: '/gambar/ilustrasi/langkah.png', width: 140, height: 110 }}
      />
      <div className="wadah-baca bagian-isi">
        <TabRangkuman tab={modul.map((m) => ({ id: m.id, label: `Modul ${m.urutan}` }))}>
          <div className="daftar-rangkuman">
            {modul.map((m) => (
              <section key={m.id} data-tab={m.id} className="kartu rangkuman-modul" aria-labelledby={`rk-${m.id}`}>
                <Image src={GAMBAR_ILUSTRASI[m.ilustrasi]} alt="" width={72} height={57} />
                <div>
                  <h2 id={`rk-${m.id}`}>
                    <span className="label-kecil">Modul {m.urutan}</span>
                    <br />
                    {m.judul}
                  </h2>
                  <ul>
                    {m.poin_penting.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <p className="grup-tautan">
                    <Link href={`/materi/${m.id}/`}>Buka modul</Link>
                    <Link href={`/materi/${m.id}/latihan/`}>Latihan soal</Link>
                  </p>
                </div>
              </section>
            ))}
          </div>
        </TabRangkuman>
        <div className="ajak-kuis">
          <p>
            <strong>Siap menguji pemahaman Anda?</strong> Kerjakan kuis latihan lengkap.
          </p>
          <Link className="tombol tombol-besar" href="/kuis/">
            Mulai Kuis Latihan
          </Link>
        </div>
      </div>
    </>
  );
}
