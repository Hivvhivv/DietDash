'use client';

import { useState } from 'react';

// Pencarian ID peserta, nama, atau nomor HP di peramban saja: kata kunci tidak masuk URL atau log server.
// Nomor HP dicocokkan lewat hash SHA-256 nomor yang sudah dinormalkan (+62…), jadi nomor lengkap tidak ada di halaman.
function normalkanNomor(masukan: string): string | null {
  let d = masukan.replace(/[\s\-().]/g, '');
  if (d.startsWith('+62')) d = d.slice(3);
  else if (d.startsWith('62')) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  else return null;
  return /^8\d{7,11}$/.test(d) ? `+62${d}` : null;
}

async function sha256(teks: string): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(teks));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function CariResponden({ idTabel }: { idTabel: string }) {
  const [jumlah, setJumlah] = useState<number | null>(null);

  async function saring(nilai: string) {
    const kata = nilai.trim().toLowerCase();
    const nomor = normalkanNomor(nilai.trim());
    const hash = nomor ? await sha256(nomor) : null;
    const baris = document.querySelectorAll<HTMLTableRowElement>(`#${idTabel} tbody tr`);
    let n = 0;
    baris.forEach((tr) => {
      const cocok = !kata || (hash ? tr.dataset.hp === hash : (tr.dataset.cari ?? '').includes(kata));
      tr.hidden = !cocok;
      if (cocok) n++;
    });
    setJumlah(kata ? n : null);
  }

  return (
    <div className="bidang">
      <label htmlFor="cari-responden">Cari ID peserta, nama, atau nomor HP</label>
      <p className="petunjuk">Pencarian dilakukan di perangkat ini dan tidak disimpan di alamat halaman.</p>
      <input id="cari-responden" type="search" autoComplete="off" onChange={(e) => void saring(e.target.value)} />
      <p role="status" className="label-kecil">
        {jumlah !== null && `${jumlah} hasil cocok`}
      </p>
    </div>
  );
}
