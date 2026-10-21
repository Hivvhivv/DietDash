// Ilustrasi dekoratif Beranda (SVG): semangkuk makanan sehat dengan gelas air, dan hati tersenyum.

function Daun({ x, y, r = 0, s = 1, warna = '#7cc49b', urat = '#5aa877' }: { x: number; y: number; r?: number; s?: number; warna?: string; urat?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0C-18-20-18-52 0-72 18-52 18-20 0 0z" fill={warna} />
      <path d="M0-6V-64" stroke={urat} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

export function MangkukSehat() {
  return (
    <svg className="ilustrasi-mangkuk" viewBox="0 0 460 320" aria-hidden="true" focusable="false">
      {/* daun latar */}
      <Daun x={70} y={300} r={-35} s={1.6} warna="#8cc8a1" urat="#6fb48a" />
      <Daun x={120} y={310} r={10} s={1.3} warna="#6db487" urat="#4f9a6c" />
      <Daun x={420} y={250} r={55} s={1.2} warna="#a9d6b8" urat="#7fbf98" />
      {/* gelas air */}
      <path d="M318 40h76l-10 150h-56z" fill="#eaf5f8" stroke="#cfe3ea" strokeWidth="3" />
      <path d="M322 80h68l-7 106h-54z" fill="#d7edf4" />
      <ellipse cx="356" cy="40" rx="38" ry="7" fill="#f4fafc" stroke="#cfe3ea" strokeWidth="3" />
      <path d="M332 92l4 80" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      {/* bayangan & mangkuk */}
      <ellipse cx="228" cy="292" rx="170" ry="18" fill="#dbe9df" />
      <path d="M60 176h336c-6 66-74 108-168 108S66 242 60 176z" fill="#ffffff" stroke="#e1e8e3" strokeWidth="3" />
      <ellipse cx="228" cy="176" rx="170" ry="34" fill="#f6f8f7" />
      {/* nasi merah */}
      <ellipse cx="190" cy="186" rx="70" ry="22" fill="#d9b48a" />
      {[[140, 182], [158, 176], [176, 186], [196, 178], [214, 188], [232, 180], [168, 194], [204, 196], [150, 192], [222, 172]].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="6" ry="3.5" fill="#c69a6c" />
      ))}
      {/* ayam panggang */}
      <path d="M150 158c10-34 88-40 118-16 12 10 6 26-12 32-34 10-94 12-106-16z" fill="#f2c08a" />
      <path d="M168 150l14 22M190 144l14 26M214 142l12 24M236 146l8 18" stroke="#d99a5b" strokeWidth="6" strokeLinecap="round" />
      {/* brokoli */}
      <path d="M96 186l18-26" stroke="#5c9a4a" strokeWidth="8" strokeLinecap="round" />
      <circle cx="104" cy="150" r="20" fill="#4f9a45" />
      <circle cx="128" cy="140" r="20" fill="#5aa84f" />
      <circle cx="116" cy="124" r="17" fill="#6bb75c" />
      <circle cx="140" cy="160" r="16" fill="#4f9a45" />
      <circle cx="318" cy="150" r="17" fill="#5aa84f" />
      <circle cx="338" cy="140" r="15" fill="#6bb75c" />
      {/* tomat */}
      <circle cx="270" cy="128" r="17" fill="#e5484d" />
      <circle cx="296" cy="124" r="14" fill="#ef5b52" />
      <path d="M264 122c4-4 10-4 13 0" stroke="#ff9b8f" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* wortel */}
      <path d="M300 168l52-22" stroke="#f08a3c" strokeWidth="12" strokeLinecap="round" />
      <path d="M296 182l50-12" stroke="#f39a4f" strokeWidth="11" strokeLinecap="round" />
      {/* timun */}
      <circle cx="262" cy="190" r="14" fill="#a7d68e" stroke="#6bb75c" strokeWidth="4" />
      <circle cx="292" cy="196" r="12" fill="#a7d68e" stroke="#6bb75c" strokeWidth="4" />
      <Daun x={30} y={250} r={-60} s={0.9} />
    </svg>
  );
}

export function OrangJempol() {
  return (
    <svg className="ilustrasi-jempol" viewBox="0 0 160 170" aria-hidden="true" focusable="false">
      {/* garis semangat */}
      <path d="M18 52l-12-6M16 72H2M24 34l-8-10M142 52l12-6M144 72h14M136 34l8-10" stroke="#f3b23a" strokeWidth="4" strokeLinecap="round" />
      {/* badan & kardigan */}
      <path d="M30 170c0-40 22-62 50-62s50 22 50 62z" fill="#7cc49b" />
      <path d="M66 110l14 26 14-26z" fill="#e9f5ee" />
      <path d="M80 136v34" stroke="#5aa877" strokeWidth="3" />
      {/* leher & kepala */}
      <rect x="71" y="92" width="18" height="20" rx="6" fill="#f2c9a5" />
      <ellipse cx="80" cy="66" rx="30" ry="33" fill="#f6d3b3" />
      <path d="M50 64c-4-30 16-44 30-44s36 12 30 44c-4-14-12-22-30-22S54 50 50 64z" fill="#d9dde0" />
      <circle cx="49" cy="70" r="6" fill="#f2c9a5" />
      <circle cx="111" cy="70" r="6" fill="#f2c9a5" />
      {/* kacamata, mata, senyum */}
      <circle cx="68" cy="66" r="9" fill="none" stroke="#6b5a4e" strokeWidth="2.5" />
      <circle cx="92" cy="66" r="9" fill="none" stroke="#6b5a4e" strokeWidth="2.5" />
      <path d="M77 66h6" stroke="#6b5a4e" strokeWidth="2.5" />
      <circle cx="68" cy="66" r="2.6" fill="#3d3029" />
      <circle cx="92" cy="66" r="2.6" fill="#3d3029" />
      <path d="M68 82c7 8 17 8 24 0" fill="none" stroke="#a5523f" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="60" cy="80" r="4" fill="#f4a9a0" opacity="0.7" />
      <circle cx="100" cy="80" r="4" fill="#f4a9a0" opacity="0.7" />
      {/* lengan & jempol */}
      <path d="M118 150c10-14 12-30 8-44" stroke="#6db487" strokeWidth="18" strokeLinecap="round" fill="none" />
      <rect x="114" y="86" width="26" height="24" rx="8" fill="#f6d3b3" />
      <rect x="120" y="66" width="10" height="26" rx="5" fill="#f6d3b3" />
      <path d="M118 96h18M118 103h18" stroke="#e2b48f" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HatiSenyum() {
  return (
    <svg className="ilustrasi-hati" viewBox="0 0 160 140" aria-hidden="true" focusable="false">
      <circle cx="80" cy="70" r="62" fill="#fde3e3" />
      <path d="M80 118C40 92 22 70 30 48c7-20 34-24 50-6 16-18 43-14 50 6 8 22-10 44-50 70z" fill="#f2777a" />
      <path d="M44 52c4-8 13-11 20-8" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
      <circle cx="66" cy="70" r="5" fill="#7a2730" />
      <circle cx="94" cy="70" r="5" fill="#7a2730" />
      <path d="M68 84c7 8 17 8 24 0" fill="none" stroke="#7a2730" strokeWidth="4" strokeLinecap="round" />
      <circle cx="56" cy="82" r="5" fill="#f8a5a8" />
      <circle cx="104" cy="82" r="5" fill="#f8a5a8" />
      <path d="M26 96l-12 8M134 96l12 8" stroke="#f2777a" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
