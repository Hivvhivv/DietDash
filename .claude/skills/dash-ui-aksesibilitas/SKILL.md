---
name: dash-ui-aksesibilitas
description: Membangun atau mengubah halaman, komponen, gaya, dan tata letak DASH Sehat (halaman publik, daftar/masuk/token, dashboard belajar, modul, materi, kuis, profil, panel admin). Gunakan untuk pekerjaan UI/front-end agar sesuai standar visual, mobile-first, dan aksesibilitas PRD 14–15.
---

# UI dan Aksesibilitas DASH Sehat

Rujukan lengkap: `docs/PRD.md` bagian 6, 8, 9, 14, dan 15.

## Token desain

Token ada di `src/styles/global.css` (Next.js App Router; komponen di `src/components/`, halaman di `src/app/`). Pakai Server Component secara default; `'use client'` hanya untuk bagian interaktif.

```css
:root {
  --warna-utama: #2e7d5b;      /* hijau lembut */
  --warna-utama-muda: #e6f4ec;
  --warna-latar: #fafcfa;
  --warna-teks: #1f2a24;
  --warna-benar: #1b7f3b;
  --warna-salah: #b3261e;
  --ukuran-teks: 1.125rem;     /* 18px; minimum 16px */
  --tinggi-baris: 1.6;
  --sentuh-min: 48px;          /* PRD 14: target sentuh 48×48 */
}
```

Setiap pasangan teks/latar harus lolos kontras ≥4,5:1 (≥3:1 untuk teks besar & komponen UI).

## Aturan tata letak

- Mobile-first; diuji mulai **360px**. Tidak ada scroll horizontal di sisi responden; tabel lebar dibungkus `.tabel-gulir`.
- Lebar baca ±40rem untuk teks materi (`.wadah-baca`).
- Satu layar, satu tugas utama. Tombol aksi utama memakai kata kerja jelas: "Mulai Materi", "Kerjakan Kuis", "Periksa Jawaban", "Lanjutkan Belajar".
- Tanpa animasi berat; hormati `prefers-reduced-motion`.
- Panel admin boleh lebih padat, dirancang untuk komputer tetapi tetap terbaca di tablet.

## Pola yang sudah dipakai

- **Alur masuk:** `/` langsung mengalihkan ke `/masuk/` (tanpa splash). Masuk, Daftar, Lupa Token ada di grup `(akun)` dengan `<HalamanAkun ilustrasi judul ringkasan sorotan kutipan>` (kartu dua kolom: panel hijau berisi merek, sorotan, ilustrasi SVG, kutipan tulisan tangan; panel putih berisi judul dan formulir; kolom berikon lewat prop `ikon`/`ujung` pada `<Bidang>`; kartu "Simpan Kode Akses" hanya nama + kode akses) (ilustrasi SVG dari `IlustrasiAkun`, judul tebal, tombol `.tombol-besar` selebar kolom; dua kolom mulai 56rem). Halaman masuk admin (`/admin/masuk/`, verifikasi, atur 2FA, undangan) memakai `KerangkaAkun` + `HalamanAkun ilustrasi="admin"`. Pengalih `<PilihMasuk aktif="responden|admin">` ada di kedua halaman masuk. Halaman tanpa login hanya Masuk, Daftar, Lupa Token, Privasi, Ketentuan; jangan menaut dari sana ke halaman yang wajib masuk.
- **Area responden & admin:** tata letak panel (menu samping `panel-sisi` + bilah atas `panel-atas` + isi `panel-isi`). Responden: `KerangkaResponden` + `MenuResponden` dengan **navbar atas** (`.navbar`, menu sebaris mulai 80rem, di bawahnya tombol Menu; di ponsel sempit tombol hanya ikon dan slogan disembunyikan); admin: layout `(panel)` + `MenuAdmin` dengan menu samping. Isi halaman memakai `.dasbor-kepala`, `.kartu-stat` (kartu angka dengan `.ubin-ikon`), `.kartu-panel`, `.kartu-lanjut`. Grafik garis: `GrafikGaris` (tooltip `<title>` + tabel pembaca layar di dalam `div.sr-only`, jangan beri `sr-only` langsung pada `<table>` karena bisa melebarkan halaman).
- **Kerangka:** `KerangkaPublik` (kepala + menu + kaki dengan batasan edukasi dan label versi konten aktif). Prop `dalam` dipakai layout `(belajar)`: menu lengkap (Belajar, Pengenalan, Tentang, Sumber, Bantuan, Profil) dan kaki lengkap; tanpa `dalam`, tamu hanya melihat tombol Masuk/Daftar dan tautan Privasi, Ketentuan, Lupa Token. Panel admin memakai layout `src/app/admin/(panel)/layout.tsx`.
- **Kepala halaman:** `<KepalaHalaman>` berisi satu-satunya `<h1>`, remah, lencana, ringkasan. Jangan menulis `<h1>` sendiri di halaman publik/belajar.
- **Formulir:** `<Bidang>` (label, petunjuk, galat di dekat kolom via `aria-describedby`) dan `<Pesan>` (galat umum `role="alert"`, sukses `role="status"`), kelas `.form-admin`. Server Action dengan `useActionState`; formulir harus tetap berfungsi tanpa JavaScript bila memungkinkan.
- **Status materi:** `<LencanaStatusMateri>` — 🔒 Terkunci, ○ Tersedia, ◐ Sedang dipelajari, ✓ Selesai (ikon + teks, warna hanya penguat). Status versi konten: `<LencanaVersi>`.
- **Kotak:** `.kotak` (hijau muda), `.kotak-peringatan` (kuning), `.kotak-contoh`, `.kotak-poin`, `.kotak-info`. Kartu `.kartu`.
- **Tombol:** `.tombol`, `.tombol-sekunder`, `.tombol-lembut`, `.tombol-besar`, `.tombol-bahaya`, `.tombol-kecil` (tetap 48px tinggi).
- **Token:** `.token-besar` (monospace besar) dengan `aria-label` per karakter; `.input-token` untuk kolom token.
- **Grafik admin:** batang horizontal satu seri (`.grafik-batang`), label & nilai selalu tertulis.

