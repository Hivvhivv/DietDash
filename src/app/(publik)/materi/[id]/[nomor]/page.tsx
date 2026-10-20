import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TampilanSubMateri from '@/components/TampilanSubMateri';
import { ambilSemuaModul, ringkas, type Modul } from '@/lib/konten';

interface Props {
  params: Promise<{ id: string; nomor: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const modul = await ambilSemuaModul();
  return modul.flatMap((m) => m.materi.map((x) => ({ id: m.id, nomor: String(x.nomor) })));
}

function cari(semua: Modul[], id: string, nomorStr: string) {
  const modul = semua.find((m) => m.id === id);
  const nomor = /^\d+$/.test(nomorStr) ? Number(nomorStr) : NaN;
  if (!modul || !(nomor >= 1 && nomor <= modul.materi.length)) return null;
  return { modul, nomor };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, nomor } = await params;
  const hasil = cari(await ambilSemuaModul(), id, nomor);
  if (!hasil) return {};
  const materi = hasil.modul.materi[hasil.nomor - 1];
  return {
    title: `${materi.judul} — Modul ${hasil.modul.urutan}`,
    description: `Materi ${hasil.nomor} dari modul ${hasil.modul.judul}.`,
  };
}

export default async function HalamanSubMateri({ params }: Props) {
  const { id, nomor } = await params;
  const semua = await ambilSemuaModul();
  const hasil = cari(semua, id, nomor);
  if (!hasil) notFound();

  return <TampilanSubMateri modul={hasil.modul} nomor={hasil.nomor} semua={semua.map(ringkas)} />;
}
