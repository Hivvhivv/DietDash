import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { aksiBuatDraf, aksiHapusDraf, aksiSetujui } from '../../../aksi';
import LencanaStatus from '@/components/admin/LencanaStatus';
import TombolAksi from '@/components/admin/TombolAksi';
import TampilanModul from '@/components/TampilanModul';
import TampilanSubMateri from '@/components/TampilanSubMateri';
import { wajibAdmin } from '@/lib/auth';
import { keObjectId } from '@/lib/db';
import { ambilSemuaModul, keModul, ringkas } from '@/lib/konten';
import { ambilVersi } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Pratinjau versi' };

const PESAN: Record<string, string> = {
  tersimpan: 'Draf tersimpan.',
  dibuat: 'Draf modul baru dibuat.',
  disetujui: 'Versi ini sudah disetujui dan sekarang tayang di website.',
};

export default async function PratinjauVersi({
  params,
  searchParams,
}: {
  params: Promise<{ versiId: string }>;
  searchParams: Promise<{ pesan?: string }>;
}) {
  const admin = await wajibAdmin();
  const { versiId } = await params;
  const { pesan } = await searchParams;
  const oid = keObjectId(versiId);
  const dok = oid ? await ambilVersi(oid) : null;
  if (!dok) notFound();

  const modul = keModul(dok);
  // Letakkan versi ini di antara modul yang sedang tayang, persis seperti yang akan dilihat responden.
  const tayang = (await ambilSemuaModul()).filter((m) => m.id !== modul.id);
  const urut = [...tayang, modul].sort((a, b) => a.urutan - b.urutan).map(ringkas);
  const idVersi = dok._id.toHexString();

  return (
    <>
      <p>
        <Link href={`/admin/modul/${dok.modul_id}/`}>← Riwayat versi modul</Link>
      </p>
      <section className="kartu admin-ringkasan" aria-labelledby="judul-versi">
        <h1 id="judul-versi">
          {dok.data.judul} <span className="label-kecil">versi {dok.versi}</span>
        </h1>
        <p>
          <LencanaStatus status={dok.status} /> · dibuat oleh {dok.dibuat_oleh}
          {dok.disetujui_oleh && <> · disetujui oleh {dok.disetujui_oleh}</>}
        </p>
        <p>
          <strong>Catatan perubahan:</strong> {dok.catatan || '(belum diisi)'}
        </p>
        {pesan && PESAN[pesan] && (
          <p className="pesan-sukses" role="status">
            {PESAN[pesan]}
          </p>
        )}

        <div className="grup-tombol">
          {dok.status === 'draf' && (
            <>
              <Link className="tombol tombol-sekunder" href={`/admin/versi/${idVersi}/ubah/`}>
                Ubah draf
              </Link>
              {admin.peran === 'peneliti' && (
                <TombolAksi
                  aksi={aksiSetujui}
                  label="Setujui & tayangkan"
                  konfirmasi={`Tayangkan versi ${dok.versi} untuk semua pengunjung? Versi yang sedang tayang akan diarsipkan.`}
                  data={{ versi_id: idVersi }}
                />
              )}
              <TombolAksi
                aksi={aksiHapusDraf}
                label="Hapus draf"
                konfirmasi={`Hapus draf versi ${dok.versi}? Tindakan ini tidak bisa dibatalkan.`}
                data={{ versi_id: idVersi, modul_id: dok.modul_id }}
                bahaya
              />
            </>
          )}
          {dok.status !== 'draf' && (
            <form action={aksiBuatDraf}>
              <input type="hidden" name="versi_id" value={idVersi} />
              <button type="submit" className="tombol tombol-sekunder">
                Buat draf dari versi ini
              </button>
            </form>
          )}
        </div>
        {dok.status === 'draf' && admin.peran !== 'peneliti' && (
          <p className="label-kecil">Draf ini menunggu persetujuan admin berperan peneliti.</p>
        )}
      </section>

      <p>
        Modul ini terdiri dari <strong>{modul.materi.length} materi</strong>. Setiap judul{' '}
        <code>## …</code> di naskah menjadi satu materi.
      </p>
      <div className="admin-pratinjau">
        <p className="admin-pratinjau-label">Pratinjau — halaman ringkasan modul</p>
        <TampilanModul modul={modul} semua={urut} />
      </div>
      {modul.materi.map((x) => (
        <div className="admin-pratinjau" key={x.nomor}>
          <p className="admin-pratinjau-label">
            Pratinjau — materi {x.nomor} dari {modul.materi.length}
          </p>
          <TampilanSubMateri modul={modul} nomor={x.nomor} semua={urut} catat={false} />
        </div>
      ))}
    </>
  );
}
