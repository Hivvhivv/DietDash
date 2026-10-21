# PRD DASH Sehat v2.0 — Platform Edukasi Diet DASH untuk Dewasa dengan Hipertensi

> Transkripsi Markdown dari [PRD-v2.0.pdf](PRD-v2.0.pdf) (20 Oktober 2026). Bila ada perbedaan, dokumen PDF yang berlaku.
> PRD versi sebelumnya: [PRD-v1.md](PRD-v1.md).
>
> **Penyimpangan yang diputuskan peneliti (2026-10-21):** halaman awal langsung ke halaman Masuk (tanpa beranda publik dan tanpa splash screen). Hanya Masuk, Daftar, Lupa Token, Privasi, dan Ketentuan Penggunaan yang dapat dibuka tanpa login; Pengenalan, Tentang, Sumber Materi, dan Pertanyaan Umum dipindah ke area responden (wajib masuk). Ini mengubah tabel "Area aplikasi per role" (Bagian 3), butir 1 dan 10 fitur wajib (Bagian 4), dan halaman publik (Bagian 9).
>
> **Penyimpangan kedua (2026-10-21):** "token akses" diganti **kode akses 6 angka** (mis. `482 917`) agar mudah diingat lansia (mengubah 7.2: semula 8 huruf+angka). Pola mudah ditebak (111111, 123456, 121212, …) tidak dibuat; keamanan tetap dari hash Argon2id dan batas 5 percobaan per 15 menit per nomor HP dan per IP. **ID peserta tidak ditampilkan kepada responden** (halaman simpan kode, sambutan, dashboard, profil, selesai hanya memakai nama); ID tetap dibuat dan dipakai admin, ekspor, serta analisis. Pencocokan dengan pretest/posttest dilakukan peneliti lewat data di panel admin.

## 1. Ringkasan Produk

DASH Sehat v2.0 adalah platform edukasi diet DASH berbasis web dengan akun berbasis nomor HP dan token akses, pembelajaran berurutan yang dikunci per kuis, panel konten untuk admin, dan dashboard pemantauan progres responden.

Responden mempelajari modul yang berisi beberapa materi. Setiap materi ditutup dengan kuis tentang isi materi tersebut. Materi berikutnya baru terbuka setelah kuis materi sebelumnya diselesaikan. Seluruh modul, materi, dan kuis dibuat serta dikelola oleh admin melalui panel admin, tanpa perlu mengubah kode.

Produk ini tetap berfokus pada edukasi mandiri. Produk bukan layanan konsultasi medis, diagnosis, atau telemedicine klinis.

### Tujuan produk

1. Meningkatkan pengetahuan responden tentang diet DASH.
2. Mendukung terbentuknya sikap positif terhadap penerapan diet DASH.
3. Menjamin setiap responden menempuh urutan materi yang sama dan menyelesaikan kuis tiap materi.
4. Memudahkan peneliti memantau progres seluruh responden maupun per responden secara akurat.
5. Menyediakan media edukasi yang dapat diuji keterbacaan, kemudahan penggunaan, dan kelayakan isinya.

### Perubahan dari versi 1.0

| Aspek | Versi 1.0 | Versi 2.0 |
|---|---|---|
| Akun | Opsional, berbasis kode peserta | Wajib untuk responden; daftar mandiri dengan nama dan nomor HP; token akses dan ID peserta dibuat otomatis oleh sistem |
| Struktur konten | 6 modul, kuis hanya di modul terakhir | Modul berisi beberapa materi; tiap materi diakhiri kuis |
| Alur belajar | Bebas, tidak dikunci | Berurutan; materi berikutnya terkunci sampai kuis selesai |
| Pembuatan konten | Tidak ditentukan | Seluruh modul, materi, dan kuis dibuat admin lewat panel konten |
| Pemantauan | Dashboard admin opsional | Dashboard admin wajib: progres keseluruhan dan per responden |
| Versi konten | Dicatat secara umum | Versi konten dibekukan selama penelitian dan tercatat pada setiap progres |

## 2. Permasalahan dan Prinsip Desain

Orang dewasa dengan hipertensi sering kesulitan memahami pola makan sehat karena istilah medis yang rumit, informasi yang tersebar, minimnya contoh menu lokal, dan pengalaman teknologi yang terbatas. Di sisi penelitian, peneliti membutuhkan bukti bahwa setiap responden benar-benar menempuh seluruh materi dengan urutan yang sama.

DASH Sehat v2.0 menjawab dua kebutuhan itu sekaligus: materi sederhana untuk responden, dan alur yang terkendali serta tercatat untuk peneliti.

**Prinsip desain**

- **Sederhana:** sedikit langkah untuk mulai belajar; satu layar, satu tugas utama.
- **Terarah:** responden selalu tahu materi mana yang sedang dipelajari dan apa langkah berikutnya.
- **Edukatif:** setiap materi punya tujuan pembelajaran dan kuis yang menguji tujuan itu.
- **Inklusif:** cocok untuk tingkat pendidikan dan literasi digital yang beragam.
- **Responsif:** nyaman di ponsel, tablet, dan komputer (mobile-first).
- **Aman:** hanya mengumpulkan data yang benar-benar diperlukan penelitian.
- **Konsisten:** seluruh responden menerima materi, urutan, dan versi konten yang sama.
- **Tidak menghukum:** kuis berfungsi sebagai latihan; kesalahan dijelaskan, bukan disalahkan.

## 3. Pengguna dan Peran

Sistem memiliki tiga peran dengan hak akses yang dipisahkan secara tegas. Satu akun hanya memiliki satu peran.

| Peran | Siapa | Hak akses utama | Tidak boleh |
|---|---|---|---|
| Responden | Dewasa dengan hipertensi yang memenuhi kriteria inklusi | Mendaftar, belajar materi, mengerjakan kuis, melihat progres sendiri | Melihat data responden lain; mengakses panel admin |
| Admin | Peneliti atau asisten peneliti | Membuat dan mengedit modul, materi, kuis (selama status draf); melihat dashboard progres; mengelola akun responden dan status sampel; mengekspor data | Mengubah konten yang sudah dikunci untuk penelitian; mengubah jawaban kuis responden; melihat token responden |
| Super admin | Peneliti utama | Semua hak admin; menambah atau menonaktifkan admin; mengunci dan membuka versi konten; melihat log aktivitas admin | Menghapus log aktivitas |

### Matriks fitur per role

Matriks ini adalah acuan utama hak akses saat implementasi.

