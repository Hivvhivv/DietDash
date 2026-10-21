# DASH Sehat

Platform edukasi diet DASH untuk orang dewasa dengan hipertensi (media intervensi penelitian). Kebutuhan lengkap ada di [docs/PRD.md](docs/PRD.md) (PRD v2.0, dokumen asli [docs/PRD-v2.0.pdf](docs/PRD-v2.0.pdf)), aturan kerja agent di [AGENTS.md](AGENTS.md).

Dibangun dengan Next.js 16 (App Router), React 19, TypeScript, dan MongoDB Atlas.

## Persiapan pertama kali

```bash
npm install
cp .env.example .env.local   # lalu isi MONGODB_URI dan MONGODB_DB
npm run cek-db               # memastikan koneksi database
npm run benih-konten         # memasukkan konten awal (6 modul, 20 materi, 60 soal) sebagai versi kerja DRAF
#   atau: npm run benih-konten -- --contoh   → langsung TERBIT sebagai konten contoh untuk uji coba
npm run buat-admin           # membuat akun super admin pertama (kata sandi diketik tersembunyi)
```

Lalu buka `/admin/masuk/`, masuk dengan email dan kata sandi, dan atur aplikasi autentikator (Google Authenticator, Microsoft Authenticator, Aegis, dsb.) dengan memindai kode QR.

**Konten contoh.** Database utama saat ini berisi konten contoh yang sudah terbit (label "Contoh (belum divalidasi)") supaya website bisa dicoba. Sebelum responden penelitian mulai: super admin membuka **Versi Konten → Hapus Konten Contoh** (menghapus semua modul, materi, kuis, dan soal contoh sekaligus), lalu membuat dan menerbitkan konten tervalidasi. Admin juga bisa menghapus atau mengedit per modul/materi/soal lewat Kelola Modul. Konten contoh tidak bisa dikunci untuk penelitian. Akun responden uji coba tidak ikut terhapus; tandai sebagai "bukan sampel".

Konten benih **belum divalidasi ahli**. Tinjau dan sunting di `/admin/konten/`, tandai "siap ditinjau", lalu super admin menerbitkannya di `/admin/versi/`. Sebelum responden pertama mendaftar, kunci versinya (mis. `v1.0`).

## Perintah

```bash
npm run dev           # server pengembangan di http://localhost:3000
npm run build         # build produksi (butuh akses database)
npm start             # menjalankan hasil build
npm run typecheck     # cek tipe TypeScript
npm run cek-klaim     # cek klaim terlarang & penanda TODO di naskah benih dan halaman
npm run cek-db        # cek koneksi database tanpa menampilkan kata sandi
npm run benih-konten  # impor naskah benih (--ganti untuk membuang versi kerja lama)
npm run buat-admin    # buat super admin pertama
```

Next.js mengirim telemetri anonim saat build. Untuk mematikannya: `npx next telemetry disable`.

## Alur responden

1. **Daftar** (`/daftar/`): nama + nomor HP, centang kelayakan dan persetujuan. Sistem menampilkan konfirmasi nomor, lalu membuat **kode akses 6 angka** (mis. `482 917`) yang hanya tampil sekali bersama nama responden. Responden menyimpan kode (Salin / Simpan sebagai Gambar) dan mencentang "Saya sudah menyimpan kode akses saya". ID peserta (DS-xxxx) dibuat di sistem untuk admin dan ekspor, tetapi tidak ditampilkan kepada responden.
2. **Sambutan** (3 layar) → **dashboard belajar** (`/belajar/`) dengan tombol "Lanjutkan Belajar".
3. **Materi → kuis → materi berikutnya.** Materi berikutnya terkunci sampai kuis materi sebelumnya selesai (dicek di server). Mode A: selesai saat semua soal dijawab; Mode B: harus mencapai skor minimal.
4. **Masuk lagi** (`/masuk/`) dengan nomor HP + kode akses (keyboard angka; spasi/tanda hubung diabaikan); "Ingat saya" menjaga sesi 30 hari. **Lupa kode akses** → hubungi peneliti lewat WhatsApp; admin membuat kode baru.
5. **Profil** (`/profil/`): ubah nama, buat kode akses baru, ganti nomor HP, mengundurkan diri.

