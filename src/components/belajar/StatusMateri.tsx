import type { StatusMateri } from '@/lib/progres';

// Status selalu ditampilkan dengan ikon DAN teks, tidak hanya warna (PRD 6, 14).
const DATA: Record<StatusMateri, { ikon: string; teks: string }> = {
  terkunci: { ikon: '🔒', teks: 'Terkunci' },
  tersedia: { ikon: '○', teks: 'Belum dibaca' },
  selesai: { ikon: '✓', teks: 'Selesai' },
};

export default function LencanaStatusMateri({ status }: { status: StatusMateri }) {
  const d = DATA[status];
  return (
    <span className={`lencana lencana-materi-${status}`}>
      <span aria-hidden="true">{d.ikon}</span> {d.teks}
    </span>
  );
}
