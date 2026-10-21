// Cincin persentase materi selesai (dipakai di Beranda dan Modul Pembelajaran).
export default function CincinProgres({ persen }: { persen: number }) {
  return (
    <div
      className="cincin-progres"
      style={{ background: `conic-gradient(var(--warna-utama) ${persen * 3.6}deg, var(--warna-utama-muda) 0deg)` }}
      role="img"
      aria-label={`${persen} persen materi selesai`}
    >
      <span>{persen}%</span>
    </div>
  );
}