| Area | Fitur | Responden | Admin | Super admin | Bagian |
|---|---|---|---|---|---|
| Akun | Daftar sendiri dengan nama dan nomor HP | Ya | Tidak | Tidak | 7.1 |
| Akun | Masuk dengan nomor HP dan token | Ya | Tidak | Tidak | 7.3 |
| Akun | Masuk dengan email, kata sandi, dan 2FA | Tidak | Ya | Ya | 7.8 |
| Akun | Ganti token dan nomor HP sendiri | Ya | Tidak | Tidak | 7.5 |
| Akun | Reset token responden | Tidak | Ya | Ya | 7.4 |
| Akun | Undang dan nonaktifkan admin | Tidak | Tidak | Ya | 7.8 |
| Belajar | Membaca materi dan mengerjakan kuis | Ya | Pratinjau saja | Pratinjau saja | 6, 9 |
| Belajar | Melihat progres sendiri | Ya | Tidak | Tidak | 9 |
| Konten | Membuat dan mengedit modul, materi, kuis berstatus draf | Tidak | Ya | Ya | 10.1–10.3 |
| Konten | Menandai konten siap ditinjau | Tidak | Ya | Ya | 10.5 |
| Konten | Menerbitkan konten | Tidak | Tidak | Ya | 10.5 |
| Konten | Mengunci versi konten dan memperbaiki konten yang sudah dikunci | Tidak | Tidak | Ya | 10.5 |
| Responden | Melihat daftar akun responden | Tidak | Ya | Ya | 10.6 |
| Responden | Mengubah status sampel | Tidak | Ya | Ya | 10.6 |
| Responden | Membuka atau menutup pendaftaran | Tidak | Ya | Ya | 10.6 |
| Responden | Menonaktifkan akun responden | Tidak | Ya | Ya | 10.6 |
| Responden | Membuka kunci materi secara manual (wajib alasan) | Tidak | Ya | Ya | 6 |
| Monitoring | Dashboard progres keseluruhan | Tidak | Ya | Ya | 11.1 |
| Monitoring | Detail progres per responden | Tidak | Ya | Ya | 11.2 |
| Monitoring | Melihat nomor HP lengkap (tercatat di log) | Tidak | Ya | Ya | 11.2 |
| Monitoring | Ekspor data | Tidak | Ya | Ya | 11.3 |
| Monitoring | Melihat log aktivitas admin | Tidak | Tidak | Ya | 10.7 |

### Area aplikasi per role

Pemeriksaan role dilakukan di server untuk setiap permintaan; menyembunyikan tombol di tampilan saja tidak cukup.

| Area | Contoh route | Akses | Aturan |
|---|---|---|---|
| Publik | `/`, `/tentang`, `/privasi`, `/sumber`, `/daftar`, `/masuk`, `/lupa-token` | Semua orang | Responden yang sudah masuk dialihkan dari `/daftar` dan `/masuk` ke `/belajar` |
| Responden | `/belajar`, `/belajar/modul/:id`, `/belajar/materi/:id`, `/belajar/materi/:id/kuis`, `/profil` | Responden yang masuk dan aktif | Penguncian materi diperiksa di server (Bagian 6) |
| Admin | `/admin/masuk`, `/admin/dashboard`, `/admin/konten`, `/admin/responden`, `/admin/responden/:id`, `/admin/ekspor` | Admin dan super admin setelah 2FA | Responden yang membuka `/admin` mendapat halaman 404 |
| Super admin | `/admin/admins`, `/admin/versi`, `/admin/log` | Super admin saja | Admin biasa mendapat halaman 403 |

### Karakteristik responden yang perlu dipertimbangkan

- Tingkat pendidikan dan kemampuan menggunakan ponsel beragam.
- Tidak semua memahami istilah nutrisi atau medis.
- Sebagian tidak memiliki atau jarang membuka email, dan kesulitan mengingat kata sandi buatan sendiri.
- Membutuhkan contoh makanan yang mudah ditemukan di Indonesia.
- Membutuhkan navigasi yang dapat dipahami tanpa pelatihan panjang.

Karena itu akun responden memakai nomor HP dan token yang dibuat sistem, dan peneliti menyediakan pendampingan saat registrasi pertama (lihat Bagian 7).

## 4. Ruang Lingkup

### Fitur wajib (MVP)

**Sisi responden**

1. Beranda publik dan halaman pengenalan diet DASH (dapat dibuka tanpa login).
2. Registrasi mandiri dengan nama, nomor HP, dan persetujuan penelitian; token akses dan ID peserta dibuat otomatis.
3. Masuk dengan nomor HP dan token, keluar akun, ganti token, dan reset token oleh admin.
4. Dashboard belajar responden.
5. Daftar modul dan daftar materi per modul dengan status terkunci, tersedia, atau selesai.
6. Halaman materi dengan teks, gambar, dan contoh penerapan.
7. Kuis di akhir setiap materi dengan umpan balik per soal.
8. Penguncian berurutan: materi berikutnya terbuka hanya setelah kuis materi sebelumnya selesai.
9. Penyimpanan progres otomatis, termasuk melanjutkan dari posisi terakhir.
10. Halaman Tentang, privasi, sumber materi, dan batasan edukasi.

**Sisi admin**

11. Login admin terpisah dengan autentikasi dua faktor.
12. Pengelolaan modul, materi, dan kuis (buat, edit, urutkan, pratinjau, terbitkan).
13. Pengelolaan akun responden, termasuk status sampel dan buka/tutup pendaftaran.
14. Dashboard progres keseluruhan.
15. Halaman detail progres per responden.
16. Ekspor data progres dan jawaban kuis (CSV/Excel).
17. Penguncian versi konten untuk masa penelitian.
18. Log aktivitas admin.

### Fitur opsional (fase berikutnya)

- Verifikasi nomor HP dan pemulihan token mandiri lewat OTP WhatsApp/SMS (lihat 7.9).
- Pengingat belajar lewat WhatsApp/SMS untuk responden yang belum aktif beberapa hari.
- Mode audio (teks dibacakan) untuk responden dengan keterbatasan membaca.
- Sertifikat atau lencana penyelesaian.
- Bank soal dengan pengacakan urutan soal dan pilihan jawaban.

### Di luar ruang lingkup

- Diagnosis hipertensi.
- Rekomendasi atau perubahan dosis obat.
- Konsultasi dokter melalui video atau chat.
- Rencana diet klinis yang dipersonalisasi.
- Integrasi rekam medis.
- Pengambilan keputusan medis otomatis.
- Pretest dan posttest penelitian (dikelola lewat sistem penelitian terpisah; lihat Bagian 17).
- Penyimpanan data kesehatan yang tidak dibutuhkan penelitian, termasuk angka tekanan darah.

## 5. Struktur Konten: Modul → Materi → Kuis

Konten tersusun dalam tiga tingkat: satu modul berisi beberapa materi, dan satu materi selalu diakhiri tepat satu kuis. Semua tingkat dibuat oleh admin; tidak ada konten yang ditanam langsung di kode.

| Tingkat | Isi wajib | Aturan |
|---|---|---|
| Modul | Judul, deskripsi satu kalimat, ilustrasi sampul, nomor urut, tujuan modul | Minimal 1 materi; disarankan 2–5 materi per modul |
| Materi | Judul, tujuan pembelajaran, estimasi waktu baca, isi (teks pendek, gambar, contoh penerapan), kotak Poin Penting, rangkuman, nomor urut dalam modul | Wajib memiliki satu kuis berstatus terbit sebelum materi dapat diterbitkan |
| Kuis | Judul, petunjuk, batas lulus, daftar soal | Minimal 3 soal; disarankan 3–5 soal; soal hanya menguji isi materi tersebut |
| Soal | Teks pertanyaan, gambar opsional, 3–4 pilihan jawaban, satu kunci jawaban, penjelasan jawaban benar | Penjelasan wajib diisi agar umpan balik selalu tersedia |

**Contoh struktur**

```
Modul 2 — Mengenal Diet DASH
  Materi 2.1 Apa itu diet DASH? → Kuis 2.1 (3 soal)
  Materi 2.2 Prinsip pola makan DASH → Kuis 2.2 (4 soal)
  Materi 2.3 Bagaimana DASH membantu tekanan darah → Kuis 2.3 (3 soal)
```

