# AGENTS.md — DASH Sehat

Instruksi kerja untuk AI agent yang mengembangkan proyek ini. Sumber kebenaran lengkap ada di [docs/PRD.md](docs/PRD.md). Jika file ini dan PRD bertentangan, ikuti PRD.

## Tentang proyek

DASH Sehat adalah website edukasi diet DASH (*Dietary Approaches to Stop Hypertension*) untuk orang dewasa dengan hipertensi. Proyek ini dipakai sebagai media intervensi dalam penelitian skripsi, sehingga konsistensi konten dan perlindungan data sama pentingnya dengan fitur.

- Bahasa antarmuka dan konten: **Bahasa Indonesia** yang sederhana.
- Pengguna: tingkat pendidikan dan literasi digital beragam, kebanyakan memakai ponsel.
- Sifat produk: **edukasi mandiri**, bukan konsultasi medis atau telemedicine.

## Aturan yang tidak boleh dilanggar

1. **Materi bisa dibaca tanpa akun.** Jangan pernah menaruh modul, kuis latihan, atau halaman sumber di balik login.
2. **Tidak ada fitur medis.** Jangan membuat diagnosis, kalkulator risiko yang memberi kesimpulan klinis, rekomendasi atau perubahan dosis obat, rencana diet klinis yang dipersonalisasi, integrasi rekam medis, atau konsultasi video.
3. **Tidak ada klaim berlebihan.** Konten tidak boleh menyebut diet DASH menyembuhkan hipertensi atau menggantikan obat. Sertakan pengingat untuk berkonsultasi dengan tenaga kesehatan.
4. **Kuis latihan ≠ instrumen penelitian.** Jangan menggabungkan kuis latihan dengan pretest/posttest, dan jangan menampilkan kunci jawaban pretest.
5. **Minimalkan data.** Jangan menambah pengumpulan data (analitik, pelacakan, formulir) tanpa permintaan eksplisit. Jangan pernah meminta NIK, alamat lengkap, tanggal lahir, nomor rekam medis, atau nomor telepon. Data pribadi tidak boleh masuk URL atau log publik.
6. **Konten inti dikunci per versi.** Perubahan teks materi harus dicatat (lihat bagian Versi konten). Jangan mengubah isi materi diam-diam saat merapikan kode.
7. **Progres bukan indikator klinis.** Jangan menampilkan progres belajar sebagai keberhasilan menurunkan tekanan darah.

## Ruang lingkup MVP

Halaman wajib: Beranda, Pengenalan DASH, Daftar Modul, Detail Materi (6 modul), Kuis Latihan, Sumber Materi, Tentang (termasuk privasi dan batasan edukasi). Semua responsif dan mobile-first.

Urutan modul tetap:

1. Mengenal Hipertensi
2. Mengenal Diet DASH
3. Mengenal Makanan dan Porsi
4. Menerapkan Diet DASH pada Menu Indonesia
5. Memulai Kebiasaan Makan Sehat
6. Rangkuman dan Kuis

Fitur opsional yang **sudah diminta dan dibangun**: panel konten admin, akun peserta (email), progres belajar, dan dashboard peserta. Fitur opsional lain tetap hanya dibangun bila diminta eksplisit. Setiap perubahan pada fitur-fitur ini wajib mengikuti skill `dash-privasi-penelitian`.

## Skill yang tersedia

Gunakan skill di `.claude/skills/` sesuai jenis pekerjaan:

| Skill | Kapan dipakai |
|---|---|
| `dash-konten-edukasi` | Menulis, menyunting, atau meninjau teks modul, kuis, rangkuman, sumber |
| `dash-ui-aksesibilitas` | Membuat atau mengubah halaman, komponen, gaya, tata letak |
| `dash-privasi-penelitian` | Menyentuh akun, login, penyimpanan progres, analitik, data peserta, admin |
| `dash-uji-penerimaan` | Memeriksa kesiapan fitur/rilis terhadap kriteria penerimaan PRD |

## Standar desain singkat

- Warna utama hijau lembut, latar terang, kontras teks memenuhi WCAG AA.
- Teks isi 16–18px, line-height nyaman (±1.6), hierarki judul jelas.
- Target sentuh tombol minimal 44×44px.
- Informasi penting tidak hanya dibedakan dengan warna (tambahkan ikon/teks).
- Tanpa scroll horizontal di ponsel, tanpa animasi berat, gambar dioptimalkan.
- Navigasi bisa dipakai dengan keyboard; gambar informatif punya `alt`.

## Versi konten

- Konten modul sebaiknya disimpan terpisah dari kode tampilan (mis. file Markdown/JSON per modul) agar mudah divalidasi ahli dan dikunci versinya.
- Setiap file konten menyimpan nomor versi. Catat setiap perubahan isi di `CHANGELOG-KONTEN.md` (tanggal, modul, ringkasan perubahan, alasan).
- Setelah versi dibekukan untuk penelitian, perubahan konten inti memerlukan persetujuan peneliti.

