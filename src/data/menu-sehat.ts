// Isi halaman "Menu Sehat": pengetahuan makanan yang dianjurkan dan yang perlu dibatasi dalam pola makan DASH.
// Bahan bacaan pendukung (bukan bagian modul). Disarikan dari naskah benih Modul 2–4.
// TODO: verifikasi sumber — validasi ahli gizi untuk ukuran porsi dan contoh makanan sebelum versi penelitian dikunci.
// Catat perubahan isi di CHANGELOG-KONTEN.md.
export const VERSI_MENU_SEHAT = '0.1.0';

export interface Makanan {
  emoji: string;
  nama: string;
}

export interface KelompokDianjurkan {
  kunci: string;
  judul: string;
  manfaat: string;
  porsi: string; // ukuran rumah tangga
  anjuran: string; // contoh jumlah per hari pada kebutuhan ±2.000 kalori (NHLBI)
  contoh: Makanan[];
}

export const DIANJURKAN: KelompokDianjurkan[] = [
  {
    kunci: 'sayur',
    judul: 'Sayuran',
    manfaat: 'Kaya serat, kalium, dan magnesium yang membantu menjaga tekanan darah.',
    porsi: '1 porsi = ½ mangkuk sayur matang atau 1 mangkuk sayur daun mentah',
    anjuran: '4–5 porsi sehari',
    contoh: [
      { emoji: '🥬', nama: 'Bayam' },
      { emoji: '🥬', nama: 'Kangkung' },
      { emoji: '🥦', nama: 'Brokoli' },
      { emoji: '🥕', nama: 'Wortel' },
      { emoji: '🍅', nama: 'Tomat' },
      { emoji: '🫛', nama: 'Buncis' },
    ],
  },
  {
    kunci: 'buah',
    judul: 'Buah-buahan',
    manfaat: 'Sumber kalium dan serat. Pilih buah utuh daripada jus kemasan yang sering diberi gula.',
    porsi: '1 porsi = 1 buah ukuran sedang atau ½ mangkuk potongan buah',
    anjuran: '4–5 porsi sehari',
    contoh: [
      { emoji: '🍌', nama: 'Pisang' },
      { emoji: '🧡', nama: 'Pepaya' },
      { emoji: '🍊', nama: 'Jeruk' },
      { emoji: '🍉', nama: 'Semangka' },
      { emoji: '🍈', nama: 'Melon' },
      { emoji: '🍎', nama: 'Apel' },
    ],
  },
  {
    kunci: 'pokok',
    judul: 'Biji-bijian utuh & umbi',
    manfaat: 'Sumber tenaga yang kaya serat. Usahakan sedikitnya separuh makanan pokok berupa biji-bijian utuh.',
    porsi: '1 porsi = ½ gelas nasi matang atau 1 lembar roti',
    anjuran: '6–8 porsi sehari',
    contoh: [
      { emoji: '🍚', nama: 'Beras merah' },
      { emoji: '🌽', nama: 'Jagung' },
      { emoji: '🥣', nama: 'Oat' },
      { emoji: '🍠', nama: 'Ubi rebus' },
      { emoji: '🥔', nama: 'Kentang rebus' },
      { emoji: '🍞', nama: 'Roti gandum utuh' },
    ],
  },
  {
    kunci: 'nabati',
    judul: 'Protein nabati & kacang-kacangan',
    manfaat: 'Kaya protein, serat, dan magnesium. Harganya terjangkau dan mudah didapat.',
    porsi: '1 porsi = 1 potong sedang tempe atau tahu, atau ½ gelas kacang matang',
    anjuran: '4–5 porsi seminggu (kacang-kacangan)',
    contoh: [
      { emoji: '🟫', nama: 'Tempe' },
      { emoji: '⬜', nama: 'Tahu' },
      { emoji: '🫘', nama: 'Kacang hijau' },
      { emoji: '🫘', nama: 'Kacang merah' },
      { emoji: '🥜', nama: 'Kacang tanah tanpa garam' },
    ],
  },
  {
    kunci: 'hewani',
    judul: 'Ikan, ayam tanpa kulit & telur',
    manfaat: 'Sumber protein. Pilih yang dikukus, direbus, dipepes, atau dibakar.',
    porsi: 'Sepotong ikan atau ayam ukuran sedang ≈ 2–3 porsi',
    anjuran: 'Maksimal 6 porsi sehari',
    contoh: [
      { emoji: '🐟', nama: 'Ikan kembung' },
      { emoji: '🐟', nama: 'Ikan nila / lele' },
      { emoji: '🍗', nama: 'Ayam tanpa kulit' },
      { emoji: '🥚', nama: 'Telur rebus' },
    ],
  },
  {
    kunci: 'susu',
    judul: 'Susu rendah lemak',
    manfaat: 'Sumber kalsium. Bila tidak minum susu, kalsium juga ada di tahu, tempe, ikan teri tawar, dan sayuran hijau.',
    porsi: '1 porsi = 1 gelas susu (±240 ml) atau 1 gelas yogurt tawar',
    anjuran: '2–3 porsi sehari',
    contoh: [
      { emoji: '🥛', nama: 'Susu rendah lemak' },
      { emoji: '🥣', nama: 'Yogurt tawar' },
    ],
  },
];

