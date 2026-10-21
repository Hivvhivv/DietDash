// Unggah gambar konten (admin). Dibatasi 2 MB; teks alternatif wajib.
import { headers } from 'next/headers';
import { adminSaatIni } from '@/lib/admin-auth';
import { catatAudit } from '@/lib/db';
import { simpanGambar } from '@/lib/gambar';

export async function POST(req: Request) {
  const h = await headers();
  const asal = h.get('origin');
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (asal && host && new URL(asal).host !== host) return Response.json({ pesan: 'Ditolak.' }, { status: 403 });
  const admin = await adminSaatIni();
  if (!admin) return Response.json({ pesan: 'Sesi admin berakhir. Masuk lagi.' }, { status: 401 });
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return Response.json({ pesan: 'Berkas tidak terbaca atau terlalu besar.' }, { status: 400 });
  }
  const berkas = fd.get('berkas');
  if (!(berkas instanceof File)) return Response.json({ pesan: 'Pilih berkas gambar.' }, { status: 400 });
  const hasil = await simpanGambar(berkas, String(fd.get('alt') ?? ''), admin.email);
  if (!hasil.ok) return Response.json({ pesan: hasil.pesan }, { status: 400 });
  await catatAudit({ admin: admin.email, aksi: 'unggah_gambar', objek: hasil.id });
  return Response.json({ id: hasil.id, url: `/gambar-konten/${hasil.id}/` });
}
