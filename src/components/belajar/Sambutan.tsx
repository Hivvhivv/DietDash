'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// Halaman sambutan singkat (maks. 3 layar) setelah registrasi pertama (PRD 8).
export default function Sambutan({ nama }: { nama: string }) {
  const [layar, setLayar] = useState(0);
  const judul = useRef<HTMLHeadingElement>(null);
  useEffect(() => judul.current?.focus(), [layar]);

  const isi = [
    {
      judul: `Selamat datang, ${nama}!`,
      konten: (
        <>
          <p>Akun Anda sudah siap. Setiap kali masuk, cukup ketik nomor HP dan kode akses 6 angka Anda.</p>
          <div className="kotak">
            <p>
              <strong>Sebelum mulai belajar</strong>, ikuti <strong>pretest</strong> sesuai jadwal dari peneliti. Pretest tidak
              dikerjakan di website ini.
            </p>
          </div>
        </>
      ),
    },
    {
      judul: 'Cara belajar',
      konten: (
        <ol className="langkah-belajar">
          <li>Baca materi sampai akhir. Setiap materi hanya butuh beberapa menit.</li>
          <li>Tekan <strong>Kerjakan Kuis</strong> dan jawab soal satu per satu.</li>
          <li>Baca penjelasan setiap jawaban. Kuis ini latihan, bukan ujian.</li>
          <li>Setelah kuis selesai, materi berikutnya terbuka.</li>
        </ol>
      ),
    },
    {
      judul: 'Arti tanda pada materi',
      konten: (
        <ul className="daftar-ikon">
          <li>
            <span className="lencana lencana-materi-terkunci">🔒 Terkunci</span> Selesaikan kuis materi sebelumnya dulu.
          </li>
          <li>
            <span className="lencana lencana-materi-tersedia">○ Tersedia</span> Materi siap dibaca.
          </li>
          <li>
            <span className="lencana lencana-materi-sedang">◐ Sedang dipelajari</span> Materi sudah dibuka, kuis belum selesai.
          </li>
          <li>
            <span className="lencana lencana-materi-selesai">✓ Selesai</span> Kuis sudah selesai. Anda bisa membaca lagi kapan saja.
          </li>
        </ul>
      ),
    },
  ];
  const h = isi[layar];

  return (
    <div className="wadah-baca bagian-isi sambutan">
      <p className="label-kecil" aria-live="polite">
        Langkah {layar + 1} dari {isi.length}
      </p>
      <div className="kartu">
        <h1 tabIndex={-1} ref={judul}>
          {h.judul}
        </h1>
        {h.konten}
      </div>
      <div className="grup-tombol">
        {layar > 0 && (
          <button type="button" className="tombol tombol-sekunder" onClick={() => setLayar(layar - 1)}>
            Kembali
          </button>
        )}
        {layar < isi.length - 1 ? (
          <button type="button" className="tombol tombol-besar" onClick={() => setLayar(layar + 1)}>
            Lanjut
          </button>
        ) : (
          <Link className="tombol tombol-besar" href="/belajar/">
            Ke Dashboard Belajar
          </Link>
        )}
      </div>
    </div>
  );
}
