// Ikon kecil dekoratif; selalu disertai label teks di sebelahnya.
type NamaIkon = 'jam' | 'target' | 'bintang' | 'peringatan';

export default function Ikon({ nama, ukuran = 22 }: { nama: NamaIkon; ukuran?: number }) {
  const umum = {
    width: ukuran,
    height: ukuran,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
    focusable: false,
  } as const;
  const garis = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 } as const;

  switch (nama) {
    case 'jam':
      return (
        <svg {...umum}>
          <circle cx="12" cy="12" r="9" {...garis} />
          <path d="M12 7v5l3 2" {...garis} strokeLinecap="round" />
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
          <path
            d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"
            fill="currentColor"
          />
        </svg>
      );
    case 'peringatan':
      return (
        <svg {...umum}>
          <path d="M12 3l10 18H2z" {...garis} strokeLinejoin="round" />
          <path d="M12 10v5M12 18v.5" {...garis} strokeLinecap="round" />
        </svg>
      );
  }
}
