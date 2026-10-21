'use client';

import { useActionState, useRef, useState } from 'react';
import { aksiSimpanKuis, aksiSimpanMateri, aksiSimpanModul, aksiSimpanSoal, type StatusKonten } from '@/app/admin/aksi-konten';
import { LABEL_ILUSTRASI } from '@/data/gambar';
import { NAMA_ILUSTRASI } from '@/lib/skema';
import IsiMarkdown from '../IsiMarkdown';
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
}

const SISIPAN: { label: string; teks: string; bungkus?: [string, string] }[] = [
  { label: 'Subjudul', teks: '\n## Subjudul\n' },
  { label: 'Tebal', teks: 'teks tebal', bungkus: ['**', '**'] },
  { label: 'Daftar', teks: '\n- butir pertama\n- butir kedua\n' },
  { label: 'Tips', teks: '\n> **Tips:** tulis tips singkat di sini.\n' },
  { label: 'Contoh penerapan', teks: '\n```contoh\nTulis contoh penerapan sehari-hari di sini.\n```\n' },
  { label: 'Poin penting', teks: '\n```penting\nTulis poin penting di sini.\n```\n' },
  { label: 'Galeri makanan', teks: '\n```galeri\n🥦 | Brokoli | keterangan singkat\n🍌 | Pisang\n```\n' },
  { label: 'Tabel', teks: '\n| Kolom 1 | Kolom 2 |\n| --- | --- |\n| isi | isi |\n' },
];

export function FormMateri({ awal }: { awal: AwalMateri }) {
  const [status, kirim, menunggu] = useActionState(aksiSimpanMateri, undefined);
  const { nilai, attr, Galat } = useKolom(status, awal as unknown as Record<string, unknown>);
  const [isi, setIsi] = useState(nilai('isi'));
  const [lihat, setLihat] = useState(false);
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
            <IsiMarkdown isi={isi} />
          </div>
        ) : null}
        <div className="bidang" hidden={lihat}>
          <label htmlFor="isi">Isi (Markdown)</label>
          <p className="petunjuk">
            Gunakan kalimat pendek dan bahasa sehari-hari. Tandai angka yang belum dicek sumbernya dengan
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

// ---------- Kuis ----------

export function FormKuis({ awal }: { awal: { kuis_kunci: string; judul: string; petunjuk: string; mode: 'A' | 'B'; batas_lulus: number } }) {
  const [status, kirim, menunggu] = useActionState(aksiSimpanKuis, undefined);
  const g = status?.galat ?? {};
  const [mode, setMode] = useState(awal.mode);
  return (
    <form action={kirim} className="form-admin" noValidate>
      <Pesan pesan={status?.pesan} sukses={status?.sukses} />
      <input type="hidden" name="kuis_kunci" value={awal.kuis_kunci} />
      <Kolom id="judul-kuis" label="Judul kuis">
        <input id="judul-kuis" name="judul" defaultValue={awal.judul} aria-invalid={g.judul ? true : undefined} />
        {g.judul && <p className="galat">{g.judul}</p>}
      </Kolom>
      <Kolom id="petunjuk-kuis" label="Petunjuk untuk responden">
        <textarea id="petunjuk-kuis" name="petunjuk" rows={2} defaultValue={awal.petunjuk} aria-invalid={g.petunjuk ? true : undefined} />
        {g.petunjuk && <p className="galat">{g.petunjuk}</p>}
      </Kolom>
      <div className="bidang-baris">
        <Kolom id="mode-kuis" label="Aturan selesai">
          <select id="mode-kuis" name="mode" value={mode} onChange={(e) => setMode(e.target.value as 'A' | 'B')}>
            <option value="A">Mode A: selesai setelah semua soal dijawab</option>
            <option value="B">Mode B: harus mencapai skor minimal</option>
          </select>
        </Kolom>
        <Kolom id="batas-kuis" label="Skor minimal (%)" petunjuk="Hanya dipakai pada Mode B.">
          <input id="batas-kuis" name="batas_lulus" type="number" min={1} max={100} defaultValue={awal.batas_lulus} disabled={mode === 'A'} />
          {mode === 'A' && <input type="hidden" name="batas_lulus" value={awal.batas_lulus} />}
        </Kolom>
      </div>
      <p className="petunjuk">Mode sebaiknya sama untuk semua kuis selama penelitian. Gunakan “Terapkan ke semua kuis” di halaman Konten.</p>
      <button type="submit" className="tombol tombol-sekunder" disabled={menunggu}>
        {menunggu ? 'Menyimpan…' : 'Simpan pengaturan kuis'}
      </button>
    </form>
  );
}

// ---------- Soal ----------

