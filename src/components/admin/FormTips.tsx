'use client';

import { useActionState, useState } from 'react';
import type { StatusKonten } from '@/app/admin/aksi-konten';
import { aksiSimpanTips } from '@/app/admin/aksi-tips';
import { Pesan } from '../belajar/Bidang';
import UnggahGambar from './UnggahGambar';

export interface AwalTips {
  id: string;
  judul: string;
  kategori: string;
  masalah: string;
  solusi: string;
  catatan: string;
  gambar_id: string;
  gambar_alt: string;
  terbit: boolean;
}

function Kolom({ id, label, petunjuk, galat, children }: { id: string; label: string; petunjuk?: string; galat?: string; children: React.ReactNode }) {
  return (
    <div className="bidang">
      <label htmlFor={id}>{label}</label>
      {petunjuk && <p className="petunjuk">{petunjuk}</p>}
      {children}
      {galat && (
        <p className="galat" id={`galat-${id}`}>
          {galat}
        </p>
      )}
    </div>
  );
}

// Formulir tambah/ubah tips. Gambar opsional; tanpa gambar, kartu memakai ilustrasi kategori.
export default function FormTips({ awal, kategori }: { awal: AwalTips; kategori: [string, string][] }) {
  const [status, kirim, menunggu] = useActionState<StatusKonten | undefined, FormData>(aksiSimpanTips, undefined);
  const g = status?.galat ?? {};
  const nilai = (k: keyof AwalTips): string => {
    const n = status?.nilai;
    if (n && k in n) return String(n[k] ?? '');
    return String(awal[k] ?? '');
  };
  const attr = (k: string) => (g[k] ? { 'aria-invalid': true as const, 'aria-describedby': `galat-${k}` } : {});
  const [gambarId, setGambarId] = useState(nilai('gambar_id'));
  const [alt, setAlt] = useState(nilai('gambar_alt'));
  const terbitAwal = status?.nilai ? status.nilai.terbit === 'ya' : awal.terbit;

  return (
    <form key={status?.percobaan ?? 0} action={kirim} className="form-admin" noValidate>
      <Pesan pesan={status?.pesan} />
      <input type="hidden" name="id" value={awal.id} />
      <fieldset>
        <legend>Isi tips</legend>
        <Kolom id="judul" label="Judul tips" petunjuk="Singkat dan jelas, mis. “Trik bawang putih & sangrai rempah”." galat={g.judul}>
          <input id="judul" name="judul" defaultValue={nilai('judul')} {...attr('judul')} />
        </Kolom>
        <Kolom id="kategori" label="Kategori" galat={g.kategori}>
          <select id="kategori" name="kategori" defaultValue={nilai('kategori') || kategori[0][0]} {...attr('kategori')}>
            {kategori.map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </Kolom>
        <Kolom id="masalah" label="Masalah" petunjuk="Kesulitan yang sering dialami responden." galat={g.masalah}>
          <textarea id="masalah" name="masalah" rows={3} defaultValue={nilai('masalah')} {...attr('masalah')} />
        </Kolom>
        <Kolom id="solusi" label="Solusi praktis" petunjuk="Langkah yang bisa langsung dicoba, tanpa klaim pengobatan." galat={g.solusi}>
          <textarea id="solusi" name="solusi" rows={4} defaultValue={nilai('solusi')} {...attr('solusi')} />
        </Kolom>
        <Kolom id="catatan" label="Tips singkat (opsional)" petunjuk="Satu kalimat pengingat di bagian bawah kartu." galat={g.catatan}>
          <textarea id="catatan" name="catatan" rows={2} defaultValue={nilai('catatan')} {...attr('catatan')} />
        </Kolom>
      </fieldset>
      <fieldset>
        <legend>Gambar (opsional)</legend>
        <input type="hidden" name="gambar_id" value={gambarId} />
        {gambarId ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pratinjau-gambar" src={`/gambar-konten/${gambarId}/`} alt={alt} width={180} height={120} />
            <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => setGambarId('')}>
              Hapus gambar (pakai ilustrasi kategori)
            </button>
          </>
        ) : (
          <p className="petunjuk">Belum ada gambar. Kartu akan memakai ilustrasi sesuai kategori.</p>
        )}
        <UnggahGambar
          label="Pilih berkas gambar"
          onSelesai={(h) => {
            setGambarId(h.id);
            setAlt(h.alt);
          }}
        />
        {g.gambar_id && <p className="galat">{g.gambar_id}</p>}
        {gambarId && (
          <Kolom id="gambar_alt" label="Teks alternatif gambar" petunjuk="Jelaskan isi gambar untuk pembaca layar." galat={g.gambar_alt}>
            <input id="gambar_alt" name="gambar_alt" value={alt} onChange={(e) => setAlt(e.target.value)} {...attr('gambar_alt')} />
          </Kolom>
        )}
      </fieldset>
      <label className="centang">
        <input type="checkbox" name="terbit" value="ya" defaultChecked={terbitAwal} />
        <span>Tampilkan kepada responden</span>
      </label>
      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Menyimpan…' : 'Simpan tips'}
      </button>
    </form>
  );
}
