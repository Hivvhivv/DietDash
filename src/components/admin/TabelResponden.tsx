'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AksiResponden from './AksiResponden';
import LihatKodeAkses from './LihatKodeAkses';

export interface BarisResponden {
  id_peserta: string;
  nama: string;
  nomor_samar: string; // nomor HP lengkap tidak pernah dikirim ke peramban
  hp_hash: string; // SHA-256 nomor (+62…) untuk pencarian nomor di peramban
  sampel: boolean;
  aktif: boolean;
  status_akun: 'aktif' | 'nonaktif' | 'mundur';
  status_belajar: 'belum' | 'sedang' | 'selesai';
  hari_ke: number;
  batas_hari: number;
  selesai: number;
  total: number;
  persen: number;
  pretest: boolean;
  posttest: boolean;
  terakhir_aktif: string; // tanggal & jam (WIB), dihitung di server
  terakhir_relatif: string;
  waktu_aktif: number;
  waktu_daftar: number;
  tidak_aktif: boolean;
  mendekati_batas: boolean;
  punya_kode: boolean; // salinan terenkripsi tersedia
}

type Akses = 'semua' | 'aktif' | 'nonaktif' | 'mundur';
type Progres = 'semua' | 'belum' | 'sedang' | 'selesai' | 'perhatian';
type Urut = 'id' | 'terbaru' | 'aktif' | 'progres_rendah' | 'progres_tinggi' | 'nama';

const URUT: Record<Urut, (a: BarisResponden, b: BarisResponden) => number> = {
  id: (a, b) => a.id_peserta.localeCompare(b.id_peserta),
  terbaru: (a, b) => b.waktu_daftar - a.waktu_daftar,
  aktif: (a, b) => b.waktu_aktif - a.waktu_aktif,
  progres_rendah: (a, b) => a.persen - b.persen,
  progres_tinggi: (a, b) => b.persen - a.persen,
  nama: (a, b) => a.nama.localeCompare(b.nama, 'id'),
};
const LABEL_AKSES = { aktif: 'Aktif', nonaktif: 'Nonaktif', mundur: 'Mundur' } as const;
const PER_HALAMAN = 10;

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

function daftarHalaman(kini: number, akhir: number): (number | '…')[] {
  const set = [...new Set([1, kini - 1, kini, kini + 1, akhir])].filter((n) => n >= 1 && n <= akhir).sort((a, b) => a - b);
  return set.flatMap((n, i) => (i && n - set[i - 1] > 1 ? (['…', n] as const) : ([n] as const)));
}

