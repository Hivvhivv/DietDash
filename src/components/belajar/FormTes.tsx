'use client';

import { useActionState } from 'react';
import { aksiKirimTes, type StatusTes } from '@/app/aksi-responden';
import type { JenisTes, SoalTes } from '@/lib/db';
import { Pesan } from './Bidang';

type SoalResponden = Omit<SoalTes, 'pilihan'> & { pilihan?: { kunci: string; teks: string }[] };

// Formulir pretest/posttest. Satu halaman berisi semua soal; jawaban dikirim sekali dan tidak dapat diubah.
export default function FormTes({ jenis, soal }: { jenis: JenisTes; soal: SoalResponden[] }) {
  const [status, kirim, menunggu] = useActionState<StatusTes | undefined, FormData>(aksiKirimTes, undefined);
  const nilai = (k: string) => status?.nilai?.[k] ?? '';

  return (
    <form key={status?.percobaan ?? 0} action={kirim} className="form-tes" noValidate>
      <input type="hidden" name="jenis" value={jenis} />
      <Pesan pesan={status?.pesan} />
      <ol className="tes-soal-daftar">
        {soal.map((s, n) => {
          const nama = `s_${s.kunci}`;
          const galat = status?.soal === s.kunci;
          return (
            <li key={s.kunci} id={`soal-${s.kunci}`} className={`tes-soal${galat ? ' tes-soal-galat' : ''}`}>
              <fieldset>
                <legend>
                  <span className="tes-soal-nomor">{n + 1}</span>
                  <span>
                    {s.teks}
                    {s.wajib ? <span className="sr-only"> (wajib)</span> : <span className="label-kecil"> (boleh dilewati)</span>}
                  </span>
                </legend>
                {s.jenis === 'pilihan' && (
                  <div className="tes-pilihan">
                    {s.pilihan?.map((p, i) => (
                      <label key={p.kunci} className="tes-pilihan-item">
                        <input type="radio" name={nama} value={p.kunci} defaultChecked={nilai(nama) === p.kunci} required={s.wajib} />
                        <span className="tes-pilihan-huruf" aria-hidden="true">
                          {'ABCDEF'[i]}
                        </span>
                        <span>{p.teks}</span>
                      </label>
                    ))}
                  </div>
                )}
                {s.jenis === 'skala' && s.skala && (
                  <div className="tes-skala">
                    <div className="tes-skala-angka">
                      {Array.from({ length: s.skala.maks - s.skala.min + 1 }, (_, i) => s.skala!.min + i).map((v) => (
                        <label key={v} className="tes-skala-item">
                          <input type="radio" name={nama} value={v} defaultChecked={nilai(nama) === String(v)} required={s.wajib} />
                          <span>{v}</span>
                        </label>
                      ))}
                    </div>
                    {(s.skala.label_min || s.skala.label_maks) && (
                      <p className="tes-skala-label label-kecil">
                        <span>
                          {s.skala.min} = {s.skala.label_min}
                        </span>
                        <span>
                          {s.skala.maks} = {s.skala.label_maks}
                        </span>
                      </p>
                    )}
                  </div>
                )}
                {s.jenis === 'isian' &&
                  (s.isian?.panjang === 'panjang' ? (
                    <textarea name={nama} rows={4} maxLength={2000} defaultValue={nilai(nama)} aria-label={`Jawaban soal ${n + 1}`} required={s.wajib} />
                  ) : (
                    <input name={nama} maxLength={300} defaultValue={nilai(nama)} aria-label={`Jawaban soal ${n + 1}`} required={s.wajib} autoComplete="off" />
                  ))}
                {galat && <p className="galat">{status?.pesan}</p>}
              </fieldset>
            </li>
          );
        })}
      </ol>
      <p className="label-kecil">Periksa kembali jawaban Anda. Setelah dikirim, jawaban tidak dapat diubah.</p>
      <button type="submit" className="tombol tombol-besar" disabled={menunggu}>
        {menunggu ? 'Mengirim…' : 'Kirim Jawaban'}
      </button>
    </form>
  );
}
