import type { Metadata } from 'next';
import Link from 'next/link';
import HalamanAkun from '@/components/akun/HalamanAkun';
import { ambilPengaturan, tautanWhatsapp } from '@/lib/pengaturan';

export const metadata: Metadata = { title: 'Lupa Kode Akses' };

// PRD 7.4: token baru dibuat peneliti setelah identitas dicocokkan (belum ada OTP).
export default async function LupaToken() {
  const atur = await ambilPengaturan();
  const wa = tautanWhatsapp(atur.nomor_whatsapp_peneliti, 'Halo, saya responden DASH Sehat dan lupa kode akses saya.');
  return (
    <HalamanAkun
      ilustrasi="lupa"
      judul="Lupa Kode Akses?"
      ringkasan="Tenang, progres belajar Anda tidak hilang. Kode baru dibuat oleh peneliti setelah identitas Anda dicocokkan."
    >
      <ol className="akun-langkah">
        <li>Hubungi peneliti lewat WhatsApp resmi penelitian.</li>
        <li>Peneliti menghubungi balik nomor HP yang Anda daftarkan dan mencocokkan nama Anda.</li>
        <li>Peneliti mengirim kode akses baru ke nomor terdaftar. Kode lama langsung tidak berlaku.</li>
        <li>Setelah masuk, Anda boleh mengganti kode dari halaman Profil.</li>
      </ol>
      {wa ? (
        <a className="tombol tombol-besar" href={wa} rel="noopener noreferrer">
          Hubungi Peneliti
        </a>
      ) : (
        // TODO: isi nomor WhatsApp resmi penelitian di Admin → Pengaturan.
        <p className="kotak kotak-peringatan">Nomor WhatsApp resmi penelitian akan dicantumkan di sini.</p>
      )}
      <Link className="tombol tombol-sekunder tombol-besar" href="/masuk/">
        Kembali ke Masuk
      </Link>
      <p className="akun-tautan-kecil">Peneliti tidak pernah meminta Anda mengirim kode akses. Jangan berikan kode kepada siapa pun.</p>
    </HalamanAkun>
  );
}
