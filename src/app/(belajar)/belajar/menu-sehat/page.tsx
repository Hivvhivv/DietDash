import type { Metadata } from 'next';
import Link from 'next/link';
import KartuResep, { GambarResep } from '@/components/belajar/KartuResep';
import Ikon from '@/components/Ikon';
import { CARA_MASAK, DIANJURKAN, DIBATASI, ISI_PIRING } from '@/data/menu-sehat';
import { JENIS_BAHAN, RESEP, WAKTU_MAKAN, resepHariIni, type JenisBahan, type WaktuMakan } from '@/data/resep-sehat';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Menu Sehat' };
export const dynamic = 'force-dynamic'; // "Menu pilihan hari ini" berganti setiap hari

const adalahWaktu = (v?: string): v is WaktuMakan => !!v && v in WAKTU_MAKAN;
const adalahBahan = (v?: string): v is JenisBahan => !!v && v in JENIS_BAHAN;

function tautanSaring(waktu?: WaktuMakan, bahan?: JenisBahan) {
  const q = new URLSearchParams();
  if (waktu) q.set('waktu', waktu);
  if (bahan) q.set('bahan', bahan);
  const s = q.toString();
  return `/belajar/menu-sehat/${s ? `?${s}` : ''}#pilihan-sajian`;
}

