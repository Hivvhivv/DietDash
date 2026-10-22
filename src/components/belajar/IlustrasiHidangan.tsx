import type { ElemenHidangan, Resep } from '@/data/resep-sehat';

// Ilustrasi dekoratif hidangan (SVG) yang disusun dari elemen sederhana: wadah piring/mangkuk + 3 isi.
// Dipakai bila resep belum punya foto asli.

function Elemen({ jenis }: { jenis: ElemenHidangan }) {
  switch (jenis) {
    case 'nasi':
    case 'nasi-merah': {
      const [isi, butir] = jenis === 'nasi' ? ['#fdfbf3', '#e9e2cf'] : ['#c98f6b', '#a8704f'];
      return (
        <g>
          <ellipse cx="0" cy="4" rx="36" ry="22" fill={isi} stroke={butir} strokeWidth="2" />
          {[[-18, 0], [-6, -8], [8, -4], [18, 4], [-10, 10], [4, 10], [-22, 8], [14, -10]].map(([x, y]) => (
            <ellipse key={`${x}${y}`} cx={x} cy={y} rx="4" ry="2.2" fill={butir} />
          ))}
        </g>
      );
    }
    case 'jagung':
      return (
        <g transform="rotate(-20)">
          <path d="M-30 6c-4-10 4-16 10-12 6-6 14 2 10 10z" fill="#7cb85a" />
          <rect x="-26" y="-12" width="54" height="22" rx="11" fill="#f6c443" />
          {[-18, -9, 0, 9, 18].map((x) => (
            <g key={x}>
              <circle cx={x} cy="-5" r="3.2" fill="#e8a923" />
              <circle cx={x + 4} cy="3" r="3.2" fill="#e8a923" />
            </g>
          ))}
        </g>
      );
    case 'ubi':
      return (
        <g>
          <ellipse cx="-12" cy="2" rx="22" ry="14" fill="#9c4a2f" transform="rotate(-15 -12 2)" />
          <ellipse cx="14" cy="6" rx="18" ry="13" fill="#b9573a" />
          <ellipse cx="14" cy="6" rx="13" ry="9" fill="#f2a65a" />
        </g>
      );
    case 'lontong':
      return (
        <g>
          {[-16, 4, 24].map((x) => (
            <rect key={x} x={x - 9} y="-10" width="18" height="22" rx="4" fill="#eef3d8" stroke="#a9c27a" strokeWidth="2" />
          ))}
        </g>
      );
    case 'ikan':
      return (
        <g>
          <path d="M26 0l18-14v28z" fill="#c98b4e" />
          <ellipse cx="0" cy="0" rx="32" ry="15" fill="#e0a865" />
          <path d="M-14-10l6 20M-2-12l6 24M10-11l6 22" stroke="#b9773f" strokeWidth="3" strokeLinecap="round" />
          <circle cx="-22" cy="-3" r="3" fill="#3d2a1a" />
        </g>
      );
    case 'pepes':
      return (
        <g>
          <path d="M-42 4c10-22 74-26 84-4-8 20-76 24-84 4z" fill="#4f8f3f" />
          <path d="M-30 2c10-12 52-14 62-2-8 12-54 14-62 2z" fill="#f3c24b" />
          <path d="M-22 0h44M-16-6l4 12M0-8l4 14M14-6l4 12" stroke="#d99a2b" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="-8" cy="-4" r="4" fill="#5aa84f" />
          <circle cx="10" cy="4" r="4" fill="#e5484d" />
          <path d="M-40 4c-6-6-8-14-2-18M40 0c8-4 10-12 6-18" stroke="#3f7a32" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'ayam':
      return (
        <g>
          <path d="M-30 4c-2-20 22-30 40-18 12 8 10 26-6 30-14 4-32 2-34-12z" fill="#c9783d" />
          <path d="M-22 0c4-8 14-12 22-8" stroke="#e6a061" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M8 10l18 14" stroke="#f3ead9" strokeWidth="8" strokeLinecap="round" />
          <circle cx="28" cy="22" r="5" fill="#f3ead9" />
          <circle cx="24" cy="27" r="5" fill="#f3ead9" />
        </g>
      );
    case 'telur':
      return (
        <g>
          <ellipse cx="-12" cy="0" rx="16" ry="12" fill="#ffffff" stroke="#e6e1d4" strokeWidth="2" />
          <circle cx="-12" cy="0" r="6.5" fill="#f5b631" />
          <ellipse cx="14" cy="4" rx="16" ry="12" fill="#ffffff" stroke="#e6e1d4" strokeWidth="2" />
          <circle cx="14" cy="4" r="6.5" fill="#f5b631" />
        </g>
      );
    case 'tahu':
      return (
        <g>
          {[[-18, -2], [4, -8], [10, 10], [-12, 14]].map(([x, y]) => (
            <g key={`${x}${y}`}>
              <rect x={x - 10} y={y - 10} width="20" height="20" rx="3" fill="#f7ecc9" stroke="#e1cf98" strokeWidth="2" />
              <path d={`M${x - 10} ${y - 4}h20`} stroke="#ead9a6" strokeWidth="2" />
            </g>
          ))}
        </g>
      );
    case 'tempe':
      return (
        <g>
          {[-16, 14].map((x) => (
            <g key={x} transform={`rotate(${x > 0 ? 8 : -8} ${x} 0)`}>
              <rect x={x - 16} y="-12" width="32" height="24" rx="4" fill="#e2b45e" />
              {[[-8, -5], [2, -6], [9, 2], [-4, 5], [5, 7], [-10, 4]].map(([a, b]) => (
                <circle key={`${a}${b}`} cx={x + a} cy={b} r="2.2" fill="#f4dca0" />
              ))}
            </g>
          ))}
        </g>
      );
    case 'sayur':
      return (
        <g>
          <ellipse cx="-16" cy="2" rx="18" ry="11" fill="#4f9a45" transform="rotate(-25 -16 2)" />
          <ellipse cx="8" cy="-4" rx="18" ry="11" fill="#6bb75c" transform="rotate(20 8 -4)" />
          <ellipse cx="2" cy="10" rx="20" ry="10" fill="#3f8a3c" />
          <path d="M-26 8l20-8M0 -2l18 4M-14 12h28" stroke="#9bd38a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="10" r="5" fill="#f08a3c" />
        </g>
      );
    case 'brokoli':
      return (
        <g>
          <path d="M-6 18l6-14M12 18l2-12" stroke="#7fb36a" strokeWidth="7" strokeLinecap="round" />
          <circle cx="-12" cy="-4" r="13" fill="#4f9a45" />
          <circle cx="6" cy="-10" r="14" fill="#5aa84f" />
          <circle cx="22" cy="0" r="12" fill="#4f9a45" />
          <circle cx="2" cy="4" r="10" fill="#6bb75c" />
        </g>
      );
    case 'tomat':
      return (
        <g>
          <circle cx="-10" cy="0" r="12" fill="#e5484d" />
          <circle cx="-10" cy="0" r="7" fill="#f47c74" />
          <circle cx="12" cy="6" r="11" fill="#ef5b52" />
          <circle cx="12" cy="6" r="6" fill="#f99a90" />
        </g>
      );
    case 'buah':
      return (
        <g>
          <path d="M-34 6c10-22 46-24 58-2-18 6-40 8-58 2z" fill="#f28c38" />
          <path d="M-26 4c10-12 32-14 42-2" stroke="#e46c1f" strokeWidth="2" fill="none" />
          {[-14, -4, 6].map((x) => (
            <circle key={x} cx={x} cy="-2" r="2.2" fill="#3d2a1a" />
          ))}
          <circle cx="24" cy="12" r="11" fill="#c9e6a6" stroke="#6bb75c" strokeWidth="3" />
        </g>
      );
    case 'pisang':
      return (
        <g>
          <path d="M-30-4c8 20 44 22 60 2-14 6-44 6-60-2z" fill="#f6d34a" stroke="#d9b12a" strokeWidth="2" />
          {[-16, -2, 12].map((x) => (
            <circle key={x} cx={x} cy="6" r="5" fill="#fbeaa0" stroke="#e8cf6a" strokeWidth="1.5" />
          ))}
        </g>
      );
    case 'saus-kacang':
      return (
        <g>
          <ellipse cx="0" cy="2" rx="30" ry="14" fill="#a8672f" />
          <path d="M-18 0c6-4 16-4 22 0M2 6c6-3 12-2 16 1" stroke="#c98a4d" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="-6" cy="-4" r="2" fill="#7a4a20" />
          <circle cx="10" cy="-2" r="2" fill="#7a4a20" />
        </g>
      );
  }
}

const SLOT = {
  piring: [
    { x: 102, y: 118, s: 1 },
    { x: 172, y: 104, s: 1 },
    { x: 200, y: 140, s: 0.95 },
  ],
  mangkuk: [
    { x: 116, y: 96, s: 0.75 },
    { x: 158, y: 88, s: 0.75 },
    { x: 192, y: 100, s: 0.7 },
  ],
};

export default function IlustrasiHidangan({ resep, className }: { resep: Resep; className?: string }) {
  const { wadah, kuah, isi } = resep.ilustrasi;
  return (
    <svg className={className ?? 'ilustrasi-hidangan'} viewBox="0 0 300 200" aria-hidden="true" focusable="false">
      <rect width="300" height="200" fill="#f4efe6" />
      <path d="M0 150h300v50H0z" fill="#e8dcc6" />
      <ellipse cx="40" cy="40" rx="70" ry="50" fill="#eef6ee" />
      <ellipse cx="270" cy="30" rx="60" ry="40" fill="#fbf3e2" />
      {/* daun hiasan */}
      <path d="M262 168c-20-30-4-62 26-70-2 30-8 56-26 70z" fill="#7cc49b" />
      <path d="M22 178c4-28 28-44 56-40-12 24-30 38-56 40z" fill="#9fd3ae" />
      {wadah === 'piring' ? (
        <g>
          <ellipse cx="150" cy="130" rx="124" ry="58" fill="#d9cdb8" />
          <ellipse cx="150" cy="122" rx="124" ry="58" fill="#ffffff" stroke="#ebe5da" strokeWidth="3" />
          <ellipse cx="150" cy="122" rx="96" ry="42" fill="#faf8f4" />
        </g>
      ) : (
        <g>
          <ellipse cx="150" cy="176" rx="96" ry="14" fill="#d9cdb8" />
          <path d="M44 96h212c-4 52-50 82-106 82S48 148 44 96z" fill="#ffffff" stroke="#ebe5da" strokeWidth="3" />
          <path d="M70 148c22 14 138 14 160 0" stroke="#7cc49b" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="150" cy="96" rx="106" ry="30" fill="#ffffff" stroke="#ebe5da" strokeWidth="3" />
          <ellipse cx="150" cy="98" rx="94" ry="24" fill={kuah ?? '#f2c46b'} />
        </g>
      )}
      {isi.map((e, i) => {
        const p = SLOT[wadah][i];
        return (
          <g key={`${e}-${i}`} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
            <Elemen jenis={e} />
          </g>
        );
      })}
      {wadah === 'mangkuk' && (
        <g>
          <circle cx="132" cy="80" r="4" fill="#5aa84f" />
          <circle cx="178" cy="108" r="3.5" fill="#5aa84f" />
          <circle cx="104" cy="104" r="3" fill="#e5484d" />
        </g>
      )}
    </svg>
  );
}
