// Menyajikan gambar konten yang diunggah admin (WebP dari GridFS).
import { bacaGambar } from '@/lib/gambar';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isi = await bacaGambar(id);
  if (!isi) return new Response('Gambar tidak ditemukan', { status: 404 });
  return new Response(new Uint8Array(isi), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
