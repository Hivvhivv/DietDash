import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { aksiMulaiKuis } from '@/app/aksi-responden';
import PencatatBaca from '@/components/belajar/PencatatBaca';
import TampilanMateri from '@/components/belajar/TampilanMateri';
import { strukturAktif } from '@/lib/konten';
import { statusResponden } from '@/lib/progres';
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
  const r = await statusResponden(a, struktur);
  const s = r.daftar.find((d) => d.materi.kunci === kunci);
  if (!s) notFound();
  // Penguncian diperiksa di server: alamat materi terkunci dialihkan ke materi aktif.
  if (s.status === 'terkunci') redirect(r.lanjut ? `${r.lanjut.url}?pesan=terkunci` : '/belajar/?pesan=terkunci');

  const m = s.materi;
  const berikut = r.daftar[m.indeks + 1];
  return (
    <>
      <PencatatBaca materiKunci={m.kunci} />
      {pesan === 'terkunci' && (
        <div className="wadah-baca">
          <p className="kotak kotak-peringatan" role="status">
            Materi yang Anda buka masih terkunci. Selesaikan dulu kuis materi sebelumnya. Ini materi yang sedang aktif
            untuk Anda.
          </p>
        </div>
      )}
      <TampilanMateri
        m={m}
        remah={[
          { href: '/belajar/modul/', label: 'Modul Pembelajaran' },
          { href: `/belajar/modul/${m.modul.kunci}/`, label: `Modul ${m.modul.nomor}` },
        ]}
      >
        <div className="ajak-kuis">
          {s.status === 'selesai' ? (
            <>
              <p>
                <strong>✓ Kuis materi ini sudah selesai.</strong> Anda boleh mengerjakannya lagi sebagai latihan; status
                selesai tidak berubah.
              </p>
              <div className="grup-tombol">
                <Link className="tombol tombol-besar" href={berikut ? `/belajar/materi/${berikut.materi.kunci}/` : '/belajar/selesai/'}>
                  {berikut ? `Lanjut ke Materi ${berikut.materi.nomor}` : 'Selesai'} <span aria-hidden="true">→</span>
                </Link>
                <form action={aksiMulaiKuis}>
                  <input type="hidden" name="materi" value={m.kunci} />
                  <button type="submit" className="tombol tombol-sekunder">
                    Kerjakan Kuis Lagi
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <p>
                <strong>Sudah selesai membaca?</strong> Kerjakan kuis singkat ({m.kuis?.jumlah_soal ?? 0} soal) untuk membuka
                materi berikutnya.
              </p>
              <form action={aksiMulaiKuis}>
                <input type="hidden" name="materi" value={m.kunci} />
                <button type="submit" className="tombol tombol-besar">
                  {s.percobaan_aktif ? 'Lanjutkan Kuis' : 'Kerjakan Kuis'}
                </button>
              </form>
            </>
          )}
        </div>
      </TampilanMateri>
    </>
  );
}
