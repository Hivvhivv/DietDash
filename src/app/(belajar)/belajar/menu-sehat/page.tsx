import type { Metadata } from 'next';
import Link from 'next/link';
import { CARA_MASAK, DIANJURKAN, DIBATASI, ISI_PIRING } from '@/data/menu-sehat';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Menu Sehat' };

// Pengetahuan makanan yang dianjurkan dan yang perlu dibatasi (bahan bacaan pendukung modul).
export default async function MenuSehat() {
  await wajibResponden();
  let mulai = 0;
  const irisan = ISI_PIRING.map((p) => {
    const dari = mulai;
    mulai += p.persen;
    return `var(--piring-${p.warna}) ${dari}% ${mulai}%`;
  }).join(', ');

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Menu Sehat</h1>
        <p>Kenali makanan yang dianjurkan dalam pola makan DASH, mana yang perlu dibatasi, dan cara memasaknya.</p>
      </div>

      <section className="kartu-panel" aria-labelledby="judul-piring">
        <h2 id="judul-piring">Isi Piring Sehat</h2>
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

      <section aria-labelledby="judul-anjur">
        <h2 id="judul-anjur" className="judul-bagian">
          <span aria-hidden="true">✅</span> Dianjurkan
        </h2>
        <ul className="kisi-menu-sehat">
          {DIANJURKAN.map((k) => (
            <li key={k.kunci} className="kartu-panel kartu-menu-sehat">
              <h3>{k.judul}</h3>
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
      </section>

      <section aria-labelledby="judul-batasi">
        <h2 id="judul-batasi" className="judul-bagian">
          <span aria-hidden="true">⚠️</span> Perlu Dibatasi
        </h2>
        <ul className="kisi-menu-sehat">
          {DIBATASI.map((k) => (
            <li key={k.kunci} className="kartu-panel kartu-menu-sehat kartu-menu-batasi">
              <h3>{k.judul}</h3>
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
      </section>

      <section className="kartu-panel" aria-labelledby="judul-masak">
        <h2 id="judul-masak">Cara Memasak</h2>
        <div className="dua-kolom-masak">
          <div>
            <h3>
              <span aria-hidden="true">👍</span> Pilih
            </h3>
            <ul>
              {CARA_MASAK.anjur.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>
              <span aria-hidden="true">✋</span> Kurangi
            </h3>
            <ul>
              {CARA_MASAK.kurangi.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
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
