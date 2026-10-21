import type { Metadata } from 'next';
import Link from 'next/link';
import GrafikGaris from '@/components/admin/GrafikGaris';
import Ikon, { type NamaIkon } from '@/components/Ikon';
import { wajibAdmin } from '@/lib/admin-auth';
import { aktivitasTerbaru, jumlahKonten, penggunaanHarian, waktuRelatif, type JenisAktivitas } from '@/lib/dashboard-admin';
import { ringkasanDashboard } from '@/lib/monitor';
import { formatWaktu } from '@/lib/waktu';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

const RENTANG = [7, 14, 30] as const;

const IKON_AKTIVITAS: Record<JenisAktivitas, { ikon: NamaIkon; warna: string }> = {
  konten: { ikon: 'dokumen', warna: 'biru' },
  kuis: { ikon: 'kuis', warna: 'oranye' },
  pengguna: { ikon: 'pengguna', warna: 'hijau' },
  versi: { ikon: 'lapisan', warna: 'ungu' },
  data: { ikon: 'grafik', warna: 'toska' },
  akun: { ikon: 'perisai', warna: 'abu' },
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ hari?: string }> }) {
  const admin = await wajibAdmin();
  const { hari: hariMentah } = await searchParams;
  const hari = RENTANG.find((r) => String(r) === hariMentah) ?? 7;
  const [konten, aktivitas, harian, { kartu, perMateri, perhatian, struktur }] = await Promise.all([
    jumlahKonten(),
    aktivitasTerbaru(5),
    penggunaanHarian(hari),
    ringkasanDashboard(),
  ]);

  const stat = [
    { angka: konten.modul, label: 'Modul', ket: 'Total modul tersedia', ikon: 'buku' as const, warna: 'biru', href: '/admin/konten/' },
    { angka: konten.materi, label: 'Materi', ket: 'Total halaman materi', ikon: 'dokumen' as const, warna: 'toska', href: '/admin/konten/materi/' },
    { angka: konten.soal, label: 'Pertanyaan Kuis', ket: `Dalam ${konten.modul} modul`, ikon: 'tanya' as const, warna: 'oranye', href: '/admin/konten/kuis/' },
    { angka: kartu.total, label: 'Pengguna', ket: 'Total peserta terdaftar', ikon: 'pengguna' as const, warna: 'hijau', href: '/admin/responden/?sampel=semua' },
  ];
  const statusBelajar = [
    { label: 'Responden penelitian', nilai: kartu.sampel, ket: `${kartu.bukan_sampel} bukan sampel` },
    { label: 'Belum mulai', nilai: kartu.belum, ket: 'sampel penelitian' },
    { label: 'Sedang belajar', nilai: kartu.sedang, ket: 'sampel penelitian' },
    { label: 'Selesai semua materi', nilai: kartu.selesai, ket: 'sampel penelitian' },
    { label: 'Tidak aktif', nilai: kartu.tidak_aktif, ket: `> ${kartu.batas_tidak_aktif_hari} hari tanpa aktivitas` },
    { label: 'Rata-rata progres', nilai: `${kartu.rata_persen}%`, ket: 'materi selesai' },
  ];

  return (
    <>
      <div className="dasbor-kepala">
        <h1>Dashboard</h1>
        <p>Selamat datang di panel administrator DASH Sehat.</p>
      </div>

      {konten.contoh && (
        <p className="kotak kotak-peringatan">
          🧪 Website sedang memakai <strong>konten contoh</strong>. Hapus atau ganti dengan konten yang sudah divalidasi sebelum responden
          penelitian mulai (<Link href="/admin/konten/">Kelola Modul</Link>
          {admin.peran === 'super_admin' ? (
            <>
              {' '}atau <Link href="/admin/versi/">Versi Konten</Link>
            </>
          ) : null}
          ).
        </p>
      )}

      <ul className="kartu-stat">
        {stat.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="kartu-stat-isi">
              <span className={`ubin-ikon ubin-${s.warna}`}>
                <Ikon nama={s.ikon} ukuran={24} />
              </span>
              <span className="kartu-stat-angka">{s.angka}</span>
              <span className="kartu-stat-label">{s.label}</span>
              <span className="kartu-stat-ket">{s.ket}</span>
            </Link>
          </li>
        ))}
      </ul>
      {!konten.aktif && konten.label && (
        <p className="label-kecil">Angka konten diambil dari versi kerja “{konten.label}” karena belum ada versi yang terbit.</p>
      )}

      <div className="dasbor-dua">
        <section className="kartu-panel" aria-labelledby="judul-aktivitas">
          <div className="kartu-panel-kepala">
            <h2 id="judul-aktivitas">Aktivitas Terbaru</h2>
            {admin.peran === 'super_admin' && <Link href="/admin/log/">Lihat semua</Link>}
          </div>
          {aktivitas.length === 0 ? (
            <p className="label-kecil">Belum ada aktivitas.</p>
          ) : (
            <ul className="daftar-aktivitas">
              {aktivitas.map((a, i) => (
                <li key={i}>
                  <span className={`ubin-ikon ubin-kecil ubin-${IKON_AKTIVITAS[a.jenis].warna}`}>
                    <Ikon nama={IKON_AKTIVITAS[a.jenis].ikon} ukuran={18} />
                  </span>
                  <span>
                    <span className="aktivitas-teks">{a.teks}</span>
                    <time className="aktivitas-waktu" dateTime={a.waktu.toISOString()} title={formatWaktu(a.waktu)}>
                      {waktuRelatif(a.waktu)}
                    </time>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="kartu-panel" aria-labelledby="judul-penggunaan">
          <div className="kartu-panel-kepala">
            <h2 id="judul-penggunaan">Progres Penggunaan Website</h2>
            <nav className="pilih-rentang" aria-label="Rentang waktu grafik">
              {RENTANG.map((r) => (
                <Link key={r} href={`?hari=${r}#judul-penggunaan`} aria-current={r === hari ? 'true' : undefined}>
                  {r} hari
                </Link>
              ))}
            </nav>
          </div>
          <GrafikGaris
            data={harian.map((h) => ({ label: h.label, nilai: h.aktif }))}
            satuan="responden aktif"
            judulTabel={`Responden penelitian aktif per hari, ${hari} hari terakhir`}
          />
          <p className="label-kecil">
            Responden penelitian yang punya kegiatan belajar tercatat per hari (daftar, membuka atau menyelesaikan materi,
            mengerjakan kuis). Ini indikator keterlibatan, bukan keberhasilan menurunkan tekanan darah.
          </p>
        </section>
      </div>

      <section className="kartu-panel" aria-labelledby="judul-status">
        <div className="kartu-panel-kepala">
          <h2 id="judul-status">Status Belajar Responden Penelitian</h2>
          <span className="label-kecil">
            Pendaftaran {kartu.pendaftaran_dibuka ? '🟢 dibuka' : '⛔ ditutup'} · <Link href="/admin/pengaturan/">ubah</Link>
          </span>
        </div>
        <ul className="kisi-kartu-angka">
          {statusBelajar.map((k) => (
            <li key={k.label} className="kartu kartu-angka">
              <span className="kartu-angka-label">{k.label}</span>
              <span className="kartu-angka-nilai">{k.nilai}</span>
              <span className="label-kecil">{k.ket}</span>
            </li>
          ))}
        </ul>
        <p className="label-kecil">
          Progres menunjukkan keterlaksanaan intervensi (materi yang dibuka dan diselesaikan), bukan keberhasilan menurunkan
          tekanan darah. Konten aktif: <strong>{struktur?.versi.label ?? 'belum ada versi terbit'}</strong>.
        </p>
      </section>

      <section className="kartu-panel" id="perhatian" aria-labelledby="judul-perhatian">
        <div className="kartu-panel-kepala">
          <h2 id="judul-perhatian">{perhatian.length ? `⚠ Perlu Perhatian (${perhatian.length})` : 'Perlu Perhatian'}</h2>
          {perhatian.length > 10 && <Link href="/admin/responden/?belajar=perhatian">Lihat semua</Link>}
        </div>
        {perhatian.length === 0 ? (
          <p className="label-kecil">✓ Tidak ada responden yang tidak aktif atau mendekati batas waktu intervensi.</p>
        ) : (
          <ul className="daftar-tautan">
            {perhatian.slice(0, 10).map((b) => (
              <li key={b.id_peserta}>
                <Link href={`/admin/responden/${b.id_peserta}/`}>{b.id_peserta}</Link> —{' '}
                {b.tidak_aktif ? `tidak aktif sejak ${formatWaktu(b.terakhir_aktif)}` : `hari ke-${b.hari_sejak_daftar}, progres ${b.persen}%`}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="kartu-panel" aria-labelledby="judul-per-materi">
        <div className="kartu-panel-kepala">
          <h2 id="judul-per-materi">Penyelesaian per Materi</h2>
          <Link href="/admin/laporan/">Analisis kuis →</Link>
        </div>
        <p className="label-kecil">Persentase responden penelitian yang sudah menyelesaikan kuis tiap materi.</p>
        {perMateri.length === 0 ? (
          <p>Belum ada konten terbit.</p>
        ) : (
          <ul className="grafik-batang">
            {perMateri.map((m) => (
              <li key={m.kunci} title={`${m.nomor} ${m.judul}: ${m.selesai} responden (${m.persen}%)`}>
                <span className="grafik-label">
                  <strong>{m.nomor}</strong> {m.judul}
                </span>
                <span className="grafik-jalur" aria-hidden="true">
                  <span className="grafik-isi" style={{ width: `${m.persen}%` }} />
                </span>
                <span className="grafik-nilai">
                  {m.persen}% <span className="label-kecil">({m.selesai})</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
