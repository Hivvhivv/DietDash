'use client';

import { useActionState } from 'react';
import { aksiImporResponden, type StatusAksiAdmin } from '@/app/admin/aksi-responden';
import { Pesan } from '../belajar/Bidang';

const CONTOH = 'nama,nomor_hp\nSiti Aminah,081234567890\nBudi Santoso,0857 1234 5678';

function unduhHasil(hasil: NonNullable<StatusAksiAdmin['hasil']>) {
  const sel = (v: string) => (/[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const isi = [['baris', 'nama', 'nomor_hp_tersamar', 'id_peserta', 'kode_akses', 'keterangan'], ...hasil.map((x) => [String(x.baris), x.nama, x.nomor_samar, x.id_peserta ?? '', x.kode ?? '', x.pesan ?? 'dibuat'])]
    .map((r) => r.map(sel).join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿' + isi], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `hasil-impor-responden_${new Date().toISOString().slice(0, 10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

// Impor CSV responden (khusus super admin). Kode akses hasil impor hanya tampil di sini sekali.
export default function FormImpor() {
  const [status, aksi, menunggu] = useActionState<StatusAksiAdmin | undefined, FormData>(aksiImporResponden, undefined);

  if (status?.hasil) {
    const jadi = status.hasil.filter((x) => x.kode);
    return (
      <section className="kartu-panel" aria-labelledby="judul-hasil-impor">
        <h2 id="judul-hasil-impor">Hasil impor</h2>
        <Pesan sukses={status.sukses} />
        <div className="grup-tombol">
          <button type="button" className="tombol" onClick={() => unduhHasil(status.hasil!)}>
            Unduh hasil (CSV, berisi kode)
          </button>
          {jadi.length > 0 && (
            <a className="tombol tombol-sekunder" href="/admin/cetak/?mode=kartu" target="_blank" rel="noopener">
              Cetak semua kartu
            </a>
          )}
          <a className="tombol tombol-sekunder" href="/admin/responden/impor/">
            Impor lagi
          </a>
        </div>
        <div className="tabel-gulir">
          <table className="tabel-admin">
            <thead>
              <tr>
                <th scope="col">Baris</th>
                <th scope="col">Nama</th>
                <th scope="col">Nomor HP</th>
                <th scope="col">ID peserta</th>
                <th scope="col">Kode akses</th>
                <th scope="col">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {status.hasil.map((x) => (
                <tr key={x.baris}>
                  <td>{x.baris}</td>
                  <td>{x.nama || '—'}</td>
                  <td>{x.nomor_samar || '—'}</td>
                  <td>{x.id_peserta ?? '—'}</td>
                  <td>{x.kode ? <span className="lihat-kode-angka">{x.kode}</span> : '—'}</td>
                  <td>{x.pesan ? <span className="lencana lencana-peringatan">⚠ {x.pesan}</span> : <span className="lencana lencana-materi-selesai">✓ Dibuat</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <form action={aksi} className="form-admin kartu-panel">
      <Pesan pesan={status?.pesan} />
      <div className="bidang">
        <label htmlFor="berkas">Berkas CSV</label>
        <p className="petunjuk">Dua kolom: nama, nomor HP (pemisah koma, titik koma, atau tab). Baris judul boleh ada. Maksimal 300 baris.</p>
        <input id="berkas" name="berkas" type="file" accept=".csv,text/csv,text/plain" />
      </div>
      <div className="bidang">
        <label htmlFor="teks">…atau tempel isinya di sini</label>
        <textarea id="teks" name="teks" rows={6} placeholder={CONTOH} className="kode" />
      </div>
      <div className="bidang">
        <label htmlFor="sampel">Kelompok untuk semua baris</label>
        <select id="sampel" name="sampel" defaultValue="responden_penelitian">
          <option value="responden_penelitian">Responden penelitian</option>
          <option value="bukan_sampel">Bukan sampel (uji coba / tim)</option>
        </select>
      </div>
      <div className="bidang">
        <label className="centang">
          <input type="checkbox" name="konfirmasi" value="ya" />
          <span>
            Semua calon responden di berkas ini sudah menyatakan <strong>memenuhi kriteria</strong> dan <strong>menyetujui ikut
            penelitian</strong> kepada peneliti.
          </span>
        </label>
      </div>
      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Mengimpor…' : 'Impor responden'}
      </button>
    </form>
  );
}
