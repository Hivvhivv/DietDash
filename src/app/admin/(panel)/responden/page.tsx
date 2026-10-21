import type { Metadata } from 'next';
import Link from 'next/link';
import CariResponden from '@/components/admin/CariResponden';
import { wajibAdmin } from '@/lib/admin-auth';
import { sha256 } from '@/lib/identitas';
import { daftarResponden, type BarisResponden } from '@/lib/monitor';
import { formatTanggal, formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Responden' };
export const dynamic = 'force-dynamic';

const LABEL_BELAJAR = { belum: '○ Belum mulai', sedang: '◐ Sedang belajar', selesai: '✓ Selesai' } as const;
const LABEL_AKUN = { aktif: 'Aktif', nonaktif: '⛔ Nonaktif', mundur: '↩ Mundur' } as const;

// Hanya saringan tanpa data pribadi yang masuk URL; pencarian nama/nomor dilakukan di peramban (CariResponden).
type Saring = { belajar?: string; akun?: string; sampel?: string; modul?: string; dari?: string; sampai?: string; urut?: string };

const URUT: Record<string, (a: BarisResponden, b: BarisResponden) => number> = {
  terbaru: (a, b) => b.dibuat_pada.getTime() - a.dibuat_pada.getTime(),
  terlama: (a, b) => a.dibuat_pada.getTime() - b.dibuat_pada.getTime(),
  aktif: (a, b) => b.terakhir_aktif.getTime() - a.terakhir_aktif.getTime(),
  progres_rendah: (a, b) => a.persen - b.persen,
  progres_tinggi: (a, b) => b.persen - a.persen,
  id: (a, b) => a.id_peserta.localeCompare(b.id_peserta),
  nama: (a, b) => a.nama.localeCompare(b.nama, 'id'),
};

function saring(baris: BarisResponden[], c: Saring) {
  const awalHari = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00+07:00`) : null);
  const dari = awalHari(c.dari);
  const sampai = awalHari(c.sampai);
  const hasil = baris.filter((b) => {
    if (c.sampel !== 'semua' && b.status_sampel !== (c.sampel === 'bukan' ? 'bukan_sampel' : 'responden_penelitian')) return false;
    if (c.belajar === 'tidak_aktif' ? !b.tidak_aktif : c.belajar === 'perhatian' ? !(b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas)) : c.belajar && b.status_belajar !== c.belajar) return false;
    if (c.akun && b.status_akun !== c.akun) return false;
    if (c.modul && String(b.modul_saat_ini ?? 'selesai') !== c.modul) return false;
    if (dari && b.dibuat_pada < dari) return false;
    if (sampai && b.dibuat_pada.getTime() >= sampai.getTime() + 86_400_000) return false;
    return true;
  });
  return hasil.sort(URUT[c.urut ?? 'terbaru'] ?? URUT.terbaru);
}

export default async function Responden({ searchParams }: { searchParams: Promise<Saring> }) {
  await wajibAdmin();
  const c = await searchParams;
  const { baris, struktur } = await daftarResponden();
  const hasil = saring(baris, c);

  return (
    <>
      <h1>Responden</h1>
      <p className="label-kecil">Nomor HP ditampilkan tersamarkan. Nomor lengkap hanya dapat dibuka di halaman detail dan tercatat di log.</p>
      <form className="form-admin form-saring" method="get" aria-label="Saring responden">
        <div className="bidang-baris">
          <div className="bidang">
            <label htmlFor="belajar">Status belajar</label>
            <select id="belajar" name="belajar" defaultValue={c.belajar ?? ''}>
              <option value="">Semua</option>
              <option value="belum">Belum mulai</option>
              <option value="sedang">Sedang belajar</option>
              <option value="selesai">Selesai</option>
              <option value="tidak_aktif">Tidak aktif</option>
              <option value="perhatian">Perlu perhatian</option>
            </select>
          </div>
          <div className="bidang">
            <label htmlFor="akun">Status akun</label>
            <select id="akun" name="akun" defaultValue={c.akun ?? ''}>
              <option value="">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="mundur">Mengundurkan diri</option>
            </select>
          </div>
          <div className="bidang">
            <label htmlFor="sampel">Status sampel</label>
            <select id="sampel" name="sampel" defaultValue={c.sampel ?? ''}>
              <option value="">Responden penelitian</option>
              <option value="bukan">Bukan sampel</option>
              <option value="semua">Semua akun</option>
            </select>
          </div>
          <div className="bidang">
            <label htmlFor="modul">Modul saat ini</label>
            <select id="modul" name="modul" defaultValue={c.modul ?? ''}>
              <option value="">Semua</option>
              {(struktur?.modul ?? []).map((m) => (
                <option key={m.kunci} value={m.nomor}>
                  Modul {m.nomor}
                </option>
              ))}
              <option value="selesai">Selesai semua</option>
            </select>
          </div>
          <div className="bidang">
            <label htmlFor="dari">Daftar dari tanggal</label>
            <input id="dari" name="dari" type="date" defaultValue={c.dari} />
          </div>
          <div className="bidang">
            <label htmlFor="sampai">Sampai tanggal</label>
            <input id="sampai" name="sampai" type="date" defaultValue={c.sampai} />
          </div>
          <div className="bidang">
            <label htmlFor="urut">Urutkan</label>
            <select id="urut" name="urut" defaultValue={c.urut ?? 'terbaru'}>
              <option value="terbaru">Pendaftar terbaru</option>
              <option value="terlama">Pendaftar terlama</option>
              <option value="aktif">Terakhir aktif</option>
              <option value="progres_rendah">Progres terendah</option>
              <option value="progres_tinggi">Progres tertinggi</option>
              <option value="id">ID peserta</option>
              <option value="nama">Nama</option>
            </select>
          </div>
        </div>
        <p className="grup-tombol">
          <button type="submit" className="tombol tombol-sekunder">
            Terapkan
          </button>
          <Link href="/admin/responden/">Hapus saringan</Link>
        </p>
      </form>

      <CariResponden idTabel="tabel-responden" />
      <p role="status">{hasil.length} responden</p>
      <div className="tabel-gulir">
        <table className="tabel-admin" id="tabel-responden">
          <thead>
            <tr>
              <th scope="col">ID peserta</th>
              <th scope="col">Nama</th>
              <th scope="col">Nomor HP</th>
              <th scope="col">Status</th>
              <th scope="col">Progres</th>
              <th scope="col">Materi saat ini</th>
              <th scope="col">Terakhir aktif</th>
              <th scope="col">Daftar</th>
            </tr>
          </thead>
          <tbody>
            {hasil.map((b) => (
              <tr key={b.id_peserta} data-cari={`${b.id_peserta} ${b.nama}`.toLowerCase()} data-hp={sha256(b.nomor_hp)}>
                <th scope="row">
                  <Link href={`/admin/responden/${b.id_peserta}/`}>{b.id_peserta}</Link>
                </th>
                <td>{b.nama}</td>
                <td>{b.nomor_samar}</td>
                <td>
                  {LABEL_BELAJAR[b.status_belajar]}
                  {b.status_akun !== 'aktif' && <div className="label-kecil">{LABEL_AKUN[b.status_akun]}</div>}
                  {b.status_sampel === 'bukan_sampel' && <div className="label-kecil">Bukan sampel</div>}
                  {b.tidak_aktif && <div className="label-kecil">⚠ Tidak aktif</div>}
                  {b.mendekati_batas && <div className="label-kecil">⏱ Hari ke-{b.hari_sejak_daftar}</div>}
                </td>
                <td>
                  {b.selesai}/{b.total} ({b.persen}%)
                </td>
                <td>{b.materi_saat_ini}</td>
                <td>{formatWaktu(b.terakhir_aktif)}</td>
                <td>{formatTanggal(b.dibuat_pada)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
