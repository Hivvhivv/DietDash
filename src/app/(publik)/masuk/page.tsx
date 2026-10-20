import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import KepalaHalaman from '@/components/KepalaHalaman';
import { FormMasukPeserta } from '@/components/peserta/FormPeserta';
import { pesertaSaatIni } from '@/lib/peserta';

export const metadata: Metadata = { title: 'Masuk', robots: { index: false, follow: false } };

export default async function Masuk({ searchParams }: { searchParams: Promise<{ lanjut?: string }> }) {
  if (await pesertaSaatIni()) redirect('/akun/');
  const { lanjut = '/akun/' } = await searchParams;

  return (
    <>
      <KepalaHalaman
        label="Akun Peserta"
        judul="Masuk"
        ringkasan="Masuk untuk menyimpan dan melanjutkan progres belajar Anda. Materi tetap bisa dibaca tanpa masuk."
      />
      <div className="wadah-baca bagian-isi">
        <div className="kartu">
          <FormMasukPeserta lanjut={lanjut} />
        </div>
        <p>
          Belum punya akun? <Link href="/daftar/">Daftar di sini</Link>.
        </p>
        <p className="label-kecil">
          Lupa kata sandi? Hubungi tim peneliti untuk mendapatkan tautan pengaturan ulang kata sandi.
        </p>
      </div>
    </>
  );
}
