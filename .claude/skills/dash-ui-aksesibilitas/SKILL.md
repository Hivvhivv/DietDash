---
name: dash-ui-aksesibilitas
description: Membangun atau mengubah halaman, komponen, gaya, dan tata letak DASH Sehat (Beranda, Daftar Modul, Detail Materi, Kuis, Tentang, Sumber). Gunakan untuk pekerjaan UI/front-end agar sesuai standar visual, mobile-first, dan aksesibilitas di PRD.
---

# UI dan Aksesibilitas DASH Sehat

Rujukan lengkap: `docs/PRD.md` bagian 5, 7, 8, 10, dan 11.

## Token desain

Token ada di `src/styles/global.css` (Next.js App Router; komponen di `src/components/`, halaman di `src/app/`). Pakai komponen Server secara default; tambahkan `'use client'` hanya untuk bagian interaktif. Gunakan `next/link` untuk tautan internal. Nilai awalnya:

```css
:root {
  --warna-utama: #2E7D5B;        /* hijau lembut, untuk tombol & aksen */
  --warna-utama-muda: #E6F4EC;   /* latar kotak Poin Penting / kartu */
  --warna-latar: #FAFCFA;
  --warna-teks: #1F2A24;         /* kontras tinggi terhadap latar */
  --warna-teks-sekunder: #4A5A51;
  --warna-garis: #D5E3DA;
  --warna-benar: #1B7F3B;
  --warna-salah: #B3261E;
  --ukuran-teks: 1.125rem;       /* 18px; minimum 16px */
  --tinggi-baris: 1.6;
  --radius: 12px;
  --sentuh-min: 44px;
}
```

Nilai warna boleh disesuaikan, tetapi setiap pasangan teks/latar harus lolos kontras WCAG AA (≥4.5:1 teks biasa, ≥3:1 teks besar & komponen UI).

## Aturan tata letak

- **Mobile-first**: tulis gaya untuk lebar 360px dulu, lalu `min-width` breakpoint untuk tablet/desktop.
- Lebar baca maksimum ±65–70 karakter (`max-width: 40rem`) untuk teks materi.
- Tidak boleh ada scroll horizontal di 320px. Gambar `max-width: 100%; height: auto`.
- Navigasi sederhana: maksimal 4–5 tautan utama (Beranda, Materi, Kuis, Tentang). Di ponsel boleh menu ringkas, tapi tetap bisa diakses keyboard.
- Tombol minimal 44×44px, jarak antar tombol cukup agar tidak salah tekan.
- Tanpa animasi berat; hormati `prefers-reduced-motion`.

## Pola desain yang sudah dipakai (ikuti untuk halaman baru)

- **Font:** Plus Jakarta Sans (teks), Caveat (hanya kutipan/catatan bergaya tulisan tangan). Keduanya lewat `next/font` di `src/app/layout.tsx`.
- **Kepala halaman:** setiap halaman publik selain beranda memakai `<KepalaHalaman>` (pita hijau muda, lencana, satu-satunya `<h1>`, ringkasan, ilustrasi). Jangan menulis `<h1>` sendiri.
- **Ilustrasi:** gambar PNG di `public/gambar/` (peta di `src/data/gambar.ts`), ditampilkan pada ukuran aslinya (140×110) agar tidak buram. Ilustrasi dekoratif `alt=""`.
- **Kotak:** `.kotak` (hijau muda), `.kotak-peringatan` (kuning), judul kotak dengan ikon dalam lingkaran `.kotak-ikon`. Kartu putih `.kartu` dengan sudut 16px.
- **Tombol:** `.tombol` (utama), `.tombol-sekunder` (garis), `.tombol-lembut` (hijau muda, untuk kartu), `.tombol-besar` (aksi utama halaman).
- **Klaim manfaat** memakai "membantu"/"mendukung", bukan janji hasil.

## Komponen per halaman

**Beranda**: logo + nama "DASH Sehat"; judul "Mulai Kenali Diet DASH untuk Tekanan Darah yang Lebih Terkontrol"; deskripsi singkat; tombol utama "Mulai Belajar" (ke Daftar Modul / Modul 1); tombol sekunder "Lihat Materi"; ringkasan manfaat; pratinjau modul; footer (info website, privasi, sumber). Tanpa paksaan login.

**Daftar Modul**: 6 kartu berurutan, masing-masing judul, deskripsi satu kalimat, ilustrasi sederhana, tombol "Buka Materi". Tampilkan nomor urut agar urutan jelas.

**Detail Materi**: mengikuti struktur di skill `dash-konten-edukasi`. Kotak "Poin Penting" diberi ikon + label teks, bukan hanya warna latar. Navigasi bawah: "Materi Sebelumnya", "Materi Berikutnya", "Kembali ke Daftar Modul" (sembunyikan Sebelumnya di modul 1, ganti Berikutnya menjadi "Ke Kuis" di modul 5/6 sesuai alur).

**Kuis**: satu soal per layar; indikator "Soal 2 dari 10"; opsi sebagai tombol radio besar (`<fieldset>` + `<legend>`); tombol "Periksa Jawaban" nonaktif sampai opsi dipilih; umpan balik muncul dengan ikon ✓/✗ **dan** teks "Benar"/"Belum tepat" plus penjelasan; umumkan umpan balik lewat `aria-live="polite"`; ringkasan hasil di akhir dengan tombol "Pelajari Kembali Materi". Nada positif, tanpa skor yang mempermalukan.

**Tentang**: tujuan edukasi, identitas tim/institusi (jika disetujui), pernyataan bukan pengganti konsultasi medis, kontak penelitian, privasi.

**Batasan edukasi**: tampilkan pengingat singkat "Informasi ini untuk edukasi dan tidak menggantikan saran dokter atau tenaga kesehatan" di footer semua halaman.

## Checklist aksesibilitas

- [ ] HTML semantik: `<header>`, `<nav>`, `<main>`, `<footer>`, satu `<h1>` per halaman, heading berurutan.
- [ ] `lang="id"` pada `<html>`.
- [ ] Tautan "Lewati ke konten utama" di awal halaman.
- [ ] Semua elemen interaktif bisa dijangkau Tab dan punya fokus yang terlihat jelas (`:focus-visible`).
- [ ] Gambar informatif punya `alt` deskriptif berbahasa Indonesia; gambar dekoratif `alt=""`.
- [ ] Label formulir eksplisit (`<label for>`); pesan kesalahan menjelaskan cara memperbaiki dan dihubungkan via `aria-describedby`.
- [ ] Teks bisa diperbesar sampai 200% tanpa terpotong.
- [ ] Status penting (benar/salah, selesai/belum) tidak hanya lewat warna.

## Performa

- Gambar dalam WebP/AVIF atau SVG untuk ilustrasi, ukuran disesuaikan, `loading="lazy"` di bawah lipatan, sertakan `width`/`height`.
- Hindari font web berat; jika dipakai, maksimal 1–2 keluarga dengan `font-display: swap`.
- Materi utama harus tetap terbaca tanpa JavaScript bila memungkinkan (render statis).
- Tidak ada skrip pelacakan pihak ketiga.

## Verifikasi sebelum selesai

Cek di lebar 320px, 375px, 768px, dan 1280px; navigasi dengan keyboard saja; jalankan Lighthouse/axe bila tersedia dan perbaiki pelanggaran aksesibilitas.
