import type { Metadata } from 'next';
import KerangkaResponden from '@/components/belajar/KerangkaResponden';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function LayoutBelajar({ children }: { children: React.ReactNode }) {
  return <KerangkaResponden>{children}</KerangkaResponden>;
}
