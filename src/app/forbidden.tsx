import Link from 'next/link';

// 403: admin biasa membuka fitur khusus super admin (PRD 7.8).
export default function Terlarang() {
  return (
    <main id="konten-utama" className="wadah-baca admin-masuk">
      <h1>Akses ditolak</h1>
      <p>Halaman ini hanya untuk super admin. Jika Anda memerlukan akses, hubungi super admin penelitian.</p>
      <p>
        <Link href="/admin/dashboard/">Kembali ke dashboard admin</Link>
      </p>
    </main>
  );
}
