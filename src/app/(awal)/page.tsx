import { redirect } from 'next/navigation';
import { respondenSaatIni } from '@/lib/responden';

// Halaman awal langsung ke Masuk; responden yang sudah masuk langsung ke dashboard belajar.
export default async function Awal() {
  const a = await respondenSaatIni();
  redirect(!a ? '/masuk/' : a.r.token_disimpan_pada ? '/belajar/' : '/simpan-token/');
}
