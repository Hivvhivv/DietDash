'use client';

import { useEffect, useState } from 'react';
import { CHECKLIST_HARIAN } from '@/data/tips';

// Checklist kebiasaan harian. Hanya disimpan di perangkat ini (localStorage) dan kembali kosong setiap hari;
// tidak dikirim ke server dan bukan data penelitian.
const kunciHariIni = () => {
  const t = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10); // tanggal WIB
  return `dash-checklist-${t}`;
};

export default function ChecklistHarian() {
  const [centang, setCentang] = useState<string[]>([]);

  useEffect(() => {
    try {
      const simpan = JSON.parse(localStorage.getItem(kunciHariIni()) ?? '[]');
      if (Array.isArray(simpan)) setCentang(simpan.filter((x) => typeof x === 'string'));
      // Bersihkan catatan hari-hari sebelumnya.
      for (const k of Object.keys(localStorage)) if (k.startsWith('dash-checklist-') && k !== kunciHariIni()) localStorage.removeItem(k);
    } catch {
      // Penyimpanan tidak tersedia (mode privat); checklist tetap bisa dipakai tanpa disimpan.
    }
  }, []);

  function ubah(kunci: string, nyala: boolean) {
    const baru = nyala ? [...new Set([...centang, kunci])] : centang.filter((x) => x !== kunci);
    setCentang(baru);
    try {
      localStorage.setItem(kunciHariIni(), JSON.stringify(baru));
    } catch {
      // abaikan
    }
  }

  const jumlah = CHECKLIST_HARIAN.filter((c) => centang.includes(c.kunci)).length;

  return (
    <>
      <p className="checklist-skor" aria-live="polite">
        <span className="label-kecil">Pencapaian hari ini</span>
        <strong>
          {jumlah} / {CHECKLIST_HARIAN.length}
        </strong>{' '}
        tercapai
      </p>
      <ul className="checklist-harian">
        {CHECKLIST_HARIAN.map((c) => (
          <li key={c.kunci}>
            <label className="checklist-butir">
              <input type="checkbox" checked={centang.includes(c.kunci)} onChange={(e) => ubah(c.kunci, e.target.checked)} />
              <span>
                <strong>{c.judul}</strong>
                <span className="label-kecil">{c.teks}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}
