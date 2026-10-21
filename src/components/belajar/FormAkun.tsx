'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import {
  aksiBuatUlangToken,
  aksiDaftar,
  aksiGantiNama,
  aksiGantiNomor,
  aksiGantiToken,
  aksiMasuk,
  aksiMundur,
} from '@/app/aksi-responden';
import Ikon from '../Ikon';
import Bidang, { Pesan } from './Bidang';
import SimpanToken from './SimpanToken';

// Format nomor untuk konfirmasi di sisi peramban (validasi sebenarnya tetap di server).
function formatLokal(nomor: string): string | null {
  let d = nomor.replace(/[\s\-().]/g, '');
  if (d.startsWith('+62')) d = d.slice(3);
  else if (d.startsWith('62')) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  else return null;
  if (!/^8\d{7,11}$/.test(d)) return null;
  return `0${d}`.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3');
}

export function FormDaftar({ wajibKelayakan, judul, ringkasan }: { wajibKelayakan: boolean; judul: string; ringkasan: string }) {
  const [status, aksi, menunggu] = useActionState(aksiDaftar, undefined);
  const [konfirmasi, setKonfirmasi] = useState<string | null>(null);
  const [galatNomor, setGalatNomor] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const judulSimpan = useRef<HTMLHeadingElement>(null);
  const berhasil = !!(status?.token && status.nama);
  useEffect(() => {
    if (berhasil) judulSimpan.current?.focus();
  }, [berhasil]);

  // Setelah mendaftar, halaman yang sama berganti menjadi "Simpan Kode Akses Anda".
  if (status?.token && status.nama) {
    return (
      <>
        <h1 className="akun-judul" tabIndex={-1} ref={judulSimpan}>
          Simpan Kode Akses Anda
        </h1>
        <SimpanToken token={status.token} nama={status.nama} tujuan="awal" />
      </>
    );
  }

  const g = (k: string) => (status?.kolom === k ? status.pesan : null);

  return (
    <>
    <h1 className="akun-judul">{judul}</h1>
    <p className="akun-ringkasan">{ringkasan}</p>
    <form
      ref={form}
      action={aksi}
      className="form-admin"
      noValidate
      onSubmit={(e) => {
        // Langkah konfirmasi nomor sebelum dikirim (cegah salah ketik).
        if (konfirmasi) return;
        e.preventDefault();
        const nomor = String(new FormData(e.currentTarget).get('nomor') ?? '');
        const f = formatLokal(nomor);
        if (!f) {
          setGalatNomor('Nomor HP belum sesuai. Contoh yang benar: 081234567890.');
          return;
        }
        setGalatNomor(null);
        setKonfirmasi(f);
      }}
    >
      <Pesan pesan={status?.kolom ? undefined : status?.pesan} />
      <Bidang id="nama" label="Nama" autoComplete="name" defaultValue={status?.nilai?.nama} galat={g('nama')} petunjuk="Boleh nama panggilan. Dipakai untuk menyapa Anda." />
      <Bidang
        id="nomor"
        label="Nomor HP"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        defaultValue={status?.nilai?.nomor}
        galat={galatNomor ?? g('nomor')}
        petunjuk="Contoh: 081234567890. Satu nomor untuk satu akun."
        onChange={() => setKonfirmasi(null)}
      />
      {wajibKelayakan && (
        <div className="bidang">
          <label className="centang">
            <input type="checkbox" name="layak" value="ya" aria-invalid={g('layak') ? true : undefined} />
            <span>Saya berusia 18 tahun ke atas dan pernah didiagnosis hipertensi.</span>
          </label>
          {g('layak') && <p className="galat">{g('layak')}</p>}
        </div>
      )}
      <div className="bidang">
        <label className="centang">
          <input type="checkbox" name="setuju" value="ya" aria-invalid={g('setuju') ? true : undefined} />
          <span>
            Saya telah membaca dan menyetujui <Link href="/privasi/">informasi penelitian dan kebijakan privasi</Link>.
          </span>
        </label>
        {g('setuju') && <p className="galat">{g('setuju')}</p>}
      </div>
      {konfirmasi ? (
        <div className="kotak" role="alert">
          <p className="kotak-judul">Pastikan nomor ini benar: {konfirmasi}</p>
          <div className="grup-tombol">
            <button type="submit" className="tombol" disabled={menunggu}>
              {menunggu ? 'Mendaftar…' : 'Ya, benar — Daftar'}
            </button>
            <button type="button" className="tombol tombol-sekunder" onClick={() => setKonfirmasi(null)}>
              Ubah nomor
            </button>
          </div>
        </div>
      ) : (
        <button type="submit" className="tombol tombol-besar">
          Daftar <Ikon nama="panah-kanan" />
        </button>
      )}
    </form>
    <p className="akun-tautan-kecil">Kami tidak meminta email, NIK, alamat, tanggal lahir, nomor rekam medis, atau data tekanan darah.</p>
    <div className="akun-pemisah">
      <span>Sudah punya akun?</span>
    </div>
    <Link className="tombol tombol-sekunder tombol-besar" href="/masuk/">
      Masuk
    </Link>
    </>
  );
}