## Halaman responden (PRD 9)

- **Dashboard belajar:** sapaan nama, tombol besar "Lanjutkan Belajar" ke posisi terakhir (materi atau soal kuis yang belum dijawab), "X dari Y materi selesai" + batang progres, daftar modul dengan jumlah selesai, tautan Profil/Bantuan/Privasi/Keluar. Tanpa grafik kesehatan atau peringkat.
- **Modul:** tujuan modul + kartu materi (nomor, judul, menit, status, tombol "Mulai Materi"/"Lanjutkan"/"Baca Lagi"; terkunci → "Selesaikan kuis Materi X dulu").
- **Materi:** urutan tetap (lihat skill konten); penanda "Materi 2 dari 3"; tidak ada tombol "Materi Berikutnya" sebelum kuis selesai.
- **Kuis:** "Soal 2 dari 4"; satu soal per layar dalam `<fieldset>`/`<legend>`; pilihan berupa label besar ≥48px; "Periksa Jawaban" aktif setelah memilih; umpan balik ✓/✗ + teks + jawaban benar + penjelasan lewat `aria-live="polite"`; ringkasan akhir dengan tombol sesuai mode.
- **Daftar/Simpan Token:** konfirmasi "Pastikan nomor ini benar: 0812-3456-7890"; halaman token dengan Salin, Simpan sebagai Gambar, centang konfirmasi.

## Checklist aksesibilitas (WCAG 2.1 AA)

- [ ] HTML semantik, `lang="id"`, satu `<h1>`, heading berurutan, tautan "Lewati ke konten utama".
- [ ] Semua fungsi bisa dengan keyboard; fokus terlihat (`:focus-visible`).
- [ ] Gambar informatif punya `alt` (wajib di panel admin); dekoratif `alt=""`.
- [ ] Label formulir eksplisit; pesan kesalahan menjelaskan cara memperbaiki, dekat kolomnya.
- [ ] Teks bisa diperbesar 200% tanpa terpotong.
- [ ] Status penting tidak hanya lewat warna.

## Performa

- Gambar unggahan otomatis WebP ≤1200px (sharp); ilustrasi bawaan PNG kecil dengan `width`/`height`.
- Halaman materi tampil <3 detik di 4G; jawaban kuis tersimpan <1 detik dengan antrean offline di perangkat.
- Tidak ada skrip pelacakan pihak ketiga.

## Verifikasi sebelum selesai

Cek di 360px, 768px, dan 1280px; navigasi keyboard saja. Catatan: screenshot Chrome headless dengan `--window-size` di bawah ±500px memotong sisi kanan (artefak), jadi jangan menyimpulkan ada scroll horizontal dari itu saja; pakai emulasi perangkat bila perlu.