Penomoran materi (2.1, 2.2, …) dibuat otomatis dari urutan yang ditetapkan admin, sehingga responden dan peneliti memakai rujukan yang sama.

**Kuis per materi vs. instrumen penelitian.** Kuis per materi adalah latihan pembelajaran dan syarat membuka materi berikutnya. Kuis ini bukan pengganti pretest dan posttest. Soal kuis tidak boleh sama dengan butir instrumen pretest/posttest agar tidak terjadi kebocoran kunci jawaban.

## 6. Aturan Progres Berurutan

Materi berikutnya hanya terbuka setelah kuis materi sebelumnya berstatus selesai. Aturan ini berlaku lintas modul: materi pertama Modul 3 terbuka setelah kuis materi terakhir Modul 2 selesai.

Pada Mode A kuis selalu selesai begitu dikirim, sehingga jalur "belum lulus" hanya berlaku bila peneliti memilih Mode B.

### Status materi

| Status | Arti | Tampilan bagi responden |
|---|---|---|
| Terkunci | Kuis materi sebelumnya belum selesai | Ikon gembok, kartu abu-abu, teks "Selesaikan kuis Materi X dulu" |
| Tersedia | Boleh dibuka, belum mulai dibaca | Tombol "Mulai Materi" |
| Sedang dipelajari | Materi sudah dibuka, kuis belum selesai | Tombol "Lanjutkan" dan label "Kuis belum selesai" |
| Selesai | Kuis sudah selesai sesuai aturan kuis | Tanda centang dan tombol "Baca Lagi" |

Status tidak hanya dibedakan dengan warna; setiap status selalu disertai ikon dan teks.

### Kapan kuis dianggap selesai

Admin memilih satu dari dua mode untuk setiap kuis. Mode yang dipakai harus sama untuk semua kuis selama penelitian.

- **Mode A — Selesai saat dikirim (disarankan):** kuis selesai ketika semua soal dijawab dan dikirim, berapa pun nilainya. Mode ini menjaga kuis tetap sebagai latihan dan tidak menghambat responden dengan literasi rendah.
- **Mode B — Selesai saat lulus:** kuis selesai jika nilai mencapai batas lulus yang ditetapkan admin (misalnya 70%). Jika belum lulus, responden diarahkan membaca ulang materi lalu mengulang kuis.

Pada kedua mode, jumlah percobaan tidak dibatasi dan semua percobaan tercatat. Nilai percobaan pertama disimpan terpisah karena paling mencerminkan pemahaman awal.

### Aturan rinci

1. Tombol "Kerjakan Kuis" muncul di akhir halaman materi.
2. Soal ditampilkan satu per satu. Setelah menekan "Periksa Jawaban", responden melihat apakah jawabannya benar beserta penjelasan singkat.
3. Jawaban tersimpan otomatis per soal. Jika koneksi terputus atau halaman ditutup, responden melanjutkan dari soal terakhir.
4. Setelah soal terakhir, sistem menampilkan ringkasan hasil, lalu tombol "Lanjut ke Materi Berikutnya" (jika selesai) atau "Baca Ulang Materi" (Mode B, belum lulus).
5. Materi yang sudah selesai dapat dibaca ulang kapan saja. Mengulang kuis yang sudah selesai diperbolehkan sebagai latihan, tercatat sebagai percobaan tambahan, dan tidak mengubah status selesai.
6. Penguncian diperiksa di server, bukan hanya disembunyikan di tampilan. Membuka alamat materi terkunci secara langsung akan dialihkan ke materi aktif dengan pesan yang ramah.
7. Jika admin membuka kunci secara manual untuk seorang responden (misalnya karena kendala teknis), tindakan itu wajib disertai alasan dan tercatat di log aktivitas admin.

## 7. Sistem Akun: Nomor HP dan Token Akses

Responden mendaftar sendiri hanya dengan nama dan nomor HP, lalu sistem membuat token akses untuk masuk. Tidak ada email, kata sandi buatan sendiri, maupun kode dari admin. Verifikasi nomor lewat OTP WhatsApp/SMS dijadwalkan untuk fase berikutnya (7.9).

### 7.1 Registrasi responden

Siapa pun yang memegang tautan website dapat mendaftar dari tombol "Daftar". Peneliti cukup membagikan tautan.

| Kolom | Wajib | Aturan |
|---|---|---|
| Nama | Ya | 2–50 karakter; boleh nama panggilan; dipakai untuk sapaan dan pencocokan identitas saat reset token |
| Nomor HP | Ya | Nomor Indonesia aktif; diterima dalam format 08…, 628…, atau +628…; disimpan seragam sebagai +628…; satu nomor untuk satu akun |
| Pernyataan kelayakan | Sesuai protokol | Centang "Saya berusia 18 tahun ke atas dan pernah didiagnosis hipertensi" |
| Persetujuan | Ya | Centang "Saya telah membaca dan menyetujui informasi penelitian dan kebijakan privasi", dengan tautan ke dokumen lengkap |

Sebelum dikirim, sistem menampilkan konfirmasi "Pastikan nomor ini benar: 0812-3456-7890" untuk mencegah salah ketik. Formulir tidak meminta email, NIK, alamat, tanggal lahir, nomor rekam medis, atau data tekanan darah.

### 7.2 Token akses dan ID peserta

1. Setelah formulir dikirim, sistem membuat dua hal: ID peserta (misalnya `DS-4827`) dan token akses (misalnya `K7M4-PX9Q`).
2. Token terdiri atas 8 huruf kapital dan angka, ditampilkan dengan tanda hubung di tengah, tanpa karakter yang mudah tertukar (0/O, 1/I/L, 5/S). Saat masuk, huruf kecil, spasi, dan tanda hubung diabaikan.
3. Halaman "Simpan Token Anda" menampilkan nomor HP, ID peserta, dan token dalam huruf besar, dengan tombol "Salin" dan "Simpan sebagai Gambar" serta anjuran mencatat token di buku atau memotretnya.
4. Responden wajib mencentang "Saya sudah menyimpan token saya" sebelum lanjut.
5. Token hanya ditampilkan sekali. Sistem menyimpannya dalam bentuk hash (Argon2id), sehingga admin pun tidak dapat melihatnya.
6. ID peserta berformat `DS-` + 4 angka acak, tidak pernah berubah, tampil di Profil, dan dicantumkan saat pretest dan posttest. ID peserta bukan rahasia; token adalah rahasia.

### 7.3 Masuk dan sesi

- Masuk dengan nomor HP dan token.
- Pilihan "Ingat saya di perangkat ini" tercentang secara bawaan dan menjaga sesi hingga 30 hari sejak terakhir aktif, sehingga token jarang perlu diketik ulang. Halaman masuk menyarankan menghapus centang bila HP dipakai bersama.
- Sesi disimpan dalam cookie `HttpOnly`, `Secure`, `SameSite=Lax`; token tidak disimpan di localStorage.
- Setelah 5 kali gagal dalam 15 menit untuk satu nomor HP, percobaan berikutnya ditunda 15 menit. Batas serupa berlaku per alamat IP.
- Tombol "Keluar" selalu tersedia di menu akun.

### 7.4 Token hilang atau lupa

