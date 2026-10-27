'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { aksiEditResponden, aksiHapusResponden, aksiResetToken, aksiStatusAkun, type StatusAksiAdmin } from '@/app/admin/aksi-responden';
import Ikon from '../Ikon';
import { Pesan } from '../belajar/Bidang';
import type { BarisResponden } from './TabelResponden';

type Jenis = 'edit' | 'reset' | 'status' | 'hapus';

export function Dialog({ judul, buka, tutup, children }: { judul: string; buka: boolean; tutup: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const idJudul = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (buka && !d.open) d.showModal();
    if (!buka && d.open) d.close();
  }, [buka]);
  return (
    <dialog ref={ref} className="dialog-admin" onClose={tutup} aria-labelledby={idJudul}>
      <div className="dialog-admin-kepala">
        <h2 id={idJudul}>{judul}</h2>
        <button type="button" className="tombol tombol-sekunder tombol-ikon" onClick={tutup} aria-label="Tutup">
          ✕
        </button>
      </div>
      {buka && children}
    </dialog>
  );
}

function useAksi(aksi: (s: StatusAksiAdmin | undefined, fd: FormData) => Promise<StatusAksiAdmin>, segarkan: boolean) {
  const router = useRouter();
  const [status, jalankan, menunggu] = useActionState<StatusAksiAdmin | undefined, FormData>(aksi, undefined);
  useEffect(() => {
    if (segarkan && status?.sukses) router.refresh();
  }, [status, segarkan, router]);
  return { status, jalankan, menunggu };
}

function Alasan({ wajib = true }: { wajib?: boolean }) {
  return (
    <div className="bidang">
      <label htmlFor="alasan-aksi">Alasan{wajib ? '' : ' (opsional)'}</label>
      <textarea id="alasan-aksi" name="alasan" rows={2} required={wajib} minLength={wajib ? 5 : undefined} placeholder="mis. responden lupa kode akses" />
    </div>
  );
}

type DataEdit = Pick<BarisResponden, 'id_peserta' | 'nama' | 'nomor_samar' | 'sampel' | 'pretest' | 'posttest'>;

function FormEdit({ b, tutup }: { b: DataEdit; tutup: () => void }) {
  const { status, jalankan, menunggu } = useAksi(aksiEditResponden, true);
  return (
    <form action={jalankan} className="form-admin">
      <input type="hidden" name="id_peserta" value={b.id_peserta} />
      <Pesan pesan={status?.pesan} sukses={status?.sukses} />
      <div className="bidang">
        <label htmlFor="edit-nama">Nama</label>
        <input id="edit-nama" name="nama" defaultValue={status?.nilai?.nama ?? b.nama} autoComplete="off" />
      </div>
      <div className="bidang">
        <label htmlFor="edit-nomor">Nomor HP baru</label>
        <p className="petunjuk">Sekarang: {b.nomor_samar}. Kosongkan bila tidak diubah.</p>
        <input id="edit-nomor" name="nomor" type="tel" inputMode="tel" defaultValue={status?.nilai?.nomor ?? ''} autoComplete="off" />
      </div>
      <div className="bidang">
        <label htmlFor="edit-sampel">Kelompok</label>
        <select id="edit-sampel" name="sampel" defaultValue={b.sampel ? 'responden_penelitian' : 'bukan_sampel'}>
          <option value="responden_penelitian">Responden penelitian</option>
          <option value="bukan_sampel">Bukan sampel (uji coba / tim)</option>
        </select>
      </div>
      <fieldset className="daftar-centang">
        <legend>Tanda manual pretest / posttest (bila dikerjakan di kertas; tes online tercatat otomatis)</legend>
        <label className="centang">
          <input type="checkbox" name="pretest" value="ya" defaultChecked={b.pretest} />
          <span>Pretest sudah dikerjakan</span>
        </label>
        <label className="centang">
          <input type="checkbox" name="posttest" value="ya" defaultChecked={b.posttest} />
          <span>Posttest sudah dikerjakan</span>
        </label>
      </fieldset>
      <div className="grup-tombol">
        <button type="submit" className="tombol" disabled={menunggu}>
          {menunggu ? 'Menyimpan…' : 'Simpan'}
        </button>
        <button type="button" className="tombol tombol-sekunder" onClick={tutup}>
          Tutup
        </button>
      </div>
    </form>
  );
}

function FormReset({ b }: { b: BarisResponden }) {
  const { status, jalankan, menunggu } = useAksi(aksiResetToken, false);
  if (status?.token) {
    return (
      <div role="status">
        <Pesan sukses={status.sukses} />
        <p className="token-tampil">{status.token}</p>
        <button type="button" className="tombol tombol-sekunder" onClick={() => navigator.clipboard?.writeText(status.token!.replace(/\s/g, ''))}>
          Salin kode
        </button>
      </div>
    );
  }
  return (
    <form action={jalankan} className="form-admin">
      <input type="hidden" name="id_peserta" value={b.id_peserta} />
      <p>
        Kode lama <strong>{b.nama}</strong> tidak berlaku lagi dan semua sesinya keluar. Progres belajar tetap tersimpan.
      </p>
      <Pesan pesan={status?.pesan} />
      <Alasan />
      <button type="submit" className="tombol" disabled={menunggu}>
        {menunggu ? 'Membuat…' : 'Buat kode akses baru'}
      </button>
    </form>
  );
}

