'use client';

import { useEffect, useRef, useState } from 'react';

// Kotak pencarian untuk daftar pertanyaan (<details>). Tanpa JavaScript, semua pertanyaan tetap tampil.
export default function CariTanya({ children }: { children: React.ReactNode }) {
  const [kata, setKata] = useState('');
  const [jumlah, setJumlah] = useState<number | null>(null);
  const [js, setJs] = useState(false);
  const wadah = useRef<HTMLDivElement>(null);

  useEffect(() => setJs(true), []);
  useEffect(() => {
    const q = kata.trim().toLowerCase();
    let n = 0;
    wadah.current?.querySelectorAll<HTMLDetailsElement>('details').forEach((d) => {
      const cocok = !q || (d.textContent ?? '').toLowerCase().includes(q);
      d.hidden = !cocok;
      if (q && cocok) d.open = true;
      if (cocok) n++;
    });
    setJumlah(q ? n : null);
  }, [kata]);

  return (
    <>
      {js && (
        <div className="cari">
          <label htmlFor="cari-tanya" className="sr-only">
            Cari pertanyaan
          </label>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="cari-tanya"
            type="search"
            placeholder="Cari pertanyaan, misalnya: garam"
            value={kata}
            onChange={(e) => setKata(e.target.value)}
          />
        </div>
      )}
      <p className="label-kecil" aria-live="polite">
        {jumlah === null ? '' : jumlah ? `${jumlah} pertanyaan cocok.` : 'Tidak ada pertanyaan yang cocok. Coba kata lain.'}
      </p>
      <div ref={wadah} className="daftar-tanya">
        {children}
      </div>
    </>
  );
}