1. Halaman "Lupa Token" menjelaskan bahwa token baru dibuat oleh peneliti, dengan tombol "Hubungi Peneliti" yang membuka WhatsApp nomor resmi penelitian.
2. Peneliti mencocokkan identitas dengan menghubungi balik nomor HP yang terdaftar, lalu menanyakan nama dan ID peserta jika diingat.
3. Admin menekan "Buat Token Baru" di halaman detail responden. Token lama langsung tidak berlaku dan semua sesi responden keluar.
4. Token baru disampaikan langsung ke nomor terdaftar. Responden disarankan menggantinya sendiri dari Profil setelah masuk.
5. Tindakan ini tercatat di log aktivitas admin beserta alasannya. Progres belajar tidak hilang.

### 7.5 Ganti token dan nomor HP

- Responden yang sedang masuk dapat membuat token baru dari Profil dengan mengetik token lama. Token baru tampil sekali di halaman "Simpan Token Anda".
- Mengganti nomor HP memerlukan token saat ini, dan nomor baru tidak boleh sudah terdaftar. ID peserta dan progres tidak berubah; perubahan tercatat di riwayat akun.

### 7.6 Batasan yang disadari pada fase ini

- Nomor HP belum diverifikasi, sehingga salah ketik atau pemakaian nomor orang lain masih mungkin. Mitigasinya: konfirmasi nomor saat daftar, satu nomor untuk satu akun, dan pengecekan oleh peneliti saat skrining.
- Pemulihan token bergantung pada peneliti, sehingga peneliti perlu menyiapkan nomor WhatsApp resmi dan jam layanan.
- Kedua batasan ini ditutup oleh OTP pada fase berikutnya (7.9).

### 7.7 Pesan kesalahan yang mudah dipahami

| Situasi | Pesan |
|---|---|
| Nama kosong | "Silakan isi nama Anda. Nama panggilan juga boleh." |
| Nomor HP tidak valid | "Nomor HP belum sesuai. Contoh yang benar: 081234567890." |
| Nomor HP sudah terdaftar | "Nomor ini sudah punya akun. Silakan masuk. Jika Anda belum pernah mendaftar, hubungi peneliti." |
| Belum mencentang simpan token | "Simpan token Anda dulu. Token ini dibutuhkan saat masuk lagi." |
| Nomor atau token salah | "Nomor HP atau token belum cocok. Periksa kembali token yang Anda simpan." |
| Terlalu banyak percobaan | "Terlalu banyak percobaan. Coba lagi dalam 15 menit atau hubungi peneliti." |
| Pendaftaran ditutup | "Pendaftaran sudah ditutup. Hubungi peneliti jika Anda merasa ini keliru." |

### 7.8 Akun admin

- Admin tetap memakai email dan kata sandi, karena jumlahnya sedikit dan membutuhkan keamanan lebih tinggi.
- Admin tidak bisa mendaftar sendiri; akun dibuat super admin melalui email undangan yang berlaku 48 jam.
- Autentikasi dua faktor (aplikasi autentikator/TOTP) wajib untuk admin dan super admin.
- Kata sandi admin minimal 12 karakter dan disimpan dengan Argon2id.
- Sesi admin berakhir setelah 30 menit tidak aktif; halaman masuk admin terpisah dari halaman masuk responden.

### 7.9 Fase berikutnya: OTP WhatsApp/SMS

- Verifikasi nomor HP saat daftar dengan kode 6 angka yang berlaku 5 menit.
- Pemulihan token mandiri: "Lupa Token" mengirim OTP ke nomor terdaftar, lalu sistem membuat token baru tanpa melibatkan peneliti.
- Opsional: masuk langsung dengan OTP tanpa token.
- Membutuhkan layanan WhatsApp Business API atau gateway SMS, dengan biaya per pesan yang perlu masuk anggaran.
- Model data sudah menyiapkan kolom `nomor_terverifikasi_pada`, sehingga fitur ini dapat ditambahkan tanpa mengubah akun yang sudah ada.

### 7.10 Pendampingan dan pengunduran diri

- Peneliti mendampingi registrasi pertama bagi responden yang membutuhkan, termasuk membantu memastikan token tersimpan, misalnya ditulis di kartu kecil. Peneliti tidak menyimpan salinan token responden.
- Responden dapat mengajukan pengunduran diri lewat menu akun atau kontak peneliti. Akun dinonaktifkan, dan data ditangani sesuai protokol etik (lihat Bagian 16).

## 8. Alur Pengguna Responden

Responden menempuh satu jalur tetap dari pendaftaran sampai materi terakhir, dengan progres tersimpan di setiap langkah.

**Pertama kali**

1. Peneliti membagikan tautan website kepada calon responden yang lolos skrining.
2. Responden membuka beranda dan menekan "Daftar".
3. Responden mengisi nama dan nomor HP, lalu menyetujui informasi penelitian.
4. Sistem menampilkan token akses dan ID peserta. Responden menyimpan token lalu mencentang "Saya sudah menyimpan token saya".
5. Sistem menampilkan halaman sambutan singkat (maks. 3 layar) berisi ID peserta, petunjuk mengikuti pretest sesuai jadwal peneliti, cara belajar, dan arti ikon gembok.
6. Responden masuk ke dashboard dan menekan "Mulai Belajar", yang langsung membuka Materi 1.1.

**Siklus belajar setiap materi**

1. Responden membaca materi sampai akhir.
2. Responden menekan "Kerjakan Kuis".
3. Responden menjawab soal satu per satu dan membaca umpan balik setiap soal.
4. Sistem menampilkan ringkasan hasil kuis.
5. Jika kuis selesai, materi berikutnya terbuka dan responden menekan "Lanjut ke Materi Berikutnya". Jika belum (Mode B), responden membaca ulang materi lalu mengulang kuis.

**Kunjungan berikutnya**

1. Di perangkat yang sama, responden langsung masuk karena sesi masih tersimpan. Di perangkat lain, responden masuk dengan nomor HP dan token.
2. Dashboard menampilkan tombol "Lanjutkan Belajar" yang membuka posisi terakhir: materi yang sedang dibaca atau soal kuis yang belum dijawab.

**Selesai**

1. Setelah kuis materi terakhir selesai, sistem menampilkan halaman ucapan selamat, rangkuman prinsip DASH, dan ajakan menerapkan kebiasaan makan sehat.
2. Halaman itu mengingatkan responden untuk mengikuti posttest sesuai jadwal dari peneliti. Posttest tidak dikerjakan di dalam website ini.

## 9. Halaman Sisi Responden

Sisi responden terdiri atas halaman publik (tanpa login) dan halaman belajar (setelah login).

### Halaman publik

| Halaman | Elemen utama |
|---|---|
| Beranda | Logo DASH Sehat; judul "Mulai Kenali Diet DASH untuk Tekanan Darah yang Lebih Terkontrol"; deskripsi singkat; tombol "Masuk" dan "Daftar"; ringkasan manfaat; pratinjau judul modul; footer berisi privasi, sumber, dan kontak |
| Pengenalan DASH | Penjelasan singkat diet DASH sebagai gambaran sebelum mendaftar |
| Tentang | Tujuan edukasi, identitas institusi/tim peneliti (jika disetujui), pernyataan bukan pengganti konsultasi medis, kontak resmi |
| Privasi | Data yang dikumpulkan, tujuan, lama penyimpanan, siapa yang mengakses, cara mundur |
| Sumber Materi | Daftar pustaka dan pedoman yang menjadi dasar konten |
| Masuk, Daftar, Simpan Token, Lupa Token | Sesuai Bagian 7 |

