'use client';

import { useActionState } from 'react';
import type { StatusForm } from '@/app/admin/aksi';

interface Props {
  aksi: (s: StatusForm | undefined, fd: FormData) => Promise<StatusForm>;
  label: string;
  konfirmasi: string;
  data: Record<string, string>;
  bahaya?: boolean;
}

// Tombol untuk aksi penting (setujui, hapus) dengan konfirmasi dan pesan galat yang jelas.
export default function TombolAksi({ aksi, label, konfirmasi, data, bahaya }: Props) {
  const [status, jalankan, menunggu] = useActionState(aksi, undefined);

  return (
    <form
      action={jalankan}
      onSubmit={(e) => {
        if (!window.confirm(konfirmasi)) e.preventDefault();
      }}
      className="form-aksi"
    >
      {Object.entries(data).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        className={bahaya ? 'tombol tombol-bahaya' : 'tombol'}
        disabled={menunggu}
      >
        {menunggu ? 'Memproses…' : label}
      </button>
      {status?.pesan && (
        <p className="galat-umum" role="alert">
          {status.pesan}
        </p>
      )}
    </form>
  );
}
