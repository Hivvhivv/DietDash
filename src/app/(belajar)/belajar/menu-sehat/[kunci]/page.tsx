import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import KartuResep, { GambarResep, GiziResep } from '@/components/belajar/KartuResep';
import Ikon from '@/components/Ikon';
import { RESEP, WAKTU_MAKAN, cariResep } from '@/data/resep-sehat';
import { wajibResponden } from '@/lib/responden';

type Params = { params: Promise<{ kunci: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = cariResep((await params).kunci);
  return { title: r ? r.nama : 'Menu Sehat' };
}

export default async function DetailResep({ params }: Params) {
  await wajibResponden();
  const r = cariResep((await params).kunci);
  if (!r) notFound();
  const lain = RESEP.filter((x) => x.waktu === r.waktu && x.kunci !== r.kunci).slice(0, 3);

  return (
    <>
      <nav aria-label="Lokasi halaman" className="remah">
        <Link href="/belajar/">Beranda</Link>
        <span className="remah-item">
          <span aria-hidden="true">›</span>
          <Link href="/belajar/menu-sehat/">Menu Sehat</Link>
        </span>
        <span className="remah-item">
          <span aria-hidden="true">›</span>
          <span aria-current="page">{r.nama}</span>
        </span>
      </nav>

      <div className="resep-detail-kepala">
        <div className="resep-detail-gambar">
          <GambarResep resep={r} besar />
        </div>
        <div className="resep-detail-teks">
          <span className="kartu-resep-tag">
            <span className="tag-resep tag-resep-waktu">{WAKTU_MAKAN[r.waktu].label}</span>
            <span className="tag-resep">{r.label}</span>
          </span>
          <h1>{r.nama}</h1>
          <p>{r.deskripsi}</p>
          <ul className="resep-meta">
            <li>
              <Ikon nama="jam" ukuran={20} /> ± {r.menit} menit
            </li>
            <li>
              <Ikon nama="orang" ukuran={20} /> {r.porsi}
            </li>
            <li>
              <Ikon nama="piring" ukuran={20} /> {r.metode}
            </li>
          </ul>
          <GiziResep resep={r} />
          <p className="label-kecil">Perkiraan per porsi berdasarkan bahan, belum hasil perhitungan ahli gizi.</p>
        </div>
      </div>

      <div className="resep-detail-isi">
        <section className="kartu-panel" aria-labelledby="judul-bahan">
          <h2 id="judul-bahan">Bahan</h2>
          <ul className="resep-bahan-daftar">
            {r.bahan.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
        <section className="kartu-panel" aria-labelledby="judul-langkah">
          <h2 id="judul-langkah">Cara Memasak</h2>
          <ol className="resep-langkah">
            {r.langkah.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ol>
          <p className="rahasia-gurih">
            <Ikon nama="lampu" ukuran={20} />
            <span>
              <strong>Rahasia Gurih:</strong> {r.rahasiaGurih}
            </span>
          </p>
          {r.catatan && <p className="kotak">{r.catatan}</p>}
        </section>
      </div>

      <p className="kotak kotak-peringatan">
        <strong>Penting:</strong> resep ini contoh menu sehari-hari, bukan rencana diet khusus untuk Anda. Bila Anda memiliki
        penyakit ginjal, diabetes, atau kondisi lain, bicarakan dulu dengan dokter atau ahli gizi. Tetap ikuti pengobatan dari
        tenaga kesehatan.
      </p>

      {lain.length > 0 && (
        <section className="resep-lain" aria-labelledby="judul-resep-lain">
          <div className="beranda-bagian-kepala">
            <h2 id="judul-resep-lain">Menu {WAKTU_MAKAN[r.waktu].label} Lainnya</h2>
            <Link href="/belajar/menu-sehat/" className="tautan-panah-kanan">
              Semua Menu
              <Ikon nama="panah-kanan" ukuran={18} />
            </Link>
          </div>
          <ul className="kisi-resep">
            {lain.map((x) => (
              <KartuResep key={x.kunci} resep={x} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
