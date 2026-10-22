import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { aksiBukaKunci, aksiLihatNomor, aksiPretest, aksiResetToken, aksiStatusAkun, aksiStatusSampel } from '../../../aksi-responden';
import { FormAksi } from '@/components/admin/FormAdmin';
import LencanaStatusMateri from '@/components/belajar/StatusMateri';
import { wajibAdmin } from '@/lib/admin-auth';
import { samarkanNomorHp } from '@/lib/identitas';
import { detailResponden } from '@/lib/monitor';
import { formatDurasi, formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Detail responden' };
export const dynamic = 'force-dynamic';

const LABEL_RIWAYAT: Record<string, string> = {
  token_dibuat: 'Kode akses dibuat',
  token_diganti_responden: 'Kode akses diganti responden',
  token_direset_admin: 'Kode akses dibuat ulang oleh admin',
  nomor_diganti: 'Nomor HP diganti',
  nama_diganti: 'Nama diganti',
  mengundurkan_diri: 'Mengundurkan diri',
  dinonaktifkan: 'Akun dinonaktifkan',
  diaktifkan: 'Akun diaktifkan',
};

function KolomAlasan({ id, wajib = true }: { id: string; wajib?: boolean }) {
  return (
    <div className="bidang">
      <label htmlFor={id}>Alasan{wajib ? '' : ' (opsional)'}</label>
      <input id={id} name="alasan" required={wajib} minLength={wajib ? 5 : undefined} />
    </div>
  );
}


export default async function DetailResponden({ params }: { params: Promise<{ id: string }> }) {
  await wajibAdmin();
  const { id } = await params;
  const d = await detailResponden(id);
  if (!d) notFound();
  const { r, p, ringkasan, garisWaktu, riwayat, atur } = d;
  const data = { id_peserta: p.id_peserta };
  const terkunci = (ringkasan?.daftar ?? []).filter((x) => x.status === 'terkunci');
  const statusAkun = r.mundur_pada ? 'Mengundurkan diri' : r.aktif ? 'Aktif' : 'Nonaktif';

  return (
    <>
      <p>
        <Link href="/admin/responden/">← Daftar responden</Link>
      </p>
      <h1>Responden {p.id_peserta}</h1>
      <dl className="kartu kartu-data">
        <div>
          <dt>Nama</dt>
          <dd>{r.nama}</dd>
        </div>
        <div>
          <dt>Nomor HP</dt>
          <dd>
            {samarkanNomorHp(r.nomor_hp)}
            <FormAksi aksi={aksiLihatNomor} data={data} label="Lihat nomor lengkap" sekunder konfirmasi="Membuka nomor lengkap akan tercatat di log audit. Lanjutkan?" />
          </dd>
        </div>
        <div>
          <dt>Status akun</dt>
          <dd>{statusAkun}</dd>
        </div>
        <div>
          <dt>Status sampel</dt>
          <dd>{p.status_sampel === 'responden_penelitian' ? 'Responden penelitian' : 'Bukan sampel'}</dd>
        </div>
        <div>
          <dt>Daftar</dt>
          <dd>{formatWaktu(r.dibuat_pada)}</dd>
        </div>
        <div>
          <dt>Terakhir aktif</dt>
          <dd>{formatWaktu(r.terakhir_aktif)}</dd>
        </div>
        <div>
          <dt>Progres</dt>
          <dd>{ringkasan ? `${ringkasan.selesai}/${ringkasan.total} materi (${ringkasan.persen}%)` : '—'}</dd>
        </div>
        {atur.gerbang_pretest && (
          <div>
            <dt>Pretest</dt>
            <dd>{p.pretest_selesai_pada ? `✓ Selesai (${formatWaktu(p.pretest_selesai_pada)})` : 'Belum ditandai'}</dd>
          </div>
        )}
      </dl>

      <section className="bagian-kartu" aria-labelledby="judul-garis">
        <h2 id="judul-garis">Garis waktu belajar</h2>
        <div className="tabel-gulir">
          <table className="tabel-admin">
            <thead>
              <tr>
                <th scope="col">Materi</th>
                <th scope="col">Status</th>
                <th scope="col">Dibuka</th>
                <th scope="col">Selesai</th>
                <th scope="col">Waktu baca</th>
                <th scope="col">Versi konten</th>
              </tr>
            </thead>
            <tbody>
              {garisWaktu.map((g) => (
                <tr key={g.materi.kunci}>
                  <th scope="row">
                    {g.materi.nomor} {g.materi.judul}
                    {g.buka_manual && <div className="label-kecil">🔓 Dibuka manual: {g.buka_manual.alasan}</div>}
                  </th>
                  <td>
                    <LencanaStatusMateri status={g.status} />
                  </td>
                  <td>{formatWaktu(g.dibuka_pada)}</td>
                  <td>{formatWaktu(g.selesai_pada)}</td>
                  <td>{formatDurasi(g.detik_baca)}</td>
                  <td>{g.versi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bagian-kartu" aria-labelledby="judul-tindakan">
        <h2 id="judul-tindakan">Tindakan</h2>

        <details className="tanya">
          <summary>Buat kode akses baru</summary>
          <div className="tanya-isi">
            <p>
              Kode lama tidak berlaku lagi dan semua sesi responden keluar. Pastikan identitas responden, lalu kirim kode baru
              langsung ke nomor HP terdaftar.
            </p>
            <FormAksi aksi={aksiResetToken} data={data} label="Buat kode akses baru" konfirmasi="Buat kode akses baru untuk responden ini?">
              <KolomAlasan id="alasan-token" />
            </FormAksi>
          </div>
        </details>

        {terkunci.length > 0 && (
          <details className="tanya">
            <summary>Buka kunci materi secara manual</summary>
            <div className="tanya-isi">
              <p>Gunakan hanya untuk kendala teknis. Tercatat di log dan di data progres.</p>
              <FormAksi aksi={aksiBukaKunci} data={data} label="Buka materi">
                <div className="bidang">
                  <label htmlFor="materi-buka">Materi</label>
                  <select id="materi-buka" name="materi">
                    {terkunci.map((x) => (
                      <option key={x.materi.kunci} value={x.materi.kunci}>
                        {x.materi.nomor} {x.materi.judul}
                      </option>
                    ))}
                  </select>
                </div>
                <KolomAlasan id="alasan-buka" />
              </FormAksi>
            </div>
          </details>
        )}

        <details className="tanya">
          <summary>Status sampel</summary>
          <div className="tanya-isi">
            <p>Akun uji coba atau yang tidak memenuhi kriteria dapat ditandai “bukan sampel” agar tidak masuk analisis dan ekspor bawaan.</p>
            <FormAksi
              aksi={aksiStatusSampel}
              data={{ ...data, status: p.status_sampel === 'responden_penelitian' ? 'bukan_sampel' : 'responden_penelitian' }}
              label={p.status_sampel === 'responden_penelitian' ? 'Tandai bukan sampel' : 'Tandai responden penelitian'}
              sekunder
            >
              <KolomAlasan id="alasan-sampel" wajib={false} />
            </FormAksi>
          </div>
        </details>

        {atur.gerbang_pretest && (
          <details className="tanya">
            <summary>Tanda pretest</summary>
            <div className="tanya-isi">
              <FormAksi
                aksi={aksiPretest}
                data={{ ...data, selesai: p.pretest_selesai_pada ? 'tidak' : 'ya' }}
                label={p.pretest_selesai_pada ? 'Batalkan tanda pretest' : 'Tandai pretest selesai'}
                sekunder
              />
            </div>
          </details>
        )}

        {!r.mundur_pada && (
          <details className="tanya bahaya">
            <summary>{r.aktif ? 'Nonaktifkan akun' : 'Aktifkan kembali akun'}</summary>
            <div className="tanya-isi">
              <p>{r.aktif ? 'Responden tidak dapat masuk selama akun nonaktif. Data belajar tetap tersimpan.' : 'Responden dapat masuk kembali dengan token yang sama.'}</p>
              <FormAksi
                aksi={aksiStatusAkun}
                data={{ ...data, aktif: r.aktif ? 'tidak' : 'ya' }}
                label={r.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                bahaya={r.aktif}
                konfirmasi={r.aktif ? 'Nonaktifkan akun ini?' : undefined}
              >
                <KolomAlasan id="alasan-akun" />
              </FormAksi>
            </div>
          </details>
        )}
      </section>

      <section className="bagian-kartu" aria-labelledby="judul-riwayat">
        <h2 id="judul-riwayat">Riwayat akun</h2>
        {riwayat.length === 0 ? (
          <p>Belum ada catatan.</p>
        ) : (
          <ul>
            {riwayat.map((x) => (
              <li key={x._id.toHexString()}>
                {formatWaktu(x.waktu)} — {LABEL_RIWAYAT[x.jenis] ?? x.jenis} oleh {x.oleh}
                {x.alasan && ` (alasan: ${x.alasan})`}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
