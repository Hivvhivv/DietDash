'use client';

import { useActionState, useState } from 'react';
import { aksiTambahResponden, type StatusAksiAdmin } from '@/app/admin/aksi-responden';
import Bidang, { Pesan } from '../belajar/Bidang';
import { FormUndangAdmin } from './FormAdmin';

type Peran = 'responden' | 'admin' | 'super_admin';

const PILIHAN: { nilai: Peran; judul: string; ket: string }[] = [
  { nilai: 'responden', judul: 'Responden', ket: 'Peserta penelitian. Masuk dengan nomor HP + kode akses 6 angka.' },
  { nilai: 'admin', judul: 'Admin', ket: 'Kelola konten, tips, dan pantau responden.' },
  { nilai: 'super_admin', judul: 'Super admin', ket: 'Semua akses admin + terbitkan/kunci versi, kelola admin, log.' },
];

function FormResponden() {
  const [status, aksi, menunggu] = useActionState<StatusAksiAdmin | undefined, FormData>(aksiTambahResponden, undefined);
  const [salin, setSalin] = useState(false);
  const g = (k: string) => (status?.kolom === k ? status.pesan : null);

  if (status?.token) {
    return (
      <div className="tambah-hasil" role="status">
        <Pesan sukses={status.sukses} />
        <dl className="tambah-hasil-data">
          <div>
            <dt>Nama</dt>
            <dd>{status.nama}</dd>
          </div>
          <div>
            <dt>Nomor HP</dt>
            <dd>{status.nomor}</dd>
          </div>
          <div>
            <dt>ID peserta (untuk peneliti)</dt>
            <dd>{status.id_peserta}</dd>
          </div>
          <div>
            <dt>Kode akses</dt>
            <dd className="token-tampil" aria-label={`Kode akses ${status.token.replace(/\D/g, '').split('').join(' ')}`}>
              {status.token}
            </dd>
          </div>
        </dl>
        <div className="grup-tombol">
          <button
            type="button"
            className="tombol tombol-sekunder"
            onClick={async () => {
              await navigator.clipboard?.writeText(`Nomor HP: ${status.nomor}\nKode akses DASH Sehat: ${status.token}`);
              setSalin(true);
            }}
          >
            {salin ? 'Tersalin ✓' : 'Salin nomor & kode akses'}
          </button>
          <a className="tombol" href="/admin/responden/tambah/">
            Tambah pengguna lain
          </a>
        </div>
        <p className="label-kecil">Responden tidak perlu tahu ID peserta. Bila responden lupa, super admin dapat melihat kode lewat tombol “Lihat kode” di Manajemen Pengguna (tercatat di log).</p>
      </div>
    );
  }

  return (
    <form action={aksi} className="form-admin" noValidate>
      <Pesan pesan={status?.kolom ? undefined : status?.pesan} />
      <div className="bidang-baris">
        <Bidang id="nama" label="Nama responden" defaultValue={status?.nilai?.nama} galat={g('nama')} autoComplete="off" />
        <Bidang id="nomor" label="Nomor HP (WhatsApp)" type="tel" inputMode="tel" defaultValue={status?.nilai?.nomor} galat={g('nomor')} petunjuk="Contoh: 0812 3456 7890" autoComplete="off" />
      </div>
      <div className="bidang">
        <label htmlFor="sampel">Kelompok</label>
        <select id="sampel" name="sampel" defaultValue={status?.nilai?.sampel || 'responden_penelitian'}>
          <option value="responden_penelitian">Responden penelitian</option>
          <option value="bukan_sampel">Bukan sampel (uji coba, tim peneliti)</option>
        </select>
      </div>
      <div className="bidang">
        <label className="centang">
          <input type="checkbox" name="konfirmasi" value="ya" aria-invalid={g('konfirmasi') ? true : undefined} aria-describedby={g('konfirmasi') ? 'galat-konfirmasi' : undefined} />
          <span>
            Calon responden sudah menyatakan <strong>memenuhi kriteria</strong> dan <strong>menyetujui ikut penelitian</strong> setelah
            membaca/mendengar penjelasan Privasi dan Ketentuan Penggunaan.
          </span>
        </label>
        {g('konfirmasi') && (
          <p className="galat" id="galat-konfirmasi">
            {g('konfirmasi')}
          </p>
        )}
      </div>
      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Membuat akun…' : 'Buat akun responden'}
      </button>
    </form>
  );
}

// Tambah Pengguna Baru (khusus super admin): pilih role, lalu isi formulir yang sesuai.
export default function FormTambahPengguna() {
  const [peran, setPeran] = useState<Peran>('responden');
  return (
    <>
      <fieldset className="pilih-peran">
        <legend>Pilih role pengguna</legend>
        <div className="pilih-peran-kisi">
          {PILIHAN.map((p) => (
            <label key={p.nilai} className={`pilih-peran-kartu${peran === p.nilai ? ' pilih-peran-aktif' : ''}`}>
              <input type="radio" name="peran-pilih" value={p.nilai} checked={peran === p.nilai} onChange={() => setPeran(p.nilai)} />
              <span>
                <strong>{p.judul}</strong>
                <span className="label-kecil">{p.ket}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <section className="kartu-panel" aria-live="polite">
        {peran === 'responden' ? (
          <>
            <h2>Data responden</h2>
            <FormResponden />
          </>
        ) : (
          <>
            <h2>Undang {peran === 'super_admin' ? 'super admin' : 'admin'}</h2>
            <p className="label-kecil">
              Website tidak mengirim email. Setelah undangan dibuat, salin tautannya dan kirim sendiri ke calon admin. Tautan berlaku 48
              jam; calon admin membuat kata sandinya sendiri.
            </p>
            <FormUndangAdmin key={peran} peran={peran} />
          </>
        )}
      </section>
    </>
  );
}
