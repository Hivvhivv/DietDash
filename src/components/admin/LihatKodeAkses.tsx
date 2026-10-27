'use client';

import { useState, useTransition } from 'react';
import { aksiLihatKodeAkses } from '@/app/admin/aksi-responden';

// Kode akses tersamar dengan tombol "Tampilkan" dan "Salin" (khusus super admin). Kode diambil dari server saat
// tombol ditekan, tidak ada di HTML awal, dan setiap pembukaan tercatat di log aktivitas.
export default function LihatKodeAkses({ idPeserta, ringkas = false }: { idPeserta: string; ringkas?: boolean }) {
  const [kode, setKode] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [tersalin, setTersalin] = useState(false);
  const [menunggu, mulai] = useTransition();

  const ambil = async (): Promise<string | null> => {
    if (kode) return kode;
    const h = await aksiLihatKodeAkses(idPeserta);
    if (!h.kode) {
      setPesan(h.pesan ?? 'Kode tidak dapat ditampilkan.');
      return null;
    }
    setPesan(null);
    return h.kode;
  };

  return (
    <span className={`lihat-kode${ringkas ? ' lihat-kode-ringkas' : ''}`}>
      <span className="lihat-kode-angka" aria-label={kode ? `Kode akses ${kode.replace(/\D/g, '').split('').join(' ')}` : 'Kode akses tersembunyi'}>
        {kode ?? '••• •••'}
      </span>
      <span className="lihat-kode-tombol">
        <button
          type="button"
          className="tombol tombol-sekunder tombol-kecil"
          disabled={menunggu}
          onClick={() =>
            kode
              ? setKode(null)
              : mulai(async () => {
                  setKode(await ambil());
                })
          }
        >
          {kode ? 'Sembunyikan' : menunggu ? 'Membuka…' : 'Tampilkan'}
          <span className="sr-only"> kode akses {idPeserta}</span>
        </button>
        <button
          type="button"
          className="tombol tombol-sekunder tombol-kecil"
          disabled={menunggu}
          onClick={() =>
            mulai(async () => {
              const k = await ambil();
              if (!k) return;
              await navigator.clipboard?.writeText(k.replace(/\s/g, ''));
              setTersalin(true);
              setTimeout(() => setTersalin(false), 2000);
            })
          }
        >
          {tersalin ? 'Tersalin ✓' : 'Salin'}
          <span className="sr-only"> kode akses {idPeserta}</span>
        </button>
      </span>
      {pesan && (
        <span className="label-kecil" role="status">
          {pesan}
        </span>
      )}
    </span>
  );
}
