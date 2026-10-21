# AGENTS.md — DASH Sehat

Instruksi kerja untuk AI agent yang mengembangkan proyek ini. Sumber kebenaran lengkap ada di [docs/PRD.md](docs/PRD.md) (PRD v2.0; dokumen asli [docs/PRD-v2.0.pdf](docs/PRD-v2.0.pdf)). Jika file ini dan PRD bertentangan, ikuti PRD.

## Tentang proyek

DASH Sehat adalah platform edukasi diet DASH (*Dietary Approaches to Stop Hypertension*) untuk orang dewasa dengan hipertensi. Proyek ini dipakai sebagai media intervensi dalam penelitian skripsi, sehingga konsistensi konten dan perlindungan data sama pentingnya dengan fitur.

- Bahasa antarmuka dan konten: **Bahasa Indonesia** yang sederhana, sapaan "Anda".
- Pengguna: tingkat pendidikan dan literasi digital beragam, kebanyakan memakai ponsel.
- Sifat produk: **edukasi mandiri**, bukan konsultasi medis atau telemedicine.

## Aturan yang tidak boleh dilanggar

1. **Langsung ke Masuk; fitur hanya setelah masuk.** Keputusan peneliti (2026-10-21, menyimpang dari PRD 3–4): halaman awal `/` langsung dialihkan ke `/masuk/` (atau `/belajar/` bila sudah masuk); tidak ada splash screen. Masuk, Daftar, Lupa Token, serta Masuk Admin (termasuk 2FA dan undangan) memakai `KerangkaAkun` + `HalamanAkun` bergaya aplikasi (ilustrasi SVG, judul tebal, tombol bulat; dua kolom di layar lebar). Halaman Masuk responden dan Masuk Admin punya pengalih "Responden | Admin" (`PilihMasuk`). Yang publik hanya Masuk, Daftar, Lupa Token, Privasi, dan Ketentuan Penggunaan (wajib tetap publik karena dirujuk saat persetujuan). Semua fitur responden hanya setelah masuk (`wajibResponden()`). Area responden memakai `KerangkaResponden` (**navbar di atas**: merek, 5 menu, lonceng kuis, akun; di ponsel menu terlipat di tombol Menu); panel admin memakai menu samping; menu Bantuan/Pertanyaan Umum sengaja tidak dibuat (keputusan peneliti 2026-10-21). Halaman publik tidak boleh menaut ke halaman yang wajib masuk.
2. **Penguncian berurutan diperiksa di server.** Materi berikutnya terbuka hanya setelah kuis materi sebelumnya selesai (lintas modul). Membuka URL materi terkunci dialihkan ke materi aktif. Jangan hanya menyembunyikan tombol.
3. **Tidak ada fitur medis.** Jangan membuat diagnosis, kalkulator risiko yang memberi kesimpulan klinis, rekomendasi atau perubahan dosis obat, rencana diet klinis yang dipersonalisasi, integrasi rekam medis, atau konsultasi video/chat.
4. **Tidak ada klaim berlebihan.** Konten tidak boleh menyebut diet DASH menyembuhkan hipertensi atau menggantikan obat. Sertakan pengingat untuk berkonsultasi dengan tenaga kesehatan.
5. **Kuis per materi ≠ instrumen penelitian.** Pretest/posttest tidak dimuat di website; jangan menyalin butirnya ke kuis dan jangan menampilkan kuncinya.
6. **Minimalkan data.** Responden hanya memberi nama dan nomor HP (+ centang kelayakan & persetujuan). Jangan pernah meminta email responden, NIK, alamat, tanggal lahir, nomor rekam medis, atau angka tekanan darah. Nomor HP, token, dan data pribadi tidak boleh masuk URL atau log. Jangan menambah analitik/pelacak pihak ketiga.
7. **Kode akses dan kata sandi hanya hash Argon2id.** Kode akses responden = 6 angka (di kode disebut `token`; pola lemah seperti 123456 tidak dibuat), tampil sekali saat dibuat; admin tidak bisa melihatnya. Di teks untuk responden selalu sebut "kode akses", bukan "token".
11. **ID peserta tidak ditampilkan kepada responden** (keputusan peneliti 2026-10-21). Responden hanya melihat nama dan kode akses; ID peserta (DS-xxxx) tetap dipakai di panel admin, ekspor, dan analisis.
8. **Konten dikunci per versi.** Versi `dikunci` tidak pernah diubah atau dihapus; perbaikan = versi perbaikan baru oleh super admin, wajib alasan, tercatat di log.
9. **Progres bukan indikator klinis.** Progres = keterlaksanaan intervensi (fidelity), bukan keberhasilan menurunkan tekanan darah atau efektivitas edukasi.
10. **Log aktivitas hanya tambah.** Jangan membuat fitur untuk mengubah atau menghapus `log_audit`.

