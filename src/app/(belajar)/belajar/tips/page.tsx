import type { Metadata } from 'next';
import Link from 'next/link';
import ChecklistHarian from '@/components/belajar/ChecklistHarian';
import IlustrasiTips from '@/components/belajar/IlustrasiTips';
import Ikon from '@/components/Ikon';
import { PRINSIP_TIPS } from '@/data/tips';
import { KATEGORI_TIPS, type DokTips, type KategoriTips } from '@/lib/db';
import { wajibResponden } from '@/lib/responden';
import { LABEL_KATEGORI_TIPS, daftarTipsTerbit, pilihHariIni } from '@/lib/tips';

export const metadata: Metadata = { title: 'Tips Sehari-hari' };
export const dynamic = 'force-dynamic'; // daftar tips dikelola admin; "tips hari ini" berganti setiap hari

const adalahKategori = (v?: string): v is KategoriTips => !!v && (KATEGORI_TIPS as readonly string[]).includes(v);

function GambarTips({ t, className }: { t: DokTips; className: string }) {
  return t.gambar ? (
    // Gambar unggahan admin (WebP dari /gambar-konten/); ukuran diatur CSS.
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={`/gambar-konten/${t.gambar.id}/`} alt={t.gambar.alt} width={480} height={320} loading="lazy" />
  ) : (
    <IlustrasiTips kategori={t.kategori} className={className} />
  );
}

export default async function Tips({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  await wajibResponden();
  const sp = await searchParams;
  const kategori = adalahKategori(sp.kategori) ? sp.kategori : undefined;
  const semua = await daftarTipsTerbit();
  const daftar = kategori ? semua.filter((t) => t.kategori === kategori) : semua;
  const hariIni = pilihHariIni(semua);
  const kategoriAda = KATEGORI_TIPS.filter((k) => semua.some((t) => t.kategori === k));

  return (
    <>
      <section className="tips-hero" aria-labelledby="judul-tips">
        <div className="tips-hero-teks">
          <p className="resep-lencana">
            <span aria-hidden="true">💡</span> Tips Sehari-hari · Diet DASH
          </p>
          <h1 id="judul-tips">Tips Sehari-hari: Trik Praktis Menjalani Diet DASH Tanpa Tersiksa</h1>
          <p>
            Panduan langkah demi langkah yang mudah diterapkan di rumah, pasar, warung, dan saat berkumpul bersama keluarga, agar
            makanan tetap enak meski garam dikurangi.
          </p>
          <div className="grup-tombol">
            <a className="tombol" href="#katalog-tips">
              Jelajahi Tips
              <Ikon nama="panah-kanan" ukuran={18} />
            </a>
            <a className="tombol tombol-sekunder" href="#checklist-harian">
              <Ikon nama="daftar" ukuran={18} />
              Checklist Harian
            </a>
          </div>
        </div>
        {hariIni && (
          <div className="tips-sorotan">
            <GambarTips t={hariIni} className="gambar-tips" />
            <div className="tips-sorotan-isi">
              <span className="resep-sorotan-label tips-sorotan-label">Tips hari ini</span>
              <h2>{hariIni.judul}</h2>
              <p>{hariIni.catatan || hariIni.solusi}</p>
            </div>
          </div>
        )}
      </section>

      <ul className="tips-prinsip">
        {PRINSIP_TIPS.map((p, i) => (
          <li key={p.judul}>
            <span className="tips-prinsip-ikon" aria-hidden="true">
              {['👅', '📉', '🔑'][i]}
            </span>
            <h2>{p.judul}</h2>
            <p>{p.teks}</p>
          </li>
        ))}
      </ul>

      <section id="katalog-tips" className="resep-daftar" aria-labelledby="judul-katalog-tips">
        <div className="beranda-bagian-kepala">
          <div>
            <h2 id="judul-katalog-tips">Katalog Tips Praktis</h2>
            <p>Pilih kategori sesuai kebutuhan Anda sehari-hari.</p>
          </div>
          <span className="lencana lencana-materi-selesai">✓ {daftar.length} tips</span>
        </div>
        {kategoriAda.length > 1 && (
          <nav aria-label="Saring kategori tips">
            <ul className="resep-chip tips-chip">
              <li>
                <Link href="/belajar/tips/#katalog-tips" aria-current={!kategori ? 'true' : undefined}>
                  Semua Tips
                </Link>
              </li>
              {kategoriAda.map((k) => (
                <li key={k}>
                  <Link href={`/belajar/tips/?kategori=${k}#katalog-tips`} aria-current={kategori === k ? 'true' : undefined}>
                    {LABEL_KATEGORI_TIPS[k]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {daftar.length > 0 ? (
          <ul className="kisi-resep">
            {daftar.map((t) => (
              <li key={t._id.toHexString()} className="kartu-resep kartu-tips">
                <div className="kartu-resep-gambar">
                  <GambarTips t={t} className="gambar-tips" />
                  <span className="kartu-resep-tag">
                    <span className="tag-resep tag-resep-waktu">{LABEL_KATEGORI_TIPS[t.kategori]}</span>
                  </span>
                </div>
                <div className="kartu-resep-isi">
                  <h3>{t.judul}</h3>
                  <div className="tips-masalah">
                    <p className="tips-kotak-judul">
                      <Ikon nama="peringatan" ukuran={18} /> Masalah
                    </p>
                    <p>{t.masalah}</p>
                  </div>
                  <div className="tips-solusi">
                    <p className="tips-kotak-judul">
                      <Ikon nama="centang-bulat" ukuran={18} /> Solusi Praktis
                    </p>
                    <p>{t.solusi}</p>
                  </div>
                  {t.catatan && (
                    <p className="rahasia-gurih tips-catatan">
                      <Ikon nama="lampu" ukuran={20} />
                      <span>{t.catatan}</span>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="kotak">
            {semua.length ? (
              <>
                Belum ada tips di kategori ini. <Link href="/belajar/tips/#katalog-tips">Tampilkan semua tips</Link>.
              </>
            ) : (
              'Tips sedang disiapkan oleh tim peneliti. Silakan kembali lagi nanti.'
            )}
          </p>
        )}
      </section>

      <section id="checklist-harian" className="checklist-panel" aria-labelledby="judul-checklist">
        <div className="checklist-kepala">
          <p className="resep-lencana">
            <span aria-hidden="true">✅</span> Langkah kecil setiap hari
          </p>
          <h2 id="judul-checklist">Checklist Harian Kebiasaan Ramah Tensi</h2>
          <p>Centang kebiasaan yang sudah Anda lakukan hari ini.</p>
        </div>
        <ChecklistHarian />
        <p className="kotak checklist-catatan">
          Mulailah dari satu atau dua kebiasaan dulu; setiap langkah kecil berarti. Centang hanya tersimpan di perangkat ini, tidak
          dikirim ke tim peneliti, dan kembali kosong setiap hari.
        </p>
      </section>

      <p className="label-kecil">
        Tips ini melengkapi materi di <Link href="/belajar/modul/">Modul Pembelajaran</Link> dan tidak menggantikan saran dokter atau
        tenaga kesehatan.
      </p>
    </>
  );
}
