'use client';

import { useActionState, useRef, useState } from 'react';
import { aksiSimpanMateri, aksiSimpanModul, type StatusKonten } from '@/app/admin/aksi-konten';
import { LABEL_ILUSTRASI } from '@/data/gambar';
import { NAMA_ILUSTRASI } from '@/lib/skema';
import { IsiMateriBagian } from '../IsiMarkdown';
import { Pesan } from '../belajar/Bidang';
import UnggahGambar from './UnggahGambar';

// ---------- Bantuan kolom ----------

function useKolom(status: StatusKonten | undefined, awal: Record<string, unknown>) {
  const g = status?.galat ?? {};
  const nilai = (k: string): string => {
    const n = status?.nilai;
    if (n && k in n) return String(n[k] ?? '');
    const a = awal[k];
    return Array.isArray(a) ? a.join('\n') : a == null ? '' : String(a);
  };
  const attr = (k: string) => (g[k] ? { 'aria-invalid': true as const, 'aria-describedby': `galat-${k}` } : {});
  const Galat = ({ k }: { k: string }) =>
    g[k] ? (
      <p className="galat" id={`galat-${k}`}>
        {g[k]}
      </p>
    ) : null;
  return { nilai, attr, Galat };
}

function Kolom({ id, label, petunjuk, children }: { id: string; label: string; petunjuk?: string; children: React.ReactNode }) {
  return (
    <div className="bidang">
      <label htmlFor={id}>{label}</label>
      {petunjuk && <p className="petunjuk">{petunjuk}</p>}
      {children}
    </div>
  );
}

// ---------- Modul ----------

export interface AwalModul {
  kunci: string;
  judul: string;
  deskripsi: string;
  tujuan: string[];
  jenis_gambar: 'bawaan' | 'unggah';
  ilustrasi: string;
  gambar_id: string;
  gambar_alt: string;
}

export function FormModul({ awal }: { awal: AwalModul }) {
  const [status, kirim, menunggu] = useActionState(aksiSimpanModul, undefined);
  const { nilai, attr, Galat } = useKolom(status, awal as unknown as Record<string, unknown>);
  const [jenis, setJenis] = useState(nilai('jenis_gambar') || 'bawaan');
  const [gambarId, setGambarId] = useState(nilai('gambar_id'));
  const [alt, setAlt] = useState(nilai('gambar_alt'));

  return (
    <form key={status?.percobaan ?? 0} action={kirim} className="form-admin" noValidate>
      <Pesan pesan={status?.pesan} />
      <input type="hidden" name="kunci" value={awal.kunci} />
      <fieldset>
        <legend>Identitas modul</legend>
        <Kolom id="judul" label="Judul modul">
          <input id="judul" name="judul" defaultValue={nilai('judul')} {...attr('judul')} />
          <Galat k="judul" />
        </Kolom>
        <Kolom id="deskripsi" label="Deskripsi singkat" petunjuk="Satu atau dua kalimat. Tampil di kartu modul.">
          <textarea id="deskripsi" name="deskripsi" rows={2} defaultValue={nilai('deskripsi')} {...attr('deskripsi')} />
          <Galat k="deskripsi" />
        </Kolom>
        <Kolom id="tujuan" label="Tujuan modul" petunjuk="Satu tujuan per baris (1–5 baris).">
          <textarea id="tujuan" name="tujuan" rows={3} defaultValue={nilai('tujuan')} {...attr('tujuan')} />
          <Galat k="tujuan" />
        </Kolom>
      </fieldset>
      <fieldset>
        <legend>Ilustrasi sampul</legend>
        <div className="daftar-centang" role="radiogroup" aria-label="Sumber ilustrasi">
          <label className="centang">
            <input type="radio" name="jenis_gambar" value="bawaan" checked={jenis === 'bawaan'} onChange={() => setJenis('bawaan')} />
            <span>Pilih ilustrasi bawaan</span>
          </label>
          <label className="centang">
            <input type="radio" name="jenis_gambar" value="unggah" checked={jenis === 'unggah'} onChange={() => setJenis('unggah')} />
            <span>Unggah gambar sendiri</span>
          </label>
        </div>
        {jenis === 'bawaan' ? (
          <Kolom id="ilustrasi" label="Ilustrasi">
            <select id="ilustrasi" name="ilustrasi" defaultValue={nilai('ilustrasi') || 'piring'}>
              {NAMA_ILUSTRASI.map((x) => (
                <option key={x} value={x}>
                  {LABEL_ILUSTRASI[x]}
                </option>
              ))}
            </select>
          </Kolom>
        ) : (
          <>
            <input type="hidden" name="gambar_id" value={gambarId} />
            {gambarId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="pratinjau-gambar" src={`/gambar-konten/${gambarId}/`} alt={alt} width={140} height={110} />
            ) : (
              <p className="petunjuk">Belum ada gambar.</p>
            )}
            <UnggahGambar
              label="Pilih berkas sampul"
              onSelesai={(h) => {
                setGambarId(h.id);
                setAlt(h.alt);
              }}
            />
            <Galat k="gambar_id" />
          </>
        )}
        <Kolom id="gambar_alt" label="Teks alternatif ilustrasi" petunjuk="Jelaskan isi gambar untuk pembaca layar.">
          <input id="gambar_alt" name="gambar_alt" value={alt} onChange={(e) => setAlt(e.target.value)} {...attr('gambar_alt')} />
          <Galat k="gambar_alt" />
        </Kolom>
      </fieldset>
      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Menyimpan…' : 'Simpan modul'}
      </button>
    </form>
  );
}

