'use client';

import { useActionState, useState } from 'react';
import { aksiBuatTautanReset } from '@/app/admin/aksi';

// Membuat tautan atur ulang kata sandi untuk diberikan peneliti kepada peserta (berlaku 24 jam, sekali pakai).
export default function TautanReset({ pesertaId }: { pesertaId: string }) {
  const [status, aksi, menunggu] = useActionState(aksiBuatTautanReset, undefined);
  const [tersalin, setTersalin] = useState(false);
  const tautan = status?.pesan?.startsWith('http') ? status.pesan : null;

  return (
    <div>
      <form action={aksi}>
        <input type="hidden" name="peserta_id" value={pesertaId} />
        <button type="submit" className="tombol tombol-sekunder" disabled={menunggu}>
          {menunggu ? 'Membuat…' : 'Buat tautan atur ulang kata sandi'}
        </button>
      </form>
      {status?.pesan && !tautan && (
        <p className="galat-umum" role="alert">
          {status.pesan}
        </p>
      )}
      {tautan && (
        <div className="kotak" role="status">
          <p>
            Berikan tautan ini kepada peserta secara langsung (misalnya lewat pesan pribadi). Berlaku
            24 jam dan hanya bisa dipakai sekali. Tautan ini tidak akan ditampilkan lagi.
          </p>
          <p className="tautan-reset">
            <code>{tautan}</code>
          </p>
          <button
            type="button"
            className="tombol tombol-kecil"
            onClick={() => {
              navigator.clipboard?.writeText(tautan).then(() => setTersalin(true));
            }}
          >
            {tersalin ? 'Tersalin ✓' : 'Salin tautan'}
          </button>
        </div>
      )}
    </div>
  );
}
