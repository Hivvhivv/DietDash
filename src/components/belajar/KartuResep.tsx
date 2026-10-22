import Image from 'next/image';
import Link from 'next/link';
import Ikon from '../Ikon';
import IlustrasiHidangan from './IlustrasiHidangan';
import { LABEL_TINGKAT, WAKTU_MAKAN, type Resep } from '@/data/resep-sehat';

export function GambarResep({ resep, besar = false }: { resep: Resep; besar?: boolean }) {
  return resep.foto ? (
    <Image className="gambar-resep" src={resep.foto} alt="" width={besar ? 720 : 480} height={besar ? 480 : 320} />
  ) : (
    <IlustrasiHidangan resep={resep} className="gambar-resep" />
  );
}

// Natrium/kalium/serat ditampilkan sebagai tingkat perkiraan; angka hanya bila sudah dihitung ahli gizi.
export function GiziResep({ resep }: { resep: Resep }) {
  const a = resep.angka;
  const isi = [
    { label: 'Natrium', nilai: a ? `${a.natrium_mg} mg` : LABEL_TINGKAT[resep.gizi.natrium] },
    { label: 'Kalium', nilai: a ? `${a.kalium_mg} mg` : LABEL_TINGKAT[resep.gizi.kalium] },
    { label: 'Serat', nilai: a ? `${a.serat_g} g` : LABEL_TINGKAT[resep.gizi.serat] },
  ];
  return (
    <dl className="gizi-resep">
      {isi.map((g) => (
        <div key={g.label}>
          <dt>{g.label}</dt>
          <dd>{g.nilai}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function KartuResep({ resep }: { resep: Resep }) {
  const href = `/belajar/menu-sehat/${resep.kunci}/`;
  return (
    <li className="kartu-resep">
      <div className="kartu-resep-gambar">
        <GambarResep resep={resep} />
        <span className="kartu-resep-tag">
          <span className="tag-resep tag-resep-waktu">{WAKTU_MAKAN[resep.waktu].label}</span>
          <span className="tag-resep">{resep.label}</span>
        </span>
      </div>
      <div className="kartu-resep-isi">
        <h3>
          <Link href={href}>{resep.nama}</Link>
        </h3>
        <p className="kartu-resep-deskripsi">{resep.deskripsi}</p>
        <GiziResep resep={resep} />
        <p className="rahasia-gurih">
          <Ikon nama="lampu" ukuran={20} />
          <span>
            <strong>Rahasia Gurih:</strong> {resep.rahasiaGurih}
          </span>
        </p>
        <div className="kartu-resep-kaki">
          <span>
            <Ikon nama="jam" ukuran={18} /> {resep.menit} menit masak
          </span>
          <Link className="tombol tombol-kecil" href={href} aria-label={`Lihat resep ${resep.nama}`}>
            Lihat Resep
            <Ikon nama="panah-kanan" ukuran={18} />
          </Link>
        </div>
      </div>
    </li>
  );
}
