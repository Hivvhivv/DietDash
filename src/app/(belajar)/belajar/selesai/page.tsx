import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import KepalaHalaman from '@/components/KepalaHalaman';
import { strukturAktif } from '@/lib/konten';
import { statusResponden } from '@/lib/progres';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Selamat!' };

export default async function Selesai() {
  const a = await wajibResponden();
  const struktur = await strukturAktif();
  if (!struktur) redirect('/belajar/');
  const r = await statusResponden(a, struktur);
  if (r.selesai < r.total) redirect('/belajar/');

  return (
    <>
      <KepalaHalaman label="Semua materi selesai" judul={`Selamat, ${a.r.nama}!`} ringkasan="Anda sudah membaca seluruh materi DASH Sehat." gambar={{ src: '/gambar/ilustrasi/kuis.png', width: 140, height: 110 }} />
      <div className="wadah-baca bagian-isi">
        <section className="kartu bagian-kartu" aria-labelledby="judul-prinsip">
          <h2 id="judul-prinsip">Rangkuman prinsip DASH</h2>
          <ol>
            <li>Periksa tekanan darah secara rutin dan minum obat sesuai anjuran dokter.</li>
            <li>Perbanyak sayur, buah, biji-bijian utuh, tempe, tahu, kacang-kacangan, ikan, dan susu rendah lemak.</li>
            <li>Batasi garam hingga paling banyak 1 sendok teh per hari, termasuk dari kecap, penyedap, dan makanan kemasan.</li>
            <li>Kurangi gorengan, santan kental, jeroan, daging olahan, dan minuman manis.</li>
            <li>Mulai dari perubahan kecil, buat target yang realistis, dan ajak keluarga.</li>
          </ol>
          <p className="label-kecil">Diet DASH melengkapi pengobatan, bukan menggantikannya.</p>
        </section>
        <div className="kotak kotak-peringatan">
          <p>
            <strong>Langkah berikutnya:</strong> peneliti akan membuka <strong>posttest</strong> sesuai jadwal. Setelah dibuka, posttest muncul otomatis saat Anda masuk dan di menu Tes.
          </p>
        </div>
        <p>Anda tetap bisa membaca ulang materi kapan saja.</p>
        <Link className="tombol tombol-besar" href="/belajar/">
          Kembali ke Dashboard
        </Link>
      </div>
    </>
  );
}
