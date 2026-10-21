import { NextResponse, type NextRequest } from 'next/server';

// Memperpanjang umur cookie sesi responden yang memilih "Ingat saya" (30 hari sejak terakhir aktif).
// Pemeriksaan sesi sesungguhnya tetap di server (wajibResponden / wajibAdmin) pada setiap halaman,
// Server Action, dan Route Handler. Proxy ini tidak memberi akses apa pun.
const COOKIE_RESPONDEN = 'dash_r';
const SUFIKS_INGAT = '.i';
const TIGA_PULUH_HARI = 30 * 24 * 60 * 60;

export function proxy(request: NextRequest) {
  const res = NextResponse.next();
  const nilai = request.cookies.get(COOKIE_RESPONDEN)?.value;
  if (nilai?.endsWith(SUFIKS_INGAT)) {
    res.cookies.set(COOKIE_RESPONDEN, nilai, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: TIGA_PULUH_HARI,
    });
  }
  return res;
}

export const config = {
  matcher: ['/belajar/:path*', '/profil/:path*', '/simpan-token/:path*', '/selamat-datang/:path*'],
};
