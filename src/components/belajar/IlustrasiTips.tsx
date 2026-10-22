import type { KategoriTips } from '@/lib/db';

// Ilustrasi dekoratif (SVG) per kategori tips; dipakai bila tips tidak punya gambar unggahan.
const LATAR: Record<KategoriTips, [string, string]> = {
  dapur: ['#fbefe0', '#f3dcc0'],
  belanja: ['#eaf6ee', '#d2ecd9'],
  luar: ['#fdf1e6', '#f5d9bf'],
  keluarga: ['#eef3fb', '#d8e5f6'],
  label: ['#f4f1fb', '#e2dbf3'],
  kebiasaan: ['#eef8f3', '#d6eee2'],
};

function Isi({ kategori }: { kategori: KategoriTips }) {
  switch (kategori) {
    case 'dapur':
      return (
        <g>
          {/* wajan + bawang + rempah */}
          <ellipse cx="150" cy="150" rx="86" ry="20" fill="#3d3f45" />
          <path d="M64 140h172c-6 22-40 30-86 30s-80-8-86-30z" fill="#55585f" />
          <rect x="232" y="132" width="60" height="12" rx="6" fill="#2f3136" transform="rotate(-8 232 132)" />
          <ellipse cx="150" cy="140" rx="80" ry="14" fill="#6b6e75" />
          {[[120, 136], [146, 132], [170, 138], [134, 142], [160, 144]].map(([x, y]) => (
            <ellipse key={`${x}${y}`} cx={x} cy={y} rx="9" ry="5" fill="#e9b45f" />
          ))}
          <circle cx="60" cy="86" r="22" fill="#e9e2f0" />
          <path d="M60 60c-4 6-4 12 0 16" stroke="#8fae5a" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="98" cy="70" r="16" fill="#b5536a" />
          <path d="M98 50v8" stroke="#6f9d4a" strokeWidth="4" strokeLinecap="round" />
          <path d="M210 60l30 20M214 74l30 20" stroke="#9b6b3a" strokeWidth="6" strokeLinecap="round" />
          <circle cx="250" cy="66" r="5" fill="#5a3b1e" />
          <circle cx="238" cy="54" r="4" fill="#5a3b1e" />
          <path d="M120 112c4-10 0-16 6-24M150 108c4-10 0-16 6-24M180 112c4-10 0-16 6-24" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'belanja':
      return (
        <g>
          {/* keranjang pasar */}
          <path d="M96 96c0-40 108-40 108 0" stroke="#a1683a" strokeWidth="8" fill="none" />
          <circle cx="112" cy="92" r="20" fill="#5aa84f" />
          <circle cx="136" cy="80" r="18" fill="#4f9a45" />
          <circle cx="170" cy="86" r="17" fill="#e5484d" />
          <path d="M184 76l30-18" stroke="#f08a3c" strokeWidth="12" strokeLinecap="round" />
          <path d="M150 96c10-24 40-26 52-8" fill="#f6d34a" />
          <path d="M70 100h160l-16 66H86z" fill="#c98b4e" />
          <path d="M80 118h140M84 136h132M88 152h124" stroke="#a8703b" strokeWidth="4" />
          <path d="M110 100v66M150 100v66M190 100v66" stroke="#a8703b" strokeWidth="4" />
          <rect x="226" y="120" width="42" height="30" rx="6" fill="#ffffff" stroke="#d2c6b3" strokeWidth="3" />
          <path d="M234 132h26M234 140h18" stroke="#9aa49e" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'luar':
      return (
        <g>
          {/* atap warung + piring lauk */}
          <path d="M40 40h220l-14 30H54z" fill="#e5484d" />
          <path d="M54 70h28l-6-30M110 70h28l-4-30M166 70h28l-2-30M222 70h24l0-30" fill="#fbf3e2" />
          <rect x="60" y="70" width="8" height="70" fill="#a1683a" />
          <rect x="232" y="70" width="8" height="70" fill="#a1683a" />
          <ellipse cx="150" cy="150" rx="80" ry="22" fill="#ffffff" stroke="#e6ded0" strokeWidth="3" />
          <ellipse cx="124" cy="146" rx="26" ry="12" fill="#fdfbf3" stroke="#e9e2cf" strokeWidth="2" />
          <path d="M150 140c14-16 46-14 54 0-8 12-44 14-54 0z" fill="#c9783d" />
          <circle cx="196" cy="156" r="9" fill="#4f9a45" />
          <circle cx="180" cy="160" r="8" fill="#6bb75c" />
          <rect x="230" y="118" width="20" height="34" rx="4" fill="#dff1f6" stroke="#b7d8e2" strokeWidth="2" />
        </g>
      );
    case 'keluarga':
      return (
        <g>
          {/* tiga orang di meja makan */}
          {[
            [90, '#7cc49b', '#f2c9a5', '#d9dde0'],
            [150, '#f2a65a', '#e9b98f', '#3d3029'],
            [210, '#5b9be0', '#f6d3b3', '#5a4636'],
          ].map(([x, baju, kulit, rambut]) => (
            <g key={x as number}>
              <path d={`M${(x as number) - 28} 150c0-30 12-46 28-46s28 16 28 46z`} fill={baju as string} />
              <circle cx={x as number} cy="80" r="20" fill={kulit as string} />
              <path d={`M${(x as number) - 20} 78c0-18 40-18 40 0-8-8-32-8-40 0z`} fill={rambut as string} />
              <path d={`M${(x as number) - 7} 86c4 4 10 4 14 0`} stroke="#7a3b2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          ))}
          <rect x="40" y="140" width="220" height="16" rx="6" fill="#c98b4e" />
          <ellipse cx="150" cy="138" rx="30" ry="8" fill="#ffffff" />
          <ellipse cx="150" cy="134" rx="20" ry="6" fill="#5aa84f" />
        </g>
      );
    case 'label':
      return (
        <g>
          {/* kemasan + kaca pembesar */}
          <rect x="70" y="40" width="110" height="130" rx="10" fill="#f6d34a" />
          <rect x="86" y="58" width="78" height="96" rx="6" fill="#ffffff" />
          <path d="M94 72h62M94 86h40M94 100h62M94 114h50M94 128h62M94 142h34" stroke="#9aa49e" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M94 100h62" stroke="#e5484d" strokeWidth="5" strokeLinecap="round" />
          <circle cx="196" cy="110" r="30" fill="#e8f3fb" fillOpacity="0.8" stroke="#3d7fd0" strokeWidth="8" />
          <path d="M218 132l30 30" stroke="#3d7fd0" strokeWidth="12" strokeLinecap="round" />
        </g>
      );
    case 'kebiasaan':
      return (
        <g>
          {/* gelas air + buah + daftar centang */}
          <rect x="60" y="44" width="96" height="120" rx="10" fill="#ffffff" stroke="#d2e2d8" strokeWidth="3" />
          {[70, 100, 130].map((y) => (
            <g key={y}>
              <rect x="74" y={y} width="20" height="20" rx="5" fill="#2e7d5b" />
              <path d={`M78 ${y + 10}l5 5 8-9`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d={`M102 ${y + 10}h42`} stroke="#9aa49e" strokeWidth="4" strokeLinecap="round" />
            </g>
          ))}
          <path d="M184 70h48l-6 94h-36z" fill="#dff1f6" stroke="#b7d8e2" strokeWidth="3" />
          <path d="M188 96h40l-4 64h-32z" fill="#bfe2ee" />
          <circle cx="236" cy="150" r="18" fill="#f28c38" />
          <path d="M236 132c4-6 10-8 14-6" stroke="#5aa84f" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

export default function IlustrasiTips({ kategori, className }: { kategori: KategoriTips; className?: string }) {
  const [a, b] = LATAR[kategori];
  return (
    <svg className={className ?? 'ilustrasi-tips'} viewBox="0 0 300 200" aria-hidden="true" focusable="false">
      <rect width="300" height="200" fill={a} />
      <ellipse cx="250" cy="30" rx="90" ry="60" fill={b} />
      <ellipse cx="30" cy="190" rx="90" ry="40" fill={b} />
      <Isi kategori={kategori} />
    </svg>
  );
}
