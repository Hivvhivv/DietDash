'use client';

import { useState, useTransition } from 'react';
import { aksiLihatKodeAkses } from '@/app/admin/aksi-responden';

// Tombol "Lihat kode" (khusus super admin). Kode diambil dari server saat ditekan, tidak ada di HTML awal,
// dan setiap pembukaan tercatat di log aktivitas.
export default function LihatKodeAkses({ idPeserta, ringkas = false }: { idPeserta: string; ringkas?: boolean }) {
  const [kode, setKode] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [menunggu, mulai] = useTransition();

  if (kode) {
    return (
      <span className="lihat-kode">
        <span className="lihat-kode-angka" aria-label={`Kode akses ${kode.replace(/\D/g, '').split('').join(' ')}`}>
          {kode}
        </span>
        <button type="button" className="tautan-tombol" onClick={() => setKode(null)}>
          Sembunyikan
        </button>
      </span>
    );
  }
  return (
    <span className="lihat-kode">
      <button
        type="button"
        className={`tombol tombol-sekunder tombol-kecil${ringkas ? ' lihat-kode-tombol' : ''}`}
        disabled={menunggu}
        onClick={() =>
          mulai(async () => {
            const h = await aksiLihatKodeAkses(idPeserta);
            if (h.kode) {
              setKode(h.kode);
              setPesan(null);
            } else setPesan(h.pesan ?? 'Kode tidak dapat ditampilkan.');
          })
        }
      >
        {menunggu ? 'Membuka…' : 'Lihat kode'}
        <span className="sr-only"> akses {idPeserta}</span>
      </button>
      {pesan && (
        <span className="label-kecil" role="status">
          {pesan}
        </span>
      )}
    </span>
  );
}
