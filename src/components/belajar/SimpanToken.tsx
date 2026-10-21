'use client';

import { useActionState, useState } from 'react';
import { aksiKonfirmasiToken } from '@/app/aksi-responden';
import Ikon from '../Ikon';
import { Pesan } from './Bidang';

interface Props {
  token: string; // kode akses 6 angka, sudah diformat "482 917"
  nama: string;
  tujuan: 'awal' | 'profil';
}

// "Simpan Kode Akses Anda" (PRD 7.2): kode ditampilkan sekali, besar dan jelas.
// Hanya nama dan kode akses yang ditampilkan agar mudah dicatat (keputusan peneliti 2026-10-21).
export default function SimpanToken({ token, nama, tujuan }: Props) {
  const [status, aksi, menunggu] = useActionState(aksiKonfirmasiToken, undefined);
  const [tersalin, setTersalin] = useState(false);
  const angka = token.replace(/\D/g, '');

  function salin() {
    navigator.clipboard?.writeText(angka).then(() => setTersalin(true));
  }

  function simpanGambar() {
    const kanvas = document.createElement('canvas');
    kanvas.width = 900;
    kanvas.height = 520;
    const g = kanvas.getContext('2d');
    if (!g) return;
    g.fillStyle = '#f1f8f3';
    g.fillRect(0, 0, 900, 520);
    g.fillStyle = '#174a35';
    g.font = 'bold 44px sans-serif';
    g.fillText('DASH Sehat — Kode Akses', 50, 90);
    g.font = '32px sans-serif';
    g.fillStyle = '#1f2a24';
    g.fillText(`Nama: ${nama}`, 50, 175);
    g.fillText('Kode akses:', 50, 250);
    g.font = 'bold 120px monospace';
    g.fillStyle = '#174a35';
    g.fillText(token, 50, 380);
    g.font = '26px sans-serif';
    g.fillStyle = '#4a5a51';
    g.fillText('Masuk dengan nomor HP Anda dan kode ini. Jangan dibagikan.', 50, 460);
    const a = document.createElement('a');
    a.href = kanvas.toDataURL('image/png');
    a.download = 'kode-akses-dash-sehat.png';
    a.click();
  }

  return (
    <div className="simpan-token">
      <div className="kotak-berikon kotak-berikon-peringatan">
        <span className="kotak-berikon-tanda" aria-hidden="true">
          !
        </span>
        <p>
          <strong>Kode ini hanya ditampilkan sekali.</strong> Catat di buku atau kartu kecil, atau potret layar ini. Kode
          dibutuhkan setiap kali Anda masuk bersama nomor HP Anda.
        </p>
      </div>

      <div className="kartu-token">
        <div className="kartu-token-baris">
          <span className="kartu-token-ikon">
            <Ikon nama="orang" />
          </span>
          <div>
            <p className="kartu-token-label">Nama</p>
            <p className="kartu-token-nilai">{nama}</p>
          </div>
        </div>
        <div className="kartu-token-baris">
          <span className="kartu-token-ikon">
            <Ikon nama="kunci" />
          </span>
          <div>
            <p className="kartu-token-label">Kode akses</p>
            <div className="kode-kotak">
              <span className="token-besar" aria-label={`Kode akses: ${angka.split('').join(' ')}`}>
                {token}
              </span>
              <button type="button" className="kode-kotak-salin" onClick={salin} aria-label="Salin kode akses">
                <Ikon nama="salin" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grup-tombol-dua">
        <button type="button" className="tombol tombol-sekunder" onClick={salin}>
          <Ikon nama="salin" />
          {tersalin ? 'Tersalin ✓' : 'Salin'}
        </button>
        <button type="button" className="tombol" onClick={simpanGambar}>
          <Ikon nama="gambar" />
          Simpan sebagai Gambar
        </button>
      </div>
      <p className="sr-only" role="status">
        {tersalin ? 'Kode akses tersalin.' : ''}
      </p>

      <div className="kotak-berikon kotak-berikon-info">
        <span className="kotak-berikon-tanda">
          <Ikon nama="gembok" ukuran={18} />
        </span>
        <p>Kode akses adalah rahasia: jangan bagikan kepada siapa pun, termasuk orang yang mengaku petugas.</p>
      </div>

      <form action={aksi} className="form-admin" noValidate>
        <input type="hidden" name="tujuan" value={tujuan} />
        <Pesan pesan={status?.pesan} />
        <div className="bidang">
          <label className="centang">
            <input type="checkbox" name="sudah_simpan" value="ya" aria-invalid={status?.kolom === 'sudah_simpan' || undefined} />
            <span>Saya sudah menyimpan kode akses saya</span>
          </label>
        </div>
        <button type="submit" className="tombol tombol-besar" disabled={menunggu}>
          {menunggu ? 'Menyimpan…' : 'Lanjut'}
          {!menunggu && <Ikon nama="panah-kanan" />}
        </button>
      </form>
    </div>
  );
}