### Dashboard belajar

- Sapaan dengan nama responden.
- Tombol besar "Lanjutkan Belajar" ke posisi terakhir.
- Indikator progres sederhana, misalnya "7 dari 18 materi selesai", disertai batang progres.
- Daftar modul dengan jumlah materi selesai per modul.
- Tautan ke Profil, Bantuan, Privasi, dan Keluar.

Dashboard tidak menampilkan grafik kesehatan, peringkat antar-responden, atau notifikasi yang tidak terkait belajar. Progres tidak dibahasakan sebagai keberhasilan klinis atau penurunan tekanan darah.

### Halaman modul

Judul modul, tujuan modul, dan daftar materi berurutan. Setiap materi tampil sebagai kartu dengan nomor, judul, estimasi waktu baca, dan status (terkunci, tersedia, sedang dipelajari, selesai).

### Halaman materi

Urutan isi tetap: judul dan nomor materi, tujuan pembelajaran, estimasi waktu baca, isi dalam paragraf pendek, gambar atau ilustrasi, contoh penerapan sehari-hari, kotak Poin Penting, rangkuman, lalu tombol "Kerjakan Kuis". Navigasi atas berisi tautan kembali ke modul dan penanda posisi (misalnya "Materi 2 dari 3"). Tidak ada tombol "Materi Berikutnya" sebelum kuis selesai.

### Halaman kuis

- Penanda posisi soal, misalnya "Soal 2 dari 4".
- Pilihan jawaban berupa tombol besar (tinggi minimal 48 piksel).
- Tombol "Periksa Jawaban" aktif setelah memilih jawaban.
- Umpan balik: benar atau belum tepat, jawaban yang benar, dan penjelasan singkat. Tidak memakai bahasa yang menyalahkan.
- Ringkasan akhir: jumlah benar, daftar soal dengan penjelasannya, dan tombol lanjutan sesuai Bagian 6.

### Profil

Menampilkan nama, nomor HP (tersamarkan), dan ID peserta. Responden dapat mengubah nama, membuat token baru, mengganti nomor HP, dan mengajukan pengunduran diri.

## 10. Panel Admin: Manajemen Konten

Admin membuat seluruh modul, materi, dan kuis lewat panel ini tanpa menyentuh kode, lalu super admin mengunci satu versi konten untuk dipakai selama penelitian.

### 10.1 Manajemen modul

- Buat, edit, arsipkan modul (tidak ada hapus permanen jika sudah ada data progres).
- Isi: judul, deskripsi satu kalimat, tujuan modul, ilustrasi sampul.
- Ubah urutan modul dengan seret-lepas atau tombol naik/turun.

### 10.2 Manajemen materi

- Buat materi di dalam modul tertentu; ubah urutan materi dalam modul.
- Editor teks sederhana: judul bagian, paragraf, tebal, daftar, kotak Poin Penting, kotak contoh penerapan, dan sisipan gambar.
- Unggah gambar JPG/PNG/WebP maks. 2 MB; sistem mengecilkan ukuran otomatis. Teks alternatif wajib diisi sebelum gambar bisa disimpan.
- Estimasi waktu baca dihitung otomatis dari jumlah kata (sekitar 150 kata per menit untuk pembaca awam) dan dapat disesuaikan admin.
- Kolom sumber/rujukan per materi.

### 10.3 Pembuat kuis

- Setiap materi memiliki tepat satu kuis.
- Pengaturan kuis: petunjuk, mode penyelesaian (A atau B), batas lulus untuk Mode B.
- Pengaturan soal: teks soal, gambar opsional, 3–4 pilihan jawaban, satu kunci, penjelasan wajib.
- Ubah urutan soal; duplikasi soal.

### 10.4 Pratinjau dan validasi

Tombol "Pratinjau sebagai Responden" menampilkan materi dan kuis persis seperti di ponsel dan komputer. Sebelum diterbitkan, sistem memeriksa:

- Setiap materi punya isi, tujuan pembelajaran, dan rangkuman.
- Setiap materi punya kuis dengan minimal 3 soal.
- Setiap soal punya kunci jawaban dan penjelasan.
- Setiap gambar punya teks alternatif.

### 10.5 Siklus status konten

| Status | Siapa yang mengubah | Arti |
|---|---|---|
| Draf | Admin | Sedang disusun; tidak terlihat responden |
| Siap ditinjau | Admin | Lolos validasi; menunggu validasi ahli |
| Terbit | Super admin | Terlihat responden (untuk uji coba atau penelitian) |
| Dikunci | Super admin | Versi konten dibekukan untuk penelitian; tidak dapat diedit |

Saat konten dikunci, sistem menyimpan versi (misalnya `v1.0`) dan setiap catatan progres menyimpan versi yang dipakai. Perbaikan mendesak setelah dikunci (misalnya salah ketik) hanya bisa dilakukan super admin, wajib disertai alasan, menghasilkan versi baru (misalnya `v1.0.1`), dan tercatat di log aktivitas.

### 10.6 Manajemen akun responden

- Melihat daftar akun responden beserta ID peserta, nomor HP tersamarkan, dan status sampel.
- Menandai akun sebagai "Responden penelitian" atau "Bukan sampel"; setiap perubahan tercatat di log.
- Membuka atau menutup pendaftaran baru, misalnya setelah target sampel terpenuhi.
- Menonaktifkan akun jika responden mengundurkan diri atau tidak memenuhi kriteria.
- Admin tidak membuat akun responden dan tidak dapat melihat token; seluruh pendaftaran dilakukan responden sendiri.

### 10.7 Log aktivitas admin

Semua tindakan admin dicatat: membuat, mengubah, menerbitkan, mengunci konten; membuka kunci materi dan membuat token baru untuk responden; mengekspor data; mengubah status sampel, membuka atau menutup pendaftaran, dan mengelola akun admin. Log berisi waktu, nama admin, tindakan, dan objek; log tidak dapat dihapus.

## 11. Dashboard Admin: Monitoring Progres

Dashboard admin menjawab dua pertanyaan peneliti: sejauh mana seluruh responden sudah belajar, dan di mana posisi tiap responden. Data diperbarui setiap kali responden menyelesaikan aksi, dan semua tampilan memakai ID peserta sebagai identitas utama.

### 11.1 Progres keseluruhan

**Kartu ringkasan (bagian atas)**

| Kartu | Isi |
|---|---|
| Pendaftaran | Total akun terdaftar, pendaftar baru 7 hari terakhir; status pendaftaran (dibuka atau ditutup) |
| Sampel | Jumlah responden penelitian dan akun bukan sampel |
| Status belajar | Belum mulai, sedang belajar, selesai semua materi |
| Tidak aktif | Responden yang belum masuk lagi lebih dari 7 hari (batas dapat diatur) |
| Rata-rata progres | Rata-rata persentase materi selesai |

