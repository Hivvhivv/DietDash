import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TampilanModul from '@/components/TampilanModul';
import { ambilSemuaModul, ringkas } from '@/lib/konten';

interface Props {
  params: Promise<{ id: string }>;
}

// Modul baru yang disetujui admin dirender saat pertama dikunjungi.
export const dynamicParams = true;

export async function generateStaticParams() {
  const modul = await ambilSemuaModul();
  return modul.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const modul = (await ambilSemuaModul()).find((m) => m.id === id);
  if (!modul) return {};
  return { title: modul.judul, description: modul.deskripsi_kartu };
}

export default async function HalamanModul({ params }: Props) {
  const { id } = await params;
  const semua = await ambilSemuaModul();
  const modul = semua.find((m) => m.id === id);
  if (!modul) notFound();

  return <TampilanModul modul={modul} semua={semua.map(ringkas)} />;
}
