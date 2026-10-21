// Format tanggal/waktu untuk tampilan (zona Asia/Jakarta).
const ZONA = 'Asia/Jakarta';

export function formatTanggal(d: Date | null | undefined): string {
  return d ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: ZONA }) : '—';
}

export function formatWaktu(d: Date | null | undefined): string {
  return d
    ? d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: ZONA })
    : '—';
}

export function formatDurasi(detik: number): string {
  if (detik < 60) return `${detik} dtk`;
  const m = Math.round(detik / 60);
  return m < 60 ? `${m} mnt` : `${Math.floor(m / 60)} j ${m % 60} mnt`;
}