- **Penyelesaian per materi:** grafik batang horizontal berisi persentase responden yang telah menyelesaikan setiap materi, berurutan dari Materi 1.1 sampai materi terakhir. Grafik ini menunjukkan di materi mana responden paling banyak berhenti.
- **Analisis kuis per materi:** tabel berisi rata-rata nilai percobaan pertama, rata-rata jumlah percobaan, dan persentase jawaban benar per soal. Soal dengan persentase benar sangat rendah ditandai untuk ditinjau, karena bisa jadi soalnya ambigu atau materinya kurang jelas.
- **Tabel responden:**
  - Kolom: ID peserta, nama, status akun, status sampel, materi saat ini, persentase progres, materi selesai, tanggal daftar, terakhir aktif.
  - Cari berdasarkan ID peserta, nama, atau nomor HP; saring berdasarkan status sampel, status belajar, status akun, modul saat ini, dan rentang tanggal.
  - Urutkan berdasarkan kolom apa pun; klik baris untuk membuka detail responden.

### 11.2 Progres per responden

- **Profil singkat:** ID peserta, nama, nomor HP (disamarkan, misalnya `0812****7890`; tampilan lengkap memerlukan klik dan tercatat di log), tanggal daftar, terakhir aktif, riwayat reset token, versi konten.
- **Garis waktu belajar:** satu baris per materi berisi status, waktu pertama dibuka, waktu kuis selesai, lama membaca, jumlah percobaan kuis, nilai percobaan pertama, dan nilai terbaik.
- **Detail kuis:** untuk setiap percobaan, tampilkan jawaban per soal, benar atau salah, dan waktu pengerjaan. Admin hanya dapat melihat; jawaban tidak dapat diubah.
- **Tindakan admin:**
  - Buat token baru setelah mencocokkan identitas (lihat 7.4); token lama langsung tidak berlaku.
  - Buka kunci materi secara manual (wajib alasan; tercatat di log).
  - Nonaktifkan akun (misalnya responden mengundurkan diri).

### 11.3 Ekspor data

- Format CSV dan Excel.
- Tiga jenis ekspor: ringkasan per responden; progres per responden per materi; jawaban kuis per soal per percobaan.
- Data ekspor memakai ID peserta dan secara bawaan hanya memuat akun berstatus responden penelitian. Nama dan nomor HP tidak disertakan secara bawaan.
- Nama file memuat versi konten dan tanggal ekspor, misalnya `progres_v1.0_2026-11-15.csv`.
- Setiap ekspor tercatat di log aktivitas.

### 11.4 Catatan penafsiran

Lama membaca dihitung hanya saat halaman materi aktif di layar, dan dihentikan setelah 5 menit tanpa interaksi. Angka ini adalah indikator keterlibatan, bukan ukuran pemahaman. Efektivitas edukasi tetap dinilai dari pretest dan posttest.

## 12. Model Data

Data identitas (nama, nomor HP) disimpan terpisah dari data belajar; keduanya hanya terhubung melalui ID internal, dan data belajar dianalisis memakai ID peserta.

| Entitas | Kolom utama | Catatan |
|---|---|---|
| respondents | id, nama, nomor_hp, token_hash, nomor_terverifikasi_pada, aktif, persetujuan_pada, dibuat_pada | nomor_hp unik dalam format +62; nomor_terverifikasi_pada kosong sampai fase OTP |
| participants | respondent_id, id_peserta, status_sampel | id_peserta unik (misalnya DS-4827); status_sampel: responden_penelitian atau bukan_sampel |
| token_events | id, respondent_id, jenis, oleh, alasan, waktu | Jenis: dibuat, diganti_responden, direset_admin |
| admins | id, email, password_hash, totp_secret, peran, aktif | Peran: admin atau super_admin |
| admin_invites | id, email, token_hash, kedaluwarsa_pada, dipakai_pada | Undangan berlaku 48 jam |
| sessions | id, pemilik_id, jenis_pemilik, dibuat_pada, terakhir_aktif, kedaluwarsa_pada | Semua sesi responden dihapus saat token diganti |
| app_settings | pendaftaran_dibuka, batas_tidak_aktif_hari, versi_aktif | Diatur admin |
| content_versions | id, label, status, dikunci_oleh, dikunci_pada | Misalnya v1.0 |
| modules | id, version_id, urutan, judul, deskripsi, tujuan, gambar | — |
| materials | id, module_id, urutan, judul, tujuan, isi, rangkuman, estimasi_menit, sumber | — |
| quizzes | id, material_id, petunjuk, mode, batas_lulus | Satu kuis per materi |
| questions | id, quiz_id, urutan, teks, gambar, penjelasan | — |
| options | id, question_id, teks, benar | Satu pilihan benar per soal |
| material_progress | respondent_id, material_id, version_id, status, dibuka_pada, selesai_pada, detik_baca | Status sesuai Bagian 6 |
| quiz_attempts | id, respondent_id, quiz_id, percobaan_ke, mulai_pada, selesai_pada, skor, lulus | Percobaan pertama ditandai |
| attempt_answers | attempt_id, question_id, option_id, benar, dijawab_pada | Tidak dapat diubah setelah dikirim |
| admin_audit_log | id, admin_id, tindakan, objek, alasan, waktu | Hanya tambah, tidak dapat dihapus |

Materi dan soal yang sudah dikunci tidak pernah ditimpa; perubahan selalu menjadi versi baru agar jawaban lama tetap merujuk ke soal yang benar-benar dilihat responden.

## 13. Standar Konten Edukasi

Konten disusun berdasarkan pedoman diet DASH dan literatur ilmiah yang telah ditelaah, lalu divalidasi ahli sebelum dikunci. Rancangan di bawah adalah usulan awal materi yang akan diinput admin; jumlah akhir mengikuti hasil validasi.

> Catatan transkripsi: teks PDF menyebut "18 materi", tetapi tabel di bawah berisi 20 materi (3 + 3 + 5 + 4 + 3 + 2). Konten benih mengikuti tabel.

| Modul | Materi usulan |
|---|---|
| 1. Mengenal Hipertensi | 1.1 Apa itu hipertensi · 1.2 Faktor risiko · 1.3 Komplikasi dan pentingnya pengendalian tekanan darah |
| 2. Mengenal Diet DASH | 2.1 Apa itu diet DASH · 2.2 Prinsip pola makan DASH · 2.3 Hubungan DASH dengan tekanan darah |
| 3. Mengenal Makanan dan Porsi | 3.1 Sayur dan buah · 3.2 Biji-bijian utuh dan sumber protein · 3.3 Susu rendah lemak sesuai kebutuhan · 3.4 Natrium dan lemak jenuh · 3.5 Contoh porsi harian |
| 4. Diet DASH pada Menu Indonesia | 4.1 Contoh sarapan, makan siang, makan malam · 4.2 Mengurangi garam dan bumbu tinggi natrium · 4.3 Membaca label pangan · 4.4 Makan di luar rumah |
| 5. Memulai Kebiasaan Makan Sehat | 5.1 Perubahan bertahap dan target realistis · 5.2 Mengatasi hambatan biaya dan waktu · 5.3 Dukungan keluarga |
| 6. Rangkuman dan Rencana Saya | 6.1 Rangkuman prinsip DASH · 6.2 Menyusun rencana makan sehat pribadi |

Karena setiap materi sudah memiliki kuis, Modul 6 tidak lagi berisi "kuis besar". Modul ini menjadi rangkuman dan ajakan penerapan, dengan kuis pendek di setiap materinya.

**Aturan isi**

