---
name: dash-konten-edukasi
description: Menulis, menyunting, atau meninjau konten edukasi DASH Sehat (teks modul, contoh menu Indonesia, kotak Poin Penting, rangkuman, kuis latihan, halaman sumber). Gunakan setiap kali membuat atau mengubah teks yang dibaca pengguna di modul 1–6 atau kuis.
---

# Konten Edukasi DASH Sehat

Rujukan lengkap: `docs/PRD.md` bagian 5C, 5D, 9, 10, dan 13.

## Struktur wajib setiap modul

Satu **modul** berisi beberapa **materi** (halaman sendiri). Naskah tetap satu berkas/versi per modul:

- **Frontmatter:** `urutan`, `judul`, `versi`, `deskripsi_kartu` (satu kalimat untuk kartu), `ilustrasi` + `ilustrasi_alt`, `tujuan` (2–4 butir, diawali kata kerja: "Anda dapat menyebutkan…"), `poin_penting` (3–5 butir), `rangkuman` (3–5 kalimat), `sumber`.
- **Pengantar (opsional):** teks sebelum `##` pertama, tampil di halaman ringkasan modul.
- **Materi:** setiap `## Judul Materi` memulai satu materi. Ikuti subtopik PRD bagian 9 (umumnya 3–5 materi isi). Di dalam materi pakai `### Subjudul`; paragraf pendek (2–4 kalimat), satu gagasan per paragraf.
- **Materi terakhir:** `## Contoh Penerapan Sehari-hari` — situasi nyata di Indonesia. Poin Penting dan Rangkuman otomatis tampil setelahnya.
- **Estimasi waktu baca** dihitung otomatis per materi dan per modul (`ceil(kata / 150)` menit); jangan ditulis manual.
- Navigasi (Materi Sebelumnya/Berikutnya, Ringkasan Modul, Modul Berikutnya) dibuat otomatis.

## Cakupan isi per modul

| Modul | Topik wajib |
|---|---|
| 1. Mengenal Hipertensi | pengertian, faktor risiko, komplikasi, pentingnya pengendalian |
| 2. Mengenal Diet DASH | definisi, tujuan & manfaat, prinsip pola makan, hubungan dengan tekanan darah |
| 3. Makanan dan Porsi | sayur & buah, biji-bijian utuh, sumber protein, produk susu sesuai kebutuhan, natrium & lemak jenuh, contoh porsi berdasarkan kebutuhan energi |
| 4. Menu Indonesia | contoh sarapan/makan siang/makan malam, pilihan lauk & sayur, mengurangi garam & bumbu tinggi natrium, membaca label pangan, makan di luar rumah |
| 5. Kebiasaan Sehat | perubahan bertahap, hambatan biaya & waktu, alternatif makanan, dukungan keluarga, target realistis |
| 6. Rangkuman dan Kuis | ringkasan prinsip DASH, soal latihan, umpan balik, ajakan menerapkan |

## Aturan bahasa

- Bahasa Indonesia sederhana; sapa pembaca dengan "Anda".
- Istilah teknis wajib dijelaskan saat pertama muncul. Contoh: "natrium (zat yang banyak terdapat dalam garam dapur)".
- Gunakan satuan rumah tangga di samping gram: "1 sendok teh garam (±5 gram)", "1 centong nasi", "1 potong sedang tempe".
- Contoh makanan harus mudah ditemukan dan terjangkau di Indonesia: tempe, tahu, ikan kembung, sayur bening bayam, pepaya, pisang, beras merah, oatmeal, singkong rebus, dll.
- Sebut juga makanan tinggi natrium yang umum: ikan asin, kecap asin, MSG berlebihan, mi instan, kerupuk, makanan kaleng, saus sambal kemasan.
- Hindari nada menghakimi atau menakut-nakuti. Tulis "Kurangi perlahan" bukan "Berhenti sekarang atau Anda berisiko stroke".

## Batasan klaim (wajib)

- JANGAN menulis bahwa DASH menyembuhkan hipertensi atau bisa menggantikan obat.
- Gunakan rumusan seperti "membantu mengendalikan tekanan darah bersama pengobatan dari tenaga kesehatan".
- Ingatkan bahwa kebutuhan nutrisi bisa berbeda untuk kondisi tertentu (mis. penyakit ginjal, diabetes, kehamilan) — sarankan berkonsultasi dengan dokter atau ahli gizi.
- Jangan pernah menyarankan mengubah, menghentikan, atau mengatur dosis obat.
- Angka (batas natrium, jumlah porsi, nilai tekanan darah) harus berasal dari pedoman yang dirujuk. Jika belum ada sumber, tulis `<!-- TODO: verifikasi sumber -->` — jangan mengarang angka atau rujukan.

## Kuis latihan

- Pilihan ganda, 3–4 opsi, satu jawaban benar.
- Setiap soal punya `umpan_balik` yang menjelaskan **mengapa** jawaban benar (1–2 kalimat), plus `modul_terkait` untuk tombol "Pelajari Kembali Materi".
- Pengecoh harus masuk akal, bukan jebakan bahasa.
- Kuis ini latihan. JANGAN menyalin soal dari instrumen pretest/posttest penelitian, dan jangan membuat soal yang membocorkan jawabannya. Jika ragu, tanyakan ke peneliti.

## Sumber

- Setiap modul mencantumkan daftar sumber di akhir dan terkumpul di halaman Sumber Materi.
- Utamakan pedoman resmi (mis. NHLBI DASH Eating Plan, Kemenkes RI, pedoman perhimpunan hipertensi) dan literatur yang telah ditelaah.

## Setelah mengubah konten

1. Perbarui `estimasi_menit`.
2. Naikkan `versi` file konten.
3. Tambahkan entri di `CHANGELOG-KONTEN.md`.
4. Jalankan cek cepat: tidak ada kata "menyembuhkan", "pasti turun", "ganti obat", "tidak perlu obat".