export interface KelompokDibatasi {
  kunci: string;
  judul: string;
  alasan: string;
  contoh: string[];
  ganti: string;
}

export const DIBATASI: KelompokDibatasi[] = [
  {
    kunci: 'garam',
    judul: 'Garam & makanan asin',
    alasan: 'Natrium (zat dalam garam) berlebih membuat tubuh menahan cairan sehingga tekanan darah naik. Batas garam paling banyak 1 sendok teh (±5 gram) per orang per hari dari semua sumber.',
    contoh: ['Ikan asin, telur asin', 'Kecap asin, penyedap, kaldu bubuk', 'Terasi, saus botolan', 'Mi instan, kerupuk, makanan kaleng'],
    ganti: 'Bumbu rempah: bawang, jahe, kunyit, serai, daun salam, perasan jeruk nipis.',
  },
  {
    kunci: 'lemak',
    judul: 'Lemak jenuh',
    alasan: 'Terlalu banyak lemak jenuh kurang baik bagi jantung dan pembuluh darah.',
    contoh: ['Gorengan', 'Santan kental', 'Jeroan dan kulit ayam', 'Mentega, daging berlemak'],
    ganti: 'Rebus, kukus, pepes, panggang, atau tumis dengan sedikit minyak; santan encer.',
  },
  {
    kunci: 'olahan',
    judul: 'Daging olahan',
    alasan: 'Biasanya tinggi garam dan lemak.',
    contoh: ['Sosis', 'Kornet', 'Dendeng', 'Nugget beku'],
    ganti: 'Tempe, tahu, telur, atau ikan segar.',
  },
  {
    kunci: 'gula',
    judul: 'Gula & minuman manis',
    alasan: 'Minuman dan makanan manis menambah gula tanpa banyak zat gizi.',
    contoh: ['Minuman manis kemasan', 'Es teh manis, sirup', 'Kue manis, susu kental manis'],
    ganti: 'Air putih, teh tawar, atau air dengan irisan jeruk nipis; buah segar sebagai camilan.',
  },
];

// Pembagian isi piring "Isi Piringku" (Pedoman Gizi Seimbang): separuh sayur & buah, separuh makanan pokok & lauk.
// TODO: verifikasi sumber — cocokkan proporsi dengan Permenkes 41/2014 bersama ahli gizi.
export const ISI_PIRING = [
  { bagian: 'Sayur', porsi: '⅓ piring', persen: 33.3, warna: 'sayur' },
  { bagian: 'Buah', porsi: '⅙ piring', persen: 16.7, warna: 'buah' },
  { bagian: 'Makanan pokok', porsi: '⅓ piring', persen: 33.3, warna: 'pokok' },
  { bagian: 'Lauk', porsi: '⅙ piring', persen: 16.7, warna: 'lauk' },
] as const;

export const CARA_MASAK = {
  anjur: ['Merebus', 'Mengukus', 'Membuat pepes', 'Memanggang atau membakar', 'Menumis dengan sedikit minyak'],
  kurangi: ['Menggoreng dengan banyak minyak', 'Menggoreng berulang kali', 'Memakai santan kental', 'Menambah garam di awal memasak'],
};