Setelah masuk, responden memakai navbar di atas (di HP: tombol **Menu**):

| Menu | Isi |
|---|---|
| Beranda | Sapaan, Lanjutkan Belajar, kartu modul/materi/kuis selesai & progres keseluruhan, aktivitas terbaru, progres per modul |
| Modul Pembelajaran | Progres keseluruhan + kartu tiap modul dengan % materi selesai |
| Menu Sehat | Isi piring sehat, makanan yang dianjurkan & perlu dibatasi, cara memasak |
| Tips Sehari-hari | Tips hari ini + tips per kategori (garam, belanja, memasak, makan di luar, kebiasaan) |
| Kuis | Jumlah kuis belum selesai, status & skor setiap kuis per modul |

Halaman awal (`/`) langsung ke **Masuk**; responden yang sudah masuk langsung ke dashboard. Masuk, Daftar, Lupa Token, dan Masuk Admin bergaya aplikasi (ilustrasi besar, judul tebal, tombol bulat; dua kolom di layar lebar). Di halaman Masuk ada pengalih **Responden | Admin** untuk berpindah antara `/masuk/` dan `/admin/masuk/`. Tanpa akun hanya bisa membuka Masuk, Daftar, Lupa Token, Privasi, dan Ketentuan Penggunaan. Pengenalan, Tentang, Sumber, dan Pertanyaan Umum ada di menu setelah masuk (keputusan peneliti 2026-10-21, menyimpang dari PRD 3–4).

## Panel admin (`/admin/`)

| Menu | Isi | Peran |
|---|---|---|
| Dashboard | Kartu modul/materi/pertanyaan/pengguna, aktivitas terbaru, grafik responden aktif per hari, status belajar, perlu perhatian, penyelesaian per materi | Admin, super admin |
| Kelola Materi / Kelola Kuis | Daftar seluruh materi dan kuis per modul; aturan selesai kuis (Mode A/B) | Admin, super admin |
| Laporan & Statistik | Analisis kuis per soal dan ekspor data | Admin, super admin |
| Responden | Tabel dengan pencarian, saringan, urutan; detail per responden (garis waktu, jawaban, buka nomor lengkap, reset token, buka kunci manual, status sampel, nonaktifkan) | Admin, super admin |
| Konten | Versi kerja: modul, materi (editor Markdown + unggah gambar), kuis & soal, pratinjau, validasi, mode kuis untuk semua kuis | Admin, super admin (versi perbaikan: super admin) |
| Pengaturan | Buka/tutup pendaftaran, pernyataan kelayakan, gerbang pretest, batas tidak aktif & intervensi, WhatsApp peneliti | Admin, super admin |
| Versi | Terbitkan, kunci (v1.0), buat versi perbaikan | Super admin |
| Admin | Undang admin (tautan 48 jam, dikirim manual), nonaktifkan, reset 2FA | Super admin |
| Log | Log aktivitas (cari, unduh CSV); tidak dapat dihapus | Super admin |

Siklus konten: **Draf → Siap ditinjau → Terbit → Dikunci**. Hanya ada satu versi kerja pada satu waktu; versi baru disalin dari versi aktif, dan setiap modul/materi/kuis/soal mempertahankan `kunci` yang sama sehingga progres responden tetap tersambung.

## Blok khusus di isi materi

- ` ```contoh ` — kotak "Contoh penerapan sehari-hari".
- ` ```penting ` — kotak poin penting di tengah isi.
- ` ```galeri ` — satu makanan per baris: `🥦 | Brokoli | keterangan opsional`.
- ` ```menu ` — daftar YAML (`waktu`, `emoji`, `nama`, `bahan`, `alasan`, `catatan`) yang tampil sebagai kartu bertab.
- `> **Tips:** …` — kotak tips. Gambar: `![teks alternatif](/gambar-konten/<id>/)`.

