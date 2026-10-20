import type { Metadata } from 'next';
import Link from 'next/link';
import FormHapusSemua from '@/components/admin/FormHapusSemua';
import { wajibAdmin } from '@/lib/auth';
import { daftarPeserta } from '@/lib/peserta-admin';

export const metadata: Metadata = { title: 'Peserta' };

const tgl = (d?: Date) =>
  d ? d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) : '—';

const LABEL = { selesai: '✓', sedang: '◐', belum: '○' } as Record<string, string>;
const PESAN: Record<string, string> = {
  dihapus: 'Akun peserta dan datanya sudah dihapus.',
  'semua-dihapus': 'Seluruh akun peserta dan datanya sudah dihapus.',
};

export default async function HalamanPeserta({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  await wajibAdmin('peneliti');
  const { pesan } = await searchParams;
  const baris = await daftarPeserta();
  const modul = baris[0]?.modul ?? [];
  const rata = baris.length ? Math.round(baris.reduce((n, b) => n + b.persen, 0) / baris.length) : 0;

  return (
    <>
      <h1>Peserta dan progres belajar</h1>
      <p>
        Hanya admin berperan <strong>peneliti</strong> yang bisa melihat halaman ini. Progres berarti
        materi yang sudah dibuka, bukan hasil kesehatan, dan bukan ukuran efektivitas intervensi.
      </p>
      {pesan && PESAN[pesan] && (
        <p className="pesan-sukses" role="status">
          {PESAN[pesan]}
        </p>
      )}

      <ul className="ringkas-angka">
        <li className="kartu">
          <strong>{baris.length}</strong> akun peserta
        </li>
        <li className="kartu">
          <strong>{rata}%</strong> rata-rata materi dibuka
        </li>
        <li className="kartu">
          <strong>{baris.filter((b) => b.persen === 100).length}</strong> peserta membuka semua materi
        </li>
      </ul>

      <p className="grup-tombol">
        <a className="tombol tombol-sekunder" href="/admin/peserta/unduh/">
          Unduh data (CSV)
        </a>
      </p>

      {baris.length === 0 ? (
        <p>Belum ada peserta yang mendaftar.</p>
      ) : (
        <div className="tabel-gulir">
          <table className="tabel-admin">
            <caption className="sr-only">Daftar peserta dan progres</caption>
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Terdaftar</th>
                <th scope="col">Terakhir aktif</th>
                <th scope="col">Progres</th>
                {modul.map((m) => (
                  <th scope="col" key={m.id} title={`Modul ${m.urutan}`}>
                    M{m.urutan}
                  </th>
                ))}
                <th scope="col">Kuis</th>
              </tr>
            </thead>
            <tbody>
              {baris.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href={`/admin/peserta/${b.id}/`}>{b.email}</Link>
                  </td>
                  <td>{tgl(b.dibuat_pada)}</td>
                  <td>{tgl(b.terakhir_aktif)}</td>
                  <td>
                    {b.persen}%<br />
                    <span className="label-kecil">
                      {b.dibaca}/{b.total} materi
                    </span>
                  </td>
                  {b.modul.map((m) => (
                    <td key={m.id}>
                      <span aria-hidden="true">{LABEL[m.status]}</span> {m.dibaca}/{m.jumlah}
                      {m.latihan && (
                        <>
                          <br />
                          <span className="label-kecil">latihan {m.latihan}</span>
                        </>
                      )}
                    </td>
                  ))}
                  <td>{b.kuis_lengkap ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="label-kecil">✓ selesai · ◐ sedang dipelajari · ○ belum dimulai. Angka = materi dibuka / jumlah materi.</p>

      <details className="tanya bahaya">
        <summary>Hapus semua data peserta (akhir penelitian)</summary>
        <div className="tanya-isi">
          <p>
            Gunakan sesuai prosedur penghapusan data dalam izin etik. Unduh CSV terlebih dahulu bila
            datanya masih diperlukan. Tindakan ini tidak bisa dibatalkan.
          </p>
          <FormHapusSemua />
        </div>
      </details>
    </>
  );
}
