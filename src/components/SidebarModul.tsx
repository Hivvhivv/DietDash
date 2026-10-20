'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ambilProgresSaya, catatMateriDibuka } from '@/lib/progres-klien';

interface Props {
  modulId: string;
  urutan: number;
  judul: string;
  materi: { nomor: number; judul: string }[];
  aktif: number | 'ringkasan' | 'latihan';
  catat?: boolean; // catat materi aktif sebagai sudah dibuka (dimatikan di pratinjau admin)
}

// Daftar materi dalam satu modul + progres modul.
// Di layar lebar tampil sebagai kolom samping; di ponsel bisa dilipat.
export default function SidebarModul({ modulId, urutan, judul, materi, aktif, catat = true }: Props) {
  const [dibaca, setDibaca] = useState<Set<number>>(new Set());
  const [js, setJs] = useState(false);
  const [buka, setBuka] = useState(false);

  useEffect(() => {
    setJs(true);
    let batal = false;
    (async () => {
      if (catat && typeof aktif === 'number') await catatMateriDibuka(modulId, aktif);
      const { data } = await ambilProgresSaya();
      if (batal) return;
      const s = new Set<number>();
      for (const x of materi) if (data.materi[`${modulId}/${x.nomor}`]) s.add(x.nomor);
      setDibaca(s);
    })();
    return () => {
      batal = true;
    };
  }, [modulId, aktif, catat, materi]);

  const persen = Math.round((dibaca.size / materi.length) * 100);

  return (
    <aside className="sidebar-modul" aria-label={`Isi Modul ${urutan}`} data-js={js ? 'aktif' : undefined}>
      <button
        type="button"
        className="sidebar-tombol"
        aria-expanded={buka}
        aria-controls={`isi-sidebar-${modulId}`}
        onClick={() => setBuka((b) => !b)}
      >
        <span>
          Isi Modul {urutan} · {dibaca.size}/{materi.length} materi
        </span>
        <span aria-hidden="true">{buka ? '▲' : '▼'}</span>
      </button>
      <div id={`isi-sidebar-${modulId}`} className="sidebar-isi" data-buka={buka ? 'ya' : undefined}>
        <p className="sidebar-judul">
          <Link href={`/materi/${modulId}/`} aria-current={aktif === 'ringkasan' ? 'page' : undefined}>
            {judul}
          </Link>
        </p>
        <ol className="sidebar-daftar">
          {materi.map((x) => (
            <li key={x.nomor}>
              <Link
                href={`/materi/${modulId}/${x.nomor}/`}
                aria-current={aktif === x.nomor ? 'page' : undefined}
                className={dibaca.has(x.nomor) ? 'dibaca' : undefined}
              >
                <span className="sidebar-tanda" aria-hidden="true">
                  {dibaca.has(x.nomor) ? '✓' : x.nomor}
                </span>
                <span>
                  {x.judul}
                  {dibaca.has(x.nomor) && <span className="sr-only"> (sudah dibuka)</span>}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link href={`/materi/${modulId}/latihan/`} aria-current={aktif === 'latihan' ? 'page' : undefined}>
              <span className="sidebar-tanda" aria-hidden="true">
                ✎
              </span>
              <span>Latihan Soal</span>
            </Link>
          </li>
        </ol>
        <div className="sidebar-progres">
          <p>
            Progres modul <strong>{persen}%</strong>
            <span className="label-kecil"> · {dibaca.size} dari {materi.length} materi</span>
          </p>
          <div
            className="bilah-progres"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={persen}
            aria-label={`Progres Modul ${urutan}`}
          >
            <div style={{ width: `${persen}%` }} />
          </div>
          <p className="label-kecil">
            <Link href="/akun/">Lihat progres saya</Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
