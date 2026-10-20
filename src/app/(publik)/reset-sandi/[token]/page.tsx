import type { Metadata } from 'next';
import Link from 'next/link';
import KepalaHalaman from '@/components/KepalaHalaman';
import { FormResetSandi } from '@/components/peserta/FormPeserta';
import { cekTokenReset } from '@/lib/peserta';

export const metadata: Metadata = {
  title: 'Atur Ulang Kata Sandi',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function ResetSandi({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const akun = await cekTokenReset(token);

  return (
    <>
      <KepalaHalaman label="Akun Peserta" judul="Atur Ulang Kata Sandi" />
      <div className="wadah-baca bagian-isi">
        {akun ? (
          <>
            <p>
              Buat kata sandi baru untuk <strong>{akun.email}</strong>.
            </p>
            <div className="kartu">
              <FormResetSandi token={token} />
            </div>
          </>
        ) : (
          <div className="galat-umum">
            <p>
              Tautan ini sudah tidak berlaku atau sudah dipakai. Tautan hanya berlaku 24 jam dan
              sekali pakai. Minta tautan baru kepada tim peneliti.
            </p>
            <p>
              <Link href="/masuk/">Kembali ke halaman masuk</Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
