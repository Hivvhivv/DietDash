'use client';

import { useId, useState } from 'react';

interface Props {
  label?: string;
  onSelesai: (hasil: { id: string; url: string; alt: string }) => void;
}

// Unggah gambar ke /admin/unggah-gambar/ (JPG/PNG/WebP, maks. 2 MB). Teks alternatif wajib.
export default function UnggahGambar({ label = 'Unggah gambar', onSelesai }: Props) {
  const id = useId();
  const [alt, setAlt] = useState('');
  const [pesan, setPesan] = useState<string | null>(null);
  const [menunggu, setMenunggu] = useState(false);

  async function unggah(berkas: File | undefined) {
    if (!berkas) return;
    if (!alt.trim()) {
      setPesan('Isi teks alternatif dulu: jelaskan isi gambar dalam satu kalimat.');
      return;
    }
    if (berkas.size > 2 * 1024 * 1024) {
      setPesan('Ukuran gambar maksimal 2 MB.');
      return;
    }
    setMenunggu(true);
    setPesan(null);
    const fd = new FormData();
    fd.set('berkas', berkas);
    fd.set('alt', alt.trim());
    try {
      const r = await fetch('/admin/unggah-gambar/', { method: 'POST', body: fd });
      const j = (await r.json()) as { id?: string; url?: string; pesan?: string };
      if (!r.ok || !j.id || !j.url) setPesan(j.pesan ?? 'Gagal mengunggah.');
      else {
        onSelesai({ id: j.id, url: j.url, alt: alt.trim() });
        setPesan('Gambar terunggah ✓');
        setAlt('');
      }
    } catch {
      setPesan('Koneksi terputus. Coba lagi.');
    } finally {
      setMenunggu(false);
    }
  }

  return (
    <div className="unggah-gambar">
      <div className="bidang">
        <label htmlFor={`${id}-alt`}>Teks alternatif gambar</label>
        <p className="petunjuk">Contoh: &quot;Piring berisi nasi merah, ikan, dan sayur bayam.&quot;</p>
        <input id={`${id}-alt`} value={alt} onChange={(e) => setAlt(e.target.value)} />
      </div>
      <div className="bidang">
        <label htmlFor={`${id}-berkas`}>{label}</label>
        <p className="petunjuk">JPG, PNG, atau WebP, maksimal 2 MB. Gambar otomatis diperkecil.</p>
        <input
          id={`${id}-berkas`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={menunggu}
          onChange={(e) => {
            void unggah(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {menunggu && <p role="status">Mengunggah…</p>}
      {pesan && <p role="status" className={pesan.endsWith('✓') ? 'label-kecil' : 'galat'}>{pesan}</p>}
    </div>
  );
}
