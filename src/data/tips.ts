// Isi halaman "Tips Sehari-hari": tips praktis pendukung materi (bukan bagian modul/kuis).
// Disarikan dari naskah benih Modul 4–5. TODO: validasi ahli sebelum versi penelitian dikunci.
// Catat perubahan isi di CHANGELOG-KONTEN.md.
export const VERSI_TIPS = '0.1.0';

export interface Tip {
  emoji: string;
  judul: string;
  teks: string;
}

export interface KategoriTips {
  kunci: string;
  judul: string;
  tips: Tip[];
}

export const KATEGORI_TIPS: KategoriTips[] = [
  {
    kunci: 'garam',
    judul: 'Mengurangi garam',
    tips: [
      { emoji: '🧂', judul: 'Kurangi sedikit demi sedikit', teks: 'Lidah perlu waktu untuk terbiasa. Kurangi garam secara bertahap; biasanya dalam beberapa minggu lidah menyesuaikan.' },
      { emoji: '🌿', judul: 'Pakai bumbu rempah', teks: 'Bawang merah, bawang putih, jahe, kunyit, serai, daun salam, dan jeruk nipis memberi rasa kuat tanpa banyak garam.' },
      { emoji: '⏱️', judul: 'Tambahkan garam di akhir', teks: 'Garam yang ditambahkan menjelang masakan matang lebih terasa, jadi jumlahnya bisa lebih sedikit.' },
      { emoji: '🍽️', judul: 'Jauhkan garam dari meja makan', teks: 'Tidak menaruh garam atau kecap di meja membantu kita tidak terbiasa menambah garam.' },
      { emoji: '🍜', judul: 'Separuh bumbu mi instan', teks: 'Bila sesekali makan mi instan, pakai separuh bumbu atau kurang, lalu tambahkan sayur dan telur.' },
    ],
  },
  {
    kunci: 'belanja',
    judul: 'Belanja hemat & sehat',
    tips: [
      { emoji: '🛒', judul: 'Pilih sayur dan buah musiman', teks: 'Biasanya lebih murah dan segar. Pilih warna yang beragam: hijau, oranye, dan merah.' },
      { emoji: '🟫', judul: 'Tempe dan tahu sebagai lauk', teks: 'Bergizi, kaya protein, dan harganya terjangkau. Bisa dikukus, dibacem rendah gula, atau dipepes.' },
      { emoji: '🏷️', judul: 'Baca baris "Natrium" di label', teks: 'Lihat natrium per sajian dan jumlah sajian per kemasan. Bandingkan dua produk dan pilih yang natriumnya lebih rendah.' },
      { emoji: '💰', judul: 'Alihkan uang jajan asin', teks: 'Uang untuk kerupuk, keripik, dan minuman manis bisa dipakai membeli sayur dan buah.' },
    ],
  },
  {
    kunci: 'masak',
    judul: 'Memasak lebih praktis',
    tips: [
      { emoji: '🔪', judul: 'Siapkan bahan sekaligus', teks: 'Cuci dan potong sayur untuk dua hari, lalu simpan di lemari es dalam wadah tertutup.' },
      { emoji: '🧄', judul: 'Buat bumbu dasar tanpa garam', teks: 'Bumbu putih dari bawang merah dan bawang putih bisa dibuat untuk beberapa hari dan disimpan di lemari es.' },
      { emoji: '♨️', judul: 'Kukus, rebus, atau pepes', teks: 'Cara memasak ini memakai sedikit atau tanpa minyak dan tetap enak.' },
      { emoji: '🥥', judul: 'Santan encer untuk sayur', teks: 'Ganti santan kental dengan santan encer, atau pilih sayur bening dan sayur asem.' },
    ],
  },
  {
    kunci: 'luar',
    judul: 'Makan di luar rumah',
    tips: [
      { emoji: '🍢', judul: 'Pilih yang dibakar atau dikukus', teks: 'Ayam bakar tanpa kulit, ikan bakar, atau pepes lebih rendah lemak dibanding gorengan.' },
      { emoji: '🥣', judul: 'Minta kuah dan sambal dipisah', teks: 'Dengan begitu Anda bisa mengambil sedikit saja. Kuah biasanya mengandung banyak garam.' },
      { emoji: '🥗', judul: 'Tambah sayur bila ada', teks: 'Lalapan, sayur asem, gado-gado, atau sayur bening membantu isi piring lebih seimbang.' },
      { emoji: '🚰', judul: 'Air putih atau teh tawar', teks: 'Lebih baik daripada es teh manis atau minuman bersoda.' },
    ],
  },
  {
    kunci: 'kebiasaan',
    judul: 'Kebiasaan & keluarga',
    tips: [
      { emoji: '🎯', judul: 'Satu target kecil dulu', teks: 'Contoh: "Saya makan satu buah setiap sore, minimal lima hari seminggu." Target kecil lebih mudah dijalankan.' },
      { emoji: '📝', judul: 'Tulis dan tinjau setiap minggu', teks: 'Catat target di kertas atau ponsel. Di akhir minggu, lihat apa yang berhasil dan sesuaikan.' },
      { emoji: '👨‍👩‍👧', judul: 'Ajak keluarga memasak bersama', teks: 'Masak dengan sedikit garam untuk semua orang; seluruh keluarga ikut mendapat manfaat pola makan sehat.' },
      { emoji: '🔁', judul: 'Tidak apa-apa bila sesekali lupa', teks: 'Bila kembali ke kebiasaan lama, mulai lagi pada waktu makan berikutnya.' },
      { emoji: '🩺', judul: 'Tetap periksa dan minum obat', teks: 'Pola makan sehat melengkapi pengobatan. Periksa tekanan darah rutin dan minum obat sesuai anjuran dokter.' },
    ],
  },
];

// Tips hari ini: berganti setiap hari secara berurutan (bukan acak, agar sama untuk semua responden).
export function tipsHariIni(tanggal = new Date()): Tip {
  const semua = KATEGORI_TIPS.flatMap((k) => k.tips);
  const hari = Math.floor(Number(new Date(tanggal.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }))) / 86_400_000);
  return semua[hari % semua.length];
}