// ---------- Materi (editor Markdown) ----------

export interface AwalMateri {
  kunci: string;
  modul_kunci: string;
  judul: string;
  tujuan: string[];
  isi: string;
  poin_penting: string[];
  rangkuman: string;
  estimasi_menit: number | null;
  sumber: string[];
  gambar_id: string;
  gambar_alt: string;
}

const SISIPAN: { label: string; teks: string; bungkus?: [string, string] }[] = [
  { label: 'Subjudul', teks: '\n## Subjudul\n' },
  { label: 'Tebal', teks: 'teks tebal', bungkus: ['**', '**'] },
  { label: 'Daftar', teks: '\n- butir pertama\n- butir kedua\n' },
  { label: 'Tips', teks: '\n> **Tips:** tulis tips singkat di sini.\n' },
  { label: 'Contoh penerapan', teks: '\n```contoh\nTulis contoh penerapan sehari-hari di sini.\n```\n' },
  { label: 'Poin penting', teks: '\n```penting\nTulis poin penting di sini.\n```\n' },
  { label: 'Catatan', teks: '\n```catatan\n# Catatan Medis\nTulis catatan atau pengingat di sini.\n```\n' },
  { label: 'Galeri makanan', teks: '\n```galeri\n🥦 | Brokoli | keterangan singkat\n🍌 | Pisang\n```\n' },
  { label: 'Tabel', teks: '\n| Kolom 1 | Kolom 2 |\n| --- | --- |\n| isi | isi |\n' },
];

