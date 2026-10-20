'use client';

import { useActionState } from 'react';
import { aksiMasuk } from '@/app/admin/aksi';

export default function FormMasuk() {
  const [status, aksi, menunggu] = useActionState(aksiMasuk, undefined);

  return (
    <form action={aksi} className="form-admin" noValidate>
      {status?.pesan && (
        <p className="galat-umum" role="alert">
          {status.pesan}
        </p>
      )}
      <div className="bidang">
        <label htmlFor="username">Nama pengguna</label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={(status?.nilai?.username as string) ?? ''}
        />
      </div>
      <div className="bidang">
        <label htmlFor="password">Kata sandi</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Memeriksa…' : 'Masuk'}
      </button>
    </form>
  );
}
