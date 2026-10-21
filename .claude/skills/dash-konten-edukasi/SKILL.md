---
name: dash-konten-edukasi
description: Menulis, menyunting, atau meninjau konten edukasi DASH Sehat (materi, contoh penerapan, Poin Penting, rangkuman, kuis per materi, sumber), baik di naskah benih maupun lewat panel admin. Gunakan setiap kali membuat atau mengubah teks yang dibaca responden.
---

# Konten Edukasi DASH Sehat

Rujukan lengkap: `docs/PRD.md` bagian 5, 6, 9, 10, 13, dan 14.

## Struktur Modul → Materi → Kuis (PRD 5)

| Tingkat | Isi wajib | Aturan |
|---|---|---|
| Modul | Judul, deskripsi satu kalimat, ilustrasi sampul + teks alternatif, tujuan modul | 2–5 materi per modul |
| Materi | Judul, tujuan pembelajaran (1–5), isi, Poin Penting (1–6), rangkuman, sumber | Tepat satu kuis; estimasi waktu baca otomatis (±150 kata/menit) kecuali diisi admin |
| Kuis | Judul, petunjuk, mode A/B | Minimal 3 soal (disarankan 3–5), hanya menguji isi materi itu |
| Soal | Teks, 3–4 pilihan, tepat satu kunci, penjelasan wajib, gambar opsional (alt wajib) | Penjelasan tampil baik saat benar maupun salah |

Urutan tampilan materi tetap (PRD 9): judul & nomor → tujuan → estimasi waktu → isi (paragraf pendek, gambar, contoh penerapan) → Poin Penting → rangkuman → sumber → tombol "Kerjakan Kuis". Jangan menulis ulang bagian yang dirender otomatis (tujuan, Poin Penting, rangkuman) di dalam isi.

Usulan materi (PRD 13): 1.1–1.3 hipertensi; 2.1–2.3 diet DASH; 3.1–3.5 makanan & porsi; 4.1–4.4 menu Indonesia; 5.1–5.3 kebiasaan sehat; 6.1–6.2 rangkuman & rencana saya. Modul 6 tidak berisi "kuis besar".

## Di mana konten berada

- **Database (sumber kebenaran setelah impor):** diedit lewat `/admin/konten/` di versi kerja. Perubahan tercatat otomatis di log aktivitas.
- **Naskah benih:** `scripts/benih/naskah-v2/<n>-<slug>.md`, satu berkas per modul. Frontmatter: `judul`, `deskripsi`, `ilustrasi` (jantung/piring/porsi/menu/langkah/kuis), `alt`, `tujuan`. Setiap `## Judul` = satu materi, diawali blok:

  ````
  ```meta
  tujuan: [...]
  poin_penting: [...]
  rangkuman: ...
  sumber: [id-sumber, ...]        # dari scripts/benih/sumber-v1.ts
  kuis:
    - k01                          # soal lama dari scripts/benih/kuis-v1.ts
    - teks: Pertanyaan?
      pilihan: [A, B, C]
      benar: 1                     # indeks mulai 0
      penjelasan: Mengapa B benar.
  ```
  ````

  Impor dengan `npm run benih-konten` (gagal bila skema tidak terpenuhi). Perubahan naskah benih dicatat di `CHANGELOG-KONTEN.md`.

## Blok khusus di isi materi (Markdown)

- ```` ```contoh ```` … kotak "Contoh penerapan sehari-hari" (situasi nyata di Indonesia). Satu per materi dianjurkan.
- ```` ```penting ```` … kotak poin penting di tengah isi (untuk peringatan seperti konsultasi tenaga kesehatan).
- ```` ```galeri ```` baris `emoji | Nama | keterangan` untuk contoh makanan.
- ```` ```menu ```` daftar YAML waktu makan (waktu, emoji, nama, bahan, alasan, catatan).
- `> **Tips:** …` untuk tips singkat. Gambar: `![teks alternatif](/gambar-konten/<id>/)` — alt wajib.
- HTML mentah tidak dirender (`skipHtml`). Komentar `<!-- TODO … -->` aman (tidak tampil).

## Aturan bahasa (PRD 14)

- Bahasa Indonesia sederhana; sapa pembaca dengan "Anda". Paragraf pendek, satu gagasan per paragraf.
- Istilah teknis dijelaskan saat pertama muncul: "natrium (zat yang banyak terdapat dalam garam dapur)".
- Satuan rumah tangga di samping gram: "1 sendok teh garam (±5 gram)", "½ mangkuk sayur matang".
- Contoh makanan mudah ditemukan dan terjangkau: tempe, tahu, ikan kembung, bayam, kangkung, pepaya, pisang, beras merah.
- Sebut sumber natrium umum: ikan asin, kecap asin, penyedap, mi instan, kerupuk, saus botolan, makanan kemasan.
- Tidak menghakimi atau menakut-nakuti. Umpan balik kuis memakai "Belum tepat", bukan "Salah!".

## Batasan klaim (wajib, PRD 13)

- JANGAN menulis bahwa DASH menyembuhkan hipertensi atau menggantikan obat. Pakai "membantu mengendalikan tekanan darah bersama pengobatan dari tenaga kesehatan".
- Ingatkan bahwa kebutuhan nutrisi bisa berbeda (penyakit ginjal, diabetes, kehamilan) — sarankan berkonsultasi dengan dokter atau ahli gizi.
- Jangan pernah menyarankan mengubah, menghentikan, atau mengatur dosis obat.
- Angka (batas natrium, porsi, kategori tekanan darah) harus dari pedoman yang dirujuk. Bila belum pasti, tulis `<!-- TODO: verifikasi sumber -->`; jangan mengarang angka atau rujukan.
- Validasi versi di panel dan `npm run cek-klaim` menolak frasa seperti "menyembuhkan", "pasti turun", "ganti obat", "berhenti minum obat" (kecuali disangkal, mis. "tidak menyembuhkan").

## Kuis per materi

- Menguji tujuan pembelajaran materi itu saja, dengan bahasa yang sama dengan materi; tidak menjebak.
- Pengecoh masuk akal. Penjelasan 1–2 kalimat menjelaskan **mengapa** jawaban benar.
- Kuis ini latihan dan syarat membuka materi berikutnya, **bukan** pretest/posttest. Jangan menyalin butir instrumen penelitian. Jika ragu, tanyakan ke peneliti.

## Sumber

Setiap materi mencantumkan sumbernya (terkumpul otomatis di halaman Sumber Materi). Utamakan NHLBI DASH Eating Plan, Kemenkes RI (Pedoman Gizi Seimbang, Permenkes GGL), BPOM (label pangan), konsensus PERHI, WHO, dan literatur yang telah ditelaah.

## Setelah mengubah konten

1. Pratinjau materi dan kuis di panel (`Pratinjau`), cek di lebar 360px.
2. Pastikan versi kerja lolos pemeriksaan di `/admin/konten/` sebelum "Tandai siap ditinjau".
3. Untuk naskah benih: catat di `CHANGELOG-KONTEN.md` dan jalankan `npm run cek-klaim`.
4. Konten yang sudah dikunci (mis. v1.0) hanya diubah lewat versi perbaikan oleh super admin dengan alasan.
