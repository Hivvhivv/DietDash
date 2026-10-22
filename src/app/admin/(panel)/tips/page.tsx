import type { Metadata } from 'next';
import Link from 'next/link';
import { aksiGeserTips, aksiHapusTips, aksiHapusTipsContoh, aksiTerbitTips } from '../../aksi-tips';
import { FormAksi } from '@/components/admin/FormAdmin';
import { wajibAdmin } from '@/lib/admin-auth';
import { LABEL_KATEGORI_TIPS, semuaTips } from '@/lib/tips';
import { formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Kelola Tips' };
export const dynamic = 'force-dynamic';

const PESAN: Record<string, string> = {
  tersimpan: 'Tips tersimpan.',
  dihapus: 'Tips dihapus.',
  'contoh-dihapus': 'Semua tips contoh sudah dihapus.',
  'tidak-ada-contoh': 'Tidak ada tips contoh yang perlu dihapus.',
};

function TombolGeser({ id }: { id: string }) {
  return (
    <span className="grup-geser">
      {(['naik', 'turun'] as const).map((arah) => (
        <form key={arah} action={aksiGeserTips}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="arah" value={arah} />
          <button type="submit" className="tombol tombol-sekunder tombol-ikon" aria-label={`Geser ${arah}`}>
            {arah === 'naik' ? '↑' : '↓'}
          </button>
        </form>
      ))}
    </span>
  );
}

// Kelola Tips Sehari-hari (bacaan pendukung). Di luar versi konten penelitian; setiap perubahan tercatat di log.
export default async function KelolaTips({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  await wajibAdmin();
  const { pesan } = await searchParams;
  const daftar = await semuaTips();
  const contoh = daftar.filter((t) => t.contoh).length;
  const terbit = daftar.filter((t) => t.terbit).length;

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Kelola Tips</h1>
        <p>
          Tips Sehari-hari tampil di menu Tips responden dan kartu “Tips Hari Ini” di Beranda. {terbit} dari {daftar.length} tips
          sedang ditampilkan.
        </p>
      </div>
      {pesan && PESAN[pesan] && (
        <p className="pesan-sukses" role="status">
          {PESAN[pesan]}
        </p>
      )}
      <p className="kotak-info">
        Tips adalah bacaan pendukung dan tidak termasuk versi konten yang dikunci. Pastikan isinya sudah ditinjau ahli dan tanpa
        klaim pengobatan; klaim terlarang otomatis ditolak saat disimpan. Setiap perubahan tercatat di log aktivitas.
      </p>

      <section aria-labelledby="judul-daftar-tips">
        <div className="bagian-kepala">
          <h2 id="judul-daftar-tips">Daftar tips</h2>
          <Link className="tombol" href="/admin/tips/baru/">
            + Tambah tips
          </Link>
        </div>
        {daftar.length === 0 && <p>Belum ada tips. Tambahkan tips pertama.</p>}
        <ol className="daftar-konten">
          {daftar.map((t) => {
            const id = t._id.toHexString();
            return (
              <li key={id} className="kartu">
                <div className="baris-tips">
                  <div>
                    <h3>{t.judul}</h3>
                    <p className="label-kecil">
                      {LABEL_KATEGORI_TIPS[t.kategori]} · diubah {formatWaktu(t.diubah_pada)}{' '}
                      <span className={`lencana ${t.terbit ? 'lencana-materi-selesai' : 'lencana-materi-terkunci'}`}>
                        {t.terbit ? '✓ Ditampilkan' : '○ Disembunyikan'}
                      </span>{' '}
                      {t.contoh && <span className="lencana lencana-peringatan">🧪 Contoh</span>}
                    </p>
                  </div>
                  <div className="aksi-tips">
                    <TombolGeser id={id} />
                    <Link className="tombol tombol-sekunder tombol-kecil" href={`/admin/tips/${id}/`}>
                      Edit
                    </Link>
                    <form action={aksiTerbitTips}>
                      <input type="hidden" name="id" value={id} />
                      <input type="hidden" name="terbit" value={t.terbit ? '' : 'ya'} />
                      <button type="submit" className="tombol tombol-sekunder tombol-kecil">
                        {t.terbit ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </form>
                    <FormAksi aksi={aksiHapusTips} label="Hapus" data={{ id }} bahaya konfirmasi={`Hapus tips “${t.judul}”?`} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {contoh > 0 && (
        <section className="bagian-kartu" aria-labelledby="judul-hapus-contoh-tips">
          <h2 id="judul-hapus-contoh-tips">Hapus Tips Contoh</h2>
          <p>
            Ada {contoh} tips contoh (🧪) dari benih awal. Hapus sebelum website diberikan kepada responden bila belum ditinjau ahli.
            Tips yang Anda tambahkan sendiri tidak ikut terhapus.
          </p>
          <FormAksi aksi={aksiHapusTipsContoh} label="Hapus semua tips contoh" bahaya konfirmasi="Hapus semua tips contoh?">
            <div className="bidang">
              <label htmlFor="konfirmasi-tips">Ketik HAPUS untuk mengonfirmasi</label>
              <input id="konfirmasi-tips" name="konfirmasi" autoComplete="off" />
            </div>
          </FormAksi>
        </section>
      )}
    </>
  );
}
