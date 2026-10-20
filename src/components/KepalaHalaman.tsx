import Image from 'next/image';
import Link from 'next/link';

interface Props {
  judul: string;
  label?: string;
  ringkasan?: React.ReactNode;
  gambar?: { src: string; width: number; height: number; alt?: string };
  remah?: { href: string; label: string }[];
  children?: React.ReactNode; // info tambahan di bawah ringkasan
}

// Pita judul halaman bergaya sama dengan hero beranda. Berisi satu-satunya <h1> di halaman.
export default function KepalaHalaman({ judul, label, ringkasan, gambar, remah, children }: Props) {
  return (
    <section className="kepala-halaman" aria-labelledby="judul-halaman">
      <div className="wadah kepala-halaman-isi">
        <div className="kepala-halaman-teks">
          {remah && (
            <nav aria-label="Lokasi halaman" className="remah">
              <Link href="/">Beranda</Link>
              {remah.map((r) => (
                <span key={r.href} className="remah-item">
                  <span aria-hidden="true">›</span>
                  <Link href={r.href}>{r.label}</Link>
                </span>
              ))}
            </nav>
          )}
          {label && <p className="hero-lencana">{label}</p>}
          <h1 id="judul-halaman">{judul}</h1>
          {ringkasan && <p className="kepala-halaman-ringkasan">{ringkasan}</p>}
          {children}
        </div>
        {gambar && (
          <Image
            className="kepala-halaman-gambar"
            src={gambar.src}
            alt={gambar.alt ?? ''}
            width={gambar.width}
            height={gambar.height}
            preload
          />
        )}
      </div>
    </section>
  );
}
