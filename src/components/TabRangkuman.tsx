'use client';

import { useEffect, useRef, useState } from 'react';

// Tab penyaring untuk halaman Rangkuman Materi. Tanpa JavaScript, semua modul tetap tampil.
export default function TabRangkuman({
  tab,
  children,
}: {
  tab: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  const [aktif, setAktif] = useState('semua');
  const wadah = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wadah.current?.querySelectorAll<HTMLElement>('[data-tab]').forEach((el) => {
      el.hidden = aktif !== 'semua' && el.dataset.tab !== aktif;
    });
  }, [aktif]);

  return (
    <>
      <div className="tab-chip" role="group" aria-label="Tampilkan rangkuman">
        {[{ id: 'semua', label: 'Semua Modul' }, ...tab].map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={aktif === t.id}
            onClick={() => setAktif(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div ref={wadah}>{children}</div>
    </>
  );
}