## Struktur

| Lokasi | Isi |
|---|---|
| `src/app/(awal)/` | Halaman awal: hanya mengalihkan ke Masuk atau dashboard |
| `src/app/(akun)/` | Masuk, Daftar, Lupa Token (kerangka bergaya aplikasi, `components/akun/`) |
| `src/app/(publik)/` | Privasi dan Ketentuan Penggunaan (tanpa login) |
| `src/app/(belajar)/` | Wajib masuk: dashboard belajar, modul, materi, kuis, selesai, profil, simpan token, sambutan, pengenalan, tentang, sumber, pertanyaan umum |
| `src/app/admin/` | Panel admin, masuk + 2FA, undangan, Server Actions (`aksi-*.ts`), unggah gambar |
| `src/app/aksi-responden.ts` | Server Actions responden |
| `src/lib/` | `db` (model), `indeks`, `skema`, `identitas` (token, nomor, ID peserta), `sesi`, `batas`, `responden`, `admin-auth`, `totp`, `konten`, `konten-admin`, `progres`, `monitor`, `pengaturan`, `gambar`, `xlsx`, `cek-klaim` |
| `src/proxy.ts` | Memperpanjang cookie "ingat saya" (bukan pengaman) |
| `scripts/benih/` | Naskah benih v2 (`naskah-v2/*.md`), soal & sumber v1 yang dipakai ulang, naskah v1 (arsip) |
| `scripts/` | `benih-konten`, `buat-admin`, `cek-db`, `cek-klaim` |
| `docs/` | PRD v2.0 (Markdown + PDF) dan PRD v1 (arsip) |

## Koleksi MongoDB

| Koleksi | Isi |
|---|---|
| `respondents` | Identitas responden: nama, nomor HP (+62…), hash token, persetujuan, status |
| `participants` | ID peserta, status sampel, tanda pretest |
| `token_events` | Riwayat akun (token dibuat/diganti/direset, nomor/nama diganti, nonaktif, mundur) |
| `admins`, `admin_invites` | Akun admin (hash kata sandi, rahasia TOTP, peran) dan undangan (hash, 48 jam) |
| `sessions` | Sesi responden & admin (hash token, kedaluwarsa bergeser) |
| `app_settings` | Pengaturan penelitian & versi aktif |
| `content_versions`, `modules`, `materials`, `quizzes`, `questions` | Konten per versi |
| `material_progress`, `quiz_attempts` | Progres per materi dan percobaan kuis (jawaban per soal) |
| `percobaan_login` | Percobaan masuk/daftar (terhapus otomatis) |
| `log_audit` | Log aktivitas admin (hanya tambah) |
| `gambar.files`, `gambar.chunks` | Gambar unggahan (WebP, GridFS) |

Koleksi versi lama (`modul_versi`, `admin`, `sesi`, `peserta`, `sesi_peserta`, `progres`, `hasil_latihan`, `token_reset`) tidak dipakai lagi dan tidak dihapus otomatis.

## Pengujian

Uji yang menulis data memakai database terpisah, misalnya `MONGODB_DB=dash_sehat_uji`. `benih-konten --terbit` dan mode otomatis `buat-admin` (`BUAT_ADMIN_EMAIL`, `BUAT_ADMIN_SANDI`) hanya berjalan pada database berakhiran `_uji`. Setelah uji, bersihkan database uji dan jalankan `npm run build` lagi dengan database asli.

## Privasi

Responden hanya memberi nama dan nomor HP. Token dan kata sandi disimpan sebagai hash Argon2id; nomor HP tampil tersamarkan bagi admin; ekspor memakai ID peserta tanpa nama/HP; tidak ada analitik pihak ketiga. Lama penyimpanan, penanganan data responden yang mundur, dan lokasi server masih **TODO** di `/privasi/` (menunggu keputusan pembimbing/komisi etik).
