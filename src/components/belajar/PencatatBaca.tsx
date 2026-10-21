'use client';

import { useEffect } from 'react';
import { aksiBukaMateri } from '@/app/aksi-responden';

const BATAS_DIAM_MS = 5 * 60_000; // berhenti menghitung setelah 5 menit tanpa interaksi (PRD 11.4)
const KIRIM_TIAP_MS = 30_000;

// Menandai materi "sedang dipelajari" dan mencatat lama membaca saat halaman aktif di layar.
export default function PencatatBaca({ materiKunci }: { materiKunci: string }) {
  useEffect(() => {
    aksiBukaMateri(materiKunci).catch(() => {});
    let terakhirInteraksi = Date.now();
    let terkumpul = 0;
    let detakTerakhir = Date.now();

    const interaksi = () => {
      terakhirInteraksi = Date.now();
    };
    const detak = () => {
      const kini = Date.now();
      if (document.visibilityState === 'visible' && kini - terakhirInteraksi < BATAS_DIAM_MS) {
        terkumpul += (kini - detakTerakhir) / 1000;
      }
      detakTerakhir = kini;
    };
    const kirim = () => {
      detak();
      const detik = Math.round(terkumpul);
      if (detik < 1) return;
      terkumpul -= detik;
      fetch('/api/baca/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materi: materiKunci, detik: Math.min(detik, 60) }),
        keepalive: true,
      }).catch(() => {});
    };

    const jenis = ['scroll', 'keydown', 'pointerdown', 'touchstart'] as const;
    jenis.forEach((j) => window.addEventListener(j, interaksi, { passive: true }));
    const tik = window.setInterval(detak, 1000);
    const kirimBerkala = window.setInterval(kirim, KIRIM_TIAP_MS);
    const saatSembunyi = () => {
      if (document.visibilityState === 'hidden') kirim();
      else detakTerakhir = Date.now();
    };
    document.addEventListener('visibilitychange', saatSembunyi);
    return () => {
      kirim();
      jenis.forEach((j) => window.removeEventListener(j, interaksi));
      window.clearInterval(tik);
      window.clearInterval(kirimBerkala);
      document.removeEventListener('visibilitychange', saatSembunyi);
    };
  }, [materiKunci]);
  return null;
}
