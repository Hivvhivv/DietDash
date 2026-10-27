import type { Metadata } from 'next';
import Link from 'next/link';
import Ikon from '@/components/Ikon';
import { wajibResponden } from '@/lib/responden';
import { ambilInstrumen } from '@/lib/tes';
import { formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Pretest & Posttest' };
export const dynamic = 'force-dynamic';

// Menu "Tes" responden: status pretest & posttest. Nilai tidak ditampilkan (hanya untuk peneliti).
export default async function Tes({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  const a = await wajibResponden();
  const { pesan } = await searchParams;
  const [pre, post] = await Promise.all([ambilInstrumen('pretest'), ambilInstrumen('posttest')]);
  const preAda = pre.aktif && pre.soal.length > 0;
  const postAda = post.aktif && post.soal.length > 0;

  const kartu = [
    {
      judul: 'Pretest',
      ket: 'Diisi sebelum mulai belajar.',
      status: a.p.pretest_selesai_pada
        ? { teks: `✓ Selesai · ${formatWaktu(a.p.pretest_selesai_pada)}`, kelas: 'lencana-materi-selesai' }
        : preAda
          ? { teks: '○ Belum diisi', kelas: 'lencana-materi-tersedia' }
          : { teks: 'Belum tersedia', kelas: 'lencana-materi-terkunci' },
      href: !a.p.pretest_selesai_pada && preAda ? '/tes/pretest/' : null,
    },
    {
      judul: 'Posttest',
      ket: 'Dibuka oleh peneliti setelah masa belajar.',
      status: a.p.posttest_selesai_pada
        ? { teks: `✓ Selesai · ${formatWaktu(a.p.posttest_selesai_pada)}`, kelas: 'lencana-materi-selesai' }
        : a.p.posttest_dibuka_pada && postAda
          ? { teks: '○ Siap diisi', kelas: 'lencana-materi-tersedia' }
          : { teks: '🔒 Belum dibuka peneliti', kelas: 'lencana-materi-terkunci' },
      href: !a.p.posttest_selesai_pada && a.p.posttest_dibuka_pada && postAda ? '/tes/posttest/' : null,
    },
  ];

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Pretest & Posttest</h1>
        <p>Pertanyaan singkat untuk penelitian. Jawaban Anda tidak dinilai di website dan tidak memengaruhi materi belajar.</p>
      </div>
      {pesan === 'terima-kasih' && (
        <p className="kotak" role="status">
          ✓ Terima kasih, jawaban Anda sudah tersimpan.
        </p>
      )}
      <ul className="tes-kartu-kisi">
        {kartu.map((k) => (
          <li key={k.judul} className="kartu-panel tes-kartu">
            <span className="ubin-ikon ubin-hijau" aria-hidden="true">
              <Ikon nama="kuis" ukuran={22} />
            </span>
            <h2>{k.judul}</h2>
            <p className="label-kecil">{k.ket}</p>
            <span className={`lencana ${k.status.kelas}`}>{k.status.teks}</span>
            {k.href && (
              <Link className="tombol" href={k.href}>
                Isi {k.judul}
                <Ikon nama="panah-kanan" ukuran={18} />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
