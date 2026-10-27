'use client';

import { useActionState, useState } from 'react';
import { aksiSimpanInstrumen, type StatusTesAdmin } from '@/app/admin/aksi-tes';
import type { JenisSoalTes, JenisTes, SoalTes } from '@/lib/db';
import { Pesan } from '../belajar/Bidang';

interface Awal {
  judul: string;
  petunjuk: string;
  aktif: boolean;
  soal: SoalTes[];
}

const LABEL_JENIS: Record<JenisSoalTes, string> = { pilihan: 'Pilihan ganda', skala: 'Skala', isian: 'Isian' };

function soalBaru(jenis: JenisSoalTes): SoalTes {
  const dasar = { kunci: '', jenis, teks: '', wajib: true };
  if (jenis === 'pilihan') return { ...dasar, pilihan: [{ kunci: '', teks: '', benar: false }, { kunci: '', teks: '', benar: false }, { kunci: '', teks: '', benar: false }] };
  if (jenis === 'skala') return { ...dasar, skala: { min: 1, maks: 5, label_min: 'Sangat tidak setuju', label_maks: 'Sangat setuju' } };
  return { ...dasar, isian: { panjang: 'pendek' } };
}

// Editor pretest/posttest. Soal dikunci setelah ada jawaban (judul, petunjuk, status aktif tetap bisa diubah).
export default function EditorTes({ jenis, awal, terkunci }: { jenis: JenisTes; awal: Awal; terkunci: boolean }) {
  const [status, simpan, menunggu] = useActionState<StatusTesAdmin | undefined, FormData>(aksiSimpanInstrumen, undefined);
  const [judul, setJudul] = useState(awal.judul);
  const [petunjuk, setPetunjuk] = useState(awal.petunjuk);
  const [aktif, setAktif] = useState(awal.aktif);
  const [soal, setSoal] = useState<SoalTes[]>(awal.soal);

  const ubahSoal = (i: number, f: (s: SoalTes) => SoalTes) => setSoal((d) => d.map((s, n) => (n === i ? f(s) : s)));
  const geser = (i: number, arah: -1 | 1) =>
    setSoal((d) => {
      const j = i + arah;
      if (j < 0 || j >= d.length) return d;
      const b = [...d];
      [b[i], b[j]] = [b[j], b[i]];
      return b;
    });

  return (
    <form action={simpan} className="editor-tes">
      <input type="hidden" name="jenis" value={jenis} />
      <input type="hidden" name="data" value={JSON.stringify({ judul, petunjuk, aktif, soal })} />
      <div aria-live="polite">
        <Pesan pesan={status?.pesan} sukses={status?.sukses} />
      </div>

      <section className="kartu-panel form-admin">
        <div className="bidang">
          <label htmlFor="tes-judul">Judul</label>
          <input id="tes-judul" value={judul} onChange={(e) => setJudul(e.target.value)} />
        </div>
        <div className="bidang">
          <label htmlFor="tes-petunjuk">Petunjuk untuk responden</label>
          <textarea id="tes-petunjuk" rows={3} value={petunjuk} onChange={(e) => setPetunjuk(e.target.value)} />
        </div>
        <label className="centang">
          <input type="checkbox" checked={aktif} onChange={(e) => setAktif(e.target.checked)} />
          <span>
            <strong>Aktif</strong> —{' '}
            {jenis === 'pretest'
              ? 'responden wajib mengisi pretest sebelum dapat memakai website.'
              : 'posttest muncul untuk responden yang sudah dibuka posttest-nya.'}
          </span>
        </label>
      </section>

      {terkunci && (
        <p className="kotak kotak-peringatan">
          🔒 Soal sudah dijawab responden, jadi soal tidak dapat diubah agar semua responden mengisi instrumen yang sama. Judul,
          petunjuk, dan status aktif tetap bisa disimpan.
        </p>
      )}
      <p className="label-kecil">
        Jangan meminta data identitas atau kesehatan (mis. angka tekanan darah, NIK, alamat) — website hanya menyimpan data minimal.
        Kunci jawaban pilihan ganda tidak pernah ditampilkan ke responden; skornya hanya untuk peneliti.
      </p>

      <fieldset disabled={terkunci} className="editor-tes-soal">
        <legend className="sr-only">Daftar soal</legend>
        <ol className="editor-tes-daftar">
          {soal.map((s, i) => (
            <li key={i} className="kartu-panel editor-soal">
              <div className="editor-soal-kepala">
                <strong>Soal {i + 1}</strong>
                <span className="lencana lencana-materi-tersedia">{LABEL_JENIS[s.jenis]}</span>
                <span className="grup-geser">
                  <button type="button" className="tombol tombol-sekunder tombol-ikon" onClick={() => geser(i, -1)} aria-label={`Geser soal ${i + 1} naik`}>
                    ↑
                  </button>
                  <button type="button" className="tombol tombol-sekunder tombol-ikon" onClick={() => geser(i, 1)} aria-label={`Geser soal ${i + 1} turun`}>
                    ↓
                  </button>
                </span>
                <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => setSoal((d) => [...d.slice(0, i + 1), { ...structuredClone(s), kunci: '', pilihan: s.pilihan?.map((p) => ({ ...p, kunci: '' })) }, ...d.slice(i + 1)])}>
                  Duplikat
                </button>
                <button type="button" className="tombol tombol-bahaya tombol-kecil" onClick={() => setSoal((d) => d.filter((_, n) => n !== i))}>
                  Hapus
                </button>
              </div>
              <div className="bidang-baris">
                <div className="bidang">
                  <label htmlFor={`jenis-${i}`}>Jenis soal</label>
                  <select id={`jenis-${i}`} value={s.jenis} onChange={(e) => ubahSoal(i, (x) => ({ ...soalBaru(e.target.value as JenisSoalTes), kunci: x.kunci, teks: x.teks, wajib: x.wajib }))}>
                    <option value="pilihan">Pilihan ganda</option>
                    <option value="skala">Skala (mis. 1–5)</option>
                    <option value="isian">Isian</option>
                  </select>
                </div>
                <label className="centang editor-soal-wajib">
                  <input type="checkbox" checked={s.wajib} onChange={(e) => ubahSoal(i, (x) => ({ ...x, wajib: e.target.checked }))} />
                  <span>Wajib dijawab</span>
                </label>
              </div>
              <div className="bidang">
                <label htmlFor={`teks-${i}`}>Pertanyaan</label>
                <textarea id={`teks-${i}`} rows={2} value={s.teks} onChange={(e) => ubahSoal(i, (x) => ({ ...x, teks: e.target.value }))} />
              </div>

              {s.jenis === 'pilihan' && (
                <div className="editor-pilihan">
                  <p className="petunjuk">Tulis pilihan jawaban dan tandai satu yang benar (opsional, untuk skor peneliti).</p>
                  {s.pilihan?.map((p, j) => (
                    <div key={j} className="editor-pilihan-baris">
                      <span aria-hidden="true">{'ABCDEF'[j]}.</span>
                      <input value={p.teks} aria-label={`Pilihan ${'ABCDEF'[j]} soal ${i + 1}`} onChange={(e) => ubahSoal(i, (x) => ({ ...x, pilihan: x.pilihan?.map((q, k) => (k === j ? { ...q, teks: e.target.value } : q)) }))} />
                      <label className="centang">
                        <input
                          type="radio"
                          name={`benar-${i}`}
                          checked={p.benar}
                          onChange={() => ubahSoal(i, (x) => ({ ...x, pilihan: x.pilihan?.map((q, k) => ({ ...q, benar: k === j })) }))}
                        />
                        <span>Benar</span>
                      </label>
                      <button
                        type="button"
                        className="tombol tombol-sekunder tombol-ikon"
                        disabled={(s.pilihan?.length ?? 0) <= 2}
                        onClick={() => ubahSoal(i, (x) => ({ ...x, pilihan: x.pilihan?.filter((_, k) => k !== j) }))}
                        aria-label={`Hapus pilihan ${'ABCDEF'[j]}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="grup-tombol">
                    {(s.pilihan?.length ?? 0) < 6 && (
                      <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => ubahSoal(i, (x) => ({ ...x, pilihan: [...(x.pilihan ?? []), { kunci: '', teks: '', benar: false }] }))}>
                        + Pilihan
                      </button>
                    )}
                    {s.pilihan?.some((p) => p.benar) && (
                      <button type="button" className="tautan-tombol" onClick={() => ubahSoal(i, (x) => ({ ...x, pilihan: x.pilihan?.map((q) => ({ ...q, benar: false })) }))}>
                        Tanpa kunci jawaban
                      </button>
                    )}
                  </div>
                </div>
              )}

              {s.jenis === 'skala' && s.skala && (
                <div className="bidang-baris">
                  <div className="bidang">
                    <label htmlFor={`min-${i}`}>Dari</label>
                    <select id={`min-${i}`} value={s.skala.min} onChange={(e) => ubahSoal(i, (x) => ({ ...x, skala: { ...x.skala!, min: Number(e.target.value) } }))}>
                      <option value={0}>0</option>
                      <option value={1}>1</option>
                    </select>
                  </div>
                  <div className="bidang">
                    <label htmlFor={`maks-${i}`}>Sampai</label>
                    <select id={`maks-${i}`} value={s.skala.maks} onChange={(e) => ubahSoal(i, (x) => ({ ...x, skala: { ...x.skala!, maks: Number(e.target.value) } }))}>
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="bidang">
                    <label htmlFor={`lmin-${i}`}>Label nilai terendah</label>
                    <input id={`lmin-${i}`} value={s.skala.label_min} onChange={(e) => ubahSoal(i, (x) => ({ ...x, skala: { ...x.skala!, label_min: e.target.value } }))} />
                  </div>
                  <div className="bidang">
                    <label htmlFor={`lmaks-${i}`}>Label nilai tertinggi</label>
                    <input id={`lmaks-${i}`} value={s.skala.label_maks} onChange={(e) => ubahSoal(i, (x) => ({ ...x, skala: { ...x.skala!, label_maks: e.target.value } }))} />
                  </div>
                </div>
              )}

              {s.jenis === 'isian' && (
                <div className="bidang">
                  <label htmlFor={`panjang-${i}`}>Bentuk jawaban</label>
                  <select id={`panjang-${i}`} value={s.isian?.panjang ?? 'pendek'} onChange={(e) => ubahSoal(i, (x) => ({ ...x, isian: { panjang: e.target.value as 'pendek' | 'panjang' } }))}>
                    <option value="pendek">Singkat (satu baris)</option>
                    <option value="panjang">Panjang (paragraf)</option>
                  </select>
                </div>
              )}
            </li>
          ))}
        </ol>
        {soal.length === 0 && <p className="kotak">Belum ada soal. Tambahkan soal pertama di bawah.</p>}
        <div className="grup-tombol editor-tes-tambah">
          <span className="label-kecil">Tambah soal:</span>
          {(['pilihan', 'skala', 'isian'] as JenisSoalTes[]).map((j) => (
            <button key={j} type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => setSoal((d) => [...d, soalBaru(j)])}>
              + {LABEL_JENIS[j]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="editor-tes-simpan">
        <button type="submit" className="tombol" disabled={menunggu}>
          {menunggu ? 'Menyimpan…' : `Simpan ${jenis === 'pretest' ? 'pretest' : 'posttest'}`}
        </button>
        <span className="label-kecil">{soal.length} soal</span>
      </div>
    </form>
  );
}
