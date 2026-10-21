import Link from 'next/link';
import { aksiKeluarAdmin } from '../aksi-akun';
import MenuAdmin from '@/components/admin/MenuAdmin';
import Ikon from '@/components/Ikon';
import Logo from '@/components/Logo';
import { wajibAdmin } from '@/lib/admin-auth';
import { jumlahPerluPerhatian } from '@/lib/dashboard-admin';

// Kerangka panel admin: menu samping (sidebar) + bilah atas berisi pemberitahuan dan akun.
export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const admin = await wajibAdmin();
  const superAdmin = admin.peran === 'super_admin';
  const perhatian = await jumlahPerluPerhatian();
  const inisial = admin.nama.trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className="panel-admin">
      <a className="lewati-konten" href="#konten-utama">
        Lewati ke konten utama
      </a>
      <aside className="panel-sisi">
        <Link className="panel-merek" href="/admin/dashboard/">
          <Logo ukuran={40} />
          <span>
            <span className="panel-merek-nama">DASH Sehat</span>
            <span className="panel-merek-peran">Administrator</span>
          </span>
        </Link>
        <MenuAdmin superAdmin={superAdmin}>
          <form action={aksiKeluarAdmin}>
            <button type="submit" className="panel-keluar">
              <Ikon nama="keluar" />
              Keluar
            </button>
          </form>
        </MenuAdmin>
      </aside>

      <div className="panel-kanan">
        <header className="panel-atas">
          <Link
            className="panel-lonceng"
            href="/admin/dashboard/#perhatian"
            aria-label={perhatian ? `${perhatian} responden perlu perhatian` : 'Tidak ada responden yang perlu perhatian'}
          >
            <Ikon nama="lonceng" />
            {perhatian > 0 && (
              <span className="panel-lonceng-angka" aria-hidden="true">
                {perhatian > 99 ? '99+' : perhatian}
              </span>
            )}
          </Link>
          <div className="panel-akun">
            <span className="panel-avatar" aria-hidden="true">
              {inisial}
            </span>
            <span className="panel-akun-teks">
              <span className="panel-akun-nama">{admin.nama}</span>
              <span className="panel-akun-peran">{superAdmin ? 'Super admin' : 'Administrator'}</span>
            </span>
          </div>
        </header>
        <main id="konten-utama" tabIndex={-1} className="panel-isi">
          {children}
        </main>
        <p className="panel-catatan">Sesi admin berakhir otomatis setelah 30 menit tanpa aktivitas.</p>
      </div>
    </div>
  );
}
