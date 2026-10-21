import Link from 'next/link';
import Logo from '../Logo';
import IlustrasiAkun, { type JenisIlustrasi } from './IlustrasiAkun';
import { NAMA_SITUS, SLOGAN } from '@/data/situs';

interface Props {
  ilustrasi: JenisIlustrasi;
  judul?: string; // kosongkan bila judul dibuat oleh isi (mis. formulir daftar yang berganti ke "Simpan Kode Akses")
  ringkasan?: React.ReactNode;
  sorotan?: { judul: string; teks: string }; // teks besar di panel ilustrasi (layar lebar)
  kutipan?: string;
  children: React.ReactNode;
}

// Kartu halaman akun: panel kiri berisi merek, sorotan, dan ilustrasi; panel kanan berisi judul & formulir.
// Ponsel: satu kolom (panel ilustrasi ringkas di atas). Layar lebar: dua kolom.
export default function HalamanAkun({ ilustrasi, judul, ringkasan, sorotan, kutipan, children }: Props) {
  return (
    <div className="akun-kartu">
      <div className="akun-visual">
        <Link className="akun-merek" href="/">
          <Logo ukuran={48} />
          <span className="akun-merek-teks">
            <span className="akun-merek-nama">{NAMA_SITUS}</span>
            <span className="akun-merek-slogan">{SLOGAN}</span>
          </span>
        </Link>
        {sorotan && (
          <div className="akun-sorotan">
            <p className="akun-sorotan-judul">{sorotan.judul}</p>
            <p>{sorotan.teks}</p>
          </div>
        )}
        <div className="akun-ilustrasi">
          <IlustrasiAkun jenis={ilustrasi} />
        </div>
        {kutipan && <p className="akun-kutipan">“{kutipan}”</p>}
      </div>
      <div className="akun-isi">
        {judul && <h1 className="akun-judul">{judul}</h1>}
        {ringkasan && <p className="akun-ringkasan">{ringkasan}</p>}
        {children}
      </div>
    </div>
  );
}
