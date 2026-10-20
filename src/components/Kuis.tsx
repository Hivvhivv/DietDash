'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Soal } from '@/data/kuis';
import type { RingkasanModul } from '@/lib/konten';
import { simpanHasilLatihan } from '@/lib/progres-klien';

// Kuis LATIHAN (bukan instrumen pretest/posttest). Jawaban per soal diproses di peramban;
// yang disimpan hanya jumlah benar, di akun peserta bila masuk atau di perangkat bila tidak.
const HURUF = ['A', 'B', 'C', 'D'];

type Tahap = 'awal' | 'soal' | 'hasil';

interface Props {
  soal: Soal[];
  modul: RingkasanModul[];
  idLatihan: string; // id modul, atau 'semua' untuk kuis lengkap
  children?: React.ReactNode; // penjelasan pembuka, tampil sebelum kuis dimulai
}

export default function Kuis({ soal, modul, idLatihan, children }: Props) {
  const [siap, setSiap] = useState(false);
  const [tahap, setTahap] = useState<Tahap>('awal');
  const [indeks, setIndeks] = useState(0);
  const [dipilih, setDipilih] = useState<number | null>(null);
  const [diperiksa, setDiperiksa] = useState(false);
  const [benar, setBenar] = useState(0);
  const [salah, setSalah] = useState<Soal[]>([]);

  const refSoal = useRef<HTMLLegendElement>(null);
  const refLanjut = useRef<HTMLButtonElement>(null);
  const refHasil = useRef<HTMLHeadingElement>(null);

  // Tombol "Mulai" hanya muncul setelah JavaScript aktif.
  useEffect(() => setSiap(true), []);

  useEffect(() => {
    if (tahap === 'soal' && !diperiksa) refSoal.current?.focus();
  }, [tahap, indeks, diperiksa]);

  useEffect(() => {
    if (diperiksa) refLanjut.current?.focus();
  }, [diperiksa]);

  useEffect(() => {
    if (tahap === 'hasil') refHasil.current?.focus();
  }, [tahap]);

  function mulai() {
    setIndeks(0);
    setBenar(0);
    setSalah([]);
    setDipilih(null);
    setDiperiksa(false);
    setTahap('soal');
  }

  function periksa(e: React.FormEvent) {
    e.preventDefault();
    if (dipilih === null || diperiksa) return;
    const s = soal[indeks];
    if (dipilih === s.jawaban) setBenar((n) => n + 1);
    else setSalah((daftar) => [...daftar, s]);
    setDiperiksa(true);
  }

  function lanjut() {
    if (indeks + 1 < soal.length) {
      setIndeks(indeks + 1);
      setDipilih(null);
      setDiperiksa(false);
    } else {
      setTahap('hasil');
      // Skor disimpan di akun bila peserta masuk, selain itu di perangkat ini saja.
      void simpanHasilLatihan(idLatihan, benar, soal.length);
    }
  }

  if (tahap === 'awal') {
    return (
      <section>
        {children}
        {siap && (
          <div className="grup-tombol">
            <button type="button" className="tombol" onClick={mulai}>
              Mulai Kuis
            </button>
            <Link className="tombol tombol-sekunder" href="/materi/">
              Baca Materi Dulu
            </Link>
          </div>
        )}
      </section>
    );
  }

  if (tahap === 'hasil') {
    const total = soal.length;
    const pesan =
      benar === total
        ? 'Luar biasa! Anda sudah memahami prinsip-prinsip diet DASH dengan baik.'
        : benar >= total * 0.7
          ? 'Bagus! Sebagian besar materi sudah Anda pahami. Baca kembali bagian yang masih terlewat.'
          : 'Terima kasih sudah mencoba. Membaca ulang materi akan membantu, dan Anda bisa mengulang kuis kapan saja.';

    const idUlang = new Set(salah.map((s) => s.modul_terkait));
    const modulUlang = modul.filter((m) => idUlang.has(m.id));
    const tautanPelajari = modulUlang.length ? `/materi/${modulUlang[0].id}/` : '/materi/';

    return (
      <section aria-labelledby="judul-hasil">
        <h2 id="judul-hasil" tabIndex={-1} ref={refHasil}>
          Ringkasan Hasil Latihan
        </h2>
        <p className="kuis-skor">
          Anda menjawab benar {benar} dari {total} soal.
        </p>
        <p>{pesan}</p>
        {modulUlang.length > 0 && (
          <>
            <p>Materi yang bisa Anda baca kembali:</p>
            <ul>
              {modulUlang.map((m) => (
                <li key={m.id}>
                  <Link href={`/materi/${m.id}/`}>
                    Modul {m.urutan}: {m.judul}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="grup-tombol">
          <Link className="tombol" href={tautanPelajari}>
            Pelajari Kembali Materi
          </Link>
          <button type="button" className="tombol tombol-sekunder" onClick={mulai}>
            Ulangi Kuis
          </button>
        </div>
      </section>
    );
  }

  const s = soal[indeks];
  const tepat = dipilih === s.jawaban;
  const terakhir = indeks + 1 === soal.length;

  return (
    <section aria-labelledby="teks-soal">
      <p className="kuis-kemajuan">
        Soal {indeks + 1} dari {soal.length}
      </p>
      <div className="kuis-bilah" aria-hidden="true">
        <div className="kuis-bilah-isi" style={{ width: `${(indeks / soal.length) * 100}%` }} />
      </div>

      <form onSubmit={periksa} noValidate>
        <fieldset className="kuis-fieldset">
          <legend id="teks-soal" tabIndex={-1} ref={refSoal}>
            {s.pertanyaan}
          </legend>
          <div className="kuis-pilihan">
            {s.pilihan.map((p, i) => {
              const status = !diperiksa
                ? ''
                : i === s.jawaban
                  ? 'benar'
                  : i === dipilih
                    ? 'salah'
                    : '';
              return (
                <label
                  key={`${s.id}-${i}`}
                  className={['pilihan', dipilih === i && !diperiksa ? 'terpilih' : '', status]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <input
                    type="radio"
                    name={`jawaban-${s.id}`}
                    value={i}
                    checked={dipilih === i}
                    disabled={diperiksa}
                    onChange={() => setDipilih(i)}
                  />
                  <span className="huruf" aria-hidden="true">
                    {HURUF[i]}
                  </span>
                  <span>{p}</span>
                  {status === 'benar' && <span className="status-pilihan">✓ Jawaban benar</span>}
                  {status === 'salah' && <span className="status-pilihan">✗ Pilihan Anda</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div aria-live="polite">
          {diperiksa && (
            <div className={`kuis-umpan-balik ${tepat ? 'benar' : 'salah'}`}>
              <p className="kuis-umpan-judul">
                {tepat ? '✓ Benar!' : `✗ Belum tepat. Jawaban yang benar: ${HURUF[s.jawaban]}.`}
              </p>
              <p>{s.umpan_balik}</p>
            </div>
          )}
        </div>

        <div className="grup-tombol">
          {!diperiksa ? (
            <button type="submit" className="tombol" disabled={dipilih === null}>
              Periksa Jawaban
            </button>
          ) : (
            <button type="button" className="tombol" onClick={lanjut} ref={refLanjut}>
              {terakhir ? 'Lihat Hasil' : 'Soal Berikutnya'}
            </button>
          )}
        </div>
        {dipilih === null && (
          <p className="label-kecil kuis-petunjuk">Pilih salah satu jawaban terlebih dahulu.</p>
        )}
      </form>
    </section>
  );
}