- Tidak mengklaim diet DASH menyembuhkan hipertensi atau menggantikan obat.
- Menyertakan pengingat bahwa kebutuhan nutrisi dapat berbeda pada kondisi tertentu, misalnya penyakit ginjal atau diabetes, sehingga perlu konsultasi dengan tenaga kesehatan.
- Contoh makanan memakai bahan yang mudah ditemukan dan terjangkau di Indonesia, seperti tempe, tahu, ikan, bayam, kangkung, pepaya, dan pisang.
- Setiap materi mencantumkan sumber rujukannya.
- Soal kuis hanya menguji tujuan pembelajaran materi tersebut, tidak menjebak, dan memakai bahasa yang sama dengan materi.

## 14. Standar Bahasa dan Desain

Tampilan mengutamakan keterbacaan di ponsel bagi pembaca awam dengan literasi kesehatan dan digital yang beragam.

**Bahasa**

- Bahasa Indonesia sederhana dengan sapaan "Anda".
- Istilah teknis selalu dijelaskan saat pertama muncul, misalnya "natrium (zat dalam garam)".
- Paragraf pendek, satu gagasan per paragraf.
- Tidak menghakimi atau menakut-nakuti, termasuk pada umpan balik kuis ("Belum tepat" alih-alih "Salah!").
- Label tombol berupa kata kerja yang jelas: "Mulai Materi", "Kerjakan Kuis", "Periksa Jawaban".

**Visual**

- Warna utama hijau lembut dengan latar terang; kontras teks minimal 4,5:1.
- Ikon sederhana dan ilustrasi makanan yang relevan.
- Status (terkunci, selesai, benar, belum tepat) selalu memakai ikon dan teks, tidak hanya warna.
- Gaya visual konsisten di sisi responden; panel admin boleh lebih padat informasi.

**Tipografi dan sentuhan**

- Teks isi 18 piksel di ponsel, minimal 16 piksel di layar mana pun.
- Hierarki judul dan subjudul jelas; jarak antarbaris sekitar 1,5.
- Target sentuh minimal 48 × 48 piksel, termasuk pilihan jawaban kuis.

**Responsivitas**

- Mobile-first; diuji mulai lebar layar 360 piksel.
- Tidak ada scroll horizontal di sisi responden.
- Gambar dikompresi agar halaman materi tetap ringan pada koneksi terbatas.
- Dashboard admin dirancang untuk komputer, tetapi tetap dapat dibaca di tablet.

## 15. Persyaratan Nonfungsional

**Performa**

- Halaman materi tampil dalam 3 detik pada koneksi 4G biasa.
- Simpan jawaban kuis dan progres selesai dalam 1 detik; jika gagal, jawaban ditahan sementara di perangkat dan dikirim ulang otomatis saat koneksi kembali.
- Tidak ada animasi berat; dashboard admin tetap lancar untuk minimal 200 responden.

**Keamanan**

- HTTPS wajib di seluruh halaman.
- Token akses responden dan kata sandi admin di-hash dengan Argon2id; token undangan admin juga disimpan dalam bentuk hash.
- Pemeriksaan hak akses di server untuk setiap permintaan: responden hanya dapat mengakses datanya sendiri; materi terkunci tidak dapat dibuka lewat alamat langsung.
- Perlindungan CSRF, pembatasan jumlah percobaan di halaman masuk dan daftar, per nomor HP dan per alamat IP.
- Admin wajib autentikasi dua faktor.
- Nomor HP, token, dan data pribadi tidak muncul di URL atau log aplikasi.
- Basis data dicadangkan otomatis setiap hari dan dienkripsi; pemulihan cadangan diuji sebelum penelitian dimulai.

**Aksesibilitas**

- Mengacu pada WCAG 2.1 tingkat AA.
- Seluruh fungsi dapat dijalankan dengan keyboard; fokus terlihat jelas.
- Gambar informatif memiliki teks alternatif (diwajibkan di panel admin).
- Label formulir jelas; pesan kesalahan muncul di dekat kolom yang bermasalah dan menjelaskan cara memperbaikinya.
- Teks dapat diperbesar hingga 200% tanpa merusak tata letak.

**Kompatibilitas**

- Chrome Android, Safari iOS, Chrome dan Edge desktop versi dua tahun terakhir.
- Diuji pada ponsel Android kelas menengah ke bawah dengan RAM 3 GB, karena perangkat ini umum dipakai responden.

## 16. Privasi Data dan Etik Penelitian

Website hanya mengumpulkan data yang diperlukan untuk menjalankan akun dan memantau proses belajar, dan seluruh pengelolaannya mengikuti persetujuan komisi etik serta UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.

Perlu dicatat: terdaftarnya seseorang sebagai responden sudah mengungkap bahwa ia memiliki hipertensi. Karena itu, daftar nomor HP responden diperlakukan sebagai data sensitif walaupun website tidak menyimpan angka tekanan darah.

| Data | Tujuan | Akses | Lama simpan (usulan) |
|---|---|---|---|
| Nomor HP | Masuk, mencegah akun ganda, menghubungi responden saat reset token | Sistem; admin hanya tersamarkan kecuali dibuka dengan log | Dihapus paling lambat 6 bulan setelah penelitian selesai |
| Nama | Sapaan dan pencocokan identitas saat reset token | Responden, admin | Sama dengan nomor HP |
| ID peserta | Menghubungkan data belajar dengan data pretest/posttest | Admin, peneliti | Sesuai protokol etik |
| Progres dan jawaban kuis | Memantau keterlaksanaan intervensi | Admin, peneliti | Sesuai protokol etik, dalam bentuk ID peserta |
| Waktu akses | Melihat keterlibatan belajar | Admin, peneliti | Sesuai protokol etik |
| Log aktivitas admin | Akuntabilitas | Super admin | Sampai data penelitian dimusnahkan |

**Ketentuan**

- Persetujuan penelitian (informed consent) dicatat waktunya saat registrasi; teks persetujuan di website sama dengan dokumen yang disetujui komisi etik.
- Halaman Privasi menjelaskan data yang dikumpulkan, tujuannya, siapa yang mengakses, lama penyimpanan, dan cara mengundurkan diri.
- Responden yang mengundurkan diri: akun dinonaktifkan; penanganan data yang sudah terkumpul (dihapus atau dipertahankan secara anonim) mengikuti protokol etik dan disampaikan sejak awal kepada responden.
- Tidak ada pelacak iklan, piksel media sosial, atau analitik pihak ketiga yang mengirim data perilaku ke luar sistem.
- Server, dan layanan WhatsApp/SMS pada fase berikutnya, dipilih yang memiliki perjanjian pemrosesan data; lokasi penyimpanan dicantumkan di halaman Privasi.
- Hasil individu tidak pernah ditampilkan kepada responden lain.

## 17. Persyaratan Khusus Penelitian

Website menjamin konsistensi intervensi: semua responden menerima versi konten, urutan materi, dan aturan kuis yang sama, dan semuanya tercatat.

