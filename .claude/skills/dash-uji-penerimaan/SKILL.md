---
name: dash-uji-penerimaan
description: Memeriksa kesiapan website DASH Sehat terhadap kriteria penerimaan PRD sebelum menyatakan fitur atau rilis selesai. Gunakan saat diminta mengecek, menguji, me-review, atau menyiapkan versi untuk uji coba/penelitian.
---

# Uji Penerimaan DASH Sehat

Rujukan lengkap: `docs/PRD.md` bagian 14, 15 (Tahap 4–5), dan 16.

Jalankan pemeriksaan di bawah, laporkan setiap butir sebagai **Lulus / Gagal / Belum bisa diuji** beserta bukti singkat (URL halaman, lebar layar, temuan). Jangan menandai Lulus tanpa benar-benar memeriksanya.

## A. Fungsional (bisa diuji agent)

1. Semua halaman utama terbuka tanpa error: Beranda, Pengenalan DASH, Daftar Modul, Modul 1–6, Kuis, Sumber, Tentang/Privasi. Cek konsol browser dan tautan rusak (404).
2. Enam modul tersedia dengan urutan: Hipertensi → Diet DASH → Makanan & Porsi → Menu Indonesia → Kebiasaan Sehat → Rangkuman & Kuis.
3. Semua tombol navigasi berfungsi: Mulai Belajar, Lihat Materi, Buka Materi, Materi Sebelumnya/Berikutnya, Kembali ke Daftar Modul, Pelajari Kembali Materi.
4. Kuis: satu soal per layar, Periksa Jawaban bekerja, umpan balik sesuai jawaban (benar & salah), ringkasan hasil muncul.
5. Materi dapat diakses tanpa login.
6. Estimasi waktu baca tiap modul sesuai jumlah kata saat ini.

## B. Tampilan dan perangkat

7. Tidak ada scroll horizontal di 320px dan 375px; tata letak baik di 768px dan 1280px.
8. Teks isi ≥16px dan terbaca tanpa zoom; teks bisa diperbesar 200% tanpa terpotong.
9. Semua gambar dan ilustrasi tampil, punya `alt` yang sesuai.
10. Navigasi penuh dengan keyboard; fokus terlihat; tidak ada pelanggaran serius di axe/Lighthouse.
11. Status benar/salah dan selesai/belum tidak hanya ditandai warna.

## C. Konten dan batasan

12. Halaman Sumber Materi ada dan tiap modul mencantumkan rujukan.
13. Pernyataan batasan edukasi ("tidak menggantikan saran tenaga kesehatan") terlihat di semua halaman.
14. Tidak ada diagnosis, rekomendasi obat, atau klaim menyembuhkan. Cari kata: "sembuh", "menyembuhkan", "pasti", "ganti obat", "berhenti minum obat", "tidak perlu obat".
15. Tidak ada `TODO: verifikasi sumber` yang tersisa di konten yang akan dirilis.
16. Kuis latihan tidak berisi soal dari instrumen pretest/posttest.

## D. Privasi dan keamanan

17. Tidak ada skrip pelacakan pihak ketiga.
18. Tidak ada data pribadi di URL atau log publik.
19. Jika akun aktif: hashing kata sandi, cookie sesi aman, rate limiting, logout, dan pemulihan akses sudah diuji (lihat skill `dash-privasi-penelitian`).
20. Versi konten tercantum dan `CHANGELOG-KONTEN.md` mutakhir.

## E. Di luar kemampuan agent (ingatkan pengguna)

Butir ini tidak bisa dinyatakan Lulus oleh agent; cantumkan sebagai tindak lanjut:

- Validasi isi oleh ahli (gizi/kesehatan).
- Uji keterbacaan dan kemudahan penggunaan dengan calon pengguna nyata.
- Uji di perangkat dan peramban fisik yang umum dipakai responden.
- Kesesuaian dengan persetujuan etik dan protokol penelitian.
- Pembekuan versi website sebelum pengambilan data.

## Format laporan

```
## Hasil Uji Penerimaan — <tanggal>, versi <x.y>
Ringkasan: N lulus, N gagal, N belum bisa diuji

| # | Kriteria | Status | Bukti/Temuan |
|---|----------|--------|--------------|

### Perlu diperbaiki
- ...

### Tindak lanjut di luar agent
- ...
```

Ingat: lulus uji penerimaan berarti website siap diuji coba, bukan bukti bahwa intervensi efektif.
