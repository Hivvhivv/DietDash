# AGENTS.md — DASH Sehat

Instruksi kerja untuk AI agent yang mengembangkan proyek ini. Sumber kebenaran lengkap ada di [docs/PRD.md](docs/PRD.md) (PRD v2.0; dokumen asli [docs/PRD-v2.0.pdf](docs/PRD-v2.0.pdf)). Jika file ini dan PRD bertentangan, ikuti PRD.

## Tentang proyek

DASH Sehat adalah platform edukasi diet DASH (*Dietary Approaches to Stop Hypertension*) untuk orang dewasa dengan hipertensi. Proyek ini dipakai sebagai media intervensi dalam penelitian skripsi, sehingga konsistensi konten dan perlindungan data sama pentingnya dengan fitur.

- Bahasa antarmuka dan konten: **Bahasa Indonesia** yang sederhana, sapaan "Anda".
- Pengguna: tingkat pendidikan dan literasi digital beragam, kebanyakan memakai ponsel.
- Sifat produk: **edukasi mandiri**, bukan konsultasi medis atau telemedicine.

## Aturan yang tidak boleh dilanggar

1. **Langsung ke Masuk; fitur hanya setelah masuk.** Keputusan peneliti (2026-10-21, menyimpang dari PRD 3–4): halaman awal `/` langsung dialihkan ke `/masuk/` (atau `/belajar/` bila sudah masuk); tidak ada splash screen. Masuk, Daftar, Lupa Token, serta Masuk Admin (dan undangan) memakai `KerangkaAkun` + `HalamanAkun` bergaya aplikasi (ilustrasi SVG, judul tebal, tombol bulat; dua kolom di layar lebar). Halaman Masuk responden dan Masuk Admin punya pengalih "Responden | Admin" (`PilihMasuk`). Yang publik hanya Masuk, Daftar, Lupa Token, Privasi, dan Ketentuan Penggunaan (wajib tetap publik karena dirujuk saat persetujuan). Semua fitur responden hanya setelah masuk (`wajibResponden()`). Area responden memakai `KerangkaResponden` (**navbar di atas**: merek, 4 menu, lonceng materi berikutnya, akun; di ponsel menu terlipat di tombol Menu); panel admin memakai menu samping; menu Bantuan/Pertanyaan Umum sengaja tidak dibuat (keputusan peneliti 2026-10-21). Halaman publik tidak boleh menaut ke halaman yang wajib masuk.
2. **Penguncian berurutan diperiksa di server.** Keputusan peneliti (2026-10-22, menyimpang dari PRD): **tidak ada kuis**. Materi dianggap selesai saat dibuka; materi berikutnya terbuka hanya setelah materi sebelumnya dibuka (lintas modul). Penandaan dilakukan di server saat halaman materi dirender (`tandaiDibuka`), aman dari prefetch karena tidak ada `loading.tsx`; jangan menambah `loading.tsx` di rute materi tanpa memindahkan penandaan. Membuka URL materi terkunci dialihkan ke materi berikutnya yang terbuka. Jangan hanya menyembunyikan tombol.
3. **Tidak ada fitur medis.** Jangan membuat diagnosis, kalkulator risiko yang memberi kesimpulan klinis, rekomendasi atau perubahan dosis obat, rencana diet klinis yang dipersonalisasi, integrasi rekam medis, atau konsultasi video/chat.
4. **Tidak ada klaim berlebihan.** Konten tidak boleh menyebut diet DASH menyembuhkan hipertensi atau menggantikan obat. Sertakan pengingat untuk berkonsultasi dengan tenaga kesehatan.
5. **Pretest/posttest bukan bagian website.** Instrumen penelitian tidak dimuat di website; jangan menyalin butirnya ke materi dan jangan menampilkan kuncinya. Fitur kuis per materi sudah dihapus (2026-10-22); jangan menambahkannya kembali tanpa keputusan peneliti.
6. **Minimalkan data.** Responden hanya memberi nama dan nomor HP (+ centang kelayakan & persetujuan). Jangan pernah meminta email responden, NIK, alamat, tanggal lahir, nomor rekam medis, atau angka tekanan darah. Nomor HP, token, dan data pribadi tidak boleh masuk URL atau log. Jangan menambah analitik/pelacak pihak ketiga.
7. **Kode akses dan kata sandi hanya hash Argon2id.** Kode akses responden = 6 angka (di kode disebut `token`; pola lemah seperti 123456 tidak dibuat), tampil sekali saat dibuat. Keputusan peneliti 2026-10-22: salinan terenkripsi AES-256-GCM (`kode_terenkripsi`, kunci env `KUNCI_KODE_AKSES`, [src/lib/kode-akses.ts](src/lib/kode-akses.ts)) disimpan agar **hanya super admin** bisa membuka "Lihat kode" di Manajemen Pengguna/detail; setiap pembukaan tercatat di log (`lihat_kode_akses`). Admin biasa tidak bisa melihat; kode tidak pernah masuk ekspor, URL, atau HTML awal; proyeksi daftar/detail mengecualikan `kode_terenkripsi`. Di teks untuk responden selalu sebut "kode akses", bukan "token".
11. **ID peserta tidak ditampilkan kepada responden** (keputusan peneliti 2026-10-21). Responden hanya melihat nama dan kode akses; ID peserta (DS-xxxx) tetap dipakai di panel admin, ekspor, dan analisis.
8. **Konten dikunci per versi.** Versi `dikunci` tidak pernah diubah atau dihapus; perbaikan = versi perbaikan baru oleh super admin, wajib alasan, tercatat di log.
9. **Progres bukan indikator klinis.** Progres = keterlaksanaan intervensi (fidelity), bukan keberhasilan menurunkan tekanan darah atau efektivitas edukasi.
10. **Log aktivitas hanya tambah.** Jangan membuat fitur untuk mengubah atau menghapus `log_audit`.

