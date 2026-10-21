# Catatan Perubahan Konten — DASH Sehat

Catat setiap perubahan isi materi, kuis, atau sumber di sini. Format: tanggal, versi, modul/berkas, ringkasan perubahan, alasan.

Setelah versi dibekukan untuk penelitian, perubahan konten inti hanya boleh dilakukan dengan persetujuan peneliti.

> **Sejak PRD v2.0 (2026-10-21)** konten dikelola per versi di panel admin (`/admin/konten/`, `/admin/versi/`). Setiap perubahan lewat panel tercatat otomatis di log aktivitas (`/admin/log/`, bisa diunduh CSV). Berkas ini mencatat perubahan naskah benih (`scripts/benih/naskah-v2/`) dan keputusan penguncian versi.

## Konten contoh diterbitkan di database utama (2026-10-21)

- Naskah benih v2 (6 modul, 20 materi, 60 soal) diterbitkan sebagai **konten contoh** (`npm run benih-konten -- --contoh`) agar website dapat dicoba. Versi bertanda `contoh`, tidak dapat dikunci.
- Wajib dihapus atau diganti konten tervalidasi sebelum responden penelitian mulai (Versi Konten → Hapus Konten Contoh).

## Menu Sehat 0.1.0 & Tips Sehari-hari 0.1.0 (2026-10-21, draf, PERLU VALIDASI AHLI)

- Halaman bacaan pendukung baru untuk responden: **Menu Sehat** (`src/data/menu-sehat.ts`: isi piring, 6 kelompok makanan dianjurkan dengan contoh & porsi, 4 kelompok yang perlu dibatasi dengan pengganti, cara memasak) dan **Tips Sehari-hari** (`src/data/tips.ts`: 22 tips dalam 5 kategori, "tips hari ini" bergilir).
- Isi disarikan dari naskah benih Modul 2–5 (NHLBI, Pedoman Gizi Seimbang, Permenkes GGL). Belum selesai: TODO verifikasi proporsi "Isi Piringku" dan ukuran porsi bersama ahli gizi.
- Bukan bagian modul/kuis dan tidak dihitung dalam progres.

## Benih v2 — struktur PRD v2.0 (2026-10-21, draf, PERLU VALIDASI AHLI)

- **Struktur baru:** 6 modul, 20 materi sesuai tabel PRD v2.0 Bagian 13 (teks PRD menyebut 18 materi, tabelnya 20; benih mengikuti tabel). Setiap materi punya tujuan pembelajaran, isi dengan kotak contoh penerapan, Poin Penting, rangkuman, sumber, dan kuis 3 soal (total 60 soal).
- **Modul 6** berganti menjadi "Rangkuman dan Rencana Saya" (6.1 Rangkuman prinsip DASH, 6.2 Menyusun rencana makan sehat pribadi); tidak ada lagi kuis besar.
- **Teks dipakai ulang** dari naskah 0.2/0.3 (dipindah ke `scripts/benih/naskah-v1/`) dan dipecah per materi. Materi baru/diperluas: 1.2 contoh, 1.3 pengendalian, 2.2 kuis, 3.2 protein, 3.3 susu rendah lemak, 3.5 contoh porsi, 4.3 contoh label, 5.2 pengganti makanan, 5.3 dukungan keluarga, 6.2 rencana pribadi.
- **Kuis:** 15 soal lama (k01–k15) dipakai ulang di materi yang sesuai; 45 soal baru ditulis per tujuan pembelajaran materi. Semua perlu validasi ahli dan tidak boleh sama dengan butir pretest/posttest.
- **Belum selesai:** TODO verifikasi sumber (tabel kategori tekanan darah PERHI 2021, ukuran porsi lauk, tabel porsi NHLBI, contoh menu).
- Diimpor dengan `npm run benih-konten` sebagai versi kerja draf; terbit setelah validasi ahli dan persetujuan super admin.

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
