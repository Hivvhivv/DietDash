import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditorTes from '@/components/admin/EditorTes';
import { wajibAdmin } from '@/lib/admin-auth';
import type { JenisTes } from '@/lib/db';
import { LABEL_TES, ambilInstrumen, jumlahJawaban } from '@/lib/tes';

export const metadata: Metadata = { title: 'Kelola soal' };
export const dynamic = 'force-dynamic';

export default async function KelolaSoalTes({ params }: { params: Promise<{ jenis: string }> }) {
  await wajibAdmin();
  const { jenis: j } = await params;
  if (j !== 'pretest' && j !== 'posttest') notFound();
  const jenis: JenisTes = j;
  const [i, jawaban] = await Promise.all([ambilInstrumen(jenis), jumlahJawaban(jenis)]);

  return (
    <>
      <p>
        <Link href="/admin/tes/">← Pretest &amp; Posttest</Link>
      </p>
      <h1>Kelola {LABEL_TES[jenis]}</h1>
      <p>
        {jawaban > 0
          ? `${jawaban} responden sudah mengisi ${LABEL_TES[jenis].toLowerCase()}.`
          : `Belum ada responden yang mengisi. ${jenis === 'pretest' ? 'Saat aktif, pretest langsung muncul setelah responden masuk.' : 'Posttest hanya muncul untuk responden yang sudah dibuka.'}`}
      </p>
      <EditorTes jenis={jenis} terkunci={jawaban > 0} awal={{ judul: i.judul, petunjuk: i.petunjuk, aktif: i.aktif, soal: i.soal }} />
    </>
  );
}
