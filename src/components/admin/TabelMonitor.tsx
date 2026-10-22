'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export interface BarisMonitor {
  id_peserta: string;
  nama: string;
  nomor_samar: string; // nomor HP lengkap tidak pernah dikirim ke peramban
  sampel: boolean;
  status_akun: 'aktif' | 'nonaktif' | 'mundur';
  status_belajar: 'belum' | 'sedang' | 'selesai';
  persen: number;
  selesai: number;
  total: number;
  materi_berikutnya: string;
  terakhir_aktif: string; // teks relatif, dihitung di server
  tidak_aktif: boolean;
  mendekati_batas: boolean;
  menit_baca: number;
  pretest: boolean;
}

const PER_HALAMAN = 8;

const LABEL_BELAJAR = { belum: 'Belum mulai', sedang: 'Sedang belajar', selesai: 'Selesai' } as const;

// Tabel monitoring responden di dashboard admin. Pencarian nama/ID dilakukan di peramban (tidak masuk URL).
export default function TabelMonitor({ baris }: { baris: BarisMonitor[] }) {
  const [cari, setCari] = useState('');
  const [kelompok, setKelompok] = useState<'penelitian' | 'semua' | 'bukan'>('penelitian');
  const [status, setStatus] = useState<'semua' | 'belum' | 'sedang' | 'selesai' | 'perhatian'>('semua');
  const [halaman, setHalaman] = useState(1);

  const tersaring = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return baris.filter((b) => {
      if (kelompok === 'penelitian' && !b.sampel) return false;
      if (kelompok === 'bukan' && b.sampel) return false;
      if (status === 'perhatian' && !(b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas))) return false;
      if (status !== 'semua' && status !== 'perhatian' && b.status_belajar !== status) return false;
      return !q || b.nama.toLowerCase().includes(q) || b.id_peserta.toLowerCase().includes(q);
    });
  }, [baris, cari, kelompok, status]);

  const jumlahHalaman = Math.max(1, Math.ceil(tersaring.length / PER_HALAMAN));
  const kini = Math.min(halaman, jumlahHalaman);
  const tampil = tersaring.slice((kini - 1) * PER_HALAMAN, kini * PER_HALAMAN);
  const ubah = <T,>(f: (v: T) => void) => (v: T) => {
    f(v);
    setHalaman(1);
  };

  return (
    <>
      <div className="monitor-saring" role="search">
        <div className="bidang">
          <label htmlFor="monitor-cari">Cari nama atau ID peserta</label>
          <input id="monitor-cari" type="search" value={cari} onChange={(e) => ubah(setCari)(e.target.value)} placeholder="mis. DS-0012" autoComplete="off" />
        </div>
        <div className="bidang">
          <label htmlFor="monitor-kelompok">Kelompok</label>
          <select id="monitor-kelompok" value={kelompok} onChange={(e) => ubah(setKelompok)(e.target.value as typeof kelompok)}>
            <option value="penelitian">Responden penelitian</option>
            <option value="bukan">Bukan sampel</option>
            <option value="semua">Semua akun</option>
          </select>
        </div>
        <div className="bidang">
          <label htmlFor="monitor-status">Status belajar</label>
          <select id="monitor-status" value={status} onChange={(e) => ubah(setStatus)(e.target.value as typeof status)}>
            <option value="semua">Semua status</option>
            <option value="belum">Belum mulai</option>
            <option value="sedang">Sedang belajar</option>
            <option value="selesai">Selesai semua materi</option>
            <option value="perhatian">⚠ Perlu perhatian</option>
          </select>
        </div>
      </div>

      <div className="tabel-gulir" role="region" aria-label="Tabel monitoring responden" tabIndex={0}>
        <table className="tabel-admin tabel-monitor">
          <thead>
            <tr>
              <th scope="col">ID Peserta</th>
              <th scope="col">Nama & Kontak</th>
              <th scope="col">Kelompok</th>
              <th scope="col">Progres Modul</th>
              <th scope="col">Materi Berikutnya</th>
              <th scope="col">Terakhir Aktif</th>
              <th scope="col">Lama Baca</th>
              <th scope="col">Pretest</th>
              <th scope="col">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tampil.map((b) => {
              const perhatian = b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas);
              return (
                <tr key={b.id_peserta}>
                  <td>
                    <strong>{b.id_peserta}</strong>
                  </td>
                  <th scope="row">
                    <span className="monitor-nama">
                      <span className="monitor-avatar" aria-hidden="true">
                        {b.nama.trim().charAt(0).toUpperCase()}
                      </span>
                      <span>
                        {b.nama}
                        <span className="label-kecil">{b.nomor_samar}</span>
                      </span>
                    </span>
                  </th>
                  <td>
                    <span className={`lencana ${b.sampel ? 'lencana-materi-selesai' : 'lencana-materi-terkunci'}`}>{b.sampel ? 'Penelitian' : 'Bukan sampel'}</span>
                    {b.status_akun !== 'aktif' && <span className="label-kecil">{b.status_akun === 'mundur' ? 'Mengundurkan diri' : 'Nonaktif'}</span>}
                  </td>
                  <td>
                    <span className="monitor-progres">
                      <span className="label-kecil">
                        {b.selesai}/{b.total} materi · {LABEL_BELAJAR[b.status_belajar]}
                      </span>
                      <span className="monitor-progres-baris">
                        <span className="bilah-progres" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={b.persen} aria-label={`Progres ${b.id_peserta}`}>
                          <span style={{ width: `${b.persen}%` }} />
                        </span>
                        <strong>{b.persen}%</strong>
                      </span>
                    </span>
                  </td>
                  <td className="monitor-materi">{b.materi_berikutnya}</td>
                  <td>
                    {b.terakhir_aktif}
                    {perhatian ? (
                      <span className="lencana lencana-peringatan">⚠ {b.tidak_aktif ? 'Tidak aktif' : 'Dekat batas waktu'}</span>
                    ) : (
                      b.status_akun === 'aktif' && <span className="lencana lencana-materi-tersedia">● Aktif</span>
                    )}
                  </td>
                  <td>{b.menit_baca} mnt</td>
                  <td>{b.pretest ? '✓ Tercatat' : '—'}</td>
                  <td>
                    <Link className="tombol tombol-sekunder tombol-kecil" href={`/admin/responden/${b.id_peserta}/`}>
                      Detail<span className="sr-only"> {b.id_peserta}</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
            {tampil.length === 0 && (
              <tr>
                <td colSpan={9}>Tidak ada responden yang cocok dengan saringan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="monitor-kaki">
        <p className="label-kecil" aria-live="polite">
          {tersaring.length
            ? `Menampilkan ${(kini - 1) * PER_HALAMAN + 1}–${Math.min(kini * PER_HALAMAN, tersaring.length)} dari ${tersaring.length} responden`
            : 'Menampilkan 0 responden'}
        </p>
        {jumlahHalaman > 1 && (
          <nav className="monitor-halaman" aria-label="Halaman tabel responden">
            <button type="button" className="tombol tombol-sekunder tombol-ikon" onClick={() => setHalaman(kini - 1)} disabled={kini === 1} aria-label="Halaman sebelumnya">
              ‹
            </button>
            {Array.from({ length: jumlahHalaman }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`tombol tombol-ikon ${n === kini ? '' : 'tombol-sekunder'}`}
                aria-current={n === kini ? 'page' : undefined}
                onClick={() => setHalaman(n)}
              >
                {n}
              </button>
            ))}
            <button type="button" className="tombol tombol-sekunder tombol-ikon" onClick={() => setHalaman(kini + 1)} disabled={kini === jumlahHalaman} aria-label="Halaman berikutnya">
              ›
            </button>
          </nav>
        )}
      </div>
    </>
  );
}
