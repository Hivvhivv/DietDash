import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { aksiKeluar } from '@/app/aksi-responden';
import FormTes from '@/components/belajar/FormTes';
import Logo from '@/components/Logo';
import type { JenisTes } from '@/lib/db';
import { wajibResponden } from '@/lib/responden';
import { ambilInstrumen, soalUntukResponden } from '@/lib/tes';

export const metadata: Metadata = { title: 'Pretest & Posttest' };
export const dynamic = 'force-dynamic';

// Layar penuh pretest/posttest. Pretest muncul sebelum responden memakai website; posttest setelah dibuka admin.
export default async function HalamanTes({ params }: { params: Promise<{ jenis: string }> }) {
  const { jenis: mentah } = await params;
  if (mentah !== 'pretest' && mentah !== 'posttest') notFound();
  const jenis = mentah as JenisTes;
  const a = await wajibResponden({ izinkanTes: true });
  const i = await ambilInstrumen(jenis);
  const sudah = jenis === 'pretest' ? a.p.pretest_selesai_pada : a.p.posttest_selesai_pada;
  if (sudah || !i.aktif || !i.soal.length || (jenis === 'posttest' && !a.p.posttest_dibuka_pada)) redirect('/belajar/tes/');

  return (
    <div className="tes-wadah">
      <header className="tes-kepala">
        <div className="tes-merek">
          <Logo ukuran={36} />
          <strong>DASH Sehat</strong>
        </div>
        <form action={aksiKeluar}>
          <button type="submit" className="tombol tombol-sekunder tombol-kecil">
            Keluar
          </button>
        </form>
      </header>
      <section className="tes-pembuka" aria-labelledby="judul-tes">
        <p className="resep-lencana">{jenis === 'pretest' ? 'Sebelum mulai belajar' : 'Setelah mengikuti materi'}</p>
        <h1 id="judul-tes">{i.judul}</h1>
        <p>Halo, {a.r.nama}. {i.petunjuk}</p>
        <p className="label-kecil">
          {i.soal.length} pertanyaan · jawaban Anda hanya dipakai untuk penelitian dan tidak ditampilkan sebagai nilai.
        </p>
      </section>
      <FormTes jenis={jenis} soal={soalUntukResponden(i)} />
    </div>
  );
}