// List Responden (Manajemen Pengguna). Pencarian di peramban: kata kunci tidak masuk URL atau log server.
export default function TabelResponden({ baris, superAdmin }: { baris: BarisResponden[]; superAdmin: boolean }) {
  const [cari, setCari] = useState('');
  const [hashCari, setHashCari] = useState<string | null>(null);
  const [akses, setAkses] = useState<Akses>('semua');
  const [progres, setProgres] = useState<Progres>('semua');
  const [kelompok, setKelompok] = useState<'semua' | 'penelitian' | 'bukan'>('semua');
  const [urut, setUrut] = useState<Urut>('id');
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
    return baris
      .filter((b) => {
        if (akses !== 'semua' && b.status_akun !== akses) return false;
        if (kelompok === 'penelitian' && !b.sampel) return false;
        if (kelompok === 'bukan' && b.sampel) return false;
        if (progres === 'perhatian' && !(b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas))) return false;
        if (progres !== 'semua' && progres !== 'perhatian' && b.status_belajar !== progres) return false;
        if (!q) return true;
        if (hashCari) return b.hp_hash === hashCari;
        return b.nama.toLowerCase().includes(q) || b.id_peserta.toLowerCase().includes(q);
      })
      .sort(URUT[urut]);
  }, [baris, cari, hashCari, akses, kelompok, progres, urut]);

  const jumlahHalaman = Math.max(1, Math.ceil(tersaring.length / PER_HALAMAN));
  const kini = Math.min(halaman, jumlahHalaman);
  const tampil = tersaring.slice((kini - 1) * PER_HALAMAN, kini * PER_HALAMAN);
  const ubah = <T,>(f: (v: T) => void) => (v: T) => {
    f(v);
    setHalaman(1);
  };

  return (
    <>
      <div className="monitor-saring monitor-saring-lengkap" role="search">
        <div className="bidang monitor-cari">
          <label htmlFor="cari-responden">Cari ID, nama, atau nomor HP</label>
          <input id="cari-responden" type="search" value={cari} onChange={(e) => ubah(setCari)(e.target.value)} placeholder="mis. DS-0012 atau 0812…" autoComplete="off" />
        </div>
        <div className="bidang">
          <label htmlFor="saring-akses">Status akses</label>
          <select id="saring-akses" value={akses} onChange={(e) => ubah(setAkses)(e.target.value as Akses)}>
            <option value="semua">Semua</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
            <option value="mundur">Mengundurkan diri</option>
          </select>
        </div>
        <div className="bidang">
          <label htmlFor="saring-progres">Progres</label>
          <select id="saring-progres" value={progres} onChange={(e) => ubah(setProgres)(e.target.value as Progres)}>
            <option value="semua">Semua</option>
            <option value="belum">Belum mulai</option>
            <option value="sedang">Sedang belajar</option>
            <option value="selesai">Selesai semua materi</option>
            <option value="perhatian">⚠ Perlu perhatian</option>
          </select>
        </div>
        <div className="bidang">
          <label htmlFor="saring-kelompok">Kelompok</label>
          <select id="saring-kelompok" value={kelompok} onChange={(e) => ubah(setKelompok)(e.target.value as typeof kelompok)}>
            <option value="semua">Semua</option>
            <option value="penelitian">Responden penelitian</option>
            <option value="bukan">Bukan sampel</option>
          </select>
        </div>
        <div className="bidang">
          <label htmlFor="saring-urut">Urutkan</label>
          <select id="saring-urut" value={urut} onChange={(e) => ubah(setUrut)(e.target.value as Urut)}>
            <option value="id">ID responden</option>
            <option value="terbaru">Pendaftar terbaru</option>
            <option value="aktif">Terakhir aktif</option>
            <option value="progres_rendah">Kelengkapan terendah</option>
            <option value="progres_tinggi">Kelengkapan tertinggi</option>
            <option value="nama">Nama</option>
          </select>
        </div>
        <button
          type="button"
          className="tombol tombol-sekunder monitor-reset"
          onClick={() => {
            setCari('');
            setAkses('semua');
            setProgres('semua');
            setKelompok('semua');
            setUrut('id');
            setHalaman(1);
          }}
        >
          ↺ Reset
        </button>
      </div>

      <p className="label-kecil" aria-live="polite">
        {tersaring.length} responden
      </p>

      <div className="tabel-gulir" role="region" aria-label="List responden" tabIndex={0}>
        <table className="tabel-admin tabel-monitor tabel-responden">
          <thead>
            <tr>
              <th scope="col">ID Responden</th>
              {superAdmin && <th scope="col">Kode Akses</th>}
              <th scope="col">Status Akses</th>
              <th scope="col">Hari ke-</th>
              <th scope="col">Kelengkapan</th>
              <th scope="col">Pretest / Posttest</th>
              <th scope="col">Terakhir Aktif</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tampil.map((b) => {
              const perhatian = b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas);
              return (
                <tr key={b.id_peserta}>
                  <th scope="row">
                    <Link href={`/admin/responden/${b.id_peserta}/`} className="tabel-responden-id">
                      {b.id_peserta}
                    </Link>
                    <span className="tabel-responden-nama">{b.nama}</span>
                    <span className="label-kecil">{b.nomor_samar}</span>
                  </th>
                  {superAdmin && (
                    <td>
                      {b.punya_kode ? (
                        <LihatKodeAkses idPeserta={b.id_peserta} ringkas />
                      ) : (
                        <span className="label-kecil">Belum tersedia — buat kode baru (Reset Kode)</span>
                      )}
                    </td>
                  )}
                  <td>
                    <span className={`lencana ${b.status_akun === 'aktif' ? 'lencana-materi-selesai' : 'lencana-materi-terkunci'}`}>
                      {b.status_akun === 'aktif' ? '●' : b.status_akun === 'mundur' ? '↩' : '⛔'} {LABEL_AKSES[b.status_akun]}
                    </span>
                    {!b.sampel && <span className="label-kecil">Bukan sampel</span>}
                    {perhatian && <span className="lencana lencana-peringatan">⚠ {b.tidak_aktif ? 'Tidak aktif' : 'Dekat batas'}</span>}
                  </td>
                  <td>
                    {b.status_belajar === 'selesai' ? '—' : `${b.hari_ke}/${b.batas_hari}`}
                  </td>
                  <td>
                    <span className="monitor-progres">
                      <span className="monitor-progres-baris">
                        <strong>
                          {b.selesai}/{b.total}
                        </strong>
                        <span className="bilah-progres" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={b.persen} aria-label={`Kelengkapan ${b.id_peserta}`}>
                          <span style={{ width: `${b.persen}%` }} />
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="tabel-responden-prepost">
                    <span>{b.pretest ? 'Selesai' : 'Belum'} /</span>
                    <span>{b.posttest ? 'Selesai' : 'Belum'}</span>
                  </td>
                  <td>
                    {b.terakhir_aktif}
                    <span className="label-kecil">{b.terakhir_relatif}</span>
                  </td>
                  <td>
                    <AksiResponden b={b} superAdmin={superAdmin} />
                  </td>
                </tr>
              );
            })}
            {tampil.length === 0 && (
              <tr>
                <td colSpan={8}>Tidak ada responden yang cocok dengan pencarian atau saringan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="monitor-kaki">
        <p className="label-kecil">
          {tersaring.length
            ? `Menampilkan ${(kini - 1) * PER_HALAMAN + 1}–${Math.min(kini * PER_HALAMAN, tersaring.length)} dari ${tersaring.length} responden`
            : 'Menampilkan 0 responden'}
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
                <button key={n} type="button" className={`tombol tombol-ikon ${n === kini ? '' : 'tombol-sekunder'}`} aria-current={n === kini ? 'page' : undefined} aria-label={`Halaman ${n}`} onClick={() => setHalaman(n)}>
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
