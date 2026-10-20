import Link from 'next/link';
import { aksiKeluar } from '../aksi';
import { wajibAdmin } from '@/lib/auth';

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const admin = await wajibAdmin();

  return (
    <>
      <a className="lewati-konten" href="#konten-utama">
        Lewati ke konten utama
      </a>
      <header className="admin-kepala">
        <div className="wadah admin-kepala-isi">
          <Link className="admin-merek" href="/admin/">
            DASH Sehat — Admin
          </Link>
          <nav aria-label="Menu admin">
            <ul className="menu">
              <li>
                <Link href="/admin/">Dasbor</Link>
              </li>
              {admin.peran === 'peneliti' && (
                <li>
                  <Link href="/admin/peserta/">Peserta</Link>
                </li>
              )}
              <li>
                <Link href="/admin/log/">Log Audit</Link>
              </li>
              <li>
                <a href="/" target="_blank" rel="noopener">
                  Lihat website
                </a>
              </li>
            </ul>
          </nav>
          <div className="admin-akun">
            <span>
              {admin.username} <span className="lencana">{admin.peran}</span>
            </span>
            <form action={aksiKeluar}>
              <button type="submit" className="tombol tombol-sekunder tombol-kecil">
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="konten-utama" tabIndex={-1} className="wadah admin-isi">
        {children}
      </main>
    </>
  );
}
