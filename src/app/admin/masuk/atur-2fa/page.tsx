import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { renderSVG } from 'uqr';
import { FormKode2fa } from '@/components/admin/FormAdmin';
import HalamanAkun from '@/components/akun/HalamanAkun';
import KerangkaAkun from '@/components/akun/KerangkaAkun';
import { adminTahapSandi, rahasiaPengaturan2fa } from '@/lib/admin-auth';
import { uriOtpauth } from '@/lib/totp';

export const metadata: Metadata = { title: 'Atur autentikasi dua faktor' };

export default async function Atur2fa() {
  const t = await adminTahapSandi();
  if (!t) redirect('/admin/masuk/');
  if (t.akun.totp_aktif) redirect('/admin/masuk/verifikasi/');
  const rahasia = await rahasiaPengaturan2fa(t.akun);
  const svg = renderSVG(uriOtpauth(rahasia, t.akun.email), { border: 2 });
  return (
    <KerangkaAkun>
      <HalamanAkun
        ilustrasi="admin"
        judul="Atur Autentikasi Dua Faktor"
        ringkasan="Akun admin wajib memakai kode dari aplikasi autentikator (mis. Google Authenticator, Microsoft Authenticator, atau Aegis)."
      >
        <ol className="akun-langkah">
          <li>Pasang aplikasi autentikator di HP Anda.</li>
          <li>Pindai kode QR di bawah, atau ketik kunci rahasia secara manual.</li>
          <li>Ketik kode 6 digit yang muncul di aplikasi.</li>
        </ol>
        <div className="kode-qr" role="img" aria-label="Kode QR untuk aplikasi autentikator" dangerouslySetInnerHTML={{ __html: svg }} />
        <p>
          Kunci rahasia: <code className="kunci-rahasia">{rahasia.replace(/(.{4})/g, '$1 ').trim()}</code>
        </p>
        <FormKode2fa label="Aktifkan dan masuk" />
        <p className="akun-tautan-kecil">
          <Link href="/admin/masuk/">Batal, kembali ke Masuk Admin</Link>
        </p>
      </HalamanAkun>
    </KerangkaAkun>
  );
}
