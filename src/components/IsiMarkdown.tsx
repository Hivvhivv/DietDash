import { Children, isValidElement, type ReactElement } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TabMenu from './TabMenu';
import { parseGaleri, parseMenu } from '@/lib/blok-khusus';

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

// HTML mentah di dalam Markdown sengaja tidak dirender (skipHtml), sehingga aman
// juga bila isi materi berasal dari input admin.
// Di halaman materi, judul materi sudah menjadi <h1>, jadi "###" ditampilkan sebagai <h2>
// dan "####" sebagai <h3> agar urutan judul tetap benar untuk pembaca layar.
export default function IsiMarkdown({ isi }: { isi: string }) {
  return (
    <div className="isi-materi">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          h1: ({ node: _node, ...props }) => <h2 {...props} />,
          h2: ({ node: _node, ...props }) => <h2 {...props} />,
          h3: ({ node: _node, ...props }) => <h2 {...props} />,
          h4: ({ node: _node, ...props }) => <h3 {...props} />,
          table: ({ node: _node, ...props }) => (
            <div className="tabel-gulir" role="region" aria-label="Tabel" tabIndex={0}>
              <table {...props} />
            </div>
          ),
          blockquote: ({ node: _node, ...props }) => <blockquote className="kotak-tips" {...props} />,
          pre: ({ node: _node, children, ...props }) => {
            const kode = Children.toArray(children)[0];
            if (isValidElement(kode)) {
              const p = (kode as ReactElement<{ className?: string; children?: unknown }>).props;
              const bahasa = /language-(\w+)/.exec(p.className ?? '')?.[1];
              const teks = String(p.children ?? '');
              if (bahasa === 'galeri') return <Galeri teks={teks} />;
              if (bahasa === 'menu') {
                const r = parseMenu(teks);
                return r.ok ? <TabMenu menu={r.menu} /> : <p className="galat-umum">{r.pesan}</p>;
              }
            }
            return <pre {...props}>{children}</pre>;
          },
        }}
      >
        {isi}
      </Markdown>
    </div>
  );
}
