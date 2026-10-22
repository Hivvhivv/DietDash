import type { Metadata } from 'next';
import Link from 'next/link';
import TampilanMateri from '@/components/belajar/TampilanMateri';
import { wajibAdmin } from '@/lib/admin-auth';
import { ambilStruktur, versiAktif } from '@/lib/konten';
import { versiKerja } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Pratinjau materi' };
export const dynamic = 'force-dynamic';

// Pratinjau materi seperti yang dilihat responden (versi kerja, atau versi aktif bila tidak ada versi kerja).
export default async function Pratinjau({ params }: { params: Promise<{ kunci: string }> }) {
  await wajibAdmin();
  const { kunci } = await params;
  const v = (await versiKerja()) ?? (await versiAktif());
  const s = v ? await ambilStruktur(v._id) : null;
  const m = s?.materi.find((x) => x.kunci === kunci);
  if (!s || !m) {
    return (
      <>
        <h1>Materi tidak ditemukan</h1>
        <p>
          <Link href="/admin/konten/">Kembali ke Konten</Link>
        </p>
      </>
    );
  }
  const sebelum = s.materi[m.indeks - 1];
  const sesudah = s.materi[m.indeks + 1];

  return (
    <>
      <p className="grup-tautan">
        <Link href={`/admin/konten/materi/${m.kunci}/`}>← Edit materi ini</Link>
        {sebelum && <Link href={`/admin/konten/pratinjau/${sebelum.kunci}/`}>‹ Materi {sebelum.nomor}</Link>}
        {sesudah && <Link href={`/admin/konten/pratinjau/${sesudah.kunci}/`}>Materi {sesudah.nomor} ›</Link>}
      </p>
      <div className="admin-pratinjau">
        <p className="admin-pratinjau-label">Pratinjau · {s.versi.label} · tampilan responden</p>
        <TampilanMateri
          m={m}
          remah={[
            { href: '/admin/konten/', label: 'Kelola Modul' },
            { href: `/admin/konten/materi/${m.kunci}/`, label: 'Edit materi' },
          ]}
          daftar={s.materi
            .filter((x) => x.modul.kunci === m.modul.kunci)
            .map((x) => ({ kunci: x.kunci, nomor: x.nomor, judul: x.judul, status: 'tersedia' as const, href: `/admin/konten/pratinjau/${x.kunci}/` }))}
        />
      </div>
    </>
  );
}
