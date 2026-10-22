---
name: dash-privasi-penelitian
description: Panduan wajib saat menyentuh akun responden (nomor HP + token), sesi, akun admin, progres, pencatatan waktu baca, tips, ekspor, log aktivitas, pengaturan penelitian, atau versi konten DASH Sehat. Gunakan sebelum menambah fitur yang menyimpan, menampilkan, atau mengirim data apa pun.
---

# Privasi, Keamanan, dan Kebutuhan Penelitian

Rujukan lengkap: `docs/PRD.md` bagian 3, 7, 10.5–10.7, 11, 12, 15 (Keamanan), 16, dan 17.

## Data yang boleh disimpan (PRD 12 & 16)

| Data | Koleksi | Catatan |
|---|---|---|
| Nama, nomor HP (+62…), hash token, waktu persetujuan/kelayakan, aktif, mundur | `respondents` | Identitas; terpisah dari data belajar |
| ID peserta (DS-xxxx), status sampel, tanda pretest | `participants` | Dipakai untuk analisis & ekspor |
| Riwayat akun (token dibuat/diganti/direset, nomor/nama diganti, nonaktif, mundur) | `token_events` | Siapa & alasan |
| Progres per materi (dibuka, selesai, detik baca, versi, buka manual) | `material_progress` | Kunci materi stabil lintas versi |
| Admin (email, hash sandi, peran), undangan, sesi, percobaan masuk | `admins`, `admin_invites`, `sessions`, `percobaan_login` | Undangan & sesi disimpan sebagai hash |
| Log aktivitas admin | `log_audit` | Hanya tambah |

**Jangan pernah** meminta atau menyimpan: email responden, NIK, alamat, tanggal lahir, nomor rekam medis, angka tekanan darah, obat, atau data kesehatan lain. Menambah kolom data baru memerlukan permintaan eksplisit peneliti dan pembaruan halaman Privasi.

Terdaftarnya seseorang sudah mengungkap bahwa ia memiliki hipertensi → daftar nomor HP diperlakukan sebagai data sensitif.

## Akun responden (PRD 7)

- Semua fitur (materi, Menu Sehat, Tips, Pengenalan, Tentang, Sumber) hanya setelah masuk. Privasi dan Ketentuan Penggunaan wajib tetap publik agar calon responden bisa membacanya sebelum menyetujui.

- Daftar mandiri: nama (2–50), nomor HP (08…/628…/+628… → disimpan `+628…`, unik), centang kelayakan (bila diaktifkan di Pengaturan) dan persetujuan. Pendaftaran bisa ditutup admin. Super admin juga bisa menambah responden di `/admin/responden/tambah/` (wajib centang bahwa kelayakan & persetujuan sudah dinyatakan langsung; kode akses tampil sekali; tercatat di riwayat akun dan log).
- **Kode akses 6 angka** (di kode: `token`), tampil `482 917` **sekali** bersama nama, disimpan sebagai hash Argon2id untuk masuk, plus salinan terenkripsi (AES-256-GCM, kunci `KUNCI_KODE_AKSES`) yang hanya dapat dibuka super admin lewat "Lihat kode" (tercatat di log `lihat_kode_akses`; keputusan peneliti 2026-10-22). Jangan pernah menampilkan kode di ekspor, URL, log aplikasi, atau HTML awal. Pola lemah (111111, 123456, 121212, 123123) tidak pernah dibuat (`kodeLemah`). Masuk mengabaikan spasi dan tanda hubung. Di teks untuk responden sebut "kode akses".
- **ID peserta tidak ditampilkan kepada responden** (keputusan peneliti 2026-10-21); hanya untuk admin, ekspor, dan analisis.
- Responden tidak bisa belajar sebelum mencentang "Saya sudah menyimpan token saya" (`token_disimpan_pada`).
- Sesi: token sesi acak (hash SHA-256 di DB), cookie `HttpOnly` + `SameSite=Lax` (+ `Secure` di produksi). "Ingat saya" = 30 hari sejak terakhir aktif (sufiks `.i` diperpanjang oleh `src/proxy.ts`); tanpa itu cookie sesi peramban.
- Batas: 5 gagal / 15 menit per nomor, plus batas per IP; daftar dibatasi per IP.
- Reset token oleh admin / ganti token oleh responden → token lama tidak berlaku dan semua sesi dihapus; progres tetap. Tercatat di riwayat akun dan log.
- Pesan kesalahan memakai teks PRD 7.7 (`PESAN` di `src/lib/responden.ts`).

