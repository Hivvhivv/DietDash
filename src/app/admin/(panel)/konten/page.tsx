import type { Metadata } from 'next';
import Link from 'next/link';
import {
  aksiBuangVersiKerja,
  aksiBuatVersiKerja,
  aksiGeserModul,
  aksiGeserMateri,
  aksiKembaliDraf,
  aksiPulihkanModul,
  aksiTandaiSiap,
} from '../../aksi-konten';
import { FormAksi } from '@/components/admin/FormAdmin';
import LencanaVersi from '@/components/admin/LencanaVersi';
import { wajibAdmin } from '@/lib/admin-auth';
import { koleksi } from '@/lib/db';
import { ambilStruktur, versiAktif } from '@/lib/konten';
import { validasiVersi, versiKerja } from '@/lib/konten-admin';
import { ambilPengaturan } from '@/lib/pengaturan';
import { formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Kelola Modul' };
export const dynamic = 'force-dynamic';

const PESAN: Record<string, string> = {
  'versi-dibuat': 'Versi kerja dibuat dari konten aktif. Silakan mulai mengedit.',
  'perbaikan-dibuat': 'Versi perbaikan dibuat. Setiap perubahan tercatat di log.',
  'versi-dibuang': 'Versi kerja dibuang.',
  'modul-dihapus': 'Modul dihapus.',
  'modul-diarsipkan': 'Modul sudah dipakai responden, jadi diarsipkan (disembunyikan), bukan dihapus.',
};

function TombolGeser({ aksi, data }: { aksi: (fd: FormData) => Promise<void>; data: Record<string, string> }) {
  return (
    <span className="grup-geser">
      {(['naik', 'turun'] as const).map((arah) => (
        <form key={arah} action={aksi}>
          {Object.entries(data).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <input type="hidden" name="arah" value={arah} />
          <button type="submit" className="tombol tombol-sekunder tombol-ikon" aria-label={`Geser ${arah}`}>
            {arah === 'naik' ? '↑' : '↓'}
          </button>
        </form>
      ))}
    </span>
  );
}

export default async function Konten({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  const admin = await wajibAdmin();
  const { pesan } = await searchParams;
  const [kerja, aktif, atur] = await Promise.all([versiKerja(), versiAktif(), ambilPengaturan()]);
  const struktur = kerja ? await ambilStruktur(kerja._id) : null;
  const masalah = kerja ? await validasiVersi(kerja._id) : [];
  const { modul } = await koleksi();
  const arsip = kerja ? await modul.find({ version_id: kerja._id, diarsipkan: true }).sort({ urutan: 1 }).toArray() : [];
  const bolehUbah = !!kerja && (kerja.jenis === 'biasa' || admin.peran === 'super_admin');

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Kelola Modul</h1>
        <p>Versi konten, modul, dan materi di dalamnya. Materi juga bisa dikelola dari menu Kelola Materi.</p>
      </div>
      {pesan && PESAN[pesan] && (
        <p className="pesan-sukses" role="status">
          {PESAN[pesan]}
        </p>
      )}

      {aktif?.contoh && (
        <p className="kotak kotak-peringatan">
          🧪 Konten yang terbit sekarang adalah <strong>konten contoh</strong>. Anda boleh mengedit atau menghapus modul dan materinya
          lewat versi kerja di bawah.{' '}
          {admin.peran === 'super_admin' ? (
            <>
              Untuk menghapus semuanya sekaligus: <Link href="/admin/versi/">Versi Konten → Hapus Konten Contoh</Link>.
            </>
          ) : (
            'Super admin dapat menghapus semuanya sekaligus di Versi Konten.'
          )}
        </p>
      )}

      <section className="bagian-kartu" aria-labelledby="judul-versi">
        <h2 id="judul-versi">Versi konten</h2>
        <dl className="kartu-data">
          <div>
            <dt>Dilihat responden sekarang</dt>
            <dd>{aktif ? <>{aktif.label} <LencanaVersi status={aktif.status} /></> : 'Belum ada versi terbit — responden belum bisa belajar.'}</dd>
          </div>
          <div>
            <dt>Versi kerja (yang Anda edit)</dt>
            <dd>
              {kerja ? (
                <>
                  {kerja.label} <LencanaVersi status={kerja.status} />
                  {kerja.jenis === 'perbaikan' && <span className="lencana lencana-peringatan">Perbaikan: {kerja.alasan}</span>}
                  <div className="label-kecil">Diubah {formatWaktu(kerja.diubah_pada)}</div>
                </>
              ) : (
                'Tidak ada'
              )}
            </dd>
          </div>
        </dl>
        <p className="label-kecil">
          Alur: Draf → Siap ditinjau → Terbit (super admin) → Dikunci untuk penelitian (super admin). Mengedit versi yang siap ditinjau
          mengembalikannya ke draf.
        </p>
        {!kerja &&
          (aktif?.status === 'dikunci' ? (
            <p className="kotak-info">
              🔒 Konten aktif {aktif.label} sudah dikunci untuk penelitian. Perubahan mendesak hanya lewat versi perbaikan oleh super admin
              {admin.peran === 'super_admin' ? (
                <>
                  {' '}
                  di <Link href="/admin/versi/">halaman Versi</Link>.
                </>
              ) : (
                '.'
              )}
            </p>
          ) : (
            <FormAksi aksi={aksiBuatVersiKerja} label={aktif ? 'Buat versi kerja dari konten aktif' : 'Mulai versi konten pertama'} />
          ))}
        {kerja && bolehUbah && (
          <div className="grup-tombol">
            {kerja.status === 'draf' ? (
              <FormAksi aksi={aksiTandaiSiap} label="Tandai siap ditinjau" />
            ) : (
              <FormAksi aksi={aksiKembaliDraf} label="Kembalikan ke draf" sekunder />
            )}
            <FormAksi aksi={aksiBuangVersiKerja} label="Buang versi kerja" bahaya konfirmasi="Semua perubahan di versi kerja akan dihapus. Lanjutkan?" />
          </div>
        )}
        {kerja && !bolehUbah && <p className="kotak-info">Versi perbaikan hanya dapat diedit super admin.</p>}
      </section>

      {kerja && (
        <section className="bagian-kartu" aria-labelledby="judul-validasi">
          <h2 id="judul-validasi">{masalah.length ? `⚠ ${masalah.length} hal perlu dilengkapi` : '✓ Lolos pemeriksaan'}</h2>
          {masalah.length ? (
            <ul>
              {masalah.map((m, i) => (
                <li key={i}>
                  <strong>{m.lokasi}:</strong> {m.pesan} {m.tautan && <Link href={m.tautan}>Perbaiki</Link>}
                </li>
              ))}
            </ul>
          ) : (
            <p>Semua modul punya materi, dan setiap materi punya isi, tujuan, dan rangkuman.</p>
          )}
        </section>
      )}

      {struktur && (
        <section aria-labelledby="judul-struktur">
          <div className="bagian-kepala">
            <h2 id="judul-struktur">Modul dan materi</h2>
            {bolehUbah && (
              <Link className="tombol" href="/admin/konten/modul/baru/">
                + Tambah modul
              </Link>
            )}
          </div>
          {struktur.modul.length === 0 && <p>Belum ada modul.</p>}
          <ol className="daftar-konten">
            {struktur.modul.map((md) => (
              <li key={md.kunci} className="kartu">
                <div className="baris-konten">
                  <h3>
                    Modul {md.nomor}. {md.judul}
                  </h3>
                  <span className="grup-tombol">
                    {bolehUbah && <TombolGeser aksi={aksiGeserModul} data={{ kunci: md.kunci }} />}
                    <Link className="tombol tombol-sekunder tombol-kecil" href={`/admin/konten/modul/${md.kunci}/`}>
                      {bolehUbah ? 'Edit modul' : 'Lihat'}
                    </Link>
                  </span>
                </div>
                <ol className="daftar-konten-materi">
                  {md.materi.map((m) => (
                    <li key={m.kunci}>
                      <span>
                        <strong>{m.nomor}</strong> {m.judul}{' '}
                        <span className="label-kecil">
                          · ±{m.menit} mnt
                        </span>
                      </span>
                      <span className="grup-tombol">
                        {bolehUbah && <TombolGeser aksi={aksiGeserMateri} data={{ kunci: m.kunci, modul: md.kunci }} />}
                        <Link href={`/admin/konten/materi/${m.kunci}/`}>Edit</Link>
                        <Link href={`/admin/konten/pratinjau/${m.kunci}/`}>Pratinjau</Link>
                      </span>
                    </li>
                  ))}
                </ol>
                {bolehUbah && (
                  <Link className="tautan-panah" href={`/admin/konten/materi/baru/?modul=${md.kunci}`}>
                    + Tambah materi
                  </Link>
                )}
              </li>
            ))}
          </ol>
          {arsip.length > 0 && (
            <details className="tanya">
              <summary>Modul diarsipkan ({arsip.length})</summary>
              <div className="tanya-isi">
                <ul>
                  {arsip.map((md) => (
                    <li key={md.kunci}>
                      {md.judul}{' '}
                      {bolehUbah && (
                        <form action={aksiPulihkanModul} className="sebaris">
                          <input type="hidden" name="kunci" value={md.kunci} />
                          <button type="submit" className="tautan-tombol">
                            Pulihkan
                          </button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          )}
        </section>
      )}
    </>
  );
}
