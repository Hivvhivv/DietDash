import type { Metadata } from 'next';
import Link from 'next/link';
import { aksiBuatModul } from '../../../aksi';
import FormModul from '@/components/admin/FormModul';
import { wajibAdmin } from '@/lib/auth';
import { daftarSumber } from '@/data/sumber';

export const metadata: Metadata = { title: 'Modul baru' };

const KERANGKA_ISI = `Pengantar singkat modul (boleh dikosongkan).

## Judul materi pertama

Paragraf pendek, satu gagasan per paragraf.

### Subjudul di dalam materi

- Butir pertama.
- Butir kedua.

## Judul materi kedua

Paragraf pendek.

## Contoh Penerapan Sehari-hari

Ceritakan contoh nyata yang dekat dengan keseharian pembaca.
`;

export default async function ModulBaru() {
  await wajibAdmin();

  return (
    <>
      <p>
        <Link href="/admin/">← Dasbor</Link>
      </p>
      <h1>Tambah modul baru</h1>
      <div className="kotak kotak-peringatan">
        <p>
          PRD menetapkan enam modul dengan urutan tetap. Menambah modul mengubah protokol
          intervensi, jadi pastikan sudah disepakati tim peneliti. Modul baru tersimpan sebagai
          draf dan baru tayang setelah disetujui.
        </p>
      </div>
      <FormModul
        aksi={aksiBuatModul}
        modulBaru
        labelSimpan="Buat draf modul"
        daftarSumber={daftarSumber}
        awal={{
          versi: '0.1.0',
          urutan: '',
          judul: '',
          deskripsi_kartu: '',
          ilustrasi: '',
          ilustrasi_alt: '',
          tujuan: [],
          poin_penting: [],
          rangkuman: '',
          sumber: [],
          isi: KERANGKA_ISI,
          catatan: 'Modul baru.',
        }}
      />
    </>
  );
}
