'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export type PeranPengguna = 'responden' | 'admin' | 'super_admin';

export interface BarisMonitor {
  id_peserta: string; // "—" untuk akun admin
  nama: string;
  kontak: string; // nomor HP tersamar (responden) atau email (admin); nomor lengkap tidak pernah dikirim ke peramban
  hp_hash?: string; // SHA-256 nomor (+62…) untuk pencarian nomor di peramban
  peran: PeranPengguna;
  href: string | null; // halaman detail
  sampel: boolean;
  status_akun: 'aktif' | 'nonaktif' | 'mundur';
  status_belajar: 'belum' | 'sedang' | 'selesai' | null; // null = admin
  persen: number;
  selesai: number;
  total: number;
  materi_berikutnya: string;
  terakhir_aktif: string; // teks relatif, dihitung di server
  waktu_aktif: number; // ms, untuk urutan
  waktu_daftar: number; // ms, untuk urutan
  tidak_aktif: boolean;
  mendekati_batas: boolean;
  menit_baca: number;
  pretest: boolean;
}

const LABEL_BELAJAR = { belum: 'Belum mulai', sedang: 'Sedang belajar', selesai: 'Selesai' } as const;
const LABEL_PERAN: Record<PeranPengguna, string> = { responden: 'Responden', admin: 'Admin', super_admin: 'Super admin' };

type Status = 'semua' | 'belum' | 'sedang' | 'selesai' | 'perhatian' | 'nonaktif' | 'mundur';
type Urut = 'terbaru' | 'aktif' | 'progres_rendah' | 'progres_tinggi' | 'id' | 'nama';

const URUT: Record<Urut, (a: BarisMonitor, b: BarisMonitor) => number> = {
  terbaru: (a, b) => b.waktu_daftar - a.waktu_daftar,
  aktif: (a, b) => b.waktu_aktif - a.waktu_aktif,
  progres_rendah: (a, b) => a.persen - b.persen,
  progres_tinggi: (a, b) => b.persen - a.persen,
  id: (a, b) => a.id_peserta.localeCompare(b.id_peserta),
  nama: (a, b) => a.nama.localeCompare(b.nama, 'id'),
};

function normalkanNomor(masukan: string): string | null {
  let d = masukan.replace(/[\s\-().]/g, '');
  if (d.startsWith('+62')) d = d.slice(3);
  else if (d.startsWith('62')) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  else return null;
  return /^8\d{7,11}$/.test(d) ? `+62${d}` : null;
}

async function sha256(teks: string): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(teks));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Nomor halaman yang ditampilkan: 1 … (kini-1) kini (kini+1) … akhir.
function daftarHalaman(kini: number, akhir: number): (number | '…')[] {
  const set = [...new Set([1, kini - 1, kini, kini + 1, akhir])].filter((n) => n >= 1 && n <= akhir).sort((a, b) => a - b);
  return set.flatMap((n, i) => (i && n - set[i - 1] > 1 ? (['…', n] as const) : ([n] as const)));
}

