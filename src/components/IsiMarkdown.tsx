import { Children, isValidElement, type ReactElement } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TabMenu from './TabMenu';
import { bagiPerSubjudul, parseCatatan, parseGaleri, parseMenu } from '@/lib/blok-khusus';

function Galeri({ teks }: { teks: string }) {
  const item = parseGaleri(teks);
  return (
    <ul className="galeri-makanan">
      {item.map((x) => (
        <li key={x.nama}>
          <span className="galeri-emoji" aria-hidden="true">
            {x.emoji}
          </span>
          <span className="galeri-nama">{x.nama}</span>
          {x.keterangan && <span className="label-kecil">{x.keterangan}</span>}
        </li>
      ))}
    </ul>
  );
}

// Kotak di dalam isi materi: ```contoh (contoh penerapan sehari-hari) dan ```penting (poin penting).
function Kotak({ jenis, teks }: { jenis: 'contoh' | 'penting'; teks: string }) {
  return (
    <aside className={jenis === 'contoh' ? 'kotak kotak-contoh' : 'kotak kotak-poin'} aria-label={jenis === 'contoh' ? 'Contoh penerapan sehari-hari' : 'Poin penting'}>
      <p className="kotak-judul">{jenis === 'contoh' ? '🍽️ Contoh penerapan sehari-hari' : '⭐ Poin penting'}</p>
      <IsiMarkdown isi={teks} />
    </aside>
  );
}

// ```catatan: kotak biru untuk pengingat, mis. "Catatan Medis" (baris pertama "# Judul" opsional).
function Catatan({ teks }: { teks: string }) {
  const c = parseCatatan(teks);
  return (
    <aside className="kotak kotak-catatan" aria-label={c.judul}>
      <span className="kotak-catatan-ikon" aria-hidden="true">
        i
      </span>
      <div>
        <p className="kotak-judul">{c.judul}</p>
        <IsiMarkdown isi={c.isi} />
      </div>
    </aside>
  );
}

// Isi materi dipecah per "## Subjudul" menjadi kartu bagian (tampilan baca responden & pratinjau editor).
export function IsiMateriBagian({ isi }: { isi: string }) {
  return (
    <>
      {bagiPerSubjudul(isi).map((b, i) => (
        <section key={i} className="bagian-materi">
          <IsiMarkdown isi={b} />
        </section>
      ))}
    </>
  );
}

const komponen = {
  h1: ({ node: _n, ...p }: React.ComponentProps<'h1'> & { node?: unknown }) => <h2 {...p} />,
  h2: ({ node: _n, ...p }: React.ComponentProps<'h2'> & { node?: unknown }) => <h2 {...p} />,
  h3: ({ node: _n, ...p }: React.ComponentProps<'h3'> & { node?: unknown }) => <h2 {...p} />,
  h4: ({ node: _n, ...p }: React.ComponentProps<'h4'> & { node?: unknown }) => <h3 {...p} />,
  table: ({ node: _n, ...p }: React.ComponentProps<'table'> & { node?: unknown }) => (
    <div className="tabel-gulir" role="region" aria-label="Tabel" tabIndex={0}>
      <table {...p} />
    </div>
  ),
  blockquote: ({ node: _n, ...p }: React.ComponentProps<'blockquote'> & { node?: unknown }) => <blockquote className="kotak-tips" {...p} />,
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ node: _n, src, alt }: React.ComponentProps<'img'> & { node?: unknown }) => (
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" decoding="async" className="gambar-materi" />
  ),
  a: ({ node: _n, href, ...p }: React.ComponentProps<'a'> & { node?: unknown }) => (
    <a href={href} {...(href?.startsWith('http') ? { rel: 'noopener noreferrer' } : {})} {...p} />
  ),
  pre: ({ node: _n, children, ...props }: React.ComponentProps<'pre'> & { node?: unknown }) => {
    const kode = Children.toArray(children)[0];
    if (isValidElement(kode)) {
      const p = (kode as ReactElement<{ className?: string; children?: unknown }>).props;
      const bahasa = /language-([\w-]+)/.exec(p.className ?? '')?.[1];
      const teks = String(p.children ?? '');
      if (bahasa === 'galeri') return <Galeri teks={teks} />;
      if (bahasa === 'contoh' || bahasa === 'penting') return <Kotak jenis={bahasa} teks={teks} />;
      if (bahasa === 'catatan') return <Catatan teks={teks} />;
      if (bahasa === 'menu') {
        const r = parseMenu(teks);
        return r.ok ? <TabMenu menu={r.menu} /> : <p className="galat-umum">{r.pesan}</p>;
      }
    }
    return <pre {...props}>{children}</pre>;
  },
};

// HTML mentah di dalam Markdown sengaja tidak dirender (skipHtml), sehingga aman untuk isi dari admin.
// Judul materi sudah menjadi <h1>, jadi "##"/"###" ditampilkan sebagai <h2> agar urutan judul benar.
export default function IsiMarkdown({ isi, sebaris = false }: { isi: string; sebaris?: boolean }) {
  if (sebaris) {
    return (
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={{ ...komponen, p: ({ children }) => <>{children}</> }}>
        {isi}
      </Markdown>
    );
  }
  return (
    <div className="isi-materi">
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={komponen}>
        {isi}
      </Markdown>
    </div>
  );
}
