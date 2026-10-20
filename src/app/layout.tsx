import type { Metadata, Viewport } from 'next';
import { Caveat, Plus_Jakarta_Sans } from 'next/font/google';
import { NAMA_SITUS } from '@/data/situs';
import '@/styles/global.css';

// Font diunduh saat build dan disajikan dari server sendiri (tanpa permintaan ke Google saat dibuka pengguna).
const fontUtama = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-utama',
});

const fontTangan = Caveat({
  subsets: ['latin'],
  weight: '600',
  display: 'swap',
  variable: '--font-tangan',
});

export const metadata: Metadata = {
  title: { default: NAMA_SITUS, template: `%s — ${NAMA_SITUS}` },
  description: 'Website edukasi diet DASH untuk orang dewasa dengan hipertensi.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2e7d5b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fontUtama.variable} ${fontTangan.variable}`}>
      <body>{children}</body>
    </html>
  );
}