- Satu versi konten dikunci sebelum responden pertama mendaftar dan berlaku sampai responden terakhir selesai.
- Urutan modul dan materi ditetapkan dalam protokol dan dijaga oleh mekanisme penguncian berurutan.
- Mode penyelesaian kuis (A atau B) ditetapkan dalam protokol dan sama untuk semua kuis.
- Kuis per materi dibedakan dari instrumen penelitian; butir pretest dan posttest tidak dimuat di website.
- Pretest dilakukan setelah registrasi dan sebelum responden memulai Materi 1.1, dengan mencantumkan ID peserta; posttest dilakukan setelah responden menyelesaikan seluruh materi atau setelah batas waktu intervensi yang ditetapkan protokol.
- Website tidak mengubah jawaban apa pun secara otomatis dan tidak memberi kunci jawaban pretest/posttest.
- Pembukaan kunci manual, perbaikan konten setelah dikunci, dan ekspor data tercatat di log aktivitas untuk dilaporkan sebagai penyimpangan protokol jika ada.
- Batas waktu intervensi (misalnya 14 hari sejak registrasi) ditetapkan dalam protokol; dashboard admin menandai responden yang belum selesai mendekati batas tersebut.

Efektivitas intervensi dinilai dari perubahan skor pengetahuan dan sikap pada instrumen penelitian, bukan dari jumlah klik, lama kunjungan, nilai kuis per materi, atau persentase materi selesai. Data progres dipakai untuk menilai keterlaksanaan intervensi (fidelity), misalnya untuk analisis per protokol.

## 18. Kriteria Penerimaan

Website siap dipakai dalam penelitian bila seluruh kriteria di bawah lulus uji.

**Akun**

- Responden dapat mendaftar sendiri dengan nama dan nomor HP tanpa bantuan admin; token dan ID peserta terbentuk otomatis; pendaftaran tertolak saat ditutup admin.
- Nomor dalam format 08…, 628…, dan +628… dikenali sebagai nomor yang sama, dan nomor ganda ditolak.
- Token tidak memuat karakter yang mudah tertukar, diterima tanpa membedakan huruf besar-kecil, spasi, atau tanda hubung, dan tidak dapat dilihat admin.
- Responden tidak dapat lanjut dari halaman Simpan Token sebelum mencentang konfirmasi.
- Masuk ditunda setelah 5 percobaan gagal dalam 15 menit.
- Reset token oleh admin membuat token lama dan semua sesi tidak berlaku, tanpa menghapus progres, dan tercatat di log.
- Admin tidak dapat masuk tanpa autentikasi dua faktor.

**Belajar dan penguncian**

- Materi berikutnya terkunci sampai kuis materi sebelumnya selesai, termasuk saat dibuka lewat alamat langsung.
- Materi pertama modul berikutnya terbuka setelah kuis materi terakhir modul sebelumnya selesai.
- Kuis memberi umpan balik dan penjelasan untuk setiap soal.
- Progres dan jawaban tetap tersimpan setelah halaman ditutup, koneksi terputus, atau berganti perangkat.
- "Lanjutkan Belajar" membuka posisi terakhir dengan tepat.

**Admin**

- Admin dapat membuat, mengurutkan, mempratinjau, dan menerbitkan modul, materi, dan kuis tanpa bantuan pengembang.
- Materi tidak dapat diterbitkan tanpa kuis yang lolos validasi.
- Konten yang dikunci tidak dapat diedit oleh admin biasa.
- Angka di dashboard keseluruhan cocok dengan perhitungan manual dari data ekspor.
- Detail per responden menampilkan seluruh materi, percobaan kuis, dan jawaban dengan benar.
- Ekspor CSV/Excel dapat dibuka dan memakai ID peserta, tanpa nama dan nomor HP.
- Semua tindakan admin yang ditentukan tercatat di log.

**Umum**

- Seluruh halaman dapat digunakan di ponsel lebar 360 piksel tanpa scroll horizontal.
- Validasi isi oleh ahli dan uji coba pengguna selesai, dengan temuan sudah diperbaiki.
- Informasi sumber, privasi, dan batasan edukasi tersedia.
- Website tidak memberikan diagnosis atau rekomendasi pengobatan.

## 19. Rencana Pengembangan

| Tahap | Kegiatan utama | Luaran |
|---|---|---|
| 1. Perencanaan | Telaah literatur; tetapkan indikator pengetahuan dan sikap; tetapkan mode kuis dan batas waktu intervensi | PRD final, protokol akses |
| 2. Penyusunan konten | Tulis naskah materi; susun 3–5 soal per materi beserta penjelasan; siapkan ilustrasi | Naskah materi dan bank soal |
| 3. Pembangunan sistem | Akun nomor HP dan token; halaman responden; penguncian berurutan; panel konten; dashboard admin; ekspor | Website versi uji coba |
| 4. Input dan validasi konten | Admin menginput konten lewat panel; validasi isi oleh ahli materi dan ahli media | Konten berstatus siap ditinjau, lembar validasi |
| 5. Uji coba | Uji keterbacaan, kemudahan penggunaan (misalnya SUS), fungsionalitas, keamanan, serta alur simpan dan reset token pada 5–10 calon pengguna di luar sampel | Laporan uji coba dan daftar perbaikan |
| 6. Persiapan penelitian | Perbaikan; kunci versi konten; buka pendaftaran; uji cadangan data; gladi alur registrasi → pretest → belajar → posttest | Website versi penelitian (misalnya v1.0) |

## 20. Indikator Keberhasilan dan Keputusan Terbuka

**Keberhasilan pengembangan website**

- Kelayakan isi menurut validasi ahli materi dan ahli media.
- Keterbacaan materi dan kemudahan navigasi menurut uji coba pengguna.
- Responden uji coba dapat mendaftar, menyimpan token, masuk kembali, dan menyelesaikan satu materi beserta kuisnya tanpa bantuan.
- Kompatibilitas pada perangkat yang umum dipakai responden.
- Kepatuhan terhadap prosedur privasi dan etik.
- Kecocokan data dashboard admin dengan data mentah.

Keberhasilan intervensi edukasi dinilai terpisah melalui perubahan pengetahuan dan sikap pada instrumen penelitian. Website yang selesai dibuat belum otomatis terbukti efektif.

**Keputusan yang masih terbuka**

- Mode penyelesaian kuis: Mode A (selesai saat dikirim) atau Mode B (harus lulus), dan berapa batas lulusnya jika Mode B.
- Apakah formulir daftar memuat pernyataan kelayakan (usia 18 tahun ke atas dan diagnosis hipertensi), atau skrining cukup dilakukan peneliti di luar website.
- Apakah Materi 1.1 baru terbuka setelah admin menandai pretest selesai (gerbang pretest), atau cukup lewat petunjuk di halaman sambutan.
- Bagaimana menangani dua responden yang berbagi satu nomor HP (misalnya suami-istri): satu nomor per orang, atau salah satu memakai nomor anggota keluarga lain.
- Batas waktu intervensi (misalnya 7 atau 14 hari sejak registrasi).
- Lama penyimpanan data dan penanganan data responden yang mengundurkan diri, sesuai keputusan komisi etik.
- Jumlah akhir materi per modul setelah validasi ahli.
- Layanan hosting dan lokasi server, serta layanan WhatsApp/SMS dan anggarannya untuk fase OTP.

> Di aplikasi, keputusan terbuka yang bisa diubah tanpa kode tersedia sebagai pengaturan admin (`/admin/pengaturan/` dan "Aturan selesai kuis" di `/admin/konten/`), dengan nilai bawaan: Mode A, pernyataan kelayakan wajib, tanpa gerbang pretest, tidak aktif setelah 7 hari, batas intervensi 14 hari.
