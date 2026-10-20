---
name: dash-privasi-penelitian
description: Panduan wajib saat menyentuh akun, login, penyimpanan progres, pencatatan waktu, analitik, data peserta, dashboard pengguna/admin, atau pengelolaan versi konten DASH Sehat. Gunakan sebelum menambah fitur yang menyimpan atau mengirim data apa pun.
---

# Privasi, Keamanan, dan Kebutuhan Penelitian

Rujukan lengkap: `docs/PRD.md` bagian 4, 6, 8, 11 (Keamanan), 12, dan 13.

## Langkah 0: pastikan fitur memang diminta

Akun, progres, riwayat, pencatatan waktu, dan dashboard admin adalah fitur **opsional**. Sebelum membangunnya, pastikan peneliti meminta secara eksplisit dan sudah menetapkan:

- tujuan pengumpulan data,
- data apa saja yang dikumpulkan,
- lama penyimpanan,
- siapa yang boleh mengakses,
- prosedur penghapusan.

Jika salah satu belum jelas, tanyakan dulu. Jangan menganggap data di daftar PRD bagian 12 otomatis wajib dikumpulkan.

## Keputusan yang sudah diambil (2026-10-20)

- Peneliti memilih **akun peserta dengan email** (daftar mandiri) agar progres bisa dipantau. Pendaftaran wajib mencentang persetujuan Kebijakan Privasi; versi kebijakan yang disetujui disimpan (`VERSI_KEBIJAKAN`).
- Lupa kata sandi ditangani lewat tautan atur ulang buatan peneliti (24 jam, sekali pakai) sampai ada layanan pengirim email.
- Peserta dapat menghapus akunnya sendiri; peneliti dapat menghapus satu atau semua data peserta. Semua tindakan admin terhadap data peserta tercatat di log audit.
- **Belum diputuskan:** lama penyimpanan data dan lokasi server (TODO di `/kebijakan-privasi/`). Jangan mengarang nilainya.

## Pilihan arsitektur

**Opsi 1 — Tanpa akun (default).** Tidak ada backend data peserta. Progres boleh disimpan di `localStorage` perangkat saja (tidak dikirim ke server), dibungkus `try/catch`, dan website tetap berfungsi bila penyimpanan kosong/diblokir. Beri tahu pengguna bahwa progres hanya tersimpan di perangkat ini.

**Opsi 2 — Akun sederhana dengan kode peserta.**
- Login memakai kode peserta dari peneliti + kata sandi/PIN yang dibuat peserta, atau tautan masuk sekali pakai.
- Formulir singkat, instruksi jelas, pesan kesalahan yang menjelaskan cara memperbaiki.
- Wajib ada tombol "Keluar" dan mekanisme pemulihan akses yang aman (mis. reset oleh peneliti setelah verifikasi).
- Tabel akun hanya berisi kode peserta, bukan nama/identitas. Kunci pemetaan kode ↔ identitas disimpan peneliti di luar sistem website.

## Larangan data

Jangan pernah meminta atau menyimpan:
- NIK, alamat lengkap, nomor rekam medis, nomor telepon, tanggal lahir lengkap;
- nilai tekanan darah, obat yang diminum, atau data kesehatan lain yang tidak disetujui protokol.

Jangan pernah menyarankan tanggal lahir, nomor rekam medis, atau nomor telepon sebagai kata sandi; tolak pola tersebut saat validasi bila memungkinkan.

## Keamanan teknis

- HTTPS wajib di lingkungan publik; set HSTS.
- Kata sandi di-hash dengan algoritma modern (argon2id atau bcrypt dengan cost memadai). Jangan menyimpan teks asli atau hash cepat (MD5/SHA1).
- Sesi: cookie `HttpOnly`, `Secure`, `SameSite=Lax`; kedaluwarsa wajar; regenerasi ID sesi setelah login.
- Batasi percobaan login (rate limiting).
- Kode peserta dan data pribadi tidak boleh muncul di URL, query string, judul halaman, atau log yang bisa diakses publik.
- Akses admin dibatasi per peran; admin tidak bisa mengubah materi yang sudah dibekukan atau melihat data di luar kewenangan.
- Tidak memakai analitik/pixel pihak ketiga. Jika pencatatan akses diperlukan, simpan minimal (kode peserta, modul, waktu) di server sendiri.
- Rahasia (kunci API, kredensial DB) di variabel lingkungan, tidak di-commit.

## Dashboard pengguna (jika akun aktif)

Isi hanya: sapaan singkat, tombol "Lanjutkan Belajar", daftar modul dengan status "Belum dipelajari"/"Selesai" (ikon + teks), indikator progres sederhana, tautan kuis, tautan privasi & bantuan.

Jangan menambahkan grafik kesehatan, statistik tekanan darah, notifikasi berlebihan, gamifikasi kompetitif, atau peringkat antarpengguna. Progres **tidak boleh** dibingkai sebagai keberhasilan klinis.

## Konsistensi intervensi penelitian

- Semua peserta menerima konten inti dan urutan modul yang sama; jangan membuat A/B test atau personalisasi konten.
- Versi konten tercatat (nomor versi di tiap file konten + `CHANGELOG-KONTEN.md`). Tampilkan versi website di footer atau halaman Tentang.
- Setelah versi dibekukan, perubahan konten inti hanya dengan persetujuan peneliti.
- Kuis latihan terpisah dari pretest/posttest. Website tidak boleh mengubah jawaban instrumen secara otomatis atau menampilkan kunci pretest sebelum posttest.
- Jika pretest/posttest diintegrasikan, simpan di sistem penelitian yang aman dengan kode peserta, dan jangan tampilkan hasil individu ke pengguna lain.
- Metrik seperti jumlah klik, lama kunjungan, atau persentase modul selesai bukan ukuran efektivitas intervensi; jangan menampilkannya seolah-olah demikian.

## Admin pengelola konten

Fitur ini sudah dibangun (MongoDB, `/admin/`). Saat mengubah atau menambahnya:

- Halaman publik membaca lewat `src/lib/konten.ts` (hanya status `disetujui`); operasi admin di `src/lib/konten-admin.ts`. Jangan mengakses koleksi langsung dari halaman.
- Koleksi `modul_versi`: `modul_id`, `versi`, `status` (`draf` | `disetujui` | `diarsipkan`), `data`, `isi`, `catatan`, `dibuat_oleh`, `dibuat_pada`, `disetujui_oleh`, `disetujui_pada`. Indeks unik parsial menjamin satu `disetujui` per modul.
- Validasi input admin dengan skema di `src/lib/skema.ts`. Render tetap lewat `react-markdown` dengan `skipHtml`.
- Setiap halaman admin, Server Action, dan Route Handler memanggil `wajibAdmin()` (peran `peneliti` untuk menyetujui). `src/proxy.ts` hanya pemeriksaan cepat.
- Kata sandi admin di-hash argon2id (`@node-rs/argon2`); sesi berupa token acak yang disimpan sebagai hash SHA-256, cookie `HttpOnly` + `SameSite=Lax` (+ `Secure` di produksi), kedaluwarsa 8 jam; maksimal 5 gagal masuk per akun / 20 per IP dalam 15 menit.
- Catat setiap tindakan lewat `catatAudit()`; jangan pernah menghapus versi yang pernah tayang atau entri log audit.

## Halaman privasi

Jelaskan dengan bahasa sederhana: data apa yang dikumpulkan (atau bahwa tidak ada), untuk apa, berapa lama disimpan, siapa yang mengakses, cara meminta penghapusan, dan kontak peneliti.
