import type { Metadata } from 'next';
import Link from 'next/link';
import { aksiKeluarPeserta } from '@/app/aksi-peserta';
import KepalaHalaman from '@/components/KepalaHalaman';
import DaftarProgres from '@/components/peserta/DaftarProgres';
import { FormHapusAkun, FormUbahSandi } from '@/components/peserta/FormPeserta';
import { ProgresPerangkat, SinkronPerangkat } from '@/components/peserta/ProgresKlien';
import { ambilSemuaModul } from '@/lib/konten';
import { pesertaSaatIni } from '@/lib/peserta';
import { ambilProgres, untukProgres } from '@/lib/progres';

export const metadata: Metadata = {
  title: 'Akun Saya',
  robots: { index: false, follow: false },
};

const PESAN: Record<string, string> = {
  baru: 'Akun berhasil dibuat. Progres belajar Anda sekarang tersimpan.',
  'sandi-baru': 'Kata sandi baru tersimpan. Anda sudah masuk.',
};

export default async function AkunSaya({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const [p, semua, sp] = await Promise.all([pesertaSaatIni(), ambilSemuaModul(), searchParams]);
  const modul = semua.map(untukProgres);
  const pesan = Object.keys(PESAN).find((k) => k in sp);

  if (!p) {
    return (
      <>
        <KepalaHalaman
          label="Akun Saya"
          judul="Progres Belajar"
          ringkasan="Anda belum masuk. Progres di bawah hanya tersimpan di perangkat ini dan bisa hilang bila riwayat peramban dihapus."
        >
          <div className="grup-tombol">
            <Link className="tombol" href="/masuk/?lanjut=/akun/">
              Masuk
            </Link>
            <Link className="tombol tombol-sekunder" href="/daftar/">
              Daftar
            </Link>
          </div>
        </KepalaHalaman>
        <div className="wadah-baca bagian-isi">
          <ProgresPerangkat modul={modul} />
        </div>
      </>
    );
  }

  const data = await ambilProgres(p.id);

  return (
    <>
      <KepalaHalaman label="Akun Saya" judul="Halo, selamat belajar!" ringkasan={`Masuk sebagai ${p.email}`}>
        <form action={aksiKeluarPeserta}>
          <button type="submit" className="tombol tombol-sekunder">
            Keluar
          </button>
        </form>
      </KepalaHalaman>

      <div className="wadah-baca bagian-isi">
        <SinkronPerangkat />
        {pesan && (
          <p className="pesan-sukses" role="status">
            {PESAN[pesan]}
          </p>
        )}
        <DaftarProgres modul={modul} data={data} />

        <section className="bagian-kartu" aria-labelledby="judul-pengaturan">
          <h2 id="judul-pengaturan">Pengaturan akun</h2>
          <details className="tanya">
            <summary>Ubah kata sandi</summary>
            <div className="tanya-isi">
              <FormUbahSandi />
            </div>
          </details>
          <details className="tanya">
            <summary>Hapus akun dan data saya</summary>
            <div className="tanya-isi">
              <p>
                Akun, email, dan seluruh progres belajar Anda akan dihapus permanen dari website ini.
              </p>
              <FormHapusAkun />
            </div>
          </details>
          <p className="label-kecil">
            Baca <Link href="/kebijakan-privasi/">Kebijakan Privasi</Link> atau{' '}
            <Link href="/pertanyaan-umum/">Pertanyaan Umum</Link>. Lupa kata sandi? Hubungi tim
            peneliti untuk mendapatkan tautan pengaturan ulang.
          </p>
        </section>
      </div>
    </>
  );
}
