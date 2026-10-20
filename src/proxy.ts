import { NextResponse, type NextRequest } from 'next/server';

// Pemeriksaan cepat (optimistis): tanpa cookie sesi, arahkan ke halaman masuk.
// Pemeriksaan sesungguhnya tetap dilakukan di server lewat wajibAdmin() pada setiap
// halaman, Server Action, dan Route Handler admin.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin/masuk')) return NextResponse.next();
  if (!request.cookies.has('dash_admin')) {
    return NextResponse.redirect(new URL('/admin/masuk/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