## Stack dan struktur

- **Next.js 16 (App Router) + React 19 + TypeScript + MongoDB Atlas** (driver resmi `mongodb`).
- Halaman publik di `src/app/(publik)/` dirender statis dari database saat build dan diperbarui lewat `revalidatePath` setiap ada versi yang disetujui. Komponen klien (`'use client'`) hanya untuk interaksi.
- **Konten publik diakses hanya lewat [src/lib/konten.ts](src/lib/konten.ts)**, yang hanya mengembalikan versi berstatus `disetujui`. Operasi admin ada di [src/lib/konten-admin.ts](src/lib/konten-admin.ts).
- Skema validasi tunggal di [src/lib/skema.ts](src/lib/skema.ts), dipakai skrip impor dan formulir admin.
- `src/content/modul/*.md` hanyalah **naskah awal** untuk `npm run impor-konten` / `npm run impor-draf`; setelah diimpor, sumber kebenaran konten adalah database. Kuis dan sumber masih di `src/data/`.
- **Modul → materi:** satu modul berisi beberapa materi. Setiap `## Judul` di naskah = satu materi (halaman `/materi/<modul>/<nomor>/`), dipecah oleh [src/lib/materi.ts](src/lib/materi.ts). Halaman `/materi/<modul>/` adalah ringkasan modul. Jangan membuat koleksi materi terpisah; satu naskah per modul menjaga versi dan persetujuan tetap per modul.
- Markdown dirender dengan `react-markdown` + `skipHtml` (HTML mentah dari input admin tidak dieksekusi).
- Rahasia hanya di `.env.local` (lihat `.env.example`). Jangan membaca atau menampilkan isi `.env.local`; gunakan `npm run cek-db` untuk memeriksa koneksi.
- Versi dependensi dikunci persis (tanpa `^`). Pilih versi rilis yang sudah berumur ≥2 minggu dan jalankan `npm audit` setelah menambah paket.

## Akun peserta (email) dan progres

Diputuskan peneliti: peserta **boleh** mendaftar dengan email agar peneliti bisa memantau progres. Tetap wajib:

- Materi, latihan soal, dan kuis **selalu bisa dibuka tanpa akun**. Jangan pernah mengunci konten di balik login.
- Data yang disimpan hanya: email, hash argon2id kata sandi, materi yang dibuka (waktu, jumlah), skor latihan, waktu daftar/masuk, persetujuan kebijakan. Jangan menambah nama, telepon, tanggal lahir, atau data kesehatan.
- Logika ada di `src/lib/peserta.ts`, `src/lib/progres.ts` (server), `src/lib/progres-klien.ts` (peramban; fallback localStorage), `src/lib/peserta-admin.ts` (khusus `wajibAdmin('peneliti')`).
- Progres adalah keterpaparan materi, **bukan** keberhasilan klinis atau ukuran efektivitas intervensi; jangan menyajikannya seperti itu.
- Lama penyimpanan dan lokasi server di Kebijakan Privasi masih TODO sampai ada keputusan pembimbing/izin etik.

## Fitur admin (`/admin/`)

Wajib mengikuti skill `dash-privasi-penelitian` saat mengubahnya.

- Akun admin hanya dibuat lewat `npm run buat-admin` (tidak ada pendaftaran di website). Peran: `peneliti` (boleh menyetujui) dan `editor` (hanya draf).
- Setiap halaman, Server Action, dan Route Handler admin memanggil `wajibAdmin()`. `src/proxy.ts` hanya pemeriksaan cepat, bukan pengaman utama.
- Perubahan konten selalu berupa **draf baru**; persetujuan dijalankan dalam transaksi (versi lama → `diarsipkan`). Versi `disetujui`/`diarsipkan` tidak pernah diubah atau dihapus.
- Semua tindakan tercatat di koleksi `log_audit`. Log audit menggantikan `CHANGELOG-KONTEN.md` untuk perubahan lewat admin.
- Pengujian yang menulis ke database harus memakai database terpisah (mis. `MONGODB_DB=dash_sehat_uji`), lalu dibersihkan dan diikuti build ulang dari database asli.

## Cara bekerja

- Perintah: `npm run dev`, `npm run build`, `npm run typecheck`, `npm run cek-klaim`, `npm run cek-db`. Jalankan `typecheck`, `cek-klaim`, dan `build` sebelum menyatakan pekerjaan selesai.
- Jangan menambahkan dependensi pelacakan pihak ketiga (Google Analytics, pixel, Vercel Analytics, dll.).
- Saat membuat konten medis/nutrisi, tandai bagian yang perlu dicek sumbernya dengan `<!-- TODO: verifikasi sumber -->` daripada mengarang angka atau rujukan.
- Semua teks yang terlihat pengguna ditulis dalam Bahasa Indonesia.
