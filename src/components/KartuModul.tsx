import Image from 'next/image';
import Link from 'next/link';
import { GAMBAR_ILUSTRASI, UKURAN_ILUSTRASI } from '@/data/gambar';
import type { Modul } from '@/lib/konten';

interface Props {
  modul: Modul;
  tingkatJudul?: 'h2' | 'h3';
}

export default function KartuModul({ modul, tingkatJudul = 'h2' }: Props) {
  const Judul = tingkatJudul;
  const idJudul = `judul-modul-${modul.id}`;

  return (
    <article className="kartu-modul" aria-labelledby={idJudul}>
      <Image
        className="kartu-modul-gambar"
        src={GAMBAR_ILUSTRASI[modul.ilustrasi]}
        alt=""
        {...UKURAN_ILUSTRASI}
      />
      <div className="kartu-modul-teks">
        <Judul id={idJudul} className="kartu-modul-judul">
          {modul.urutan}. {modul.judul}
        </Judul>
        <p className="kartu-modul-deskripsi">{modul.deskripsi_kartu}</p>
        <p className="kartu-modul-waktu">
          {modul.materi.length} materi · ±{modul.estimasi_menit} menit
        </p>
        <Link className="tombol tombol-lembut" href={`/materi/${modul.id}/`} aria-describedby={idJudul}>
          Buka Materi
        </Link>
      </div>
    </article>
  );
}