export function FormMateri({ awal }: { awal: AwalMateri }) {
  const [status, kirim, menunggu] = useActionState(aksiSimpanMateri, undefined);
  const { nilai, attr, Galat } = useKolom(status, awal as unknown as Record<string, unknown>);
  const [isi, setIsi] = useState(nilai('isi'));
  const [lihat, setLihat] = useState(false);
  const [sampulId, setSampulId] = useState(nilai('gambar_id'));
  const [sampulAlt, setSampulAlt] = useState(nilai('gambar_alt'));
  const area = useRef<HTMLTextAreaElement>(null);

  function sisipkan(teks: string, bungkus?: [string, string]) {
    const el = area.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const pilih = isi.slice(a, b);
    const masuk = bungkus ? `${bungkus[0]}${pilih || teks}${bungkus[1]}` : teks;
    const baru = isi.slice(0, a) + masuk + isi.slice(b);
    setIsi(baru);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + masuk.length, a + masuk.length);
    });
  }

  return (
    <form key={status?.percobaan ?? 0} action={kirim} className="form-admin form-lebar" noValidate>
      <Pesan pesan={status?.pesan} />
      <input type="hidden" name="kunci" value={awal.kunci} />
      <input type="hidden" name="modul_kunci" value={awal.modul_kunci} />
      <fieldset>
        <legend>Pembuka</legend>
        <Kolom id="judul" label="Judul materi">
          <input id="judul" name="judul" defaultValue={nilai('judul')} {...attr('judul')} />
          <Galat k="judul" />
        </Kolom>
        <Kolom id="tujuan" label="Tujuan pembelajaran" petunjuk="Satu tujuan per baris (1–5). Contoh: Menyebutkan tiga makanan tinggi garam.">
          <textarea id="tujuan" name="tujuan" rows={3} defaultValue={nilai('tujuan')} {...attr('tujuan')} />
          <Galat k="tujuan" />
        </Kolom>
        <Kolom id="estimasi_menit" label="Estimasi waktu baca (menit)" petunjuk="Kosongkan agar dihitung otomatis dari panjang teks.">
          <input id="estimasi_menit" name="estimasi_menit" type="number" min={1} max={120} inputMode="numeric" defaultValue={nilai('estimasi_menit')} {...attr('estimasi_menit')} />
          <Galat k="estimasi_menit" />
        </Kolom>
      </fieldset>

      <fieldset>
        <legend>Gambar sampul (opsional)</legend>
        <p className="petunjuk">Tampil di kepala halaman materi. Bila kosong, memakai ilustrasi sampul modul.</p>
        <input type="hidden" name="gambar_id" value={sampulId} />
        {sampulId && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pratinjau-gambar" src={`/gambar-konten/${sampulId}/`} alt={sampulAlt} width={180} height={120} />
            <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => setSampulId('')}>
              Hapus gambar sampul
            </button>
          </>
        )}
        <UnggahGambar
          label="Pilih berkas sampul"
          onSelesai={(h) => {
            setSampulId(h.id);
            setSampulAlt(h.alt);
          }}
        />
        <Galat k="gambar_id" />
        {sampulId && (
          <Kolom id="gambar_alt" label="Teks alternatif gambar sampul">
            <input id="gambar_alt" name="gambar_alt" value={sampulAlt} onChange={(e) => setSampulAlt(e.target.value)} {...attr('gambar_alt')} />
            <Galat k="gambar_alt" />
          </Kolom>
        )}
      </fieldset>

      <fieldset>
        <legend>Isi materi</legend>
        <div className="editor-bilah" role="toolbar" aria-label="Sisipkan format">
          {SISIPAN.map((s) => (
            <button key={s.label} type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => sisipkan(s.teks, s.bungkus)}>
              {s.label}
            </button>
          ))}
          <button type="button" className="tombol tombol-lembut tombol-kecil" aria-pressed={lihat} onClick={() => setLihat((x) => !x)}>
            {lihat ? 'Kembali menulis' : 'Pratinjau'}
          </button>
        </div>
        {lihat ? (
          <div className="editor-pratinjau materi" aria-label="Pratinjau isi">
            <IsiMateriBagian isi={isi} />
          </div>
        ) : null}
        <div className="bidang" hidden={lihat}>
          <label htmlFor="isi">Isi (Markdown)</label>
          <p className="petunjuk">
            Gunakan kalimat pendek dan bahasa sehari-hari. Setiap “## Subjudul” tampil sebagai kartu bagian tersendiri;
            gambar di dalam bagian tampil di samping teks pada layar lebar. Tandai angka yang belum dicek sumbernya dengan
            &lt;!-- TODO: verifikasi sumber --&gt;.
          </p>
          <textarea ref={area} id="isi" name="isi" rows={22} className="kode" value={isi} onChange={(e) => setIsi(e.target.value)} {...attr('isi')} />
          <Galat k="isi" />
        </div>
        <details className="tanya">
          <summary>Sisipkan gambar</summary>
          <div className="tanya-isi">
            <UnggahGambar onSelesai={(h) => sisipkan(`\n![${h.alt}](${h.url})\n`)} />
          </div>
        </details>
      </fieldset>

      <fieldset>
        <legend>Penutup</legend>
        <Kolom id="poin_penting" label="Poin penting" petunjuk="Satu poin per baris (1–6).">
          <textarea id="poin_penting" name="poin_penting" rows={4} defaultValue={nilai('poin_penting')} {...attr('poin_penting')} />
          <Galat k="poin_penting" />
        </Kolom>
        <Kolom id="rangkuman" label="Rangkuman" petunjuk="Satu paragraf pendek.">
          <textarea id="rangkuman" name="rangkuman" rows={3} defaultValue={nilai('rangkuman')} {...attr('rangkuman')} />
          <Galat k="rangkuman" />
        </Kolom>
        <Kolom id="sumber" label="Sumber" petunjuk="Satu sitasi per baris. Boleh memakai tautan Markdown [judul](https://…).">
          <textarea id="sumber" name="sumber" rows={4} defaultValue={nilai('sumber')} {...attr('sumber')} />
          <Galat k="sumber" />
        </Kolom>
      </fieldset>

      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Menyimpan…' : 'Simpan materi'}
      </button>
    </form>
  );
}
