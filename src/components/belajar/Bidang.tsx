// Kolom formulir dengan label, petunjuk, dan pesan kesalahan di dekat kolom (PRD 15, aksesibilitas).
interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  petunjuk?: React.ReactNode;
  galat?: string | null;
  ikon?: React.ReactNode; // ikon dekoratif di kiri kolom
  ujung?: React.ReactNode; // tombol kecil di kanan kolom (mis. tampilkan/sembunyikan kode)
}

export default function Bidang({ id, label, petunjuk, galat, ikon, ujung, ...input }: Props) {
  const idPetunjuk = petunjuk ? `petunjuk-${id}` : undefined;
  const idGalat = galat ? `galat-${id}` : undefined;
  const kolom = (
    <input
      id={id}
      name={id}
      aria-invalid={galat ? true : undefined}
      aria-describedby={[idPetunjuk, idGalat].filter(Boolean).join(' ') || undefined}
      {...input}
    />
  );
  return (
    <div className="bidang">
      <label htmlFor={id}>{label}</label>
      {petunjuk && (
        <p className="petunjuk" id={idPetunjuk}>
          {petunjuk}
        </p>
      )}
      {ikon || ujung ? (
        <div className={`bidang-berikon${ikon ? ' ada-ikon' : ''}${ujung ? ' ada-ujung' : ''}`}>
          {ikon && <span className="bidang-ikon">{ikon}</span>}
          {kolom}
          {ujung && <span className="bidang-ujung">{ujung}</span>}
        </div>
      ) : (
        kolom
      )}
      {galat && (
        <p className="galat" id={idGalat}>
          {galat}
        </p>
      )}
    </div>
  );
}

export function Pesan({ pesan, sukses }: { pesan?: string; sukses?: string }) {
  if (sukses) {
    return (
      <p className="pesan-sukses" role="status">
        {sukses}
      </p>
    );
  }
  if (!pesan) return null;
  return (
    <p className="galat-umum" role="alert">
      {pesan}
    </p>
  );
}
