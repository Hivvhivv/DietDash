import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Ikon from '@/components/Ikon';
import PencatatBaca from '@/components/belajar/PencatatBaca';
import TampilanMateri from '@/components/belajar/TampilanMateri';
import { strukturAktif } from '@/lib/konten';
import { statusResponden, tandaiDibuka } from '@/lib/progres';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Materi' };

export default async function HalamanMateri({
  params,
  searchParams,
}: {
  params: Promise<{ kunci: string }>;
  searchParams: Promise<{ pesan?: string }>;
}) {
  const a = await wajibResponden();
  const { kunci } = await params;
  const { pesan } = await searchParams;
  const struktur = await strukturAktif();
  if (!struktur) redirect('/belajar/');
  let r = await statusResponden(a, struktur);
  const awal = r.daftar.find((d) => d.materi.kunci === kunci);
  if (!awal) notFound();
  // Penguncian diperiksa di server: alamat materi terkunci dialihkan ke materi berikutnya yang terbuka.
  if (awal.status === 'terkunci') redirect(r.lanjut ? `${r.lanjut.url}?pesan=terkunci` : '/belajar/?pesan=terkunci');
  // Membuka materi = materi selesai, sehingga materi berikutnya langsung terbuka (juga tanpa JavaScript).
  // Aman dari prefetch: rute dinamis tanpa loading.tsx tidak merender halaman ini saat tautan di-prefetch.
  if (awal.status === 'tersedia' && (await tandaiDibuka(a, struktur, kunci)).baru) r = await statusResponden(a, struktur);

  const m = awal.materi;
  const sebelum = r.daftar[m.indeks - 1];
  const berikut = r.daftar[m.indeks + 1];
  const satuModul = r.daftar.filter((d) => d.materi.modul.kunci === m.modul.kunci);

  return (
    <>
      <PencatatBaca materiKunci={m.kunci} />
      {pesan === 'terkunci' && (
        <p className="kotak kotak-peringatan" role="status">
          Materi yang Anda buka masih terkunci. Baca dulu materi sebelumnya. Ini materi berikutnya untuk Anda.
        </p>
      )}
      <TampilanMateri
        m={m}
        remah={[
          { href: '/belajar/', label: 'Beranda' },
          { href: '/belajar/modul/', label: 'Modul Pembelajaran' },
          { href: `/belajar/modul/${m.modul.kunci}/`, label: `Modul ${m.modul.nomor}` },
        ]}
        daftar={satuModul.map((d) => ({
          kunci: d.materi.kunci,
          nomor: d.materi.nomor,
          judul: d.materi.judul,
          status: d.status,
          href: d.status === 'terkunci' ? null : `/belajar/materi/${d.materi.kunci}/`,
        }))}
        progres={{ selesai: satuModul.filter((d) => d.status === 'selesai').length, total: satuModul.length }}
        navigasi={
          <nav className="materi-navigasi" aria-label="Navigasi materi">
            {sebelum ? (
              <Link className="tombol tombol-sekunder" href={`/belajar/materi/${sebelum.materi.kunci}/`}>
                <span aria-hidden="true">‹</span> Sebelumnya
              </Link>
            ) : (
              <Link className="tombol tombol-sekunder" href={`/belajar/modul/${m.modul.kunci}/`}>
                <span aria-hidden="true">‹</span> Ke Modul {m.modul.nomor}
              </Link>
            )}
            <Link className="tombol" href={berikut ? `/belajar/materi/${berikut.materi.kunci}/` : '/belajar/selesai/'}>
              {berikut ? `Lanjut ke Materi ${berikut.materi.nomor}` : 'Selesai'}
              <Ikon nama="panah-kanan" ukuran={18} />
            </Link>
          </nav>
        }
      />
    </>
  );
}
