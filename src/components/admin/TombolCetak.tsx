'use client';

// Tombol membuka jendela cetak peramban (juga untuk "Simpan sebagai PDF").
export default function TombolCetak({ label = 'Cetak' }: { label?: string }) {
  return (
    <button type="button" className="tombol" onClick={() => window.print()}>
      {label}
    </button>
  );
}