## Peran (PRD 3)

| Peran | Masuk | Area |
|---|---|---|
| Responden | Nomor HP + kode akses 6 angka (sesi "ingat saya" 30 hari) | Navbar atas: Beranda `/belajar/`, Modul Pembelajaran `/belajar/modul/`, Menu Sehat `/belajar/menu-sehat/`, Tips Sehari-hari `/belajar/tips/`; juga `/profil/`, `/pengenalan/`, `/tentang/`, `/sumber/` |
| Admin | Email + kata sandi ≥12, langsung masuk **tanpa 2FA** (keputusan peneliti 2026-10-22, menyimpang dari PRD 7.8; idle 30 menit, percobaan salah dibatasi) | Menu samping: Dashboard, Kelola Modul `/admin/konten`, Kelola Materi `/admin/konten/materi`, Manajemen Pengguna `/admin/responden`, Kelola Tips `/admin/tips`, Laporan & Statistik `/admin/laporan` (termasuk ekspor), Pengaturan |
| Super admin | Sama dengan admin | Semua area admin + `/admin/versi`, `/admin/admins`, `/admin/log` |

- Tanpa sesi admin, semua `/admin/*` (kecuali masuk/undangan) → **404**. Admin biasa di area super admin → **403** (`forbidden()`).
- Akun super admin pertama dibuat lewat `npm run buat-admin`; admin lain diundang dari `/admin/admins/` (tautan 48 jam, dikirim manual karena website tidak mengirim email).
- **Tambah Pengguna Baru** (`/admin/responden/tambah/`, khusus super admin): pilih role. *Responden*: nama + nomor HP + kelompok + centang wajib bahwa kelayakan & persetujuan sudah dinyatakan kepada peneliti; kode akses 6 angka tampil sekali (hash Argon2id), `token_disimpan_pada` langsung terisi, tercatat di riwayat akun (`dibuat_admin`) dan log (`tambah_responden`). *Admin/Super admin*: undangan 48 jam seperti di atas.

## Skill yang tersedia

| Skill | Kapan dipakai |
|---|---|
| `dash-konten-edukasi` | Menulis, menyunting, atau meninjau teks materi, rangkuman, sumber, tips (termasuk naskah benih) |
| `dash-ui-aksesibilitas` | Membuat atau mengubah halaman, komponen, gaya, tata letak |
| `dash-privasi-penelitian` | Menyentuh akun, token, sesi, progres, ekspor, admin, log, atau data responden |
| `dash-uji-penerimaan` | Memeriksa kesiapan fitur/rilis terhadap kriteria penerimaan PRD 18 |

## Standar desain singkat (PRD 14)

- Warna utama hijau lembut, latar terang, kontras teks ≥ 4,5:1.
- Teks isi 18px di ponsel (min. 16px), line-height ±1,5–1,6.
- Target sentuh minimal **48×48px** (`--sentuh-min`).
- Status (terkunci, tersedia, sedang, selesai, benar, belum tepat) selalu ikon + teks.
- Mobile-first, diuji mulai lebar 360px, tanpa scroll horizontal di sisi responden.

## Stack dan struktur

