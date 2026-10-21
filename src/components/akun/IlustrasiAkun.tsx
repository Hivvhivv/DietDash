// Ilustrasi dekoratif halaman akun (Masuk, Daftar/Simpan Kode, Lupa Kode, Admin). SVG agar tajam di semua layar.
export type JenisIlustrasi = 'masuk' | 'daftar' | 'lupa' | 'admin';

function Daun({ x, y, r = 0, s = 1, warna = '#a9d6b8', urat = '#7fbf98' }: { x: number; y: number; r?: number; s?: number; warna?: string; urat?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0C-14-16-14-40 0-56 14-40 14-16 0 0z" fill={warna} />
      <path d="M0-4V-50" stroke={urat} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Jantung({ x, y, s = 1, ekg = false }: { x: number; y: number; s?: number; ekg?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 22C-26 6-34-10-24-22c8-9 19-9 24 0 5-9 16-9 24 0 10 12 2 28-24 44z" fill="#e5484d" />
      <path d="M-17-16c4-4 10-3 12 1" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
      {ekg && <path d="M-20 0h9l4-8 6 15 5-11 3 4h13" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  );
}

// Masuk: semangkuk makanan sehat, tensimeter digital, dan hati (sesuai rancangan halaman masuk).
function AdeganMasuk() {
  return (
    <svg className="ilustrasi-akun" viewBox="0 0 420 320" aria-hidden="true" focusable="false">
      <ellipse cx="225" cy="170" rx="175" ry="140" fill="#e6f4eb" />
      <Daun x={196} y={92} r={-8} s={1.1} warna="#c4e4cf" urat="#9ccfae" />
      <Daun x={372} y={150} r={38} s={1.15} />
      <Daun x={382} y={232} r={70} s={0.9} warna="#8cc8a1" urat="#6fb48a" />
      <Daun x={60} y={212} r={-40} s={0.85} warna="#8cc8a1" urat="#6fb48a" />
      {/* manset */}
      <rect x="150" y="128" width="112" height="100" rx="40" fill="#56676a" />
      <ellipse cx="166" cy="178" rx="20" ry="46" fill="#465558" />
      <ellipse cx="168" cy="178" rx="12" ry="34" fill="#36423f" />
      <path d="M196 140h58M196 216h58" stroke="#617376" strokeWidth="4" strokeLinecap="round" />
      <path d="M232 226c4 30 30 38 56 30" fill="none" stroke="#3f4d50" strokeWidth="5" strokeLinecap="round" />
      {/* tensimeter */}
      <rect x="244" y="62" width="128" height="176" rx="26" fill="#f1f4f2" />
      <rect x="240" y="58" width="128" height="176" rx="26" fill="#ffffff" stroke="#dbe5df" strokeWidth="3" />
      <rect x="258" y="78" width="92" height="100" rx="14" fill="#2f3d37" />
      <text x="340" y="118" textAnchor="end" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="600" fontStyle="italic" fill="#eef8f1">
        120
      </text>
      <text x="340" y="152" textAnchor="end" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="600" fontStyle="italic" fill="#eef8f1">
        80
      </text>
      <path d="M302 164c-4-3-6-5-4-8 1-2 4-2 5 0 1-2 4-2 5 0 2 3 0 5-6 8z" fill="#f28b8b" />
      <text x="340" y="170" textAnchor="end" fontFamily="system-ui, sans-serif" fontSize="12" fontStyle="italic" fill="#cfe9d9">
        72
      </text>
      <rect x="268" y="196" width="40" height="18" rx="9" fill="#2e9a6a" />
      <circle cx="330" cy="205" r="7" fill="#e3e9e5" />
      {/* mangkuk makanan */}
      <ellipse cx="128" cy="276" rx="100" ry="12" fill="#d3e9da" />
      <path d="M26 214h204c-4 40-44 62-102 62S30 254 26 214z" fill="#ffffff" stroke="#dde6e0" strokeWidth="2" />
      <ellipse cx="128" cy="214" rx="102" ry="16" fill="#f4f7f5" />
      {/* nasi merah */}
      <ellipse cx="170" cy="206" rx="40" ry="16" fill="#d9b48a" />
      {[[150, 202], [162, 198], [176, 200], [188, 206], [158, 210], [174, 212], [186, 196]].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="4" ry="2.4" fill="#c69a6c" />
      ))}
      {/* ikan */}
      <path d="M100 196c8-20 52-24 68-10 6 6 2 16-8 20-20 6-50 8-60-10z" fill="#f2965a" />
      <path d="M116 190l10 14M130 186l10 16M144 186l8 14" stroke="#f6b98a" strokeWidth="4" strokeLinecap="round" />
      {/* brokoli & sayur */}
      <path d="M58 212l14-18" stroke="#5c9a4a" strokeWidth="6" strokeLinecap="round" />
      <circle cx="66" cy="186" r="14" fill="#4f9a45" />
      <circle cx="84" cy="180" r="14" fill="#5aa84f" />
      <circle cx="76" cy="168" r="12" fill="#6bb75c" />
      <circle cx="96" cy="194" r="12" fill="#4f9a45" />
      <path d="M86 212c6-18 22-22 34-16-6 14-18 20-34 16z" fill="#7cc46a" />
      {/* tomat */}
      <circle cx="52" cy="206" r="13" fill="#e5484d" />
      <circle cx="74" cy="212" r="12" fill="#ef5b52" />
      <path d="M48 202c3-3 7-3 9 0" stroke="#ff9b8f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* hati bersinar */}
      <Jantung x={84} y={96} s={0.95} />
      {[[-34, -24], [-12, -42], [16, -42], [38, -24], [-42, 4]].map(([dx, dy]) => (
        <path key={`${dx}${dy}`} d={`M${84 + dx * 0.8} ${96 + dy * 0.8}l${dx * 0.25} ${dy * 0.25}`} stroke="#f39a9a" strokeWidth="3" strokeLinecap="round" />
      ))}
      <Daun x={230} y={292} r={-70} s={0.6} warna="#8cc8a1" urat="#6fb48a" />
    </svg>
  );
}

function Latar() {
  return (
    <>
      <path d="M58 150c-6-58 40-104 104-108 70-5 118 34 118 92 0 62-50 92-118 92-62 0-98-26-104-76z" fill="#e3f2e8" />
      <Daun x={70} y={128} r={-28} s={1.1} />
      <Daun x={92} y={102} r={-6} s={1.05} warna="#c4e4cf" urat="#9ccfae" />
      <Daun x={264} y={96} r={58} s={0.9} warna="#c4e4cf" urat="#9ccfae" />
      <ellipse cx="170" cy="214" rx="104" ry="10" fill="#d3e9da" />
    </>
  );
}

function PapanDaftar() {
  return (
    <>
      <rect x="120" y="54" width="100" height="140" rx="12" fill="#f7faf8" stroke="#cfdcd4" strokeWidth="3" />
      <rect x="146" y="44" width="48" height="20" rx="6" fill="#2e7d5b" />
      {[88, 118, 148].map((y) => (
        <g key={y}>
          <circle cx="142" cy={y} r="9" fill="#e3f2e8" />
          <path d={`M137 ${y}l4 4 7-7`} fill="none" stroke="#2e7d5b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M160 ${y}h44`} stroke="#cfdcd4" strokeWidth="5" strokeLinecap="round" />
        </g>
      ))}
      <ellipse cx="88" cy="182" rx="32" ry="11" fill="#ffffff" stroke="#cfdcd4" strokeWidth="2" />
      <circle cx="76" cy="172" r="10" fill="#4f9a45" />
      <circle cx="91" cy="169" r="9" fill="#f3b23a" />
      <circle cx="103" cy="175" r="8" fill="#e5484d" />
      <Jantung x={232} y={166} s={1.15} ekg />
    </>
  );
}

function Ponsel() {
  return (
    <>
      <rect x="128" y="48" width="84" height="150" rx="14" fill="#26332d" />
      <rect x="135" y="60" width="70" height="124" rx="6" fill="#f7faf8" />
      <rect x="152" y="106" width="36" height="30" rx="6" fill="#2e7d5b" />
      <path d="M160 106v-8a10 10 0 0 1 20 0v8" fill="none" stroke="#2e7d5b" strokeWidth="5" />
      <circle cx="170" cy="120" r="4" fill="#f7faf8" />
      <path d="M150 152h40M156 162h28" stroke="#cfdcd4" strokeWidth="5" strokeLinecap="round" />
      <path d="M214 62h56a12 12 0 0 1 12 12v26a12 12 0 0 1-12 12h-34l-14 12v-12h-8a12 12 0 0 1-12-12V74a12 12 0 0 1 12-12z" fill="#ffffff" stroke="#cfdcd4" strokeWidth="2" />
      <path d="M228 80h40M228 92h26" stroke="#7fbf98" strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(90 150) rotate(-30)">
        <circle cx="0" cy="0" r="14" fill="#f3b23a" />
        <circle cx="0" cy="0" r="5" fill="#e3f2e8" />
        <path d="M14 0h34M38 0v10M46 0v8" stroke="#f3b23a" strokeWidth="6" strokeLinecap="round" />
      </g>
    </>
  );
}

function LaptopAdmin() {
  return (
    <>
      <rect x="96" y="66" width="150" height="100" rx="10" fill="#26332d" />
      <rect x="104" y="74" width="134" height="84" rx="4" fill="#f7faf8" />
      <path d="M116 146h110" stroke="#cfdcd4" strokeWidth="2" />
      <rect x="122" y="118" width="16" height="28" rx="3" fill="#7cc49b" />
      <rect x="146" y="104" width="16" height="42" rx="3" fill="#2e7d5b" />
      <rect x="170" y="94" width="16" height="52" rx="3" fill="#7cc49b" />
      <rect x="194" y="84" width="16" height="62" rx="3" fill="#2e7d5b" />
      <path d="M80 166h182l-12 16H92z" fill="#3c4a43" />
      <path d="M262 102l28 10v20c0 20-12 34-28 40-16-6-28-20-28-40v-20z" fill="#2e7d5b" />
      <path d="M250 136l8 8 16-18" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

export default function IlustrasiAkun({ jenis }: { jenis: JenisIlustrasi }) {
  if (jenis === 'masuk') return <AdeganMasuk />;
  return (
    <svg className="ilustrasi-akun" viewBox="30 20 290 210" aria-hidden="true" focusable="false">
      <Latar />
      {jenis === 'daftar' && <PapanDaftar />}
      {jenis === 'lupa' && <Ponsel />}
      {jenis === 'admin' && <LaptopAdmin />}
    </svg>
  );
}
