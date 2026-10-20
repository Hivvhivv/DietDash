# Catatan Perubahan Konten — DASH Sehat

Catat setiap perubahan isi materi, kuis, atau sumber di sini. Format: tanggal, versi, modul/berkas, ringkasan perubahan, alasan.

Setelah versi dibekukan untuk penelitian, perubahan konten inti hanya boleh dilakukan dengan persetujuan peneliti.

> **Sejak 2026-10-20 konten dikelola lewat halaman admin (`/admin/`).** Riwayat perubahan modul tercatat otomatis di **Log Audit** (koleksi `log_audit`, bisa diunduh sebagai JSON). Berkas ini tetap dipakai untuk mencatat perubahan kuis, daftar sumber, dan keputusan pembekuan versi.

## 0.3.0 — konten tambahan sesuai mockup fitur (2026-10-20, draf, PERLU VALIDASI AHLI)

- **Modul 1, materi 1:** tabel kategori tekanan darah orang dewasa (Optimal s.d. Hipertensi derajat 3) + catatan bahwa tabel bukan untuk mendiagnosis diri sendiri. Angka perlu dicocokkan dengan Konsensus PERHI 2021.
- **Modul 3, materi 1:** galeri contoh sayur dan buah (blok ` ```galeri `) dan kotak tips "pilih sayur dan buah berwarna-warni".
- **Modul 4, materi 1:** contoh menu diubah menjadi kartu bertab (Sarapan, Makan Siang, Camilan, Makan Malam) dengan bagian baru "Mengapa pilihan ini baik?".
- **Modul 4, materi 2:** cara mengurangi garam menjadi daftar bernomor + kotak pengingat.
- Modul 2, 5, 6 tetap 0.2.0.
- **Kuis latihan 0.2.0:** soal baru k11–k15 (perlu validasi ahli) sehingga setiap modul punya 3 soal latihan; Modul 6 memakai semua soal.

## 0.2.0 — modul dibagi menjadi beberapa materi (2026-10-20, draf)

- **Semua modul:** setiap `## Judul` kini menjadi satu materi dengan halaman sendiri (`/materi/<modul>/<nomor>/`). Pembagian mengikuti subtopik PRD bagian 9: Modul 1 (5 materi), Modul 2 (5), Modul 3 (6), Modul 4 (5), Modul 5 (6), Modul 6 (4).
- Isi teks tidak berubah; yang berubah hanya tingkat judul (`##`/`###`). Pembuka Modul 3 dan Modul 4 dipindah menjadi pengantar modul.
- Dimasukkan ke database sebagai **draf** lewat `npm run impor-draf`; tayang setelah disetujui peneliti di `/admin/`.

## 0.1.0 — impor ke database (2026-10-20)

- Keenam modul diimpor ke MongoDB sebagai versi `0.1.0` berstatus disetujui (`npm run impor-konten`).

## 0.1.0 — 2026-10-20 (draf)

- **Semua modul (1–6):** naskah awal ditulis berdasarkan PRD bagian 9.
- **Kuis latihan:** 10 soal pilihan ganda dengan umpan balik dan tautan ke modul terkait.
- **Sumber:** daftar awal 12 rujukan (NHLBI, uji klinis DASH, PERHI, WHO, Kemenkes, BPOM).
- **Status:** belum divalidasi ahli. Hal yang perlu ditindaklanjuti:
  - Cocokkan tabel porsi Modul 3 dengan tabel resmi NHLBI dan sesuaikan ukuran rumah tangga dengan Pedoman Gizi Seimbang.
  - Periksa ulang seluruh sitasi (tahun, nomor peraturan, URL).
  - Isi identitas tim dan kontak penelitian di halaman Tentang.