- **Next.js 16 (App Router) + React 19 + TypeScript + MongoDB Atlas** (driver resmi `mongodb`). Paket tambahan: `@node-rs/argon2`, `zod`, `yaml`, `react-markdown` + `remark-gfm` (dengan `skipHtml`), `sharp` (kompres gambar), `fflate` (berkas .xlsx).
- Model data & koleksi: [src/lib/db.ts](src/lib/db.ts), nama koleksi & indeks: [src/lib/indeks.ts](src/lib/indeks.ts). Identitas (`respondents`) terpisah dari data belajar (`participants`, `material_progress`, `quiz_attempts`); analisis memakai `id_peserta` (DS-xxxx).
- Konten Modul → Materi disimpan per versi (`content_versions`). Setiap item punya `kunci` yang sama di semua versi agar progres tetap tersambung. Responden selalu membaca versi aktif (`app_settings.versi_aktif_id`) lewat [src/lib/konten.ts](src/lib/konten.ts).
- Siklus konten & validasi PRD 10.4: [src/lib/konten-admin.ts](src/lib/konten-admin.ts). Hanya ada satu versi kerja (draf/siap ditinjau) pada satu waktu.
- Penguncian & progres (materi selesai saat dibuka): [src/lib/progres.ts](src/lib/progres.ts). Akun responden: [src/lib/responden.ts](src/lib/responden.ts). Admin (email + kata sandi): [src/lib/admin-auth.ts](src/lib/admin-auth.ts). Sesi: [src/lib/sesi.ts](src/lib/sesi.ts). Pembatasan percobaan: [src/lib/batas.ts](src/lib/batas.ts). Monitoring & ekspor: [src/lib/monitor.ts](src/lib/monitor.ts).
- Setiap halaman, Server Action, dan Route Handler admin memanggil `wajibAdmin()` (atau `wajibAdmin('super_admin')`). Halaman belajar memanggil `wajibResponden()`. `src/proxy.ts` hanya memperpanjang cookie "ingat saya", bukan pengaman.
- Halaman bacaan pendukung responden: Menu Sehat (katalog resep `src/data/resep-sehat.ts` + detail `/belajar/menu-sehat/<kunci>/`, ilustrasi SVG `IlustrasiHidangan` bila belum ada `foto`; gizi hanya tingkat perkiraan sampai `angka` diisi ahli gizi; panduan bahan `src/data/menu-sehat.ts`) — isi statis berversi, ikut diperiksa `cek-klaim`, perubahan dicatat di `CHANGELOG-KONTEN.md`. **Tips Sehari-hari** ada di database (koleksi `tips`, [src/lib/tips.ts](src/lib/tips.ts)) dan dikelola admin di `/admin/tips/` (tambah, edit, tampilkan/sembunyikan, urutkan, hapus; tercatat di log; klaim terlarang ditolak saat simpan). Tips tidak termasuk versi konten. Tips contoh: `npm run benih-tips` (bertanda `contoh`, dihapus lewat Kelola Tips → Hapus Tips Contoh). Bagian tetap halaman Tips (3 prinsip, checklist harian) di `src/data/tips.ts`; checklist hanya disimpan di localStorage perangkat responden, tidak dikirim ke server. Progres per modul dan aktivitas belajar sendiri: [src/lib/beranda-responden.ts](src/lib/beranda-responden.ts). Data dashboard admin: [src/lib/dashboard-admin.ts](src/lib/dashboard-admin.ts).
- Pengaturan penelitian (keputusan terbuka PRD 20) ada di `app_settings` dan diubah lewat `/admin/pengaturan/`, bukan di kode.
- **Konten contoh:** `npm run benih-konten -- --contoh` menerbitkan naskah benih sebagai versi bertanda `contoh: true` (label "Contoh (belum divalidasi)") agar website bisa dicoba. Konten contoh tidak bisa dikunci; super admin menghapus seluruhnya lewat Versi Konten → **Hapus Konten Contoh** (`hapusKontenContoh`, tercatat di log), atau admin menghapus per modul/materi lewat versi kerja. Skrip menolak menimpa versi terbit yang bukan contoh.
- Naskah benih konten: `scripts/benih/naskah-v2/*.md` (satu berkas per modul, `## ` = satu materi, blok ```` ```meta ```` berisi tujuan, poin penting, rangkuman, sumber). Diimpor dengan `npm run benih-konten` sebagai **versi kerja draf**; setelah itu sumber kebenaran konten adalah database dan panel admin.
- Rahasia hanya di `.env.local` (lihat `.env.example`). Jangan membaca atau menampilkan isi `.env.local`; gunakan `npm run cek-db` untuk memeriksa koneksi.
- Versi dependensi dikunci persis (tanpa `^`). Pilih versi rilis yang sudah berumur ≥2 minggu dan jalankan `npm audit` setelah menambah paket.

## Versi konten

- Perubahan konten lewat panel admin tercatat otomatis di `log_audit` (pengganti changelog manual).
- Perubahan pada naskah benih (`scripts/benih/naskah-v2`) dicatat di `CHANGELOG-KONTEN.md`.
- Setelah versi dikunci (mis. v1.0), perubahan konten inti memerlukan persetujuan peneliti utama dan dibuat sebagai versi perbaikan.

## Cara bekerja

- Perintah: `npm run dev`, `npm run build`, `npm run typecheck`, `npm run cek-klaim`, `npm run cek-db`, `npm run benih-konten`, `npm run benih-tips`, `npm run buat-admin`. Jalankan `typecheck`, `cek-klaim`, dan `build` sebelum menyatakan pekerjaan selesai.
- Pengujian yang menulis ke database harus memakai database terpisah berakhiran `_uji` (mis. `MONGODB_DB=dash_sehat_uji`); `benih-konten --terbit` dan mode otomatis `buat-admin` hanya berjalan di database `_uji`. Setelah uji, bersihkan database uji dan **build ulang dari database asli** (halaman statis bisa ikut ter-cache dari data uji).
- Saat membuat konten medis/nutrisi, tandai bagian yang perlu dicek sumbernya dengan `<!-- TODO: verifikasi sumber -->` daripada mengarang angka atau rujukan.
- Semua teks yang terlihat pengguna ditulis dalam Bahasa Indonesia.
