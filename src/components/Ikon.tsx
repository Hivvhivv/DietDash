// Ikon kecil dekoratif; selalu disertai label teks di sebelahnya (atau aria-label pada tombolnya).
export type NamaIkon =
  | 'jam'
  | 'target'
  | 'bintang'
  | 'peringatan'
  | 'telepon'
  | 'gembok'
  | 'mata'
  | 'mata-tutup'
  | 'orang'
  | 'tambah-orang'
  | 'gerigi'
  | 'panah-kanan'
  | 'salin'
  | 'gambar'
  | 'kunci'
  | 'dasbor'
  | 'buku'
  | 'dokumen'
  | 'kuis'
  | 'pengguna'
  | 'grafik'
  | 'lapisan'
  | 'perisai'
  | 'daftar'
  | 'keluar'
  | 'lonceng'
  | 'tanya'
  | 'tutup'
  | 'menu'
  | 'piring'
  | 'lampu'
  | 'putar'
  | 'jam-pasir'
  | 'centang-bulat'
  | 'rumah';

export default function Ikon({ nama, ukuran = 22 }: { nama: NamaIkon; ukuran?: number }) {
  const umum = {
    width: ukuran,
    height: ukuran,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
    focusable: false,
  } as const;
  const garis = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

  switch (nama) {
    case 'jam':
      return (
        <svg {...umum}>
          <circle cx="12" cy="12" r="9" {...garis} />
          <path d="M12 7v5l3 2" {...garis} />
        </svg>
      );
    case 'target':
      return (
        <svg {...umum}>
          <circle cx="12" cy="12" r="9" {...garis} />
          <circle cx="12" cy="12" r="4" {...garis} />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case 'bintang':
      return (
        <svg {...umum}>
          <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" fill="currentColor" />
        </svg>
      );
    case 'peringatan':
      return (
        <svg {...umum}>
          <path d="M12 3l10 18H2z" {...garis} />
          <path d="M12 10v5M12 18v.5" {...garis} />
        </svg>
      );
    case 'telepon':
      return (
        <svg {...umum}>
          <rect x="6" y="2.5" width="12" height="19" rx="2.5" {...garis} />
          <path d="M11 18h2" {...garis} />
        </svg>
      );
    case 'gembok':
      return (
        <svg {...umum}>
          <rect x="4.5" y="10.5" width="15" height="10.5" rx="2" {...garis} />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5" {...garis} />
        </svg>
      );
    case 'mata':
      return (
        <svg {...umum}>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" {...garis} />
          <circle cx="12" cy="12" r="3" {...garis} />
        </svg>
      );
    case 'mata-tutup':
      return (
        <svg {...umum}>
          <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" {...garis} />
        </svg>
      );
    case 'orang':
      return (
        <svg {...umum}>
          <circle cx="12" cy="8" r="4" fill="currentColor" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill="currentColor" />
        </svg>
      );
    case 'tambah-orang':
      return (
        <svg {...umum}>
          <circle cx="10" cy="8" r="4" fill="currentColor" />
          <path d="M2 21c0-4.4 3.6-7 8-7 1.4 0 2.7.3 3.8.8A5.5 5.5 0 0 0 13 21z" fill="currentColor" />
          <path d="M19 14v6M16 17h6" {...garis} />
        </svg>
      );
    case 'gerigi':
      return (
        <svg {...umum}>
          <circle cx="12" cy="12" r="3" {...garis} />
          <path
            d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
            {...garis}
            strokeWidth={1.6}
          />
        </svg>
      );
    case 'panah-kanan':
      return (
        <svg {...umum}>
          <path d="M5 12h14M13 6l6 6-6 6" {...garis} />
        </svg>
      );
    case 'salin':
      return (
        <svg {...umum}>
          <rect x="8.5" y="8.5" width="12" height="12.5" rx="2.5" {...garis} />
          <path d="M15.5 8.5V5.5a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 5.5v7.5A2.5 2.5 0 0 0 6 15.5h2.5" {...garis} />
        </svg>
      );
    case 'gambar':
      return (
        <svg {...umum}>
          <rect x="3" y="3.5" width="18" height="17" rx="2.5" {...garis} />
          <circle cx="8.5" cy="9" r="1.8" fill="currentColor" />
          <path d="M21 16l-5-5-9 9.5" {...garis} />
        </svg>
      );
    case 'kunci':
      return (
        <svg {...umum}>
          <circle cx="8" cy="15" r="5" {...garis} />
          <circle cx="8" cy="15" r="1.4" fill="currentColor" />
          <path d="M11.5 11.5L20 3M16.5 6.5l2.5 2.5M14 9l2 2" {...garis} />
        </svg>
      );
    case 'dasbor':
      return (
        <svg {...umum}>
          <rect x="3" y="3" width="7.5" height="9" rx="1.5" {...garis} />
          <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5" {...garis} />
          <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.5" {...garis} />
          <rect x="3" y="15" width="7.5" height="6" rx="1.5" {...garis} />
        </svg>
      );
    case 'buku':
      return (
        <svg {...umum}>
          <path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2zM12 6.5v13" {...garis} />
        </svg>
      );
    case 'dokumen':
      return (
        <svg {...umum}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" {...garis} />
          <path d="M14 3v5h5M9 13h6M9 17h6" {...garis} />
        </svg>
      );
    case 'kuis':
      return (
        <svg {...umum}>
          <rect x="5" y="4" width="14" height="17" rx="2" {...garis} />
          <path d="M9 4V2.5h6V4M8.5 11l2 2 4-4M8.5 17h7" {...garis} />
        </svg>
      );
    case 'pengguna':
      return (
        <svg {...umum}>
          <circle cx="9" cy="8" r="3.5" {...garis} />
          <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.4c2.1.8 3.5 2.8 3.5 5.6" {...garis} />
        </svg>
      );
    case 'grafik':
      return (
        <svg {...umum}>
          <path d="M3 3v18h18" {...garis} />
          <path d="M7 15l4-4 3 3 5-6" {...garis} />
        </svg>
      );
    case 'lapisan':
      return (
        <svg {...umum}>
          <path d="M12 3l9 5-9 5-9-5z" {...garis} />
          <path d="M3 13l9 5 9-5" {...garis} />
        </svg>
      );
    case 'perisai':
      return (
        <svg {...umum}>
          <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" {...garis} />
          <path d="M8.5 12l2.5 2.5 4.5-5" {...garis} />
        </svg>
      );
    case 'daftar':
      return (
        <svg {...umum}>
          <path d="M9 6h11M9 12h11M9 18h11" {...garis} />
          <circle cx="4.5" cy="6" r="1" fill="currentColor" />
          <circle cx="4.5" cy="12" r="1" fill="currentColor" />
          <circle cx="4.5" cy="18" r="1" fill="currentColor" />
        </svg>
      );
    case 'keluar':
      return (
        <svg {...umum}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" {...garis} />
        </svg>
      );
    case 'lonceng':
      return (
        <svg {...umum}>
          <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9zM10 20a2.2 2.2 0 0 0 4 0" {...garis} />
        </svg>
      );
    case 'tanya':
      return (
        <svg {...umum}>
          <circle cx="12" cy="12" r="9" {...garis} />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.5" {...garis} />
        </svg>
      );
    case 'tutup':
      return (
        <svg {...umum}>
          <path d="M6 6l12 12M18 6L6 18" {...garis} />
        </svg>
      );
    case 'menu':
      return (
        <svg {...umum}>
          <path d="M4 7h16M4 12h16M4 17h16" {...garis} />
        </svg>
      );
    case 'piring':
      return (
        <svg {...umum}>
          <circle cx="12" cy="12" r="8.5" {...garis} />
          <circle cx="12" cy="12" r="4.5" {...garis} />
          <path d="M12 3.5v4M12 16.5v4" {...garis} />
        </svg>
      );
    case 'lampu':
      return (
        <svg {...umum}>
          <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" {...garis} />
        </svg>
      );
    case 'putar':
      return (
        <svg {...umum}>
          <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z" fill="currentColor" />
        </svg>
      );
    case 'jam-pasir':
      return (
        <svg {...umum}>
          <path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9" {...garis} />
        </svg>
      );
    case 'centang-bulat':
      return (
        <svg {...umum}>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'rumah':
      return (
        <svg {...umum}>
          <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" fill="currentColor" />
        </svg>
      );
  }
}
