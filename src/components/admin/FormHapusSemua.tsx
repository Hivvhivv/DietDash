'use client';

import { useActionState } from 'react';
import { aksiHapusSemuaPeserta } from '@/app/admin/aksi';

export default function FormHapusSemua() {
  const [status, aksi, menunggu] = useActionState(aksiHapusSemuaPeserta, undefined);
  return (
    <form action={aksi} className="form-admin" noValidate>
      {status?.pesan && (
        <p className="galat-umum" role="alert">
          {status.pesan}
        </p>
      )}
      <div className="bidang">
        <label htmlFor="konfirmasi">
          Ketik <strong>HAPUS SEMUA</strong> untuk menghapus seluruh akun peserta dan data belajarnya
        </label>
        <input id="konfirmasi" name="konfirmasi" autoComplete="off" />
      </div>
      <button type="submit" className="tombol tombol-bahaya" disabled={menunggu}>
        {menunggu ? 'Menghapus…' : 'Hapus semua data peserta'}
      </button>
    </form>
  );
}
