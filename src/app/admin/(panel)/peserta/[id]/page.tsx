import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { aksiHapusPeserta } from '../../../aksi';
import TautanReset from '@/components/admin/TautanReset';
import TombolAksi from '@/components/admin/TombolAksi';
import { wajibAdmin } from '@/lib/auth';
import { keObjectId } from '@/lib/db';
import { detailPeserta } from '@/lib/peserta-admin';

export const metadata: Metadata = { title: 'Detail peserta' };

const tgl = (d?: Date) =>
  d ? d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) : '—';

export default async function DetailPeserta({ params }: { params: Promise<{ id: string }> }) {
  await wajibAdmin('peneliti');
  const { id } = await params;
  const oid = keObjectId(id);
  const d = oid ? await detailPeserta(oid) : null;
  if (!d) notFound();

  return (
    <>
      <p>
        <Link href="/admin/peserta/">← Daftar peserta</Link>
      </p>
      <h1>{d.peserta.email}</h1>
      <p className="label-kecil">
        Terdaftar {tgl(d.peserta.dibuat_pada)} · terakhir masuk {tgl(d.peserta.terakhir_masuk)} · menyetujui
        kebijakan privasi versi {d.peserta.versi_kebijakan} pada {tgl(d.peserta.setuju_privasi_pada)}
      </p>
      <p>
        <strong>{d.baris.persen}%</strong> materi dibuka ({d.baris.dibaca} dari {d.baris.total}).
      </p>

      <h2>Materi yang dibuka</h2>
      <div className="tabel-gulir">
        <table className="tabel-admin">
          <thead>
            <tr>
              <th scope="col">Modul</th>
              <th scope="col">Materi</th>
              <th scope="col">Pertama dibuka</th>
              <th scope="col">Terakhir dibuka</th>
              <th scope="col">Dibuka</th>
              <th scope="col">Versi modul</th>
            </tr>
          </thead>
          <tbody>
            {d.modul.flatMap((m) =>
              m.materi.map((x) => {
                const p = d.progres.find((y) => y.modul_id === m.id && y.materi === x.nomor);
                return (
                  <tr key={`${m.id}-${x.nomor}`}>
                    <td>{x.nomor === 1 ? `${m.urutan}. ${m.judul}` : ''}</td>
                    <td>
                      {x.nomor}. {x.judul}
                    </td>
                    <td>{p ? tgl(p.pertama_dibuka) : <span className="label-kecil">belum</span>}</td>
                    <td>{p ? tgl(p.terakhir_dibuka) : ''}</td>
                    <td>{p ? `${p.jumlah_buka}×` : ''}</td>
                    <td>{p?.versi_modul ?? ''}</td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>

      <h2>Riwayat latihan soal</h2>
      {d.latihan.length === 0 ? (
        <p>Belum mengerjakan latihan soal.</p>
      ) : (
        <div className="tabel-gulir">
          <table className="tabel-admin">
            <thead>
              <tr>
                <th scope="col">Waktu</th>
                <th scope="col">Latihan</th>
                <th scope="col">Benar</th>
                <th scope="col">Versi soal</th>
              </tr>
            </thead>
            <tbody>
              {d.latihan.map((l) => (
                <tr key={l._id.toHexString()}>
                  <td>{tgl(l.waktu)}</td>
                  <td>
                    {l.modul_id === 'semua'
                      ? 'Kuis lengkap'
                      : `Modul ${d.modul.find((m) => m.id === l.modul_id)?.urutan ?? '?'}`}
                  </td>
                  <td>
                    {l.benar}/{l.total}
                  </td>
                  <td>{l.versi_kuis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Akun</h2>
      <p>Peserta lupa kata sandi? Buat tautan atur ulang, lalu berikan kepadanya secara langsung.</p>
      <TautanReset pesertaId={id} />

      <details className="tanya bahaya">
        <summary>Hapus akun peserta ini</summary>
        <div className="tanya-isi">
          <p>Akun, email, dan seluruh progres peserta ini akan dihapus permanen.</p>
          <TombolAksi
            aksi={aksiHapusPeserta}
            label="Hapus akun dan datanya"
            konfirmasi={`Hapus akun ${d.peserta.email} beserta seluruh progresnya?`}
            data={{ peserta_id: id }}
            bahaya
          />
        </div>
      </details>
    </>
  );
}
