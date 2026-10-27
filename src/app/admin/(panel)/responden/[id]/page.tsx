import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { aksiBukaKunci, aksiLihatNomor, aksiPosttest, aksiPretest, aksiResetToken, aksiStatusAkun, aksiStatusSampel } from '../../../aksi-responden';
import { aksiPosttestResponden } from '../../../aksi-tes';
import { TombolEditResponden } from '@/components/admin/AksiResponden';
import EksporResponden from '@/components/admin/EksporResponden';
import { FormAksi } from '@/components/admin/FormAdmin';
import LihatKodeAkses from '@/components/admin/LihatKodeAkses';
import Ikon, { type NamaIkon } from '@/components/Ikon';
import LencanaStatusMateri from '@/components/belajar/StatusMateri';
import { wajibAdmin } from '@/lib/admin-auth';
import { waktuRelatif } from '@/lib/dashboard-admin';
import { samarkanNomorHp } from '@/lib/identitas';
import { detailResponden, LABEL_RIWAYAT, type DetailResponden as Detail, type StatusModul } from '@/lib/monitor';
import { jawabanResponden, type JawabanResponden } from '@/lib/tes';
import { formatDurasi, formatTanggal, formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Detail responden' };
export const dynamic = 'force-dynamic';

const TAB = [
  { id: 'ringkasan', label: 'Ringkasan Aktivitas' },
  { id: 'progres', label: 'Progres Materi & Modul' },
  { id: 'evaluasi', label: 'Evaluasi (Pretest & Posttest)' },
] as const;
type Tab = (typeof TAB)[number]['id'];

const LENCANA_MODUL: Record<StatusModul, { ikon: string; teks: string }> = {
  selesai: { ikon: '✓', teks: 'Selesai' },
  sedang: { ikon: '◐', teks: 'Sedang dibaca' },
  tersedia: { ikon: '○', teks: 'Belum dibaca' },
  terkunci: { ikon: '🔒', teks: 'Terkunci' },
};

const SAPAAN = new Set(['pak', 'bu', 'ibu', 'bapak', 'bpk', 'sdr', 'sdri', 'mbak', 'mas']);
function inisial(nama: string) {
  const kata = nama.split(/\s+/).filter((k) => k && !SAPAAN.has(k.toLowerCase().replace('.', '')));
  const pakai = kata.length ? kata : nama.split(/\s+/);
  return ((pakai[0]?.[0] ?? '') + (pakai.length > 1 ? pakai[pakai.length - 1][0] : '')).toUpperCase();
}

function KolomAlasan({ id, wajib = true }: { id: string; wajib?: boolean }) {
  return (
    <div className="bidang">
      <label htmlFor={id}>Alasan{wajib ? '' : ' (opsional)'}</label>
      <input id={id} name="alasan" required={wajib} minLength={wajib ? 5 : undefined} />
    </div>
  );
}

function KartuTahap({ judul, ikon, warna, angka, kiri, kanan }: { judul: string; ikon: NamaIkon; warna: string; angka: React.ReactNode; kiri: string; kanan: string }) {
  return (
    <li className="kartu-pengguna detail-tahap">
      <div className="kartu-pengguna-kepala">
        <span className="kartu-pengguna-judul">{judul}</span>
        <span className={`ubin-ikon ubin-kecil ubin-${warna}`} aria-hidden="true">
          <Ikon nama={ikon} ukuran={18} />
        </span>
      </div>
      <p className="kartu-pengguna-angka">{angka}</p>
      <p className="detail-tahap-kaki">
        <strong>{kiri}</strong>
        <span>{kanan}</span>
      </p>
    </li>
  );
}

function LencanaModul({ status, persen }: { status: StatusModul; persen: number }) {
  const d = LENCANA_MODUL[status];
  return (
    <span className={`lencana lencana-materi-${status}`}>
      <span aria-hidden="true">{d.ikon}</span> {d.teks}
      {status === 'selesai' || status === 'sedang' ? ` · ${persen}%` : ''}
    </span>
  );
}

function TabRingkasan({ d }: { d: Detail }) {
  const { modul, ringkasan, totalDetik } = d;
  const n = (s: StatusModul) => modul.filter((m) => m.status === s).length;
  const selesai = n('selesai');
  const persenModul = modul.length ? Math.round((selesai / modul.length) * 100) : 0;
  const persen = ringkasan?.persen ?? 0;
  return (
    <section className="kartu-panel" aria-labelledby="judul-progres-modul">
      <div className="kartu-panel-kepala">
        <div className="detail-judul-ikon">
          <span className="ubin-ikon ubin-kecil ubin-hijau" aria-hidden="true">
            <Ikon nama="buku" ukuran={18} />
          </span>
          <div>
            <h2 id="judul-progres-modul">Progres Pembacaan Modul Edukasi</h2>
            <p className="label-kecil">Pantauan keterlaksanaan dan akumulasi progres {modul.length} modul diet DASH</p>
          </div>
        </div>
        <span className="lencana lencana-materi-selesai">
          {selesai} dari {modul.length} Modul Selesai ({persenModul}%)
        </span>
      </div>

      <div className="detail-akumulasi">
        <div className="detail-akumulasi-kepala">
          <strong>
            <Ikon nama="grafik" ukuran={18} /> Total Akumulasi Pembacaan
          </strong>
          <strong>{persen}% materi dibuka</strong>
        </div>
        <div className="detail-batang detail-batang-besar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={persen} aria-label="Total materi dibuka">
          <span style={{ width: `${persen}%` }} />
        </div>
        <ul className="detail-legenda">
          <li>
            <span className="detail-titik titik-selesai" aria-hidden="true" /> {selesai} modul selesai
          </li>
          <li>
            <span className="detail-titik titik-sedang" aria-hidden="true" /> {n('sedang')} sedang dibaca
          </li>
          <li>
            <span className="detail-titik titik-belum" aria-hidden="true" /> {n('tersedia') + n('terkunci')} belum dibaca
          </li>
          <li className="detail-legenda-durasi">
            <Ikon nama="jam" ukuran={16} /> Durasi total: {formatDurasi(totalDetik)}
          </li>
        </ul>
      </div>

      {modul.length === 0 ? (
        <p>Belum ada versi konten aktif.</p>
      ) : (
        <ol className="detail-modul">
          {modul.map((m) => (
            <li key={m.kunci} className={`detail-modul-baris modul-${m.status}`}>
              <span className="detail-modul-no" aria-hidden="true">
                M{m.nomor}
              </span>
              <div className="detail-modul-info">
                <p className="detail-modul-judul">
                  <span className="sr-only">Modul {m.nomor}: </span>
                  {m.judul} <LencanaModul status={m.status} persen={m.persen} />
                </p>
                <p className="label-kecil detail-modul-meta">
                  <span>
                    <Ikon nama="jam" ukuran={14} /> Estimasi {m.menit} mnt
                  </span>
                  <span>
                    {m.selesai}/{m.total} materi dibuka
                  </span>
                  {m.detik_baca > 0 && <span>Lama baca {formatDurasi(m.detik_baca)}</span>}
                  {m.terakhir_dibuka && <span>Terakhir {formatWaktu(m.terakhir_dibuka)}</span>}
                </p>
              </div>
              <div className="detail-modul-progres">
                <span className="label-kecil">
                  Progres <strong>{m.persen}%</strong>
                </span>
                <div className="detail-batang" aria-hidden="true">
                  <span style={{ width: `${m.persen}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="label-kecil">Progres = materi yang sudah dibuka (keterlaksanaan intervensi), bukan hasil klinis.</p>
    </section>
  );
}

function TabProgres({ d }: { d: Detail }) {
  return (
    <section className="kartu-panel" aria-labelledby="judul-garis">
      <div className="kartu-panel-kepala">
        <h2 id="judul-garis">Garis waktu belajar per materi</h2>
        <span className="lencana lencana-materi-tersedia">
          {d.ringkasan ? `${d.ringkasan.selesai}/${d.ringkasan.total} materi dibuka` : 'Belum ada konten'}
        </span>
      </div>
      <div className="tabel-gulir">
        <table className="tabel-admin">
          <thead>
            <tr>
              <th scope="col">Materi</th>
              <th scope="col">Status</th>
              <th scope="col">Dibuka</th>
              <th scope="col">Waktu baca</th>
              <th scope="col">Versi konten</th>
            </tr>
          </thead>
          {d.modul.map((m) => (
            <tbody key={m.kunci}>
              <tr className="detail-baris-modul">
                <th scope="colgroup" colSpan={5}>
                  Modul {m.nomor} · {m.judul} ({m.selesai}/{m.total})
                </th>
              </tr>
              {d.garisWaktu
                .filter((g) => g.materi.modul.kunci === m.kunci)
                .map((g) => (
                  <tr key={g.materi.kunci}>
                    <th scope="row">
                      {g.materi.nomor} {g.materi.judul}
                      {g.buka_manual && <div className="label-kecil">🔓 Dibuka manual: {g.buka_manual.alasan}</div>}
                    </th>
                    <td>
                      <LencanaStatusMateri status={g.status} />
                    </td>
                    <td>{formatWaktu(g.dibuka_pada)}</td>
                    <td>{formatDurasi(g.detik_baca)}</td>
                    <td>{g.versi}</td>
                  </tr>
                ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}

function KartuTes({ t, manual, ket }: { t: JawabanResponden['pretest']; manual: Date | null | undefined; ket: string }) {
  const judul = t.jenis === 'pretest' ? 'Pretest' : 'Posttest';
  const j = t.jawaban;
  return (
    <section className="kartu-panel" aria-labelledby={`judul-${t.jenis}`}>
      <div className="kartu-panel-kepala">
        <div className="detail-judul-ikon">
          <span className={`ubin-ikon ubin-kecil ${t.jenis === 'pretest' ? 'ubin-hijau' : 'ubin-oranye'}`} aria-hidden="true">
            <Ikon nama="kuis" ukuran={18} />
          </span>
          <div>
            <h2 id={`judul-${t.jenis}`}>{judul}</h2>
            <p className="label-kecil">{j ? `Dikirim ${formatWaktu(j.dikirim_pada)}` : manual ? `Ditandai manual ${formatWaktu(manual)} (dikerjakan di kertas)` : ket}</p>
          </div>
        </div>
        {j ? (
          <span className="lencana lencana-materi-selesai">✓ Sudah mengisi</span>
        ) : (
          <span className="lencana lencana-materi-terkunci">○ Belum mengisi online</span>
        )}
      </div>
      {j && (
        <>
          <dl className="detail-skor">
            <div>
              <dt>Skor</dt>
              <dd>{j.skor === null ? 'Tanpa kunci' : `${j.skor}/100`}</dd>
            </div>
            <div>
              <dt>Jawaban benar</dt>
              <dd>
                {j.benar}/{j.total_berkunci}
              </dd>
            </div>
            <div>
              <dt>Soal dijawab</dt>
              <dd>
                {t.butir.filter((b) => b.jawaban !== '—').length}/{t.butir.length}
              </dd>
            </div>
          </dl>
          <div className="tabel-gulir">
            <table className="tabel-admin">
              <thead>
                <tr>
                  <th scope="col">No.</th>
                  <th scope="col">Soal</th>
                  <th scope="col">Jawaban responden</th>
                  <th scope="col">Hasil</th>
                </tr>
              </thead>
              <tbody>
                {t.butir.map((b) => (
                  <tr key={b.nomor}>
                    <td>{b.nomor}</td>
                    <th scope="row">{b.teks}</th>
                    <td>{b.jawaban}</td>
                    <td>
                      {b.hasil === 'benar' ? (
                        <span className="lencana lencana-materi-selesai">✓ Benar</span>
                      ) : b.hasil === 'salah' ? (
                        <>
                          <span className="lencana lencana-salah">✗ Belum tepat</span>
                          <div className="label-kecil">Kunci: {b.kunci_teks}</div>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="label-kecil">Skor dan kunci hanya untuk peneliti; responden tidak melihatnya.</p>
    </section>
  );
}

export default async function DetailResponden({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const admin = await wajibAdmin();
  const [{ id }, { tab: tabMinta }] = await Promise.all([params, searchParams]);
  const d = await detailResponden(id);
  if (!d) notFound();
  const { r, p, ringkasan, modul, riwayat, atur, totalDetik, hariKe } = d;
  const tes = await jawabanResponden(r._id);
  const tab: Tab = TAB.some((t) => t.id === tabMinta) ? (tabMinta as Tab) : 'ringkasan';
  const data = { id_peserta: p.id_peserta };
  const terkunci = (ringkasan?.daftar ?? []).filter((x) => x.status === 'terkunci');
  const statusAkun = r.mundur_pada ? 'Mengundurkan diri' : r.aktif ? 'Aktif' : 'Nonaktif';
  const sampel = p.status_sampel === 'responden_penelitian';
  const semuaDibaca = !!ringkasan && ringkasan.total > 0 && ringkasan.selesai >= ringkasan.total;
  const statusBelajar = semuaDibaca ? 'Semua materi dibaca' : ringkasan?.selesai ? 'Sedang belajar' : 'Belum mulai';
  const modulSelesai = modul.filter((m) => m.status === 'selesai').length;
  const pre = tes.pretest.jawaban;
  const post = tes.posttest.jawaban;
  const posttestSelesai = !!post || !!p.posttest_selesai_pada;

  const langkah: { judul: string; ket: string } = r.mundur_pada
    ? { judul: 'Mengundurkan diri', ket: 'Tidak ada tindak lanjut belajar.' }
    : !r.aktif
      ? { judul: 'Akun nonaktif', ket: 'Aktifkan kembali bila responden melanjutkan.' }
      : atur.gerbang_pretest && !pre && !p.pretest_selesai_pada
        ? { judul: 'Mengisi pretest', ket: 'Responden diminta mengisi pretest sebelum mulai belajar.' }
        : ringkasan?.lanjut
          ? {
              judul: `Membaca Materi ${ringkasan.lanjut.materi.nomor}`,
              ket: `${ringkasan.lanjut.materi.judul} · Modul ${ringkasan.lanjut.materi.modul.nomor}`,
            }
          : !posttestSelesai
            ? p.posttest_dibuka_pada
              ? { judul: 'Mengisi posttest', ket: 'Posttest sudah dibuka, menunggu diisi responden.' }
              : { judul: 'Menunggu posttest dibuka', ket: 'Semua materi sudah dibaca. Buka posttest bila sudah waktunya.' }
            : { judul: 'Semua tahap selesai', ket: 'Materi dan posttest sudah dikerjakan.' };

  return (
    <div className="detail-responden">
      <p>
        <Link className="tombol tombol-sekunder tombol-kecil" href="/admin/responden/">
          ← Kembali ke Daftar Pengguna
        </Link>
      </p>

      <header className="kartu-panel detail-kepala">
        <div className="detail-profil">
          <span className="detail-avatar" aria-hidden="true">
            {inisial(r.nama)}
            <span className={`detail-avatar-titik${r.aktif && !r.mundur_pada ? ' aktif' : ''}`} />
          </span>
          <div className="detail-profil-teks">
            <div className="detail-nama-baris">
              <h1>{r.nama}</h1>
              <span className="lencana lencana-materi-selesai">ID: {p.id_peserta}</span>
              <span className={`lencana ${sampel ? 'lencana-materi-tersedia' : 'lencana-materi-terkunci'}`}>
                {sampel ? 'Kelompok Penelitian' : 'Bukan Sampel'}
              </span>
            </div>
            <ul className="detail-meta">
              <li>
                <Ikon nama="jam" ukuran={16} /> Terakhir aktif: {waktuRelatif(r.terakhir_aktif)}
              </li>
              <li>
                <Ikon nama="jam-pasir" ukuran={16} /> Total durasi belajar: {formatDurasi(totalDetik)}
              </li>
              <li>
                <Ikon nama="telepon" ukuran={16} /> HP: {samarkanNomorHp(r.nomor_hp)}
              </li>
              <li>
                <Ikon nama="orang" ukuran={16} /> Akun {statusAkun.toLowerCase()} · daftar {formatTanggal(r.dibuat_pada)}
              </li>
            </ul>
          </div>
        </div>
        <div className="grup-tombol detail-alat">
          <TombolEditResponden
            b={{ id_peserta: p.id_peserta, nama: r.nama, nomor_samar: samarkanNomorHp(r.nomor_hp), sampel, pretest: !!p.pretest_selesai_pada, posttest: !!p.posttest_selesai_pada }}
          />
          <EksporResponden idPeserta={p.id_peserta} />
        </div>
      </header>

      <ul className="kisi-kartu-pengguna detail-tahap-kisi">
        <KartuTahap
          judul="1. Pretest"
          ikon="kuis"
          warna="hijau"
          angka={
            pre ? (
              pre.skor === null ? 'Selesai' : (
                <>
                  {pre.skor}
                  <span className="kartu-pengguna-sub"> /100</span>
                </>
              )
            ) : p.pretest_selesai_pada ? 'Selesai' : 'Belum'
          }
          kiri={pre ? `${tes.pretest.butir.filter((b) => b.jawaban !== '—').length} soal dijawab` : p.pretest_selesai_pada ? 'Ditandai manual' : 'Belum mengisi'}
          kanan={formatTanggal(pre?.dikirim_pada ?? p.pretest_selesai_pada)}
        />
        <KartuTahap
          judul="2. Baca Modul"
          ikon="buku"
          warna="biru"
          angka={
            <>
              {modulSelesai} / {modul.length}
              <span className="kartu-pengguna-sub"> modul</span>
            </>
          }
          kiri={`${ringkasan?.persen ?? 0}% materi dibuka`}
          kanan={formatDurasi(totalDetik)}
        />
        <KartuTahap
          judul="3. Posttest"
          ikon="kuis"
          warna="oranye"
          angka={
            post ? (
              post.skor === null ? 'Selesai' : (
                <>
                  {post.skor}
                  <span className="kartu-pengguna-sub"> /100</span>
                </>
              )
            ) : p.posttest_selesai_pada ? 'Selesai' : 'Belum'
          }
          kiri={post ? `Dikirim ${formatTanggal(post.dikirim_pada)}` : p.posttest_selesai_pada ? 'Ditandai manual' : p.posttest_dibuka_pada ? 'Dibuka, menunggu diisi' : 'Belum dibuka'}
          kanan={`Hari ke-${hariKe} dari ${atur.batas_intervensi_hari}`}
        />
      </ul>

      <nav className="detail-tab" aria-label="Bagian detail responden">
        {TAB.map((t) => (
          <Link key={t.id} href={`?tab=${t.id}`} scroll={false} aria-current={tab === t.id ? 'page' : undefined}>
            {t.id === 'progres' ? `Progres Materi & Modul (${modul.length} Modul)` : t.label}
          </Link>
        ))}
      </nav>

      <div className="detail-kisi">
        <div className="detail-utama">
          {tab === 'ringkasan' && <TabRingkasan d={d} />}
          {tab === 'progres' && <TabProgres d={d} />}
          {tab === 'evaluasi' && (
            <>
              <KartuTes t={tes.pretest} manual={pre ? null : p.pretest_selesai_pada} ket="Belum mengisi pretest." />
              <KartuTes
                t={tes.posttest}
                manual={post ? null : p.posttest_selesai_pada}
                ket={p.posttest_dibuka_pada ? `Dibuka ${formatWaktu(p.posttest_dibuka_pada)}, belum diisi.` : 'Posttest belum dibuka untuk responden ini.'}
              />
            </>
          )}
        </div>

        <aside className="detail-samping" aria-label="Status dan tindakan">
          <section className="kartu-panel" aria-labelledby="judul-status-riset">
            <div className="detail-judul-ikon">
              <span className="ubin-ikon ubin-kecil ubin-hijau" aria-hidden="true">
                <Ikon nama="pengguna" ukuran={18} />
              </span>
              <h2 id="judul-status-riset">Status Peserta Riset</h2>
            </div>
            <div className="detail-status-kotak">
              <p className="label-kecil">Akun partisipan</p>
              <p>
                <span className={`detail-titik ${r.aktif && !r.mundur_pada ? 'titik-selesai' : 'titik-belum'}`} aria-hidden="true" />{' '}
                <strong>{statusAkun}</strong> · {statusBelajar}
              </p>
            </div>
            <div className="detail-status-kotak detail-langkah">
              <p className="label-kecil">Langkah berikutnya</p>
              <p>
                <strong>{langkah.judul}</strong>
              </p>
              <p className="label-kecil">{langkah.ket}</p>
            </div>
            {!post && r.aktif && !r.mundur_pada && (
              <FormAksi
                aksi={aksiPosttestResponden}
                data={{ ...data, buka: p.posttest_dibuka_pada ? 'tidak' : 'ya' }}
                label={p.posttest_dibuka_pada ? 'Tutup posttest' : 'Buka posttest'}
                sekunder={!!p.posttest_dibuka_pada || !semuaDibaca}
                konfirmasi={p.posttest_dibuka_pada ? 'Tutup posttest untuk responden ini?' : 'Buka posttest untuk responden ini?'}
              />
            )}
          </section>

          <section className="kartu-panel" aria-labelledby="judul-kontak">
            <h2 id="judul-kontak">Kontak & akses</h2>
            <dl className="detail-data">
              <div>
                <dt>Nomor HP</dt>
                <dd>
                  {samarkanNomorHp(r.nomor_hp)}
                  <FormAksi aksi={aksiLihatNomor} data={data} label="Lihat nomor lengkap" sekunder konfirmasi="Membuka nomor lengkap akan tercatat di log audit. Lanjutkan?" />
                </dd>
              </div>
              {admin.peran === 'super_admin' && (
                <div>
                  <dt>Kode akses</dt>
                  <dd>
                    <LihatKodeAkses idPeserta={p.id_peserta} />
                    <span className="label-kecil">Hanya super admin; setiap pembukaan tercatat di log.</span>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="kartu-panel" aria-labelledby="judul-tindakan">
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
                  data={{ ...data, status: sampel ? 'bukan_sampel' : 'responden_penelitian' }}
                  label={sampel ? 'Tandai bukan sampel' : 'Tandai responden penelitian'}
                  sekunder
                >
                  <KolomAlasan id="alasan-sampel" wajib={false} />
                </FormAksi>
              </div>
            </details>

            {atur.gerbang_pretest && (
              <details className="tanya">
                <summary>Tanda pretest manual</summary>
                <div className="tanya-isi">
                  <p className="label-kecil">Hanya bila pretest dikerjakan di kertas. Pretest online menandai selesai secara otomatis.</p>
                  <FormAksi
                    aksi={aksiPretest}
                    data={{ ...data, selesai: p.pretest_selesai_pada ? 'tidak' : 'ya' }}
                    label={p.pretest_selesai_pada ? 'Batalkan tanda pretest' : 'Tandai pretest selesai'}
                    sekunder
                  />
                </div>
              </details>
            )}

            <details className="tanya">
              <summary>Tanda posttest manual</summary>
              <div className="tanya-isi">
                <p className="label-kecil">Hanya bila posttest dikerjakan di kertas. Posttest online menandai selesai secara otomatis.</p>
                <FormAksi
                  aksi={aksiPosttest}
                  data={{ ...data, selesai: p.posttest_selesai_pada ? 'tidak' : 'ya' }}
                  label={p.posttest_selesai_pada ? 'Batalkan tanda posttest' : 'Tandai posttest selesai'}
                  sekunder
                />
              </div>
            </details>

            {!r.mundur_pada && (
              <details className="tanya bahaya">
                <summary>{r.aktif ? 'Nonaktifkan akun' : 'Aktifkan kembali akun'}</summary>
                <div className="tanya-isi">
                  <p>{r.aktif ? 'Responden tidak dapat masuk selama akun nonaktif. Data belajar tetap tersimpan.' : 'Responden dapat masuk kembali dengan kode akses yang sama.'}</p>
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

          <section className="kartu-panel" aria-labelledby="judul-riwayat">
            <h2 id="judul-riwayat">Riwayat akun</h2>
            {riwayat.length === 0 ? (
              <p className="label-kecil">Belum ada catatan.</p>
            ) : (
              <ul className="detail-riwayat">
                {riwayat.map((x) => (
                  <li key={x._id.toHexString()}>
                    <strong>{LABEL_RIWAYAT[x.jenis] ?? x.jenis}</strong>
                    <span className="label-kecil">
                      {formatWaktu(x.waktu)} · oleh {x.oleh}
                      {x.alasan && ` · alasan: ${x.alasan}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
