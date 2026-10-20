'use client';

import { useActionState } from 'react';
import type { StatusForm } from '@/app/admin/aksi';
import { NAMA_ILUSTRASI } from '@/lib/skema';

export interface NilaiAwalModul {
  versi: string;
  urutan: number | '';
  judul: string;
  deskripsi_kartu: string;
  ilustrasi: string;
  ilustrasi_alt: string;
  tujuan: string[];
  poin_penting: string[];
  rangkuman: string;
  sumber: string[];
  isi: string;
  catatan: string;
}

interface Props {
  aksi: (s: StatusForm | undefined, fd: FormData) => Promise<StatusForm>;
  awal: NilaiAwalModul;
  daftarSumber: { id: string; sitasi: string }[];
  versiId?: string; // diisi saat menyunting draf
  modulBaru?: boolean; // tampilkan kolom ID modul
  labelSimpan: string;
}

const LABEL_ILUSTRASI: Record<string, string> = {
  jantung: 'Jantung & tekanan darah',
  piring: 'Piring makan',
  porsi: 'Contoh porsi',
  menu: 'Menu harian',
  langkah: 'Anak tangga (langkah kecil)',
  kuis: 'Daftar periksa (kuis)',
};

export default function FormModul({ aksi, awal, daftarSumber, versiId, modulBaru, labelSimpan }: Props) {
  const [status, kirim, menunggu] = useActionState(aksi, undefined);
  const n = status?.nilai;
  const g = status?.galat ?? {};

  const nilai = (k: keyof NilaiAwalModul | 'modul_id'): string => {
    if (n && k in n) return String(n[k] ?? '');
    const a = (awal as unknown as Record<string, unknown>)[k];
    return Array.isArray(a) ? a.join('\n') : String(a ?? '');
  };
  const sumberTerpilih = new Set<string>(n ? ((n.sumber as string[]) ?? []) : awal.sumber);

  const Galat = ({ k }: { k: string }) =>
    g[k] ? (
      <p className="galat" id={`galat-${k}`}>
        {g[k]}
      </p>
    ) : null;
  const atributGalat = (k: string) =>
    g[k] ? { 'aria-invalid': true as const, 'aria-describedby': `galat-${k}` } : {};

  return (
    // key memaksa formulir dibuat ulang dengan nilai terakhir setelah validasi gagal.
    <form key={status?.percobaan ?? 0} action={kirim} className="form-admin" noValidate>
      {status?.pesan && (
        <p className="galat-umum" role="alert">
          {status.pesan}
        </p>
      )}
      {versiId && <input type="hidden" name="versi_id" value={versiId} />}

      <fieldset>
        <legend>Identitas versi</legend>
        {modulBaru && (
          <div className="bidang">
            <label htmlFor="modul_id">ID modul (dipakai di alamat halaman)</label>
            <p className="petunjuk">Contoh: minuman-sehat. Tidak bisa diubah setelah dibuat.</p>
            <input id="modul_id" name="modul_id" defaultValue={nilai('modul_id')} {...atributGalat('modul_id')} />
            <Galat k="modul_id" />
          </div>
        )}
        <div className="bidang-baris">
          <div className="bidang">
            <label htmlFor="versi">Nomor versi</label>
            <input id="versi" name="versi" defaultValue={nilai('versi')} inputMode="decimal" {...atributGalat('versi')} />
            <Galat k="versi" />
          </div>
          <div className="bidang">
            <label htmlFor="urutan">Urutan modul</label>
            <input
              id="urutan"
              name="urutan"
              type="number"
              min={1}
              max={20}
              defaultValue={nilai('urutan')}
              {...atributGalat('urutan')}
            />
            <Galat k="urutan" />
          </div>
        </div>
        <div className="bidang">
          <label htmlFor="catatan">Catatan perubahan</label>
          <p className="petunjuk">Apa yang diubah dan mengapa. Wajib diisi sebelum disetujui.</p>
          <textarea id="catatan" name="catatan" rows={2} defaultValue={nilai('catatan')} {...atributGalat('catatan')} />
          <Galat k="catatan" />
        </div>
      </fieldset>

      <fieldset>
        <legend>Kartu & pembuka</legend>
        <div className="bidang">
          <label htmlFor="judul">Judul modul</label>
          <input id="judul" name="judul" defaultValue={nilai('judul')} {...atributGalat('judul')} />
          <Galat k="judul" />
        </div>
        <div className="bidang">
          <label htmlFor="deskripsi_kartu">Deskripsi kartu (satu kalimat)</label>
          <input id="deskripsi_kartu" name="deskripsi_kartu" defaultValue={nilai('deskripsi_kartu')} {...atributGalat('deskripsi_kartu')} />
          <Galat k="deskripsi_kartu" />
        </div>
        <div className="bidang-baris">
          <div className="bidang">
            <label htmlFor="ilustrasi">Ilustrasi</label>
            <select id="ilustrasi" name="ilustrasi" defaultValue={nilai('ilustrasi')} {...atributGalat('ilustrasi')}>
              <option value="">— Pilih —</option>
              {NAMA_ILUSTRASI.map((x) => (
                <option key={x} value={x}>
                  {LABEL_ILUSTRASI[x] ?? x}
                </option>
              ))}
            </select>
            <Galat k="ilustrasi" />
          </div>
          <div className="bidang">
            <label htmlFor="ilustrasi_alt">Teks alternatif ilustrasi</label>
            <input id="ilustrasi_alt" name="ilustrasi_alt" defaultValue={nilai('ilustrasi_alt')} {...atributGalat('ilustrasi_alt')} />
            <Galat k="ilustrasi_alt" />
          </div>
        </div>
        <div className="bidang">
          <label htmlFor="tujuan">Tujuan pembelajaran (satu per baris, 2–4 baris)</label>
          <textarea id="tujuan" name="tujuan" rows={4} defaultValue={nilai('tujuan')} {...atributGalat('tujuan')} />
          <Galat k="tujuan" />
        </div>
      </fieldset>

      <fieldset>
        <legend>Isi materi</legend>
        <div className="bidang">
          <label htmlFor="isi">Isi modul (Markdown)</label>
          <p className="petunjuk">
            Setiap baris <code>## Judul</code> memulai <strong>satu materi</strong> (halaman sendiri).
            Teks sebelum <code>##</code> pertama tampil sebagai pengantar modul. Di dalam materi, pakai{' '}
            <code>### Subjudul</code>, <code>**tebal**</code>, daftar dengan <code>-</code>, dan tabel
            Markdown. Materi terakhir sebaiknya <code>## Contoh Penerapan Sehari-hari</code>; Poin
            Penting dan Rangkuman otomatis tampil setelahnya. HTML tidak ditampilkan.
          </p>
          <details className="petunjuk">
            <summary>Blok khusus: galeri makanan, kartu menu, kotak tips</summary>
            <p>
              <strong>Galeri makanan</strong>: awali dengan <code>```galeri</code>, lalu satu makanan per
              baris dengan format <code>🥦 | Brokoli</code>, dan tutup dengan <code>```</code>.
            </p>
            <p>
              <strong>Kartu menu bertab</strong>: awali dengan <code>```menu</code>, lalu daftar YAML
              berisi <code>waktu</code>, <code>emoji</code>, <code>nama</code>, <code>bahan</code>,
              <code>alasan</code>, dan <code>catatan</code> (opsional). Contohnya ada di Modul 4.
            </p>
            <p>
              <strong>Kotak tips</strong>: awali baris dengan <code>&gt; </code>, misalnya{' '}
              <code>&gt; **Tips:** pilih sayur berwarna-warni.</code>
            </p>
          </details>
          <textarea id="isi" name="isi" rows={24} className="kode" defaultValue={nilai('isi')} {...atributGalat('isi')} />
          <Galat k="isi" />
        </div>
        <div className="bidang">
          <label htmlFor="poin_penting">Poin penting (satu per baris, 3–5 baris)</label>
          <textarea id="poin_penting" name="poin_penting" rows={5} defaultValue={nilai('poin_penting')} {...atributGalat('poin_penting')} />
          <Galat k="poin_penting" />
        </div>
        <div className="bidang">
          <label htmlFor="rangkuman">Rangkuman</label>
          <textarea id="rangkuman" name="rangkuman" rows={4} defaultValue={nilai('rangkuman')} {...atributGalat('rangkuman')} />
          <Galat k="rangkuman" />
        </div>
      </fieldset>

      <fieldset {...atributGalat('sumber')}>
        <legend>Sumber materi</legend>
        <Galat k="sumber" />
        <div className="daftar-centang">
          {daftarSumber.map((s) => (
            <label key={s.id} className="centang">
              <input type="checkbox" name="sumber" value={s.id} defaultChecked={sumberTerpilih.has(s.id)} />
              <span>{s.sitasi}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grup-tombol">
        <button type="submit" className="tombol" disabled={menunggu}>
          {menunggu ? 'Menyimpan…' : labelSimpan}
        </button>
      </div>
    </form>
  );
}
