'use client';

import { useState } from 'react';
import Ikon from '../Ikon';
import { Pesan } from '../belajar/Bidang';
import { Dialog } from './AksiResponden';
import { BAGIAN_EKSPOR } from '@/lib/bagian-ekspor';

// "Ekspor Data" di detail responden: pilih bagian, lalu halaman cetak terbuka di tab baru untuk disimpan sebagai PDF.
// Formulir GET biasa: URL hanya berisi ID peserta dan nama bagian.
export default function EksporResponden({ idPeserta }: { idPeserta: string }) {
  const [buka, setBuka] = useState(false);
  const [galat, setGalat] = useState('');
  const tutup = () => setBuka(false);
  return (
    <>
      <button type="button" className="tombol tombol-kecil" onClick={() => setBuka(true)}>
        <Ikon nama="dokumen" ukuran={18} /> Ekspor Data
      </button>
      <Dialog judul={`Ekspor data · ${idPeserta}`} buka={buka} tutup={tutup}>
        <form
          action={`/admin/cetak/responden/${idPeserta}/`}
          method="get"
          target="_blank"
          className="form-admin"
          onSubmit={(e) => {
            if (!new FormData(e.currentTarget).getAll('b').length) {
              e.preventDefault();
              setGalat('Pilih minimal satu data untuk diekspor.');
              return;
            }
            setGalat('');
            tutup();
          }}
        >
          <fieldset className="daftar-centang ekspor-pilihan">
            <legend>Data yang dimasukkan ke PDF</legend>
            {BAGIAN_EKSPOR.map((b) => (
              <label key={b.id} className="centang">
                <input type="checkbox" name="b" value={b.id} defaultChecked={b.awal} />
                <span>
                  <strong>{b.label}</strong>
                  <span className="label-kecil">{b.ket}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <Pesan pesan={galat} />
          <p className="label-kecil">PDF dibuat lewat jendela cetak (pilih “Simpan sebagai PDF”). Setiap ekspor tercatat di log aktivitas.</p>
          <div className="grup-tombol">
            <button type="submit" className="tombol">
              Buat PDF
            </button>
            <button type="button" className="tombol tombol-sekunder" onClick={tutup}>
              Batal
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
