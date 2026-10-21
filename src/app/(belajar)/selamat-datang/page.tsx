import type { Metadata } from 'next';
import Sambutan from '@/components/belajar/Sambutan';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Selamat Datang' };

export default async function SelamatDatang() {
  const a = await wajibResponden();
  return <Sambutan nama={a.r.nama} />;
}
