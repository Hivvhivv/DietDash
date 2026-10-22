// Tips contoh untuk menu Tips Sehari-hari (diimpor dengan `npm run benih-tips`, bertanda contoh).
// Disarikan dari naskah benih Modul 4–5. TODO: verifikasi sumber — tinjau bersama ahli gizi sebelum penelitian.
// Setelah diimpor, sumber kebenaran tips adalah database (Kelola Tips di panel admin).
export interface TipsContoh {
  judul: string;
  kategori: 'dapur' | 'belanja' | 'luar' | 'keluarga' | 'label' | 'kebiasaan';
  masalah: string;
  solusi: string;
  catatan: string;
}

export const TIPS_CONTOH: TipsContoh[] = [
  {
    judul: 'Trik Bawang Merah-Putih & Sangrai Rempah',
    kategori: 'dapur',
    masalah: 'Masakan terasa hambar saat garam dan penyedap dikurangi.',
    solusi:
      'Tumis bawang merah dan bawang putih sampai harum keemasan, lalu tambahkan rempah yang disangrai sebentar seperti ketumbar dan merica. Daun salam, serai, lengkuas, dan perasan jeruk nipis menambah aroma sehingga lidah tidak mencari rasa asin.',
    catatan: 'Tambahkan garam di akhir memasak. Rasanya lebih terasa, jadi jumlahnya bisa lebih sedikit.',
  },
  {
    judul: 'Strategi Makan di Warung & Rumah Makan',
    kategori: 'luar',
    masalah: 'Lauk di warung sering bersantan kental, digoreng, dan kuahnya asin.',
    solusi:
      'Pilih lauk yang dibakar, dikukus, atau dipepes, seperti ikan bakar atau ayam bakar tanpa kulit. Minta kuah, sambal, dan gulai dipisah agar Anda bisa mengambil sedikit saja. Tambahkan sayur atau lalapan bila ada.',
    catatan: 'Pilih air putih atau teh tawar daripada es teh manis.',
  },
  {
    judul: 'Belanja Hemat Pangan DASH di Pasar Tradisional',
    kategori: 'belanja',
    masalah: 'Makanan sehat terasa mahal dan repot dicari.',
    solusi:
      'Pilih sayur dan buah musiman yang lebih murah dan segar. Tempe, tahu, kacang-kacangan, dan ikan kembung adalah sumber protein bergizi dengan harga terjangkau. Buat daftar belanja agar tidak tergoda membeli camilan kemasan yang asin.',
    catatan: 'Uang untuk kerupuk dan minuman manis bisa dialihkan untuk sayur dan buah.',
  },
  {
    judul: 'Teknik Membaca Informasi Nilai Gizi Kemasan',
    kategori: 'label',
    masalah: 'Sulit menilai apakah makanan kemasan tinggi garam.',
    solusi:
      'Cari baris "Natrium" pada tabel Informasi Nilai Gizi. Perhatikan jumlah sajian per kemasan, karena angka natrium biasanya untuk satu sajian saja. Bandingkan dua produk sejenis dan pilih yang natriumnya lebih rendah.',
    catatan: 'Pada daftar bahan, garam, kecap, penyedap (MSG), dan kaldu bubuk juga menambah natrium.',
  },
  {
    judul: 'Adaptasi Rasa Bersama Seluruh Anggota Keluarga',
    kategori: 'keluarga',
    masalah: 'Keluarga merasa masakan kurang enak saat garam dikurangi.',
    solusi:
      'Kurangi garam sedikit demi sedikit untuk seluruh keluarga, bukan memasak dua menu terpisah. Ajak keluarga memilih rempah favorit, dan jangan menaruh garam, kecap, atau saus botolan di meja makan.',
    catatan: 'Lidah perlu waktu untuk terbiasa. Biasanya dalam beberapa minggu rasa kurang asin terasa wajar.',
  },
  {
    judul: 'Atasi Keinginan Mengemil Asin di Malam Hari',
    kategori: 'kebiasaan',
    masalah: 'Sering ingin mengemil kerupuk atau keripik saat bersantai.',
    solusi:
      'Sediakan camilan pengganti yang mudah dijangkau: potongan buah, kacang rebus atau kacang sangrai tanpa garam, atau ubi rebus. Simpan camilan asin di tempat yang tidak terlihat, atau tidak membelinya.',
    catatan: 'Minum segelas air putih dulu. Kadang rasa haus terasa seperti lapar.',
  },
  {
    judul: 'Siapkan Bumbu Dasar Tanpa Garam',
    kategori: 'dapur',
    masalah: 'Tidak sempat meracik bumbu setiap hari sehingga tergoda memakai bumbu instan.',
    solusi:
      'Buat bumbu dasar putih (bawang merah dan bawang putih) dan bumbu dasar kuning (ditambah kunyit dan kemiri) tanpa garam. Tumis sebentar, simpan dalam wadah tertutup di lemari es, lalu pakai untuk beberapa hari.',
    catatan: 'Bumbu instan, kaldu bubuk, dan penyedap biasanya tinggi natrium.',
  },
  {
    judul: 'Mi Instan Sesekali? Pakai Separuh Bumbu',
    kategori: 'kebiasaan',
    masalah: 'Sesekali ingin makan mi instan.',
    solusi:
      'Pakai separuh bumbu atau kurang, lalu tambahkan sayur seperti sawi dan tomat, serta telur sebagai lauk. Tidak perlu menghabiskan kuahnya karena kuah mengandung banyak garam.',
    catatan: 'Jadikan mi instan makanan sesekali, bukan menu harian.',
  },
  {
    judul: 'Santan Encer & Cara Masak Rendah Minyak',
    kategori: 'dapur',
    masalah: 'Masakan rumahan sering digoreng atau bersantan kental.',
    solusi:
      'Pilih cara memasak dengan merebus, mengukus, memepes, atau memanggang. Untuk sayur bersantan, pakai santan encer, atau ganti dengan sayur bening dan sayur asem.',
    catatan: 'Bila menggoreng, pakai minyak secukupnya dan jangan dipakai berulang kali.',
  },
];
