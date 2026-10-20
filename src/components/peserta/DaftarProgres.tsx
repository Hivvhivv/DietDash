import Image from 'next/image';
import Link from 'next/link';
import { GAMBAR_ILUSTRASI } from '@/data/gambar';
import type { NamaIlustrasi } from '@/lib/skema';
import {
  ringkasanProgres,
  statusModul,
  type DataProgres,
  type ModulUntukProgres,
} from '@/lib/status-progres';

const LABEL = { selesai: '✓ Selesai', sedang: '◐ Sedang dipelajari', belum: '○ Belum dimulai' } as const;

// Tampilan progres (tanpa hook, bisa dipakai komponen server maupun klien).
// Progres = materi yang sudah dibuka, BUKAN ukuran keberhasilan kesehatan.
export default function DaftarProgres({ modul, data }: { modul: ModulUntukProgres[]; data: DataProgres }) {
  const r = ringkasanProgres(modul, data);
  const kuis = data.latihan['semua'];

  return (
    <>
      <section className="kartu progres-ringkas" aria-labelledby="judul-progres">
        <h2 id="judul-progres">Progres modul</h2>
        <p className="progres-angka">
          <strong>{r.persen}%</strong> · {r.dibaca} dari {r.total} materi sudah dibuka
        </p>
        <div
          className="bilah-progres"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={r.persen}
          aria-label="Persentase materi yang sudah dibuka"
        >
          <div style={{ width: `${r.persen}%` }} />
        </div>
        {r.lanjut ? (
          <Link className="tombol tombol-besar" href={`/materi/${r.lanjut.modulId}/${r.lanjut.nomor}/`}>
            {r.dibaca ? 'Lanjutkan Belajar' : 'Mulai Belajar'} <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <p className="pesan-sukses">Semua materi sudah Anda buka. Anda bisa membacanya lagi kapan saja.</p>
        )}
        {r.lanjut && <p className="label-kecil">Berikutnya: {r.lanjut.judul}</p>}
      </section>

      <ol className="daftar-progres">
        {modul.map((m) => {
          const s = statusModul(m, data);
          const latihan = data.latihan[m.id];
          return (
            <li key={m.id} className="kartu">
              <Image src={GAMBAR_ILUSTRASI[m.ilustrasi as NamaIlustrasi]} alt="" width={64} height={50} />
              <div className="daftar-progres-teks">
                <Link href={`/materi/${m.id}/`}>
                  <strong>
                    {m.urutan}. {m.judul}
                  </strong>
                </Link>
                <span className="label-kecil">
                  {s.dibaca} dari {m.jumlah_materi} materi
                  {latihan && ` · Latihan: ${latihan.benar}/${latihan.total} benar`}
                </span>
              </div>
              <span className={`lencana lencana-progres-${s.status}`}>{LABEL[s.status]}</span>
            </li>
          );
        })}
      </ol>

      <p>
        <Link className="tombol tombol-sekunder" href="/kuis/">
          Kuis Latihan Lengkap
        </Link>{' '}
        {kuis && (
          <span className="label-kecil">
            Hasil terakhir: {kuis.benar}/{kuis.total} benar
          </span>
        )}
      </p>
      <p className="label-kecil">
        Progres menunjukkan materi yang sudah Anda buka, bukan hasil kesehatan atau tekanan darah Anda.
      </p>
    </>
  );
}