export interface AwalSoal {
  soal_kunci: string;
  teks: string;
  penjelasan: string;
  pilihan: string[];
  benar: string; // indeks pilihan benar
  gambar_id: string;
  gambar_alt: string;
}

export function FormSoal({ awal, kuisKunci, materiKunci }: { awal: AwalSoal; kuisKunci: string; materiKunci: string }) {
  const [status, kirim, menunggu] = useActionState(aksiSimpanSoal, undefined);
  const n = status?.nilai as Partial<AwalSoal> | undefined;
  const g = status?.galat ?? {};
  const [pilihan, setPilihan] = useState<string[]>(() => {
    const p = n?.pilihan ?? awal.pilihan;
    return p.length >= 3 ? p : [...p, ...Array(3 - p.length).fill('')];
  });
  const [benar, setBenar] = useState(n?.benar ?? awal.benar);
  const [gambar, setGambar] = useState({ id: n?.gambar_id ?? awal.gambar_id, alt: n?.gambar_alt ?? awal.gambar_alt });

  return (
    <form key={status?.percobaan ?? 0} action={kirim} className="form-admin" noValidate>
      <Pesan pesan={status?.pesan} />
      <input type="hidden" name="kuis_kunci" value={kuisKunci} />
      <input type="hidden" name="materi_kunci" value={materiKunci} />
      <input type="hidden" name="soal_kunci" value={awal.soal_kunci} />
      <input type="hidden" name="jumlah_pilihan" value={pilihan.length} />
      <Kolom id="teks" label="Pertanyaan">
        <textarea id="teks" name="teks" rows={3} defaultValue={n?.teks ?? awal.teks} aria-invalid={g.teks ? true : undefined} />
        {g.teks && <p className="galat">{g.teks}</p>}
      </Kolom>

      <fieldset>
        <legend>Pilihan jawaban (3–4) — tandai satu yang benar</legend>
        {pilihan.map((p, i) => (
          <div key={i} className="baris-pilihan">
            <label className="centang">
              <input type="radio" name="benar" value={i} checked={benar === String(i)} onChange={() => setBenar(String(i))} />
              <span>{benar === String(i) ? '✓ Benar' : 'Benar?'}</span>
            </label>
            <div className="bidang">
              <label htmlFor={`pilihan_${i}`} className="sr-only">
                Pilihan {String.fromCharCode(65 + i)}
              </label>
              <input
                id={`pilihan_${i}`}
                name={`pilihan_${i}`}
                value={p}
                placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                onChange={(e) => setPilihan((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))}
              />
            </div>
          </div>
        ))}
        {g.pilihan && <p className="galat">{g.pilihan}</p>}
        <p className="grup-tombol">
          {pilihan.length < 4 && (
            <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => setPilihan((xs) => [...xs, ''])}>
              + Tambah pilihan D
            </button>
          )}
          {pilihan.length > 3 && (
            <button
              type="button"
              className="tombol tombol-sekunder tombol-kecil"
              onClick={() => {
                setPilihan((xs) => xs.slice(0, 3));
                if (benar === '3') setBenar('');
              }}
            >
              Hapus pilihan D
            </button>
          )}
        </p>
      </fieldset>

      <Kolom id="penjelasan" label="Penjelasan jawaban" petunjuk="Wajib. Ditampilkan setelah responden menjawab, baik benar maupun salah.">
        <textarea id="penjelasan" name="penjelasan" rows={3} defaultValue={n?.penjelasan ?? awal.penjelasan} aria-invalid={g.penjelasan ? true : undefined} />
        {g.penjelasan && <p className="galat">{g.penjelasan}</p>}
      </Kolom>

      <details className="tanya" open={!!gambar.id}>
        <summary>Gambar soal (opsional)</summary>
        <div className="tanya-isi">
          <input type="hidden" name="gambar_id" value={gambar.id} />
          {gambar.id && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pratinjau-gambar" src={`/gambar-konten/${gambar.id}/`} alt={gambar.alt} />
              <div className="bidang">
                <label htmlFor="gambar_alt">Teks alternatif</label>
                <input id="gambar_alt" name="gambar_alt" value={gambar.alt} onChange={(e) => setGambar((x) => ({ ...x, alt: e.target.value }))} aria-invalid={g.gambar_alt ? true : undefined} />
                {g.gambar_alt && <p className="galat">{g.gambar_alt}</p>}
              </div>
              <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => setGambar({ id: '', alt: '' })}>
                Hapus gambar
              </button>
            </>
          )}
          <UnggahGambar label={gambar.id ? 'Ganti gambar' : 'Pilih gambar'} onSelesai={(h) => setGambar({ id: h.id, alt: h.alt })} />
        </div>
      </details>

      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Menyimpan…' : awal.soal_kunci ? 'Simpan perubahan soal' : 'Tambah soal'}
      </button>
    </form>
  );
}
