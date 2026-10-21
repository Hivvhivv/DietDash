---
name: dash-uji-penerimaan
description: Memeriksa kesiapan DASH Sehat terhadap kriteria penerimaan PRD v2.0 (Bagian 18) sebelum menyatakan fitur atau rilis selesai. Gunakan saat diminta mengecek, menguji, me-review, atau menyiapkan versi untuk uji coba/penelitian.
---

# Uji Penerimaan DASH Sehat

Rujukan lengkap: `docs/PRD.md` bagian 15, 17, 18, dan 19.

Laporkan setiap butir sebagai **Lulus / Gagal / Belum bisa diuji** beserta bukti singkat (URL, lebar layar, data uji). Jangan menandai Lulus tanpa benar-benar memeriksanya. Uji yang menulis data hanya di database `_uji` dan server terpisah (mis. `MONGODB_DB=dash_sehat_uji npx next start -p 3100`), lalu bersihkan dan build ulang dari database asli.

Persiapan data uji: `npm run benih-konten -- --terbit` (hanya DB `_uji`) dan `buat-admin` mode otomatis (`BUAT_ADMIN_EMAIL`, `BUAT_ADMIN_SANDI`, hanya DB `_uji`). Formulir dapat diuji tanpa peramban lewat jalur tanpa JavaScript (POST multipart dengan field `$ACTION_*` dari HTML); aksi yang dipanggil JavaScript (mis. `aksiJawab`) lewat header `Next-Action` dengan ID dari `.next/server/server-reference-manifest.json`. Kode TOTP dihitung dari kunci rahasia di halaman atur 2FA.

## A. Akun

0. `/` langsung ke Masuk (tanpa splash); tamu yang membuka Pengenalan/Tentang/Sumber/Pertanyaan Umum/Belajar/Profil dialihkan ke Masuk; Masuk, Daftar, Lupa Token, Privasi, Ketentuan terbuka tanpa login (keputusan peneliti 2026-10-21).

1. Daftar mandiri dengan nama + nomor HP; token & ID peserta terbentuk; konfirmasi nomor tampil; pendaftaran tertolak saat ditutup.
2. 08…, 628…, +628… dikenali sama; nomor ganda ditolak dengan pesan PRD 7.7.
3. Kode akses 6 angka tanpa pola lemah, diterima dengan/tanpa spasi atau tanda hubung, kolom memakai keyboard angka, tersimpan hanya sebagai hash Argon2id. Halaman simpan kode, sambutan, dashboard, dan profil tidak menampilkan ID peserta.
4. Tidak bisa belajar sebelum mencentang "Saya sudah menyimpan kode akses saya".
5. Masuk ditunda setelah 5 gagal dalam 15 menit.
6. Reset token oleh admin: token lama & semua sesi tidak berlaku, progres tetap, tercatat di log.
7. Admin tidak bisa masuk tanpa 2FA; non-admin di `/admin` → 404; admin biasa di Versi/Admin/Log → 403.

## B. Belajar dan penguncian

8. Materi berikutnya terkunci sampai kuis sebelumnya selesai, termasuk lewat URL langsung (dialihkan dengan pesan ramah); berlaku lintas modul.
9. Kuis: satu soal per layar, umpan balik + penjelasan per soal, ringkasan akhir; Mode A selesai saat dikirim, Mode B butuh skor minimal.
10. Jawaban tersimpan per soal; percobaan pertama tersimpan terpisah; ulang kuis tidak menimpa; lanjut setelah halaman ditutup/koneksi putus/ganti perangkat.
11. "Lanjutkan Belajar" membuka posisi terakhir (materi atau soal yang belum dijawab).
12. Halaman selesai mengingatkan posttest di luar website.

## C. Admin dan data

13. Admin dapat membuat, mengurutkan, mempratinjau modul/materi/kuis; super admin menerbitkan & mengunci tanpa pengembang.
14. Versi tidak bisa ditandai siap/diterbitkan bila ada materi tanpa kuis valid (≥3 soal, satu kunci, penjelasan, alt gambar) atau ada klaim berlebihan.
15. Versi dikunci tidak bisa diedit admin biasa; perbaikan = versi perbaikan super admin dengan alasan.
16. Angka dashboard cocok dengan perhitungan manual dari ekspor.
17. Detail responden menampilkan seluruh materi, percobaan, dan jawaban dengan benar.
18. Ekspor CSV/Excel terbuka, memakai ID peserta tanpa nama/HP, bawaan hanya sampel, nama berkas memuat versi & tanggal.
19. Semua tindakan admin yang ditentukan PRD 10.7 tercatat di log; log tidak bisa dihapus.

## D. Tampilan, konten, privasi

20. Semua halaman dapat dipakai di 360px tanpa scroll horizontal; target sentuh ≥48px; teks ≥16px; zoom 200% aman.
21. Status selalu ikon + teks; navigasi keyboard penuh; gambar ber-alt.
22. Sumber, privasi, ketentuan, dan batasan edukasi tersedia; label versi konten tampil di kaki halaman.
23. `npm run cek-klaim` lulus; tidak ada diagnosis/rekomendasi obat; TODO verifikasi sumber sudah diselesaikan sebelum versi dikunci.
24. Tidak ada pelacak pihak ketiga; tidak ada nomor HP/nama/token di URL atau log.
25. `npm run typecheck`, `npm run build`, dan `npm audit` bersih.

## E. Di luar kemampuan agent (ingatkan pengguna)

- Validasi isi oleh ahli materi dan ahli media.
- Uji coba 5–10 calon pengguna di luar sampel (keterbacaan, SUS, alur simpan & reset token).
- Uji di perangkat fisik (Android kelas menengah RAM 3 GB, Safari iOS).
- Keputusan komisi etik (lama simpan, data responden mundur, teks persetujuan), hosting & lokasi server, cadangan harian terenkripsi dan uji pemulihannya.
- Penguncian versi (mis. v1.0) sebelum responden pertama mendaftar.

## Format laporan

```
## Hasil Uji Penerimaan — <tanggal>, versi konten <label>
Ringkasan: N lulus, N gagal, N belum bisa diuji

| # | Kriteria | Status | Bukti/Temuan |
|---|----------|--------|--------------|

### Perlu diperbaiki
- ...

### Tindak lanjut di luar agent
- ...
```

Ingat: lulus uji penerimaan berarti website siap diuji coba, bukan bukti bahwa intervensi efektif.