// Katalog resep Nusantara bergaya DASH + panduan memilih bahan (bahan bacaan pendukung modul).
export default async function MenuSehat({ searchParams }: { searchParams: Promise<{ waktu?: string; bahan?: string }> }) {
  await wajibResponden();
  const sp = await searchParams;
  const waktu = adalahWaktu(sp.waktu) ? sp.waktu : undefined;
  const bahan = adalahBahan(sp.bahan) ? sp.bahan : undefined;
  const daftar = RESEP.filter((r) => (!waktu || r.waktu === waktu) && (!bahan || r.bahanUtama === bahan));
  const sorotan = resepHariIni();

  let mulai = 0;
  const irisan = ISI_PIRING.map((p) => {
    const dari = mulai;
    mulai += p.persen;
    return `var(--piring-${p.warna}) ${dari}% ${mulai}%`;
  }).join(', ');

  return (
    <>
      <section className="resep-hero" aria-labelledby="judul-menu-sehat">
        <div className="resep-hero-teks">
          <p className="resep-lencana">
            <span aria-hidden="true">🌿</span> Katalog Menu Nusantara Bergaya Diet DASH
          </p>
          <h1 id="judul-menu-sehat">Inspirasi Menu Makanan Sehari-hari Ramah Hipertensi</h1>
          <p>
            Contoh hidangan khas Nusantara yang dimasak dengan sedikit garam, kaya sayur dan buah, serta sumber kalium, kalsium,
            dan magnesium. Tetap gurih berkat bumbu rempah dan mudah dimasak di rumah.
          </p>
          <ul className="resep-patokan">
            <li>
              <span className="resep-patokan-label">
                <Ikon nama="target" ukuran={18} /> Batas garam
              </span>
              <strong>≤ 1 sendok teh</strong>
              <span className="label-kecil">±5 gram per hari, dari semua makanan</span>
            </li>
            <li>
              <span className="resep-patokan-label">
                <Ikon nama="piring" ukuran={18} /> Sayur &amp; buah
              </span>
              <strong>4–5 porsi</strong>
              <span className="label-kecil">masing-masing per hari</span>
            </li>
            <li>
              <span className="resep-patokan-label">
                <Ikon nama="jam" ukuran={18} /> Cara masak
              </span>
              <strong>Kukus &amp; pepes</strong>
              <span className="label-kecil">juga rebus, panggang, tumis sedikit minyak</span>
            </li>
          </ul>
        </div>
        <Link className="resep-sorotan" href={`/belajar/menu-sehat/${sorotan.kunci}/`}>
          <span className="resep-sorotan-gambar">
            <GambarResep resep={sorotan} besar />
            <span className="resep-sorotan-label">Menu pilihan hari ini</span>
            <span className="resep-sorotan-kutipan">“Gurih berempah tanpa garam berlebih”</span>
          </span>
          <span className="resep-sorotan-kaki">
            <span>
              <strong>{sorotan.nama}</strong>
              <span className="label-kecil">
                {WAKTU_MAKAN[sorotan.waktu].label} · ± {sorotan.menit} menit
              </span>
            </span>
            <span className="resep-sorotan-panah" aria-hidden="true">
              <Ikon nama="panah-kanan" ukuran={18} />
            </span>
          </span>
        </Link>
      </section>

      <div className="resep-saring">
        <nav aria-label="Saring menurut waktu makan">
          <ul className="resep-chip">
            <li>
              <Link href={tautanSaring(undefined, bahan)} aria-current={!waktu ? 'true' : undefined}>
                <Ikon nama="daftar" ukuran={18} /> Semua Menu
              </Link>
            </li>
            {(Object.keys(WAKTU_MAKAN) as WaktuMakan[]).map((w) => (
              <li key={w}>
                <Link href={tautanSaring(w, bahan)} aria-current={waktu === w ? 'true' : undefined}>
                  {WAKTU_MAKAN[w].label}
                  {WAKTU_MAKAN[w].jam && <span className="resep-chip-jam">({WAKTU_MAKAN[w].jam})</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form className="resep-bahan" method="get" action="/belajar/menu-sehat/">
          {waktu && <input type="hidden" name="waktu" value={waktu} />}
          <label htmlFor="pilih-bahan">Pilihan bahan</label>
          <select id="pilih-bahan" name="bahan" defaultValue={bahan ?? ''}>
            <option value="">Semua protein &amp; olahan</option>
            {(Object.keys(JENIS_BAHAN) as JenisBahan[]).map((b) => (
              <option key={b} value={b}>
                {JENIS_BAHAN[b]}
              </option>
            ))}
          </select>
          <button type="submit" className="tombol tombol-sekunder tombol-kecil">
            Terapkan
          </button>
        </form>
      </div>

      <section id="pilihan-sajian" className="resep-daftar" aria-labelledby="judul-sajian">
        <div className="beranda-bagian-kepala">
          <div>
            <h2 id="judul-sajian">Pilihan Sajian Lezat Sehat</h2>
            <p>Lengkap dengan perkiraan natrium, kalium, dan serat, serta petunjuk rempah pengganti garam.</p>
          </div>
          <span className="lencana lencana-materi-selesai">
            ✓ {daftar.length} menu tersedia
          </span>
        </div>
        {daftar.length > 0 ? (
          <ul className="kisi-resep">
            {daftar.map((r) => (
              <KartuResep key={r.kunci} resep={r} />
            ))}
          </ul>
        ) : (
          <p className="kotak">
            Belum ada menu untuk pilihan ini. <Link href={tautanSaring()}>Tampilkan semua menu</Link>.
          </p>
        )}
        <p className="label-kecil resep-catatan">
          Tingkat natrium, kalium, dan serat adalah perkiraan berdasarkan bahan, belum hasil perhitungan ahli gizi. Bila Anda
          memiliki penyakit ginjal, tanyakan dulu kepada dokter atau ahli gizi sebelum memperbanyak makanan tinggi kalium.
        </p>
      </section>

      <section className="resep-panduan" aria-labelledby="judul-panduan">
        <div className="beranda-bagian-kepala">
          <div>
            <h2 id="judul-panduan">Panduan Memilih Bahan Makanan</h2>
            <p>Kenali makanan yang dianjurkan, yang perlu dibatasi, dan cara memasaknya.</p>
          </div>
        </div>

        <section className="kartu-panel" aria-labelledby="judul-piring">
          <h3 id="judul-piring">Isi Piring Sehat</h3>
          <div className="piring-sehat">
            <div className="piring-sehat-gambar" style={{ background: `conic-gradient(${irisan})` }} aria-hidden="true" />
            <ul className="piring-sehat-keterangan">
              {ISI_PIRING.map((p) => (
                <li key={p.bagian}>
                  <span className={`piring-titik piring-${p.warna}`} aria-hidden="true" />
                  <strong>{p.bagian}</strong> {p.porsi}
                </li>
              ))}
            </ul>
          </div>
          <p className="label-kecil">Separuh piring berisi sayur dan buah, separuh lagi makanan pokok dan lauk. Minum air putih yang cukup.</p>
        </section>

        <h3 className="judul-bagian">
          <span aria-hidden="true">✅</span> Dianjurkan
        </h3>
        <ul className="kisi-menu-sehat">
          {DIANJURKAN.map((k) => (
            <li key={k.kunci} className="kartu-panel kartu-menu-sehat">
              <h4>{k.judul}</h4>
              <p>{k.manfaat}</p>
              <ul className="chip-makanan" aria-label={`Contoh ${k.judul.toLowerCase()}`}>
                {k.contoh.map((m) => (
                  <li key={m.nama}>
                    <span aria-hidden="true">{m.emoji}</span> {m.nama}
                  </li>
                ))}
              </ul>
              <dl className="porsi-menu-sehat">
                <div>
                  <dt>Ukuran porsi</dt>
                  <dd>{k.porsi}</dd>
                </div>
                <div>
                  <dt>Contoh anjuran</dt>
                  <dd>{k.anjuran}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
        <p className="label-kecil">
          Contoh jumlah porsi untuk kebutuhan sekitar 2.000 kalori menurut pedoman DASH. Kebutuhan tiap orang berbeda; ahli gizi
          dapat membantu menentukan porsi yang tepat.
        </p>

        <h3 className="judul-bagian">
          <span aria-hidden="true">⚠️</span> Perlu Dibatasi
        </h3>
        <ul className="kisi-menu-sehat">
          {DIBATASI.map((k) => (
            <li key={k.kunci} className="kartu-panel kartu-menu-sehat kartu-menu-batasi">
              <h4>{k.judul}</h4>
              <p>{k.alasan}</p>
              <ul className="daftar-batasi">
                {k.contoh.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="ganti-dengan">
                <strong>Coba ganti dengan:</strong> {k.ganti}
              </p>
            </li>
          ))}
        </ul>

        <section className="kartu-panel" aria-labelledby="judul-masak">
          <h3 id="judul-masak">Cara Memasak</h3>
          <div className="dua-kolom-masak">
            <div>
              <h4>
                <span aria-hidden="true">👍</span> Pilih
              </h4>
              <ul>
                {CARA_MASAK.anjur.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>
                <span aria-hidden="true">✋</span> Kurangi
              </h4>
              <ul>
                {CARA_MASAK.kurangi.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </section>

      <p className="kotak kotak-peringatan">
        <strong>Penting:</strong> pola makan sehat membantu mengendalikan tekanan darah bersama pengobatan dari tenaga kesehatan,
        bukan menggantikannya. Bila Anda memiliki penyakit ginjal, diabetes, atau kondisi lain, bicarakan dulu dengan dokter atau
        ahli gizi sebelum mengubah pola makan.
      </p>
      <p className="label-kecil">
        Bahan bacaan pendukung modul. Penjelasan lengkap ada di <Link href="/belajar/modul/">Modul Pembelajaran</Link>; rujukan di{' '}
        <Link href="/sumber/">Sumber Materi</Link>.
      </p>
    </>
  );
}
