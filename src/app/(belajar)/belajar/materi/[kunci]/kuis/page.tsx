import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { aksiMulaiKuis } from '@/app/aksi-responden';
import KuisMateri from '@/components/belajar/KuisMateri';
import KepalaHalaman from '@/components/KepalaHalaman';
import { koleksi } from '@/lib/db';
import { ambilSoalKuis, strukturAktif } from '@/lib/konten';
import { hasilJawaban, statusResponden, tanpaKunci } from '@/lib/progres';
import { wajibResponden } from '@/lib/responden';

export const metadata: Metadata = { title: 'Kuis' };

export default async function HalamanKuis({ params }: { params: Promise<{ kunci: string }> }) {
  const a = await wajibResponden();
  const { kunci } = await params;
  const struktur = await strukturAktif();
  if (!struktur) redirect('/belajar/');
  const r = await statusResponden(a, struktur);
  const s = r.daftar.find((d) => d.materi.kunci === kunci);
  if (!s || !s.materi.kuis) notFound();
  if (s.status === 'terkunci') redirect(r.lanjut ? `${r.lanjut.url}?pesan=terkunci` : '/belajar/?pesan=terkunci');
  const m = s.materi;
  const kuis = m.kuis!;

  const { percobaan } = await koleksi();
  const berjalan = await percobaan.findOne({ respondent_id: a.r._id, kuis_kunci: kuis.kunci, selesai_pada: null });
  const remah = [
    { href: '/belajar/modul/', label: 'Modul Pembelajaran' },
    { href: `/belajar/modul/${m.modul.kunci}/`, label: `Modul ${m.modul.nomor}` },
    { href: `/belajar/materi/${m.kunci}/`, label: `Materi ${m.nomor}` },
  ];

  if (!berjalan) {
    return (
      <>
        <KepalaHalaman remah={remah} label={`Kuis Materi ${m.nomor}`} judul={kuis.judul} ringkasan={kuis.petunjuk} />
        <div className="wadah-baca bagian-isi">
          <div className="kartu">
            <p>
              Kuis ini berisi <strong>{kuis.jumlah_soal} soal</strong>. Setiap jawaban langsung disimpan, jadi Anda bisa
              melanjutkan bila halaman tertutup.{' '}
              {kuis.mode === 'A'
                ? 'Kuis dianggap selesai setelah semua soal dijawab, berapa pun nilainya.'
                : `Materi berikutnya terbuka bila nilai Anda mencapai ${kuis.batas_lulus}%. Tidak ada batas jumlah percobaan.`}
            </p>
            <form action={aksiMulaiKuis}>
              <input type="hidden" name="materi" value={m.kunci} />
              <button type="submit" className="tombol tombol-besar">
                Mulai Kuis
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  const soal = await ambilSoalKuis(berjalan.version_id, kuis.kunci);
  const urut = berjalan.urutan_soal.map((k) => soal.find((x) => x.kunci === k)).filter((x) => !!x);
  const berikut = r.daftar[m.indeks + 1];
  return (
    <>
      <KepalaHalaman remah={remah} label={`Kuis Materi ${m.nomor}`} judul={kuis.judul} />
      <div className="wadah-baca bagian-isi">
        <div className="kartu kartu-kuis">
          <KuisMateri
            percobaanId={berjalan._id.toHexString()}
            soal={urut.map(tanpaKunci)}
            terjawab={hasilJawaban(berjalan, urut)}
            mode={berjalan.mode}
            batasLulus={berjalan.batas_lulus}
            nomorMateri={m.nomor}
            urlMateri={`/belajar/materi/${m.kunci}/`}
            urlBerikut={berikut ? `/belajar/materi/${berikut.materi.kunci}/` : '/belajar/selesai/'}
            labelBerikut={berikut ? 'Lanjut ke Materi Berikutnya' : 'Lihat Halaman Selesai'}
            percobaanKe={berjalan.percobaan_ke}
          />
        </div>
        <p className="label-kecil">Kuis ini latihan pembelajaran, bukan pretest atau posttest penelitian.</p>
      </div>
    </>
  );
}