function FormStatus({ b, tutup }: { b: BarisResponden; tutup: () => void }) {
  const { status, jalankan, menunggu } = useAksi(aksiStatusAkun, true);
  useEffect(() => {
    if (status?.sukses) tutup();
  }, [status, tutup]);
  return (
    <form action={jalankan} className="form-admin">
      <input type="hidden" name="id_peserta" value={b.id_peserta} />
      <input type="hidden" name="aktif" value={b.aktif ? '' : 'ya'} />
      <p>
        {b.aktif
          ? `Akun ${b.nama} tidak bisa dipakai masuk sampai diaktifkan lagi. Data belajarnya tetap tersimpan.`
          : `Akun ${b.nama} bisa dipakai masuk kembali.`}
      </p>
      <Pesan pesan={status?.pesan} />
      <Alasan />
      <button type="submit" className={b.aktif ? 'tombol tombol-bahaya' : 'tombol'} disabled={menunggu}>
        {menunggu ? 'Menyimpan…' : b.aktif ? 'Nonaktifkan akun' : 'Aktifkan akun'}
      </button>
    </form>
  );
}

function FormHapus({ b, tutup }: { b: BarisResponden; tutup: () => void }) {
  const { status, jalankan, menunggu } = useAksi(aksiHapusResponden, true);
  useEffect(() => {
    if (status?.sukses) tutup();
  }, [status, tutup]);
  if (b.sampel) {
    return (
      <p className="kotak kotak-peringatan">
        Responden penelitian tidak dapat dihapus agar data penelitian tetap utuh. Nonaktifkan akunnya, atau ubah kelompoknya menjadi
        “Bukan sampel” lewat Edit bila ini akun uji coba.
      </p>
    );
  }
  return (
    <form action={jalankan} className="form-admin">
      <input type="hidden" name="id_peserta" value={b.id_peserta} />
      <p>
        Akun uji coba <strong>{b.nama}</strong> ({b.id_peserta}) beserta progresnya akan dihapus permanen. Tindakan ini tidak bisa
        dibatalkan dan tercatat di log.
      </p>
      <Pesan pesan={status?.pesan} />
      <Alasan />
      <button type="submit" className="tombol tombol-bahaya" disabled={menunggu}>
        {menunggu ? 'Menghapus…' : 'Hapus permanen'}
      </button>
    </form>
  );
}

const JUDUL: Record<Jenis, string> = { edit: 'Edit responden', reset: 'Reset kode akses', status: 'Status akun', hapus: 'Hapus akun' };

// Tombol aksi per baris List Responden. Cetak Kartu & Hapus hanya untuk super admin.
export default function AksiResponden({ b, superAdmin }: { b: BarisResponden; superAdmin: boolean }) {
  const [buka, setBuka] = useState<Jenis | null>(null);
  const tutup = () => setBuka(null);
  return (
    <div className="aksi-responden">
      <Link className="tombol tombol-sekunder tombol-kecil" href={`/admin/responden/${b.id_peserta}/`}>
        Detail
      </Link>
      <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => setBuka('edit')}>
        Edit
      </button>
      <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => setBuka('reset')}>
        Reset Kode
      </button>
      <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => setBuka('status')}>
        {b.aktif ? 'Nonaktifkan' : 'Aktifkan'}
      </button>
      {superAdmin && (
        <a className="tombol tombol-sekunder tombol-kecil" href={`/admin/cetak/?mode=kartu&id=${b.id_peserta}`} target="_blank" rel="noopener">
          Cetak Kartu
        </a>
      )}
      {superAdmin && (
        <button type="button" className="tombol tombol-bahaya tombol-kecil" onClick={() => setBuka('hapus')}>
          Hapus
        </button>
      )}
      <Dialog judul={`${buka ? JUDUL[buka] : ''} · ${b.id_peserta}`} buka={buka !== null} tutup={tutup}>
        {buka === 'edit' && <FormEdit b={b} tutup={tutup} />}
        {buka === 'reset' && <FormReset b={b} />}
        {buka === 'status' && <FormStatus b={b} tutup={tutup} />}
        {buka === 'hapus' && <FormHapus b={b} tutup={tutup} />}
      </Dialog>
    </div>
  );
}

// Tombol "Edit Data" di halaman detail responden (dialog yang sama dengan List Responden).
export function TombolEditResponden({ b }: { b: DataEdit }) {
  const [buka, setBuka] = useState(false);
  const tutup = () => setBuka(false);
  return (
    <>
      <button type="button" className="tombol tombol-sekunder tombol-kecil" onClick={() => setBuka(true)}>
        <Ikon nama="gerigi" ukuran={18} /> Edit Data
      </button>
      <Dialog judul={`Edit responden · ${b.id_peserta}`} buka={buka} tutup={tutup}>
        <FormEdit b={b} tutup={tutup} />
      </Dialog>
    </>
  );
}
