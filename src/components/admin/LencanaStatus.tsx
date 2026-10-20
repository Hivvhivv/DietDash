import type { StatusVersi } from '@/lib/skema';

const LABEL: Record<StatusVersi, string> = {
  draf: 'Draf',
  disetujui: '● Tayang',
  diarsipkan: 'Arsip',
};

// Status ditandai dengan teks, bukan hanya warna.
export default function LencanaStatus({ status }: { status: StatusVersi }) {
  return <span className={`lencana lencana-${status}`}>{LABEL[status]}</span>;
}