## Peran (PRD 3)

| Peran | Masuk | Area |
|---|---|---|
| Responden | Nomor HP + kode akses 6 angka (sesi "ingat saya" 30 hari) | Navbar atas: Beranda `/belajar/`, Modul Pembelajaran `/belajar/modul/`, Menu Sehat `/belajar/menu-sehat/`, Tips Sehari-hari `/belajar/tips/`, Kuis `/belajar/kuis/`; juga `/profil/`, `/pengenalan/`, `/tentang/`, `/sumber/` |
| Admin | Email + kata sandi ≥12 + TOTP wajib (idle 30 menit) | Menu samping: Dashboard, Kelola Modul `/admin/konten`, Kelola Materi `/admin/konten/materi`, Kelola Kuis `/admin/konten/kuis`, Manajemen Pengguna `/admin/responden`, Laporan & Statistik `/admin/laporan` (termasuk ekspor), Pengaturan |
| Super admin | Sama dengan admin | Semua area admin + `/admin/versi`, `/admin/admins`, `/admin/log` |

- Tanpa sesi admin, semua `/admin/*` (kecuali masuk/undangan) → **404**. Admin biasa di area super admin → **403** (`forbidden()`).
- Akun super admin pertama dibuat lewat `npm run buat-admin`; admin lain diundang dari `/admin/admins/` (tautan 48 jam, dikirim manual karena website tidak mengirim email).

## Skill yang tersedia

| Skill | Kapan dipakai |
|---|---|
| `dash-konten-edukasi` | Menulis, menyunting, atau meninjau teks materi, kuis, rangkuman, sumber (termasuk naskah benih) |
| `dash-ui-aksesibilitas` | Membuat atau mengubah halaman, komponen, gaya, tata letak |
| `dash-privasi-penelitian` | Menyentuh akun, token, sesi, progres, ekspor, admin, log, atau data responden |
| `dash-uji-penerimaan` | Memeriksa kesiapan fitur/rilis terhadap kriteria penerimaan PRD 18 |

## Standar desain singkat (PRD 14)

- Warna utama hijau lembut, latar terang, kontras teks ≥ 4,5:1.
- Teks isi 18px di ponsel (min. 16px), line-height ±1,5–1,6.
- Target sentuh minimal **48×48px** (`--sentuh-min`), termasuk pilihan kuis.
- Status (terkunci, tersedia, sedang, selesai, benar, belum tepat) selalu ikon + teks.
- Mobile-first, diuji mulai lebar 360px, tanpa scroll horizontal di sisi responden.

## Stack dan struktur

