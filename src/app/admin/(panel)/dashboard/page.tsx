import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GrafikGaris from '@/components/admin/GrafikGaris';
import TabelMonitor, { type BarisMonitor } from '@/components/admin/TabelMonitor';
import Ikon from '@/components/Ikon';
import { srcGambarModul } from '@/data/gambar';
import { wajibAdmin } from '@/lib/admin-auth';
import { barisMonitorResponden, jumlahKonten, penggunaanMingguan } from '@/lib/dashboard-admin';
import { ringkasanDashboard } from '@/lib/monitor';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

const RENTANG_MINGGU = [4, 8, 12] as const;

// Dashboard admin & super admin (PRD 11.1). Semua angka = keterlaksanaan intervensi (materi dibuka, lama membaca),
// bukan data klinis: website tidak menyimpan tekanan darah, dan pretest/posttest dikerjakan di luar website.
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ minggu?: string }> }) {
  const admin = await wajibAdmin();
  const { minggu: mentah } = await searchParams;
  const minggu = RENTANG_MINGGU.find((r) => String(r) === mentah) ?? 8;
  const [konten, mingguan, { kartu, struktur, baris }] = await Promise.all([jumlahKonten(), penggunaanMingguan(minggu), ringkasanDashboard()]);

  const stat = [
    { angka: konten.modul, label: 'Modul', ket: 'Total modul tersedia', ikon: 'buku' as const, warna: 'biru', href: '/admin/konten/' },
    { angka: konten.materi, label: 'Materi', ket: 'Total halaman materi', ikon: 'dokumen' as const, warna: 'toska', href: '/admin/konten/materi/' },
    { angka: `${kartu.rata_persen}%`, label: 'Rata-rata Progres', ket: 'Materi dibaca responden penelitian', ikon: 'grafik' as const, warna: 'oranye', href: '/admin/laporan/' },
    { angka: kartu.total, label: 'Pengguna', ket: 'Total peserta terdaftar', ikon: 'pengguna' as const, warna: 'hijau', href: '/admin/responden/?sampel=semua' },
  ];

  const sekarang = Date.now();
  const barisMonitor: BarisMonitor[] = baris.map((b) => barisMonitorResponden(b, sekarang));

  // Per modul: berapa responden penelitian yang sudah mulai dan sudah menuntaskan modul.
  const sampel = baris.filter((b) => b.status_sampel === 'responden_penelitian');
  const perModul = (struktur?.modul ?? []).map((md) => {
    const kunci = new Set(md.materi.map((m) => m.kunci));
    const status = sampel.map((b) => b.ringkasan?.daftar.filter((d) => kunci.has(d.materi.kunci)) ?? []);
    const mulai = status.filter((d) => d.some((x) => x.status === 'selesai')).length;
    const tuntas = status.filter((d) => d.length > 0 && d.every((x) => x.status === 'selesai')).length;
    const persen = (n: number) => (sampel.length ? Math.round((n / sampel.length) * 100) : 0);
    return { md, mulai, tuntas, persenMulai: persen(mulai), persenTuntas: persen(tuntas), menit: md.materi.reduce((n, m) => n + m.menit, 0) };
  });
  const labelVersi = struktur ? (struktur.versi.contoh ? '🧪 Contoh' : struktur.versi.status === 'dikunci' ? `🔒 ${struktur.versi.label}` : `Terbit · ${struktur.versi.label}`) : null;
  const perhatian = barisMonitor.filter((b) => b.sampel && b.status_akun === 'aktif' && (b.tidak_aktif || b.mendekati_batas)).length;

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

      {/* 1. Daftar responden & monitoring harian */}
      <section className="kartu-panel" aria-labelledby="judul-monitor">
        <div className="dasbor-bagian-kepala">
          <div>
            <h2 id="judul-monitor">
              <span className="ubin-ikon ubin-kecil ubin-hijau" aria-hidden="true">
                <Ikon nama="pengguna" ukuran={18} />
              </span>
              Daftar Responden & Monitoring Harian
            </h2>
            <p className="label-kecil">
              Pantau keterlaksanaan belajar setiap responden: progres materi, aktivitas terakhir, dan lama membaca.
              {perhatian > 0 && ` ${perhatian} responden penelitian perlu perhatian.`} Pendaftaran{' '}
              {kartu.pendaftaran_dibuka ? '🟢 dibuka' : '⛔ ditutup'} (<Link href="/admin/pengaturan/">ubah</Link>).
            </p>
          </div>
          <div className="grup-tombol">
            <Link className="tombol tombol-sekunder tombol-kecil" href="/admin/laporan/#ekspor">
              <Ikon nama="grafik" ukuran={18} /> Unduh Data
            </Link>
            <Link className="tombol tombol-kecil" href="/admin/responden/?sampel=semua">
              <Ikon nama="pengguna" ukuran={18} /> Kelola Responden
            </Link>
          </div>
        </div>
        <TabelMonitor baris={barisMonitor} />
      </section>

      {/* 2. Status modul pembelajaran */}
      <section aria-labelledby="judul-status-modul">
        <div className="dasbor-bagian-kepala">
          <div>
            <p className="label-kecil dasbor-label">Konten & Manajemen Sistem</p>
            <h2 id="judul-status-modul" className="dasbor-judul-besar">
              Status Modul Pembelajaran
            </h2>
            <p className="label-kecil">
              Konten aktif: <strong>{struktur?.versi.label ?? 'belum ada versi terbit'}</strong>. Persentase dihitung dari {sampel.length}{' '}
              responden penelitian.
            </p>
          </div>
          <div className="grup-tombol">
            {admin.peran === 'super_admin' && (
              <Link className="tombol tombol-sekunder tombol-kecil" href="/admin/versi/">
                <Ikon nama="lapisan" ukuran={18} /> Versi Konten
              </Link>
            )}
            <Link className="tombol tombol-kecil" href="/admin/konten/">
              <Ikon nama="buku" ukuran={18} /> Kelola Modul
            </Link>
          </div>
        </div>
        {perModul.length === 0 ? (
          <p className="kotak">Belum ada konten terbit. Buat dan terbitkan modul di Kelola Modul.</p>
        ) : (
          <ul className="kisi-status-modul">
            {perModul.map(({ md, tuntas, persenTuntas, menit }) => (
              <li key={md.kunci} className="kartu-status-modul">
                <div className="kartu-status-modul-atas">
                  <span className="tag-resep tag-resep-waktu">Modul {md.nomor}</span>
                  {labelVersi && <span className="lencana lencana-materi-selesai">{labelVersi}</span>}
                </div>
                <div className="kartu-status-modul-isi">
                  <div>
                    <h3>{md.judul}</h3>
                    <p className="label-kecil">{md.deskripsi}</p>
                  </div>
                  <Image src={srcGambarModul(md.gambar)} alt="" width={84} height={66} unoptimized={md.gambar.jenis === 'unggah'} />
                </div>
                <p className="kartu-status-modul-meta">
                  <span>
                    <Ikon nama="dokumen" ukuran={16} /> {md.materi.length} materi · ±{menit} mnt
                  </span>
                  <span>
                    <strong>{persenTuntas}%</strong> tuntas ({tuntas})
                  </span>
                </p>
                <div className="bilah-progres" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={persenTuntas} aria-label={`Responden yang menuntaskan Modul ${md.nomor}`}>
                  <div style={{ width: `${persenTuntas}%` }} />
                </div>
                <div className="kartu-status-modul-aksi">
                  <Link className="tombol tombol-sekunder tombol-kecil" href={`/admin/konten/modul/${md.kunci}/`}>
                    Edit Modul
                  </Link>
                  {md.materi[0] && (
                    <Link className="tombol tombol-sekunder tombol-kecil" href={`/admin/konten/pratinjau/${md.materi[0].kunci}/`}>
                      Pratinjau
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. Visualisasi keterlaksanaan & keterlibatan */}
      <section aria-labelledby="judul-visual">
        <h2 id="judul-visual" className="dasbor-judul-besar">
          Visualisasi Keterlaksanaan & Keterlibatan
        </h2>
        <p className="label-kecil">
          Menggambarkan sejauh mana intervensi edukasi dijalankan responden (fidelity), bukan perubahan tekanan darah atau skor
          pengetahuan. Pretest dan posttest dikerjakan di luar website.
        </p>
        <div className="dasbor-dua">
          <section className="kartu-panel" aria-labelledby="judul-per-modul">
            <div className="kartu-panel-kepala">
              <h3 id="judul-per-modul">Mulai vs Tuntas per Modul</h3>
              <Link href="/admin/laporan/">Laporan per materi →</Link>
            </div>
            {perModul.length === 0 ? (
              <p className="label-kecil">Belum ada konten terbit.</p>
            ) : (
              <ol className="grafik-dua-batang">
                {perModul.map(({ md, mulai, tuntas, persenMulai, persenTuntas }) => (
                  <li key={md.kunci}>
                    <p className="grafik-dua-judul">
                      <strong>{md.nomor}.</strong> {md.judul}
                    </p>
                    <div className="grafik-dua-baris" title={`Mulai: ${mulai} responden`}>
                      <span className="grafik-dua-jalur" aria-hidden="true">
                        <span className="grafik-dua-isi grafik-dua-mulai" style={{ width: `${persenMulai}%` }} />
                      </span>
                      <span className="grafik-dua-nilai">Mulai {persenMulai}%</span>
                    </div>
                    <div className="grafik-dua-baris" title={`Tuntas: ${tuntas} responden`}>
                      <span className="grafik-dua-jalur" aria-hidden="true">
                        <span className="grafik-dua-isi grafik-dua-tuntas" style={{ width: `${persenTuntas}%` }} />
                      </span>
                      <span className="grafik-dua-nilai">Tuntas {persenTuntas}%</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <p className="grafik-dua-legenda label-kecil">
              <span className="grafik-dua-titik grafik-dua-mulai" aria-hidden="true" /> Sudah membuka ≥1 materi
              <span className="grafik-dua-titik grafik-dua-tuntas" aria-hidden="true" /> Semua materi modul dibuka
            </p>
          </section>

          <section className="kartu-panel" aria-labelledby="judul-tren">
            <div className="kartu-panel-kepala">
              <h3 id="judul-tren">Tren Keterlibatan Mingguan</h3>
              <nav className="pilih-rentang" aria-label="Rentang waktu grafik">
                {RENTANG_MINGGU.map((r) => (
                  <Link key={r} href={`?minggu=${r}#judul-tren`} aria-current={r === minggu ? 'true' : undefined}>
                    {r} minggu
                  </Link>
                ))}
              </nav>
            </div>
            <GrafikGaris
              data={mingguan.map((m) => ({ label: m.label, nilai: m.aktif }))}
              satuan="responden aktif"
              judulTabel={`Responden penelitian aktif per minggu, ${minggu} minggu terakhir`}
            />
            <p className="label-kecil">
              Jumlah responden penelitian yang mendaftar atau membuka materi dalam 7 hari yang berakhir pada tanggal di sumbu bawah. Indikator keterlibatan, bukan
              hasil klinis.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
