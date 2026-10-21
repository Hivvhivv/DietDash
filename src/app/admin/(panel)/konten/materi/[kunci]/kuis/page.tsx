import type { Metadata } from 'next';
import Link from 'next/link';
import { aksiOperasiSoal } from '../../../../../aksi-konten';
import { FormKuis, FormSoal, type AwalSoal } from '@/components/admin/FormKonten';
import { wajibAdmin } from '@/lib/admin-auth';
import { ambilMateriKerja } from '@/lib/konten-admin';

export const metadata: Metadata = { title: 'Kuis materi' };
export const dynamic = 'force-dynamic';

const HURUF = 'ABCD';

function TombolSoal({ op, label, soal, materi, konfirmasi }: { op: string; label: string; soal: string; materi: string; konfirmasi?: boolean }) {
  return (
    <form action={aksiOperasiSoal}>
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="soal_kunci" value={soal} />
      <input type="hidden" name="materi_kunci" value={materi} />
      <button type="submit" className={`tombol tombol-kecil ${konfirmasi ? 'tombol-bahaya' : 'tombol-sekunder'}`}>
        {label}
      </button>
    </form>
  );
}

export default async function KuisMateriAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ kunci: string }>;
  searchParams: Promise<{ soal?: string; pesan?: string }>;
}) {
  await wajibAdmin();
  const { kunci } = await params;
  const { soal: soalDiedit, pesan } = await searchParams;
  const d = await ambilMateriKerja(kunci);
  if (!d || !d.kuis) {
    return (
      <>
        <h1>Kuis tidak ditemukan</h1>
        <p>
          Kuis hanya dapat diedit di versi kerja. <Link href="/admin/konten/">Kembali ke Konten</Link>
        </p>
      </>
    );
  }
  const { materi: m, kuis, soal } = d;
  const edit = soalDiedit ? soal.find((s) => s.kunci === soalDiedit) : undefined;
  const awal: AwalSoal = edit
    ? {
        soal_kunci: edit.kunci,
        teks: edit.teks,
        penjelasan: edit.penjelasan,
        pilihan: edit.pilihan.map((p) => p.teks),
        benar: String(edit.pilihan.findIndex((p) => p.benar)),
        gambar_id: edit.gambar?.id ?? '',
        gambar_alt: edit.gambar?.alt ?? '',
      }
    : { soal_kunci: '', teks: '', penjelasan: '', pilihan: ['', '', ''], benar: '', gambar_id: '', gambar_alt: '' };

  return (
    <>
      <p>
        <Link href={`/admin/konten/materi/${m.kunci}/`}>← {m.judul}</Link>
      </p>
      <h1>Kuis: {m.judul}</h1>
      {pesan === 'soal-tersimpan' && (
        <p className="pesan-sukses" role="status">
          Soal tersimpan.
        </p>
      )}
      <p className={soal.length < 3 ? 'kotak-info' : 'label-kecil'}>
        {soal.length} soal{soal.length < 3 ? ' — setiap kuis wajib minimal 3 soal sebelum dapat ditinjau.' : '.'}
      </p>

      <section className="bagian-kartu" aria-labelledby="judul-atur-kuis">
        <h2 id="judul-atur-kuis">Pengaturan kuis</h2>
        <FormKuis awal={{ kuis_kunci: kuis.kunci, judul: kuis.judul, petunjuk: kuis.petunjuk, mode: kuis.mode, batas_lulus: kuis.batas_lulus }} />
      </section>

      <section className="bagian-kartu" aria-labelledby="judul-daftar-soal">
        <h2 id="judul-daftar-soal">Daftar soal</h2>
        {soal.length === 0 && <p>Belum ada soal.</p>}
        <ol className="daftar-soal-admin">
          {soal.map((s, i) => (
            <li key={s.kunci} className="kartu">
              <p>
                <strong>{s.teks}</strong>
              </p>
              <ul className="daftar-pilihan-admin">
                {s.pilihan.map((p, j) => (
                  <li key={p.kunci}>
                    {HURUF[j]}. {p.teks} {p.benar && <strong className="teks-benar">✓ kunci jawaban</strong>}
                  </li>
                ))}
              </ul>
              <p className="label-kecil">Penjelasan: {s.penjelasan}</p>
              <div className="grup-tombol">
                <Link className="tombol tombol-sekunder tombol-kecil" href={`?soal=${s.kunci}#form-soal`}>
                  Edit
                </Link>
                {i > 0 && <TombolSoal op="naik" label="↑ Naik" soal={s.kunci} materi={m.kunci} />}
                {i < soal.length - 1 && <TombolSoal op="turun" label="↓ Turun" soal={s.kunci} materi={m.kunci} />}
                <TombolSoal op="duplikat" label="Duplikat" soal={s.kunci} materi={m.kunci} />
                <TombolSoal op="hapus" label="Hapus" soal={s.kunci} materi={m.kunci} konfirmasi />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bagian-kartu" id="form-soal" aria-labelledby="judul-form-soal">
        <h2 id="judul-form-soal">{edit ? `Edit soal ${soal.indexOf(edit) + 1}` : 'Tambah soal'}</h2>
        {edit && (
          <p>
            <Link href="?#form-soal">Batal edit, tambah soal baru</Link>
          </p>
        )}
        <FormSoal key={edit?.kunci ?? 'baru'} awal={awal} kuisKunci={kuis.kunci} materiKunci={m.kunci} />
      </section>
    </>
  );
}
