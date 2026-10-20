'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import {
  aksiDaftar,
  aksiHapusAkun,
  aksiMasukPeserta,
  aksiResetSandi,
  aksiUbahSandi,
  type StatusFormPeserta,
} from '@/app/aksi-peserta';

type Status = StatusFormPeserta | undefined;

function Pesan({ status }: { status: Status }) {
  if (status?.sukses) {
    return (
      <p className="pesan-sukses" role="status">
        {status.sukses}
      </p>
    );
  }
  if (!status?.pesan) return null;
  return (
    <p className="galat-umum" role="alert">
      {status.pesan}
    </p>
  );
}

interface PropsBidang {
  id: string;
  label: string;
  status: Status;
  petunjuk?: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
}

function Bidang({ id, label, status, petunjuk, type = 'text', autoComplete, defaultValue }: PropsBidang) {
  const salah = status?.kolom === id;
  const idPetunjuk = petunjuk ? `petunjuk-${id}` : undefined;
  return (
    <div className="bidang">
      <label htmlFor={id}>{label}</label>
      {petunjuk && (
        <p className="petunjuk" id={idPetunjuk}>
          {petunjuk}
        </p>
      )}
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={salah || undefined}
        aria-describedby={[idPetunjuk, salah ? `galat-${id}` : undefined].filter(Boolean).join(' ') || undefined}
        autoCapitalize={type === 'email' ? 'none' : undefined}
        spellCheck={type === 'email' ? false : undefined}
      />
      {salah && (
        <p className="galat" id={`galat-${id}`}>
          {status?.pesan}
        </p>
      )}
    </div>
  );
}

function TampilkanSandi({ tampil, ubah }: { tampil: boolean; ubah: (v: boolean) => void }) {
  return (
    <label className="centang centang-kecil">
      <input type="checkbox" checked={tampil} onChange={(e) => ubah(e.target.checked)} />
      <span>Tampilkan kata sandi</span>
    </label>
  );
}

const PETUNJUK_SANDI =
  'Minimal 8 karakter. Boleh berupa kalimat yang mudah Anda ingat, misalnya "sayur bayam tiap hari". Jangan memakai tanggal lahir atau nomor telepon.';

export function FormDaftar() {
  const [status, aksi, menunggu] = useActionState(aksiDaftar, undefined);
  const [tampil, setTampil] = useState(false);
  const jenis = tampil ? 'text' : 'password';
  return (
    <form action={aksi} className="form-admin form-peserta" noValidate>
      <Pesan status={status?.kolom ? undefined : status} />
      <Bidang id="email" label="Email" type="email" autoComplete="email" status={status} defaultValue={status?.nilai?.email} />
      <Bidang id="sandi" label="Kata sandi" type={jenis} autoComplete="new-password" status={status} petunjuk={PETUNJUK_SANDI} />
      <Bidang id="ulang" label="Ulangi kata sandi" type={jenis} autoComplete="new-password" status={status} />
      <TampilkanSandi tampil={tampil} ubah={setTampil} />
      <div className="bidang">
        <label className="centang">
          <input
            type="checkbox"
            name="setuju"
            value="ya"
            aria-invalid={status?.kolom === 'setuju' || undefined}
            aria-describedby={status?.kolom === 'setuju' ? 'galat-setuju' : undefined}
          />
          <span>
            Saya telah membaca dan menyetujui <Link href="/kebijakan-privasi/">Kebijakan Privasi</Link>,
            termasuk pencatatan progres belajar saya untuk keperluan penelitian.
          </span>
        </label>
        {status?.kolom === 'setuju' && (
          <p className="galat" id="galat-setuju">
            {status.pesan}
          </p>
        )}
      </div>
      <button type="submit" className="tombol tombol-besar" disabled={menunggu}>
        {menunggu ? 'Membuat akun…' : 'Buat Akun'}
      </button>
    </form>
  );
}

export function FormMasukPeserta({ lanjut }: { lanjut: string }) {
  const [status, aksi, menunggu] = useActionState(aksiMasukPeserta, undefined);
  const [tampil, setTampil] = useState(false);
  return (
    <form action={aksi} className="form-admin form-peserta" noValidate>
      <Pesan status={status} />
      <input type="hidden" name="lanjut" value={lanjut} />
      <Bidang id="email" label="Email" type="email" autoComplete="email" status={status} defaultValue={status?.nilai?.email} />
      <Bidang id="sandi" label="Kata sandi" type={tampil ? 'text' : 'password'} autoComplete="current-password" status={status} />
      <TampilkanSandi tampil={tampil} ubah={setTampil} />
      <button type="submit" className="tombol tombol-besar" disabled={menunggu}>
        {menunggu ? 'Memeriksa…' : 'Masuk'}
      </button>
    </form>
  );
}

export function FormUbahSandi() {
  const [status, aksi, menunggu] = useActionState(aksiUbahSandi, undefined);
  const [tampil, setTampil] = useState(false);
  const jenis = tampil ? 'text' : 'password';
  return (
    <form action={aksi} className="form-admin form-peserta" noValidate key={status?.sukses ? 'ok' : 'form'}>
      <Pesan status={status?.kolom ? undefined : status} />
      <Bidang id="lama" label="Kata sandi lama" type={jenis} autoComplete="current-password" status={status} />
      <Bidang id="baru" label="Kata sandi baru" type={jenis} autoComplete="new-password" status={status} petunjuk={PETUNJUK_SANDI} />
      <Bidang id="ulang" label="Ulangi kata sandi baru" type={jenis} autoComplete="new-password" status={status} />
      <TampilkanSandi tampil={tampil} ubah={setTampil} />
      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Menyimpan…' : 'Simpan Kata Sandi'}
      </button>
    </form>
  );
}

export function FormHapusAkun() {
  const [status, aksi, menunggu] = useActionState(aksiHapusAkun, undefined);
  return (
    <form
      action={aksi}
      className="form-admin form-peserta"
      noValidate
      onSubmit={(e) => {
        if (!window.confirm('Hapus akun dan seluruh progres belajar Anda? Tindakan ini tidak bisa dibatalkan.')) {
          e.preventDefault();
        }
      }}
    >
      <Bidang id="sandi" label="Ketik kata sandi Anda untuk konfirmasi" type="password" autoComplete="current-password" status={status} />
      <button type="submit" className="tombol tombol-bahaya" disabled={menunggu}>
        {menunggu ? 'Menghapus…' : 'Hapus Akun Saya'}
      </button>
    </form>
  );
}

export function FormResetSandi({ token }: { token: string }) {
  const [status, aksi, menunggu] = useActionState(aksiResetSandi, undefined);
  const [tampil, setTampil] = useState(false);
  const jenis = tampil ? 'text' : 'password';
  return (
    <form action={aksi} className="form-admin form-peserta" noValidate>
      <Pesan status={status?.kolom ? undefined : status} />
      <input type="hidden" name="token" value={token} />
      <Bidang id="baru" label="Kata sandi baru" type={jenis} autoComplete="new-password" status={status} petunjuk={PETUNJUK_SANDI} />
      <Bidang id="ulang" label="Ulangi kata sandi baru" type={jenis} autoComplete="new-password" status={status} />
      <TampilkanSandi tampil={tampil} ubah={setTampil} />
      <button type="submit" className="tombol tombol-besar" disabled={menunggu}>
        {menunggu ? 'Menyimpan…' : 'Simpan Kata Sandi Baru'}
      </button>
    </form>
  );
}