// Tabel pengguna untuk Dashboard (ringkas) dan Manajemen Pengguna (lengkap).
// Pencarian nama/ID/nomor dilakukan di peramban, sehingga kata kunci tidak masuk URL atau log server.
export default function TabelMonitor({ baris, lengkap = false }: { baris: BarisMonitor[]; lengkap?: boolean }) {
  const perHalaman = lengkap ? 10 : 8;
  const adaAdmin = baris.some((b) => b.peran !== 'responden');
  const [cari, setCari] = useState('');
  const [hashCari, setHashCari] = useState<string | null>(null);
  const [peran, setPeran] = useState<'semua' | 'responden' | 'admin'>(lengkap ? 'semua' : 'responden');
  const [kelompok, setKelompok] = useState<'penelitian' | 'semua' | 'bukan'>(lengkap ? 'semua' : 'penelitian');
  const [status, setStatus] = useState<Status>('semua');
  const [urut, setUrut] = useState<Urut>('terbaru');
  const [halaman, setHalaman] = useState(1);

  useEffect(() => {
    const nomor = normalkanNomor(cari.trim());
    let batal = false;
    if (nomor) void sha256(nomor).then((h) => !batal && setHashCari(h));
    else setHashCari(null);
    return () => {
      batal = true;
    };
  }, [cari]);

  const tersaring = useMemo(() => {
    const q = cari.trim().toLowerCase();
    const hasil = baris.filter((b) => {
      const admin = b.peran !== 'responden';
      if (peran === 'responden' && admin) return false;
      if (peran === 'admin' && !admin) return false;
      if (!admin && kelompok === 'penelitian' && !b.sampel) return false;
      if (!admin && kelompok === 'bukan' && b.sampel) return false;
      if (status === 'perhatian' && !(b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas))) return false;
      if ((status === 'nonaktif' || status === 'mundur') && b.status_akun !== status) return false;
      if ((status === 'belum' || status === 'sedang' || status === 'selesai') && b.status_belajar !== status) return false;
      if (!q) return true;
      if (hashCari) return b.hp_hash === hashCari;
      return b.nama.toLowerCase().includes(q) || b.id_peserta.toLowerCase().includes(q) || (admin && b.kontak.toLowerCase().includes(q));
    });
    return hasil.sort(URUT[urut]);
  }, [baris, cari, hashCari, peran, kelompok, status, urut]);

  const jumlahHalaman = Math.max(1, Math.ceil(tersaring.length / perHalaman));
  const kini = Math.min(halaman, jumlahHalaman);
  const tampil = tersaring.slice((kini - 1) * perHalaman, kini * perHalaman);
  const ubah = <T,>(f: (v: T) => void) => (v: T) => {
    f(v);
    setHalaman(1);
  };
  const reset = () => {
    setCari('');
    setPeran(lengkap ? 'semua' : 'responden');
    setKelompok(lengkap ? 'semua' : 'penelitian');
    setStatus('semua');
    setUrut('terbaru');
    setHalaman(1);
  };

  return (
    <>
      <div className={`monitor-saring${lengkap ? ' monitor-saring-lengkap' : ''}`} role="search">
        <div className="bidang monitor-cari">
          <label htmlFor="monitor-cari">{lengkap ? 'Cari nama, ID peserta, nomor HP, atau email admin' : 'Cari nama atau ID peserta'}</label>
          <input id="monitor-cari" type="search" value={cari} onChange={(e) => ubah(setCari)(e.target.value)} placeholder={lengkap ? 'mis. DS-0012 atau 0812…' : 'mis. DS-0012'} autoComplete="off" />
        </div>
        {lengkap && adaAdmin && (
          <div className="bidang">
            <label htmlFor="monitor-peran">Peran</label>
            <select id="monitor-peran" value={peran} onChange={(e) => ubah(setPeran)(e.target.value as typeof peran)}>
              <option value="semua">Semua peran</option>
              <option value="responden">Responden</option>
              <option value="admin">Admin & super admin</option>
            </select>
          </div>
        )}
        <div className="bidang">
          <label htmlFor="monitor-kelompok">Kelompok</label>
          <select id="monitor-kelompok" value={kelompok} onChange={(e) => ubah(setKelompok)(e.target.value as typeof kelompok)}>
            <option value="semua">Semua kelompok</option>
            <option value="penelitian">Responden penelitian</option>
            <option value="bukan">Bukan sampel</option>
          </select>
        </div>
        <div className="bidang">
          <label htmlFor="monitor-status">Status</label>
          <select id="monitor-status" value={status} onChange={(e) => ubah(setStatus)(e.target.value as Status)}>
            <option value="semua">Semua status</option>
            <option value="belum">Belum mulai</option>
            <option value="sedang">Sedang belajar</option>
            <option value="selesai">Selesai semua materi</option>
            <option value="perhatian">⚠ Perlu perhatian</option>
            {lengkap && <option value="nonaktif">⛔ Akun nonaktif</option>}
            {lengkap && <option value="mundur">↩ Mengundurkan diri</option>}
          </select>
        </div>
        {lengkap && (
          <div className="bidang">
            <label htmlFor="monitor-urut">Urutkan</label>
            <select id="monitor-urut" value={urut} onChange={(e) => ubah(setUrut)(e.target.value as Urut)}>
              <option value="terbaru">Pendaftar terbaru</option>
              <option value="aktif">Terakhir aktif</option>
              <option value="progres_rendah">Progres terendah</option>
              <option value="progres_tinggi">Progres tertinggi</option>
              <option value="id">ID peserta</option>
              <option value="nama">Nama</option>
            </select>
          </div>
        )}
        {lengkap && (
          <button type="button" className="tombol tombol-sekunder monitor-reset" onClick={reset}>
            ↺ Reset
          </button>
        )}
      </div>

      <div className="tabel-gulir" role="region" aria-label="Tabel pengguna" tabIndex={0}>
        <table className="tabel-admin tabel-monitor">
          <thead>
            <tr>
              <th scope="col">ID Peserta</th>
              <th scope="col">Nama & Kontak</th>
              <th scope="col">{lengkap ? 'Role' : 'Kelompok'}</th>
              <th scope="col">Progres Modul</th>
              <th scope="col">Materi Berikutnya</th>
              <th scope="col">Terakhir Aktif</th>
              {!lengkap && <th scope="col">Lama Baca</th>}
              <th scope="col">Pretest</th>
              <th scope="col">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tampil.map((b) => {
              const admin = b.peran !== 'responden';
              const perhatian = !admin && b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas);
              return (
                <tr key={`${b.peran}-${b.id_peserta}-${b.kontak}`}>
                  <td>
                    <strong>{b.id_peserta}</strong>
                  </td>
                  <th scope="row">
                    <span className="monitor-nama">
                      <span className={`monitor-avatar${admin ? ' monitor-avatar-admin' : ''}`} aria-hidden="true">
                        {b.nama.trim().charAt(0).toUpperCase()}
                      </span>
                      <span>
                        {b.nama}
                        <span className="label-kecil">{b.kontak}</span>
                      </span>
                    </span>
                  </th>
                  <td>
                    {lengkap ? (
                      <span className={`lencana lencana-peran-${b.peran}`}>{LABEL_PERAN[b.peran]}</span>
                    ) : null}
                    {!admin && (!lengkap || !b.sampel) && (
                      <span className={`lencana ${b.sampel ? 'lencana-materi-selesai' : 'lencana-materi-terkunci'}`}>{b.sampel ? 'Penelitian' : 'Bukan sampel'}</span>
                    )}
                    {b.status_akun !== 'aktif' && <span className="label-kecil">{b.status_akun === 'mundur' ? '↩ Mengundurkan diri' : '⛔ Nonaktif'}</span>}
                  </td>
                  <td>
                    {admin || !b.status_belajar ? (
                      <span className="label-kecil">—</span>
                    ) : (
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
                    )}
                  </td>
                  <td className="monitor-materi">{admin ? '—' : b.materi_berikutnya}</td>
                  <td>
                    {b.terakhir_aktif}
                    {perhatian ? (
                      <span className="lencana lencana-peringatan">⚠ {b.tidak_aktif ? 'Tidak aktif' : 'Dekat batas waktu'}</span>
                    ) : (
                      !admin && b.status_akun === 'aktif' && <span className="lencana lencana-materi-tersedia">● Aktif</span>
                    )}
                  </td>
                  {!lengkap && <td>{b.menit_baca} mnt</td>}
                  <td>{admin ? '—' : b.pretest ? '✓ Tercatat' : '—'}</td>
                  <td>
                    {b.href && (
                      <Link className="tombol tombol-sekunder tombol-kecil" href={b.href}>
                        Detail<span className="sr-only"> {admin ? b.nama : b.id_peserta}</span>
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {tampil.length === 0 && (
              <tr>
                <td colSpan={9}>Tidak ada pengguna yang cocok dengan pencarian atau saringan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="monitor-kaki">
        <p className="label-kecil" aria-live="polite">
          {tersaring.length
            ? `Menampilkan ${(kini - 1) * perHalaman + 1}–${Math.min(kini * perHalaman, tersaring.length)} dari ${tersaring.length} ${lengkap ? 'pengguna' : 'responden'}`
            : `Menampilkan 0 ${lengkap ? 'pengguna' : 'responden'}`}
        </p>
        {jumlahHalaman > 1 && (
          <nav className="monitor-halaman" aria-label="Halaman tabel">
            <button type="button" className="tombol tombol-sekunder tombol-ikon" onClick={() => setHalaman(kini - 1)} disabled={kini === 1} aria-label="Halaman sebelumnya">
              ‹
            </button>
            {daftarHalaman(kini, jumlahHalaman).map((n, i) =>
              n === '…' ? (
                <span key={`l${i}`} className="monitor-lompat" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  className={`tombol tombol-ikon ${n === kini ? '' : 'tombol-sekunder'}`}
                  aria-current={n === kini ? 'page' : undefined}
                  aria-label={`Halaman ${n}`}
                  onClick={() => setHalaman(n)}
                >
                  {n}
                </button>
              ),
            )}
            <button type="button" className="tombol tombol-sekunder tombol-ikon" onClick={() => setHalaman(kini + 1)} disabled={kini === jumlahHalaman} aria-label="Halaman berikutnya">
              ›
            </button>
          </nav>
        )}
      </div>
    </>
  );
}