## Admin (PRD 7.8)

- Email + kata sandi ≥12 (Argon2id), langsung masuk tanpa 2FA (keputusan peneliti 2026-10-22, menyimpang dari PRD 7.8). Sesi penuh idle 30 menit; token sesi diganti setiap masuk; 5 gagal / 15 menit per email, 20 per IP.
- Tidak ada pendaftaran admin: super admin pertama via `npm run buat-admin`; lainnya via undangan 48 jam (hash token, sekali pakai).
- `wajibAdmin()` di setiap halaman/aksi/route admin; tanpa sesi → 404. `wajibAdmin('super_admin')` untuk Versi, Admin, Log → 403 bagi admin biasa.

## Aturan tampilan & ekspor

- Nomor HP selalu tersamarkan (`0812****7890`). Nomor lengkap hanya lewat tombol "Lihat nomor lengkap" yang tercatat di log.
- Nomor HP, nama, token, dan data pribadi tidak boleh masuk URL, judul halaman, atau log aplikasi. Pencarian nama/nomor di daftar responden dilakukan di peramban (nomor dicocokkan via hash), saringan di URL hanya berisi status/tanggal.
- Ekspor (CSV/Excel) memakai ID peserta saja, tanpa nama dan nomor HP; bawaan hanya `responden_penelitian`; nama berkas memuat label versi & tanggal; setiap ekspor tercatat di log.
- Tidak ada analitik, pixel, atau pelacak pihak ketiga. Lama baca dicatat di server sendiri (`/api/baca/`) hanya saat halaman aktif dan berhenti setelah 5 menit tanpa interaksi.

## Konsistensi intervensi (PRD 17)

- Semua responden menerima versi konten dan urutan materi yang sama. Tidak ada kuis (keputusan peneliti 2026-10-22): materi selesai saat dibuka, progres = materi yang dibuka + lama membaca.
- Versi dikunci sebelum responden pertama mendaftar. Perbaikan setelah dikunci = versi perbaikan (super admin, alasan wajib). Mengganti versi terkunci dengan versi biasa wajib beralasan (penyimpangan protokol).
- Buka kunci manual wajib alasan dan tercatat. Pembukaan manual, perbaikan konten, dan ekspor adalah bahan laporan penyimpangan protokol.
- Progres = keterlaksanaan intervensi (fidelity). Jangan menampilkannya sebagai efektivitas atau keberhasilan klinis.
- Pretest/posttest tidak ada di website. Gerbang pretest (opsional) hanya berupa tanda dari admin.

## Pengaturan penelitian (`app_settings`)

Keputusan terbuka PRD 20 menjadi pengaturan: pendaftaran dibuka, pernyataan kelayakan, gerbang pretest, batas tidak aktif (bawaan 7 hari), batas intervensi (bawaan 14 hari), nomor WhatsApp peneliti. Ubah lewat `/admin/pengaturan/` (tercatat di log), bukan di kode.

## Masih menunggu keputusan

Lama penyimpanan data, penanganan data responden yang mundur, lokasi server, dan teks persetujuan final (TODO di `/privasi/`). Jangan mengarang nilainya.

## Pengujian

Uji yang menulis data hanya di database `_uji`. Setelah selesai, bersihkan database uji dan build ulang dari database asli.