export function FormMasuk() {
  const [status, aksi, menunggu] = useActionState(aksiMasuk, undefined);
  const [lihat, setLihat] = useState(false);
  return (
    <form action={aksi} className="form-admin" noValidate>
      <Pesan pesan={status?.pesan} />
      <Bidang
        id="nomor"
        label="Nomor HP"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="Contoh: 081234567890"
        defaultValue={status?.nilai?.nomor}
        ikon={<Ikon nama="telepon" />}
      />
      <Bidang
        id="token"
        label="Kode akses"
        type={lihat ? 'text' : 'password'}
        inputMode="numeric"
        autoComplete="off"
        maxLength={9}
        placeholder="6 angka, mis. 482917"
        className="input-token"
        ikon={<Ikon nama="gembok" />}
        ujung={
          <button type="button" className="tombol-mata" aria-pressed={lihat} aria-label={lihat ? 'Sembunyikan kode akses' : 'Tampilkan kode akses'} onClick={() => setLihat((x) => !x)}>
            <Ikon nama={lihat ? 'mata-tutup' : 'mata'} />
          </button>
        }
      />
      <div className="bidang">
        <label className="centang">
          <input type="checkbox" name="ingat" value="ya" defaultChecked />
          <span>Ingat saya di perangkat ini</span>
        </label>
        <p className="petunjuk petunjuk-centang">Hapus centang bila HP ini dipakai bersama orang lain.</p>
      </div>
      <button type="submit" className="tombol tombol-besar" disabled={menunggu}>
        {menunggu ? 'Memeriksa…' : 'Masuk'}
        {!menunggu && <Ikon nama="panah-kanan" />}
      </button>
    </form>
  );
}

export function BuatUlangToken() {
  const [status, aksi, menunggu] = useActionState(aksiBuatUlangToken, undefined);
  if (status?.token && status.nama) {
    return <SimpanToken token={status.token} nama={status.nama} tujuan="awal" />;
  }
  return (
    <form action={aksi}>
      <Pesan pesan={status?.pesan} />
      <button type="submit" className="tombol tombol-besar" disabled={menunggu}>
        {menunggu ? 'Membuat…' : 'Buat Kode Akses Baru'}
      </button>
    </form>
  );
}

export function FormNama({ nama }: { nama: string }) {
  const [status, aksi, menunggu] = useActionState(aksiGantiNama, undefined);
  return (
    <form action={aksi} className="form-admin" noValidate>
      <Pesan pesan={status?.kolom ? undefined : status?.pesan} sukses={status?.sukses} />
      <Bidang id="nama" label="Nama" defaultValue={nama} galat={status?.kolom === 'nama' ? status.pesan : null} />
      <button type="submit" className="tombol" disabled={menunggu}>
        Simpan Nama
      </button>
    </form>
  );
}

export function FormGantiToken() {
  const [status, aksi, menunggu] = useActionState(aksiGantiToken, undefined);
  if (status?.token && status.nama) {
    return <SimpanToken token={status.token} nama={status.nama} tujuan="profil" />;
  }
  return (
    <form action={aksi} className="form-admin" noValidate>
      <p>Kode lama langsung tidak berlaku dan Anda keluar dari perangkat lain. Progres belajar tidak hilang.</p>
      <Bidang id="token_lama" label="Kode akses lama" inputMode="numeric" autoComplete="off" maxLength={9} className="input-token" galat={status?.kolom === 'token_lama' ? status.pesan : null} />
      <Pesan pesan={status?.kolom ? undefined : status?.pesan} />
      <button type="submit" className="tombol" disabled={menunggu}>
        Buat Kode Akses Baru
      </button>
    </form>
  );
}

export function FormGantiNomor() {
  const [status, aksi, menunggu] = useActionState(aksiGantiNomor, undefined);
  return (
    <form action={aksi} className="form-admin" noValidate>
      <Pesan pesan={status?.kolom ? undefined : status?.pesan} sukses={status?.sukses} />
      <Bidang id="nomor" label="Nomor HP baru" type="tel" inputMode="tel" defaultValue={status?.nilai?.nomor} galat={status?.kolom === 'nomor' ? status.pesan : null} />
      <Bidang id="token" label="Kode akses saat ini" inputMode="numeric" autoComplete="off" maxLength={9} className="input-token" galat={status?.kolom === 'token' ? status.pesan : null} />
      <button type="submit" className="tombol" disabled={menunggu}>
        Ganti Nomor
      </button>
    </form>
  );
}

export function FormMundur() {
  const [status, aksi, menunggu] = useActionState(aksiMundur, undefined);
  return (
    <form
      action={aksi}
      className="form-admin"
      noValidate
      onSubmit={(e) => {
        if (!window.confirm('Yakin ingin mengundurkan diri dari penelitian? Akun Anda akan dinonaktifkan.')) e.preventDefault();
      }}
    >
      <p>
        Akun dinonaktifkan dan Anda tidak dapat masuk lagi. Data yang sudah terkumpul ditangani sesuai
        protokol etik yang dijelaskan di <Link href="/privasi/">halaman Privasi</Link>.
      </p>
      <div className="bidang">
        <label htmlFor="alasan">Alasan (tidak wajib)</label>
        <textarea id="alasan" name="alasan" rows={2} />
      </div>
      <label className="centang">
        <input type="checkbox" name="yakin" value="ya" />
        <span>Saya ingin mengundurkan diri dari penelitian ini.</span>
      </label>
      <Pesan pesan={status?.pesan} />
      <button type="submit" className="tombol tombol-bahaya" disabled={menunggu}>
        Ajukan Pengunduran Diri
      </button>
    </form>
  );
}
