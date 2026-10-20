// Logo: hati dari dua daun.
export default function Logo({ ukuran = 44 }: { ukuran?: number }) {
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 43C12 34 4 26.5 4 17.5A10.5 10.5 0 0 1 24 12z" fill="#2e7d5b" />
      <path d="M24 43c12-9 20-16.5 20-25.5A10.5 10.5 0 0 0 24 12z" fill="#7cc49b" />
      <path
        d="M24 41c-1.5-8 .5-17 8-24"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M27.5 27.5c3 .3 5.5-.6 7.5-2.8M25.6 34c2.6.5 5-.2 7-1.9" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
