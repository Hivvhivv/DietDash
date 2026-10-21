'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { aksiJawab } from '@/app/aksi-responden';
import type { HasilJawab, SoalUntukResponden } from '@/lib/progres';

const HURUF = ['A', 'B', 'C', 'D'];

interface Props {
  percobaanId: string;
  soal: SoalUntukResponden[];
  terjawab: HasilJawab[];
  mode: 'A' | 'B';
  batasLulus: number;
  nomorMateri: string;
  urlMateri: string;
  urlBerikut: string; // materi berikutnya, atau halaman selesai
  labelBerikut: string;
  percobaanKe: number;
}

type Antre = { soal: string; pilihan: string };

// Kuis per materi (PRD 6 & 9): satu soal per layar, jawaban tersimpan per soal di server,
// umpan balik + penjelasan setelah "Periksa Jawaban". Bila koneksi terputus, jawaban ditahan
// di perangkat lalu dikirim ulang otomatis saat koneksi kembali.
export default function KuisMateri(p: Props) {
  const kunciAntre = `dash-kuis-antre-${p.percobaanId}`;
  const [hasil, setHasil] = useState<Record<string, HasilJawab>>(() => Object.fromEntries(p.terjawab.map((h) => [h.soal_kunci, h])));
  const indeksAwal = Math.min(p.soal.findIndex((s) => !p.terjawab.some((h) => h.soal_kunci === s.kunci)), p.soal.length);
  const [indeks, setIndeks] = useState(indeksAwal === -1 ? p.soal.length : indeksAwal);
  const [dipilih, setDipilih] = useState<string | null>(null);
  const [menunggu, setMenunggu] = useState(false);
  const [tertunda, setTertunda] = useState<Antre | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const refJudul = useRef<HTMLHeadingElement>(null);
  const refLanjut = useRef<HTMLButtonElement>(null);

  const total = p.soal.length;
  const selesai = Object.keys(hasil).length >= total;
  const s = p.soal[indeks];
  const h = s ? hasil[s.kunci] : undefined;

  const kirim = useCallback(
    async (a: Antre) => {
      setMenunggu(true);
      try {
        const r = await aksiJawab(p.percobaanId, a.soal, a.pilihan);
        if (!r.ok) {
          setPesan(r.pesan);
          return;
        }
        setHasil((lama) => ({ ...lama, [r.hasil.soal_kunci]: r.hasil }));
        setTertunda(null);
        setPesan(null);
        try {
          localStorage.removeItem(kunciAntre);
        } catch {}
      } catch {
        // Gagal kirim (koneksi): tahan di perangkat dan coba lagi otomatis.
        setTertunda(a);
        try {
          localStorage.setItem(kunciAntre, JSON.stringify(a));
        } catch {}
      } finally {
        setMenunggu(false);
      }
    },
    [p.percobaanId, kunciAntre],
  );

  // Pulihkan jawaban yang tertahan dari kunjungan sebelumnya.
  useEffect(() => {
    try {
      const a = JSON.parse(localStorage.getItem(kunciAntre) ?? 'null') as Antre | null;
      if (a && !hasil[a.soal]) void kirim(a);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tertunda) return;
    const coba = () => void kirim(tertunda);
    window.addEventListener('online', coba);
    const t = window.setInterval(coba, 8000);
    return () => {
      window.removeEventListener('online', coba);
      window.clearInterval(t);
    };
  }, [tertunda, kirim]);

  useEffect(() => {
    if (h) refLanjut.current?.focus();
    else refJudul.current?.focus();
  }, [indeks, h]);

  if (selesai && indeks >= total) {
    const benar = Object.values(hasil).filter((x) => x.benar).length;
    const skor = Math.round((benar / total) * 100);
    const lulus = p.mode === 'A' || skor >= p.batasLulus;
    {
      return (
        <section aria-labelledby="judul-ringkasan" className="kuis-ringkasan">
          <h2 id="judul-ringkasan" tabIndex={-1} ref={refJudul}>
            Ringkasan Hasil
          </h2>
          <p className="kuis-skor">
            Anda menjawab benar {benar} dari {total} soal.
          </p>
          {lulus ? (
            <p className="pesan-sukses">
              ✓ Kuis Materi {p.nomorMateri} selesai.{' '}
              {p.mode === 'A' ? 'Terima kasih sudah berlatih.' : `Nilai Anda ${skor}%, mencapai batas ${p.batasLulus}%.`}
            </p>
          ) : (
            <p className="kotak kotak-peringatan">
              Nilai Anda {skor}%. Untuk membuka materi berikutnya dibutuhkan {p.batasLulus}%. Baca ulang materinya,
              lalu coba kuis lagi. Tidak ada batas jumlah percobaan.
            </p>
          )}
          <ol className="kuis-rincian">
            {p.soal.map((q, i) => {
              const x = hasil[q.kunci];
              return (
                <li key={q.kunci} className={x?.benar ? 'benar' : 'salah'}>
                  <p>
                    <strong>
                      {i + 1}. {q.teks}
                    </strong>
                  </p>
                  <p>
                    <span aria-hidden="true">{x?.benar ? '✓' : '✗'}</span> {x?.benar ? 'Benar' : 'Belum tepat'} · Jawaban
                    benar: {q.pilihan.find((o) => o.kunci === x?.kunci_benar)?.teks}
                  </p>
                  <p className="label-kecil">{x?.penjelasan}</p>
                </li>
              );
            })}
          </ol>
          <div className="grup-tombol">
            {lulus ? (
              <Link className="tombol tombol-besar" href={p.urlBerikut}>
                {p.labelBerikut} <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <Link className="tombol tombol-besar" href={p.urlMateri}>
                Baca Ulang Materi
              </Link>
            )}
            <Link className="tombol tombol-sekunder" href={p.urlMateri}>
              Kembali ke materi
            </Link>
          </div>
        </section>
      );
    }
  }

  if (!s) return null;

  return (
    <section aria-labelledby="teks-soal">
      <p className="kuis-kemajuan">
        Soal {indeks + 1} dari {total}
        {p.percobaanKe > 1 && <span className="label-kecil"> · percobaan ke-{p.percobaanKe}</span>}
      </p>
      <div className="kuis-bilah" aria-hidden="true">
        <div className="kuis-bilah-isi" style={{ width: `${(Object.keys(hasil).length / total) * 100}%` }} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!dipilih || h || menunggu) return;
          void kirim({ soal: s.kunci, pilihan: dipilih });
        }}
      >
        <fieldset className="kuis-fieldset">
          <legend>
            <h2 id="teks-soal" tabIndex={-1} ref={refJudul} className="kuis-teks-soal">
              {s.teks}
            </h2>
          </legend>
          {s.gambar && (
            <Image src={`/gambar-konten/${s.gambar.id}/`} alt={s.gambar.alt} width={600} height={400} className="kuis-gambar" unoptimized />
          )}
          <div className="kuis-pilihan">
            {s.pilihan.map((o, i) => {
              const status = !h ? '' : o.kunci === h.kunci_benar ? 'benar' : o.kunci === h.pilihan_kunci ? 'salah' : '';
              const pilih = (h ? h.pilihan_kunci : dipilih) === o.kunci;
              return (
                <label key={o.kunci} className={['pilihan', pilih && !h ? 'terpilih' : '', status].filter(Boolean).join(' ')}>
                  <input type="radio" name={`soal-${s.kunci}`} value={o.kunci} checked={pilih} disabled={!!h || menunggu} onChange={() => setDipilih(o.kunci)} />
                  <span className="huruf" aria-hidden="true">
                    {HURUF[i]}
                  </span>
                  <span>{o.teks}</span>
                  {status === 'benar' && <span className="status-pilihan">✓ Jawaban benar</span>}
                  {status === 'salah' && <span className="status-pilihan">✗ Pilihan Anda</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div aria-live="polite">
          {h && (
            <div className={`kuis-umpan-balik ${h.benar ? 'benar' : 'salah'}`}>
              <p className="kuis-umpan-judul">
                {h.benar ? '✓ Benar!' : `✗ Belum tepat. Jawaban yang benar: ${HURUF[s.pilihan.findIndex((o) => o.kunci === h.kunci_benar)]}.`}
              </p>
              <p>{h.penjelasan}</p>
            </div>
          )}
          {tertunda && <p className="kotak kotak-peringatan">Koneksi terputus. Jawaban Anda disimpan di perangkat dan akan dikirim otomatis saat koneksi kembali.</p>}
          {pesan && <p className="galat-umum">{pesan}</p>}
        </div>

        <div className="grup-tombol">
          {!h ? (
            <button type="submit" className="tombol tombol-besar" disabled={!dipilih || menunggu}>
              {menunggu ? 'Menyimpan…' : 'Periksa Jawaban'}
            </button>
          ) : (
            <button
              type="button"
              className="tombol tombol-besar"
              ref={refLanjut}
              onClick={() => {
                setDipilih(null);
                setIndeks(indeks + 1);
              }}
            >
              {indeks + 1 < total ? 'Soal Berikutnya' : 'Lihat Ringkasan'}
            </button>
          )}
        </div>
        {!h && !dipilih && <p className="label-kecil">Pilih salah satu jawaban terlebih dahulu.</p>}
      </form>
    </section>
  );
}
