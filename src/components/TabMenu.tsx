'use client';

import { useEffect, useId, useState } from 'react';
import type { ItemMenu } from '@/lib/blok-khusus';

// Kartu contoh menu bertab (Sarapan, Makan Siang, ...). Tanpa JavaScript semua menu tampil berurutan.
export default function TabMenu({ menu }: { menu: ItemMenu[] }) {
  const [aktif, setAktif] = useState(0);
  const [js, setJs] = useState(false);
  const dasar = useId();
  useEffect(() => setJs(true), []);

  function tekanTombol(e: React.KeyboardEvent, i: number) {
    const arah = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!arah) return;
    e.preventDefault();
    const baru = (i + arah + menu.length) % menu.length;
    setAktif(baru);
    document.getElementById(`${dasar}-tab-${baru}`)?.focus();
  }

  return (
    <div className="tab-menu">
      {js && (
        <div role="tablist" aria-label="Waktu makan" className="tab-chip">
          {menu.map((m, i) => (
            <button
              key={m.waktu}
              id={`${dasar}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={aktif === i}
              aria-controls={`${dasar}-panel-${i}`}
              tabIndex={aktif === i ? 0 : -1}
              onClick={() => setAktif(i)}
              onKeyDown={(e) => tekanTombol(e, i)}
            >
              {m.waktu}
            </button>
          ))}
        </div>
      )}
      {menu.map((m, i) => (
        <section
          key={m.waktu}
          id={`${dasar}-panel-${i}`}
          role={js ? 'tabpanel' : undefined}
          aria-labelledby={js ? `${dasar}-tab-${i}` : undefined}
          hidden={js && aktif !== i}
          className="kartu kartu-menu"
        >
          <div className="kartu-menu-gambar" aria-hidden="true">
            {m.emoji ?? '🍽️'}
          </div>
          <div>
            {!js && <p className="hero-lencana">{m.waktu}</p>}
            <h3>{m.nama}</h3>
            <ul>
              {m.bahan.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {m.alasan && (
              <div className="kartu-menu-alasan">
                <p>
                  <strong>Mengapa pilihan ini baik?</strong>
                </p>
                <ul>
                  {m.alasan.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            {m.catatan && <p className="label-kecil">{m.catatan}</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
