// Penerima lama membaca (detik) dari halaman materi. Hanya dihitung saat halaman aktif di layar
// dan ada interaksi dalam 5 menit terakhir (diatur di komponen PencatatBaca).
import { headers } from 'next/headers';
import { tambahDetikBaca } from '@/lib/progres';
import { respondenSaatIni } from '@/lib/responden';

export async function POST(req: Request) {
  // Tolak kiriman lintas situs.
  const h = await headers();
  const asal = h.get('origin');
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (asal && host && new URL(asal).host !== host) return new Response(null, { status: 403 });

  const a = await respondenSaatIni();
  if (!a) return new Response(null, { status: 401 });
  let data: { materi?: unknown; detik?: unknown };
  try {
    data = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof data.materi !== 'string' || typeof data.detik !== 'number') return new Response(null, { status: 400 });
  await tambahDetikBaca(a.r._id, data.materi, data.detik);
  return new Response(null, { status: 204 });
}
