import type { Metadata } from 'next';
import Link from 'next/link';
import { aksiHapusMateri, aksiHapusModul } from '../../../../aksi-konten';
import { FormAksi } from '@/components/admin/FormAdmin';
import { FormModul } from '@/components/admin/FormKonten';
import { wajibAdmin } from '@/lib/admin-auth';
import { koleksi } from '@/lib/db';
import { ambilModulKerja, versiKerja } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Edit modul' };
export const dynamic = 'force-dynamic';

const PESAN: Record<string, string> = {
  tersimpan: 'Modul tersimpan.',
  'materi-dihapus': 'Materi dihapus.',
  'materi-diarsipkan': 'Materi sudah dipakai responden, jadi diarsipkan (disembunyikan), bukan dihapus.',
};

export default async function EditModul({ params, searchParams }: { params: Promise<{ kunci: string }>; searchParams: Promise<{ pesan?: string }> }) {
  await wajibAdmin();
  const { kunci } = await params;
  const { pesan } = await searchParams;
  const md = await ambilModulKerja(kunci);
  if (!md) {
    return (
      <>
        <h1>Modul tidak ditemukan</h1>
        <p>Modul hanya dapat diedit di versi kerja. <Link href="/admin/konten/">Kembali ke Konten</Link></p>
      </>
    );
  }
  const v = await versiKerja();
  const { materi } = await koleksi();
  const daftar = await materi.find({ version_id: v!._id, modul_kunci: kunci }).sort({ urutan: 1 }).toArray();

  return (
    <>
      <p>
        <Link href="/admin/konten/">← Konten</Link>
      </p>
      <h1>Edit modul: {md.judul}</h1>
      {pesan && PESAN[pesan] && (
        <p className="pesan-sukses" role="status">
          {PESAN[pesan]}
        </p>
      )}
      <FormModul
        awal={{
          kunci: md.kunci,
          judul: md.judul,
          deskripsi: md.deskripsi,
          tujuan: md.tujuan,
          jenis_gambar: md.gambar.jenis,
          ilustrasi: md.gambar.jenis === 'bawaan' ? md.gambar.nama : 'piring',
          gambar_id: md.gambar.jenis === 'unggah' ? md.gambar.id : '',
          gambar_alt: md.gambar.alt,
        }}
      />

      <section className="bagian-kartu" aria-labelledby="judul-materi-modul">
        <div className="bagian-kepala">
          <h2 id="judul-materi-modul">Materi di modul ini</h2>
          <Link className="tombol" href={`/admin/konten/materi/baru/?modul=${md.kunci}`}>
            + Tambah materi
          </Link>
        </div>
        {daftar.length === 0 ? (
          <p>Belum ada materi.</p>
        ) : (
          <ol className="daftar-konten-materi">
            {daftar.map((m) => (
              <li key={m.kunci}>
                <span>
                  {m.judul} {m.diarsipkan && <span className="lencana lencana-diarsipkan">🗄 Diarsipkan</span>}
                </span>
                <span className="grup-tombol">
                  <Link href={`/admin/konten/materi/${m.kunci}/`}>Edit</Link>
                  <Link href={`/admin/konten/materi/${m.kunci}/kuis/`}>Kuis</Link>
                  {!m.diarsipkan && (
                    <FormAksi
                      aksi={aksiHapusMateri}
                      data={{ kunci: m.kunci }}
                      label="Hapus"
                      bahaya
                      konfirmasi={`Hapus materi "${m.judul}" beserta kuisnya? Bila sudah dipakai responden, materi akan diarsipkan.`}
                    />
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <details className="tanya bahaya">
        <summary>Hapus modul</summary>
        <div className="tanya-isi">
          <p>Semua materi dan kuis di dalamnya ikut terhapus. Bila sudah ada responden yang memakainya, modul diarsipkan agar data tetap utuh.</p>
          <FormAksi aksi={aksiHapusModul} data={{ kunci: md.kunci }} label="Hapus modul" bahaya konfirmasi={`Hapus modul "${md.judul}"?`} />
        </div>
      </details>
    </>
  );
}
