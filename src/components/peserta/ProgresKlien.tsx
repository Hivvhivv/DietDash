'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DaftarProgres from './DaftarProgres';
import { ambilProgresSaya, bacaLokal } from '@/lib/progres-klien';
import type { DataProgres, ModulUntukProgres } from '@/lib/status-progres';

// Untuk pengunjung tanpa akun: menampilkan progres yang tersimpan di perangkat ini.
export function ProgresPerangkat({ modul }: { modul: ModulUntukProgres[] }) {
  const [data, setData] = useState<DataProgres | null>(null);
  useEffect(() => setData(bacaLokal()), []);
  if (!data) return null;
  return <DaftarProgres modul={modul} data={data} />;
}

// Untuk peserta yang baru masuk: pindahkan progres perangkat ke akun, lalu muat ulang tampilan.
export function SinkronPerangkat() {
  const router = useRouter();
  useEffect(() => {
    const lokal = bacaLokal();
    if (!Object.keys(lokal.materi).length) return;
    ambilProgresSaya().then((r) => {
      if (r.masuk) router.refresh();
    });
  }, [router]);
  return null;
}
