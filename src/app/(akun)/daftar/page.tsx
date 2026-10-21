import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import HalamanAkun from '@/components/akun/HalamanAkun';
import { FormDaftar } from '@/components/belajar/FormAkun';
import { ambilPengaturan, tautanWhatsapp } from '@/lib/pengaturan';
import { respondenSaatIni } from '@/lib/responden';

export const metadata: Metadata = { title: 'Daftar' };

const JUDUL = 'Mulai Belajar Diet DASH';
const RINGKASAN = 'Cukup isi nama dan nomor HP. Sistem akan membuatkan kode akses 6 angka untuk masuk.';

export default async function Daftar() {
  // Responden yang baru mendaftar (kode belum dikonfirmasi) tetap di halaman ini agar kode
  // hasil pendaftaran sempat ditampilkan; cookie sesi baru membuat halaman dirender ulang.
  const a = await respondenSaatIni();
  if (a?.r.token_disimpan_pada) redirect('/belajar/');
  const atur = await ambilPengaturan();
  const wa = tautanWhatsapp(atur.nomor_whatsapp_peneliti);

  if (!atur.pendaftaran_dibuka) {
    return (
      <HalamanAkun ilustrasi="daftar" judul={JUDUL} ringkasan={RINGKASAN}>
        <div className="kotak kotak-peringatan">
          <p>Pendaftaran sudah ditutup. Hubungi peneliti jika Anda merasa ini keliru.</p>
          {wa && (
            <a className="tombol" href={wa} rel="noopener noreferrer">
              Hubungi Peneliti
            </a>
          )}
        </div>
        <div className="akun-pemisah">
          <span>Sudah punya akun?</span>
        </div>
        <Link className="tombol tombol-sekunder tombol-besar" href="/masuk/">
          Masuk
        </Link>
      </HalamanAkun>
    );
  }

  // Judul dibuat oleh formulir agar berganti menjadi "Simpan Kode Akses Anda" setelah mendaftar.
  return (
    <HalamanAkun ilustrasi="daftar">
      <FormDaftar wajibKelayakan={atur.wajib_pernyataan_kelayakan} judul={JUDUL} ringkasan={RINGKASAN} />
    </HalamanAkun>
  );
}
