'use client';

import { useActionState, useState } from 'react';
import { aksiMasukAdmin, aksiTerimaUndangan, aksiUndangAdmin } from '@/app/admin/aksi-akun';
import Bidang, { Pesan } from '../belajar/Bidang';

export interface StatusUmum {
  pesan?: string;
  sukses?: string;
  token?: string;
  nomor?: string;
  tautan?: string;
}

type Aksi = (s: StatusUmum | undefined, fd: FormData) => Promise<StatusUmum>;

interface PropsFormAksi {
  aksi: Aksi;
  label: string;
  data?: Record<string, string>;
  konfirmasi?: string;
  bahaya?: boolean;
  sekunder?: boolean;
  children?: React.ReactNode; // kolom tambahan (mis. alasan)
}

// Formulir satu tombol untuk tindakan admin. Menampilkan hasil (pesan, token sekali tampil, nomor).
export function FormAksi({ aksi, label, data, konfirmasi, bahaya, sekunder, children }: PropsFormAksi) {
  const [status, jalankan, menunggu] = useActionState(aksi, undefined);
  const kelas = bahaya ? 'tombol tombol-bahaya' : sekunder ? 'tombol tombol-sekunder' : 'tombol';
  return (
    <form
      action={jalankan}
      className="form-admin form-aksi-admin"
      onSubmit={(e) => {
        if (konfirmasi && !window.confirm(konfirmasi)) e.preventDefault();
      }}
    >
      {Object.entries(data ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {children}
      <button type="submit" className={kelas} disabled={menunggu}>
        {menunggu ? 'Memproses…' : label}
      </button>
      <div aria-live="polite">
        <Pesan pesan={status?.pesan} sukses={status?.sukses} />
        {status?.token && (
          <p className="token-tampil" aria-label={`Kode akses baru ${status.token.replace(/\D/g, '').split('').join(' ')}`}>
            {status.token}
          </p>
        )}
        {status?.nomor && <p className="token-tampil">{status.nomor}</p>}
        {status?.tautan && (
          <p className="kotak-tautan">
            <code>{status.tautan}</code>
            <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => navigator.clipboard?.writeText(status.tautan!)}>
              Salin tautan
            </button>
          </p>
        )}
      </div>
    </form>
  );
}

export function FormMasukAdmin() {
  const [status, aksi, menunggu] = useActionState(aksiMasukAdmin, undefined);
  return (
    <form action={aksi} className="form-admin" noValidate>
      <Pesan pesan={status?.pesan} />
      <Bidang id="email" label="Email" type="email" autoComplete="username" required defaultValue={status?.nilai?.email} />
      <Bidang id="sandi" label="Kata sandi" type="password" autoComplete="current-password" required />
      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Memeriksa…' : 'Lanjut'}
      </button>
    </form>
  );
}

export function FormTerimaUndangan({ token, email }: { token: string; email: string }) {
  const [status, aksi, menunggu] = useActionState(aksiTerimaUndangan, undefined);
  const g = (k: string) => (status?.kolom === k ? status.pesan : null);
  return (
    <form action={aksi} className="form-admin" noValidate>
      <Pesan pesan={status?.kolom ? undefined : status?.pesan} />
      <input type="hidden" name="token" value={token} />
      <Bidang id="email-undangan" label="Email" value={email} readOnly disabled />
      <Bidang id="nama" label="Nama" autoComplete="name" galat={g('nama')} />
      <Bidang
        id="sandi"
        label="Kata sandi"
        type="password"
        autoComplete="new-password"
        galat={g('sandi')}
        petunjuk="Minimal 12 karakter. Gunakan beberapa kata yang mudah Anda ingat tetapi sulit ditebak orang lain."
      />
      <Bidang id="ulang" label="Ulangi kata sandi" type="password" autoComplete="new-password" galat={g('ulang')} />
      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Menyimpan…' : 'Buat akun admin'}
      </button>
    </form>
  );
}

export function FormUndangAdmin() {
  const [status, aksi, menunggu] = useActionState(aksiUndangAdmin, undefined);
  const [salin, setSalin] = useState(false);
  return (
    <form action={aksi} className="form-admin" noValidate>
      <Pesan pesan={status?.kolom ? undefined : status?.pesan} sukses={status?.sukses} />
      {status?.tautan && (
        <p className="kotak-tautan">
          <code>{status.tautan}</code>
          <button
            type="button"
            className="tombol tombol-sekunder tombol-kecil"
            onClick={async () => {
              await navigator.clipboard?.writeText(status.tautan!);
              setSalin(true);
            }}
          >
            {salin ? 'Tersalin ✓' : 'Salin tautan'}
          </button>
        </p>
      )}
      <div className="bidang-baris">
        <Bidang id="email" label="Email calon admin" type="email" defaultValue={status?.nilai?.email} galat={status?.kolom === 'email' ? status.pesan : null} />
        <div className="bidang">
          <label htmlFor="peran">Peran</label>
          <select id="peran" name="peran" defaultValue="admin">
            <option value="admin">Admin (kelola konten & pantau responden)</option>
            <option value="super_admin">Super admin (juga terbitkan, kunci versi, kelola admin)</option>
          </select>
        </div>
      </div>
      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Membuat…' : 'Buat undangan'}
      </button>
    </form>
  );
}