- **Next.js 16 (App Router) + React 19 + TypeScript + MongoDB Atlas** (driver resmi `mongodb`). Paket tambahan: `@node-rs/argon2`, `zod`, `yaml`, `react-markdown` + `remark-gfm` (dengan `skipHtml`), `sharp` (kompres gambar), `uqr` (QR 2FA), `fflate` (berkas .xlsx).
- Model data & koleksi: [src/lib/db.ts](src/lib/db.ts), nama koleksi & indeks: [src/lib/indeks.ts](src/lib/indeks.ts). Identitas (`respondents`) terpisah dari data belajar (`participants`, `material_progress`, `quiz_attempts`); analisis memakai `id_peserta` (DS-xxxx).
- Konten Modul → Materi → Kuis → Soal disimpan per versi (`content_versions`). Setiap item punya `kunci` yang sama di semua versi agar progres tetap tersambung. Responden selalu membaca versi aktif (`app_settings.versi_aktif_id`) lewat [src/lib/konten.ts](src/lib/konten.ts).
- Siklus konten & validasi PRD 10.4: [src/lib/konten-admin.ts](src/lib/konten-admin.ts). Hanya ada satu versi kerja (draf/siap ditinjau) pada satu waktu.
- Penguncian & kuis: [src/lib/progres.ts](src/lib/progres.ts). Akun responden: [src/lib/responden.ts](src/lib/responden.ts). Admin & 2FA: [src/lib/admin-auth.ts](src/lib/admin-auth.ts). Sesi: [src/lib/sesi.ts](src/lib/sesi.ts). Pembatasan percobaan: [src/lib/batas.ts](src/lib/batas.ts). Monitoring & ekspor: [src/lib/monitor.ts](src/lib/monitor.ts).
- Setiap halaman, Server Action, dan Route Handler admin memanggil `wajibAdmin()` (atau `wajibAdmin('super_admin')`). Halaman belajar memanggil `wajibResponden()`. `src/proxy.ts` hanya memperpanjang cookie "ingat saya", bukan pengaman.
- Halaman bacaan pendukung responden: Menu Sehat (`src/data/menu-sehat.ts`) dan Tips Sehari-hari (`src/data/tips.ts`) — isi statis berversi, ikut diperiksa `cek-klaim`, perubahan dicatat di `CHANGELOG-KONTEN.md`. Progres per modul, status kuis, dan aktivitas belajar sendiri: [src/lib/beranda-responden.ts](src/lib/beranda-responden.ts). Data dashboard admin: [src/lib/dashboard-admin.ts](src/lib/dashboard-admin.ts).
- Pengaturan penelitian (keputusan terbuka PRD 20) ada di `app_settings` dan diubah lewat `/admin/pengaturan/`, bukan di kode.
- **Konten contoh:** `npm run benih-konten -- --contoh` menerbitkan naskah benih sebagai versi bertanda `contoh: true` (label "Contoh (belum divalidasi)") agar website bisa dicoba. Konten contoh tidak bisa dikunci; super admin menghapus seluruhnya lewat Versi Konten → **Hapus Konten Contoh** (`hapusKontenContoh`, tercatat di log), atau admin menghapus per modul/materi/soal lewat versi kerja. Skrip menolak menimpa versi terbit yang bukan contoh.
- Naskah benih konten: `scripts/benih/naskah-v2/*.md` (satu berkas per modul, `## ` = satu materi, blok ```` ```meta ```` berisi tujuan, poin penting, rangkuman, sumber, kuis). Diimpor dengan `npm run benih-konten` sebagai **versi kerja draf**; setelah itu sumber kebenaran konten adalah database dan panel admin.
- Rahasia hanya di `.env.local` (lihat `.env.example`). Jangan membaca atau menampilkan isi `.env.local`; gunakan `npm run cek-db` untuk memeriksa koneksi.
- Versi dependensi dikunci persis (tanpa `^`). Pilih versi rilis yang sudah berumur ≥2 minggu dan jalankan `npm audit` setelah menambah paket.

## Versi konten

- Perubahan konten lewat panel admin tercatat otomatis di `log_audit` (pengganti changelog manual).
- Perubahan pada naskah benih (`scripts/benih/naskah-v2`) dicatat di `CHANGELOG-KONTEN.md`.
- Setelah versi dikunci (mis. v1.0), perubahan konten inti memerlukan persetujuan peneliti utama dan dibuat sebagai versi perbaikan.

## Cara bekerja

- Perintah: `npm run dev`, `npm run build`, `npm run typecheck`, `npm run cek-klaim`, `npm run cek-db`, `npm run benih-konten`, `npm run buat-admin`. Jalankan `typecheck`, `cek-klaim`, dan `build` sebelum menyatakan pekerjaan selesai.
- Pengujian yang menulis ke database harus memakai database terpisah berakhiran `_uji` (mis. `MONGODB_DB=dash_sehat_uji`); `benih-konten --terbit` dan mode otomatis `buat-admin` hanya berjalan di database `_uji`. Setelah uji, bersihkan database uji dan **build ulang dari database asli** (halaman statis bisa ikut ter-cache dari data uji).
- Saat membuat konten medis/nutrisi, tandai bagian yang perlu dicek sumbernya dengan `<!-- TODO: verifikasi sumber -->` daripada mengarang angka atau rujukan.
- Semua teks yang terlihat pengguna ditulis dalam Bahasa Indonesia.
