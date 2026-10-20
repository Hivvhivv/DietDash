// Kuis LATIHAN. Bukan instrumen pretest/posttest penelitian.
// Jangan menyalin soal dari instrumen penelitian ke file ini.
// 0.2.0: tambah k11–k15 (DRAF, perlu validasi ahli) agar setiap modul punya 3 soal latihan.
export const VERSI_KUIS = '0.2.0';

export interface Soal {
  id: string;
  pertanyaan: string;
  pilihan: string[];
  jawaban: number; // indeks pilihan yang benar
  umpan_balik: string;
  modul_terkait: string; // id modul (nama file tanpa .md)
}

export const daftarSoal: Soal[] = [
  {
    id: 'k01',
    pertanyaan: 'Seseorang umumnya dikatakan mengalami hipertensi bila tekanan darahnya…',
    pilihan: [
      '120/80 mmHg pada satu kali pemeriksaan',
      '140/90 mmHg atau lebih pada beberapa kali pemeriksaan',
      'Terasa pusing setelah bangun tidur',
    ],
    jawaban: 1,
    umpan_balik:
      'Hipertensi ditentukan dari hasil pengukuran, umumnya 140/90 mmHg atau lebih pada beberapa kali pemeriksaan. Keluhan seperti pusing tidak selalu muncul.',
    modul_terkait: 'mengenal-hipertensi',
  },
  {
    id: 'k02',
    pertanyaan: 'Manakah faktor risiko hipertensi yang BISA kita ubah?',
    pilihan: ['Usia', 'Riwayat keluarga', 'Kebiasaan makan makanan asin'],
    jawaban: 2,
    umpan_balik:
      'Usia dan keturunan tidak bisa diubah, tetapi kebiasaan makan makanan asin bisa kita kurangi sedikit demi sedikit.',
    modul_terkait: 'mengenal-hipertensi',
  },
  {
    id: 'k03',
    pertanyaan: 'Apa arti kata "diet" dalam diet DASH?',
    pilihan: [
      'Pola makan sehari-hari yang dijalani jangka panjang',
      'Makan sangat sedikit agar cepat kurus',
      'Tidak makan nasi sama sekali',
    ],
    jawaban: 0,
    umpan_balik:
      'Dalam DASH, "diet" berarti pola makan sehari-hari. Tidak ada kelompok makanan yang dilarang sepenuhnya; yang diatur adalah jenis dan jumlahnya.',
    modul_terkait: 'mengenal-diet-dash',
  },
  {
    id: 'k04',
    pertanyaan: 'Pernyataan mana yang BENAR tentang diet DASH dan obat hipertensi?',
    pilihan: [
      'Bila sudah menjalani DASH, obat boleh dihentikan sendiri',
      'Diet DASH melengkapi pengobatan; perubahan obat harus dibicarakan dengan dokter',
      'Diet DASH dapat menyembuhkan hipertensi sepenuhnya',
    ],
    jawaban: 1,
    umpan_balik:
      'Diet DASH membantu mengendalikan tekanan darah bersama pengobatan. Jangan menghentikan atau mengubah obat tanpa berbicara dengan dokter.',
    modul_terkait: 'mengenal-diet-dash',
  },
  {
    id: 'k05',
    pertanyaan: 'Berapa batas garam yang dianjurkan per orang per hari?',
    pilihan: [
      'Paling banyak 1 sendok teh (±5 gram)',
      'Paling banyak 1 sendok makan (±15 gram)',
      'Tidak ada batas, asal tidak terasa terlalu asin',
    ],
    jawaban: 0,
    umpan_balik:
      'Anjurannya paling banyak 1 sendok teh (±5 gram) garam per hari, termasuk garam yang ada dalam kecap, penyedap, dan makanan kemasan.',
    modul_terkait: 'makanan-dan-porsi',
  },
  {
    id: 'k06',
    pertanyaan: 'Manakah lauk yang paling sesuai dengan prinsip DASH?',
    pilihan: ['Ikan asin goreng', 'Sosis goreng', 'Tempe kukus atau pepes ikan'],
    jawaban: 2,
    umpan_balik:
      'Tempe kukus dan pepes ikan rendah garam dan lemak jenuh. Ikan asin dan sosis biasanya tinggi natrium.',
    modul_terkait: 'makanan-dan-porsi',
  },
  {
    id: 'k07',
    pertanyaan: 'Manakah bahan berikut yang TINGGI natrium?',
    pilihan: ['Daun salam dan serai', 'Kecap asin dan penyedap rasa', 'Jahe dan kunyit'],
    jawaban: 1,
    umpan_balik:
      'Kecap asin dan penyedap rasa mengandung banyak natrium. Rempah seperti daun salam, serai, jahe, dan kunyit memberi rasa tanpa menambah natrium.',
    modul_terkait: 'menu-indonesia',
  },
  {
    id: 'k08',
    pertanyaan:
      'Label sebuah kemasan keripik menulis "Natrium 200 mg per sajian" dan "2 sajian per kemasan". Bila Anda menghabiskan satu bungkus, berapa natrium yang Anda makan?',
    pilihan: ['100 mg', '200 mg', '400 mg'],
    jawaban: 2,
    umpan_balik:
      'Satu bungkus berisi 2 sajian, jadi natriumnya 2 × 200 mg = 400 mg. Selalu perhatikan jumlah sajian per kemasan.',
    modul_terkait: 'menu-indonesia',
  },
  {
    id: 'k09',
    pertanyaan: 'Saat makan di warung, pilihan mana yang lebih sesuai dengan DASH?',
    pilihan: [
      'Ayam bakar tanpa kulit, sayur asem, dan sambal dipisah',
      'Ayam goreng tepung dengan kerupuk dan kuah yang banyak',
      'Mi instan dengan bumbu penuh',
    ],
    jawaban: 0,
    umpan_balik:
      'Lauk yang dibakar, tambahan sayur, dan sambal yang dipisah membantu mengurangi garam dan lemak.',
    modul_terkait: 'menu-indonesia',
  },
  {
    id: 'k10',
    pertanyaan: 'Manakah contoh target kebiasaan makan yang paling realistis?',
    pilihan: [
      'Mulai besok saya tidak akan makan garam sama sekali',
      'Saya makan satu buah setiap sore, minimal lima hari dalam seminggu',
      'Saya mau makan lebih sehat',
    ],
    jawaban: 1,
    umpan_balik:
      'Target yang baik itu jelas, kecil, dan bisa dicapai. "Satu buah setiap sore, lima hari seminggu" mudah diukur dan dijalankan.',
    modul_terkait: 'kebiasaan-sehat',
  },
  // ---- Soal tambahan 0.2.0 (TODO: validasi ahli) ----
  {
    id: 'k11',
    pertanyaan: 'Apa yang dapat terjadi bila tekanan darah tinggi tidak dikendalikan dalam waktu lama?',
    pilihan: [
      'Risiko stroke, penyakit jantung, dan penyakit ginjal meningkat',
      'Tidak ada akibat apa pun selama tidak terasa',
      'Hanya menyebabkan pusing sesaat',
    ],
    jawaban: 0,
    umpan_balik:
      'Tekanan darah yang tinggi dalam waktu lama dapat merusak pembuluh darah, sehingga risiko stroke, penyakit jantung, dan penyakit ginjal meningkat. Risiko ini bisa dikurangi dengan mengendalikan tekanan darah.',
    modul_terkait: 'mengenal-hipertensi',
  },
  {
    id: 'k12',
    pertanyaan: 'Zat dalam sayur, buah, kacang-kacangan, dan susu yang membantu menjaga tekanan darah antara lain…',
    pilihan: ['Natrium dan lemak jenuh', 'Kalium, magnesium, kalsium, dan serat', 'Gula dan pengawet'],
    jawaban: 1,
    umpan_balik:
      'Pola makan DASH kaya kalium, magnesium, kalsium, dan serat. Zat-zat ini membantu tubuh menjaga tekanan darah tetap stabil.',
    modul_terkait: 'mengenal-diet-dash',
  },
  {
    id: 'k13',
    pertanyaan: 'Manakah yang termasuk biji-bijian utuh?',
    pilihan: ['Roti tawar putih dan kue kering', 'Mi instan', 'Beras merah dan oat'],
    jawaban: 2,
    umpan_balik:
      'Beras merah, oat, jagung, dan roti gandum utuh termasuk biji-bijian utuh. Usahakan sedikitnya separuh makanan pokok berasal dari kelompok ini.',
    modul_terkait: 'makanan-dan-porsi',
  },
  {
    id: 'k14',
    pertanyaan: 'Cara yang lebih mudah untuk mengubah kebiasaan makan adalah…',
    pilihan: [
      'Mengubah semua kebiasaan sekaligus mulai besok',
      'Memulai dari satu atau dua perubahan kecil, lalu menambahnya sedikit demi sedikit',
      'Menunggu sampai ada keluhan',
    ],
    jawaban: 1,
    umpan_balik:
      'Perubahan kecil lebih mudah dijalankan dan dipertahankan. Setelah satu kebiasaan terasa biasa, tambahkan perubahan berikutnya.',
    modul_terkait: 'kebiasaan-sehat',
  },
  {
    id: 'k15',
    pertanyaan: 'Manakah lauk yang bergizi dan harganya terjangkau?',
    pilihan: ['Sosis dan kornet kalengan', 'Tempe dan tahu', 'Daging olahan beku'],
    jawaban: 1,
    umpan_balik:
      'Tempe, tahu, telur, dan kacang-kacangan bergizi dan terjangkau. Daging olahan biasanya tinggi garam dan lemak.',
    modul_terkait: 'kebiasaan-sehat',
  },
];

// Soal latihan untuk satu modul. Modul terakhir (rangkuman) memakai semua soal.
export function soalUntukModul(modulId: string): Soal[] {
  const pilihan = daftarSoal.filter((s) => s.modul_terkait === modulId);
  return pilihan.length ? pilihan : daftarSoal;
}
