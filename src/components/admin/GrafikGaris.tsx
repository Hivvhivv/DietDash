// Grafik garis satu seri (SVG, dirender di server). Setiap titik punya tooltip (<title>);
// tabel tersembunyi untuk pembaca layar menjadi alternatif teksnya.
interface Titik {
  label: string;
  nilai: number;
}

const L = 640;
const T = 240;
const KIRI = 36;
const KANAN = 16;
const ATAS = 16;
const BAWAH = 30;

function skalaAtas(maks: number): number {
  if (maks <= 4) return 4;
  const langkah = 10 ** Math.floor(Math.log10(maks));
  return Math.ceil(maks / langkah) * langkah;
}

export default function GrafikGaris({ data, satuan, judulTabel }: { data: Titik[]; satuan: string; judulTabel: string }) {
  const atas = skalaAtas(Math.max(0, ...data.map((d) => d.nilai)));
  const lebarPlot = L - KIRI - KANAN;
  const tinggiPlot = T - ATAS - BAWAH;
  const x = (i: number) => KIRI + (data.length > 1 ? (i / (data.length - 1)) * lebarPlot : lebarPlot / 2);
  const y = (v: number) => ATAS + tinggiPlot - (v / atas) * tinggiPlot;
  const garis = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.nilai).toFixed(1)}`).join(' ');
  const area = `${garis} L${x(data.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`;
  const garisBantu = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(atas * f));
  // Label sumbu-x dijarangkan agar tidak bertumpuk pada rentang 30 hari.
  const setiap = Math.max(1, Math.ceil(data.length / 8));

  return (
    <figure className="grafik-garis">
      <svg viewBox={`0 0 ${L} ${T}`} aria-hidden="true" focusable="false">
        {garisBantu.map((v) => (
          <g key={v}>
            <line x1={KIRI} x2={L - KANAN} y1={y(v)} y2={y(v)} className="grafik-garis-bantu" />
            <text x={KIRI - 8} y={y(v) + 4} textAnchor="end" className="grafik-garis-sumbu">
              {v}
            </text>
          </g>
        ))}
        <path d={area} className="grafik-garis-area" />
        <path d={garis} className="grafik-garis-jalur" />
        {data.map((d, i) => (
          <g key={d.label} className="grafik-garis-titik">
            {/* area sentuh lebih besar dari titiknya */}
            <circle cx={x(i)} cy={y(d.nilai)} r="14" className="grafik-garis-sentuh">
              <title>{`${d.label}: ${d.nilai} ${satuan}`}</title>
            </circle>
            <circle cx={x(i)} cy={y(d.nilai)} r="5" className="grafik-garis-bulat" />
            {(i % setiap === 0 || i === data.length - 1) && (
              <text x={x(i)} y={T - 8} textAnchor="middle" className="grafik-garis-sumbu">
                {d.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {/* sr-only di pembungkus: <table> mengabaikan lebar 1px sehingga bisa melebarkan halaman */}
      <div className="sr-only">
      <table>
        <caption>{judulTabel}</caption>
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">{satuan}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{d.nilai}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}
