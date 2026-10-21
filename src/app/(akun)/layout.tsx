import type { Metadata } from 'next';
import KerangkaAkun from '@/components/akun/KerangkaAkun';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function LayoutAkun({ children }: { children: React.ReactNode }) {
  return <KerangkaAkun>{children}</KerangkaAkun>;
}
