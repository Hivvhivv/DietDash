import type { StatusVersi } from '@/lib/db';

// Status versi konten selalu dengan ikon + teks (tidak hanya warna).
const DATA: Record<StatusVersi, { ikon: string; teks: string; kelas: string }> = {
  draf: { ikon: '✎', teks: 'Draf', kelas: 'lencana-draf' },
  siap_ditinjau: { ikon: '👁', teks: 'Siap ditinjau', kelas: 'lencana-peringatan' },
  terbit: { ikon: '✓', teks: 'Terbit', kelas: 'lencana-disetujui' },
  dikunci: { ikon: '🔒', teks: 'Dikunci', kelas: 'lencana-disetujui' },
  arsip: { ikon: '🗄', teks: 'Arsip', kelas: 'lencana-diarsipkan' },
};

export default function LencanaVersi({ status }: { status: StatusVersi }) {
  const d = DATA[status];
  return (
    <span className={`lencana ${d.kelas}`}>
      <span aria-hidden="true">{d.ikon}</span> {d.teks}
    </span>
  );
}
