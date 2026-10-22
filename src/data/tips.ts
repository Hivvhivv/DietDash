// Bagian tetap halaman "Tips Sehari-hari". Daftar tips sendiri ada di database (Kelola Tips di panel admin).
// TODO: validasi ahli sebelum versi penelitian dikunci. Catat perubahan isi di CHANGELOG-KONTEN.md.
export const VERSI_TIPS = '0.2.0';

export const PRINSIP_TIPS = [
  {
    judul: 'Adaptasi Indera Pengecap',
    teks: 'Lidah perlu waktu untuk terbiasa dengan rasa yang kurang asin. Biasanya dalam beberapa minggu, masakan rendah garam terasa wajar.',
  },
  {
    judul: 'Target Pengurangan Bertahap',
    teks: 'Kurangi garam sedikit demi sedikit, misalnya mulai dari satu masakan, bukan langsung tanpa garam sama sekali.',
  },
  {
    judul: 'Kunci Sukses Utama',
    teks: 'Konsisten setiap hari lebih penting daripada sempurna. Ajak keluarga agar menu sehat menjadi kebiasaan bersama.',
  },
] as const;

// Checklist harian: hanya disimpan di perangkat responden (localStorage), tidak dikirim ke server.
export const CHECKLIST_HARIAN = [
  { kunci: 'cicip', judul: 'Cicip masakan sebelum menambah garam', teks: 'Tambahkan garam di akhir memasak, hanya bila perlu.' },
  { kunci: 'sayur-buah', judul: 'Ada sayur atau buah di setiap waktu makan', teks: 'Sayur di piring makan, buah sebagai camilan.' },
  { kunci: 'meja', judul: 'Tidak ada garam, kecap, atau saus botolan di meja makan', teks: 'Agar tidak terbiasa menambah rasa asin.' },
  { kunci: 'camilan', judul: 'Camilan asin diganti buah atau kacang tanpa garam', teks: 'Kerupuk dan keripik disimpan atau tidak dibeli.' },
  { kunci: 'minum', judul: 'Minum air putih, bukan minuman manis', teks: 'Teh tawar atau air dengan irisan jeruk nipis juga boleh.' },
] as const;
