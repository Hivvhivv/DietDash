// Katalog resep "Menu Sehat": contoh hidangan Nusantara bergaya DASH (rendah garam, kaya sayur, dimasak tanpa banyak minyak).
// Bahan bacaan pendukung, bukan rencana diet yang dipersonalisasi. Catat perubahan isi di CHANGELOG-KONTEN.md.
// TODO: verifikasi sumber — resep, takaran, dan tingkat natrium/kalium/serat perlu ditinjau ahli gizi sebelum versi
// penelitian dikunci. Angka gizi (mg/gram) sengaja belum diisi; isi `angka` hanya dari perhitungan TKPI/ahli gizi.
export const VERSI_RESEP = '0.1.0';

export type WaktuMakan = 'sarapan' | 'siang' | 'malam' | 'selingan';
export type JenisBahan = 'ikan' | 'ayam' | 'telur' | 'nabati' | 'buah';
export type Tingkat = 'rendah' | 'sedang' | 'tinggi';
export type ElemenHidangan =
  | 'nasi'
  | 'nasi-merah'
  | 'jagung'
  | 'ubi'
  | 'lontong'
  | 'ikan'
  | 'pepes'
  | 'ayam'
  | 'telur'
  | 'tahu'
  | 'tempe'
  | 'sayur'
  | 'brokoli'
  | 'tomat'
  | 'buah'
  | 'pisang'
  | 'saus-kacang';

export const WAKTU_MAKAN: Record<WaktuMakan, { label: string; jam: string }> = {
  sarapan: { label: 'Sarapan', jam: '06.30–08.00' },
  siang: { label: 'Makan Siang', jam: '12.00–13.00' },
  malam: { label: 'Makan Malam', jam: '18.30–19.30' },
  selingan: { label: 'Selingan Sehat', jam: '' },
};

export const JENIS_BAHAN: Record<JenisBahan, string> = {
  ikan: 'Ikan',
  ayam: 'Ayam tanpa kulit',
  telur: 'Telur',
  nabati: 'Tahu, tempe & kacang',
  buah: 'Buah',
};

export interface Resep {
  kunci: string;
  nama: string;
  waktu: WaktuMakan;
  bahanUtama: JenisBahan;
  label: string; // keunggulan singkat, mis. "Tinggi serat"
  deskripsi: string;
  menit: number;
  porsi: string;
  metode: string;
  gizi: { natrium: Tingkat; kalium: Tingkat; serat: Tingkat };
  angka?: { natrium_mg: number; kalium_mg: number; serat_g: number }; // per porsi; hanya bila sudah dihitung ahli gizi
  rahasiaGurih: string;
  bahan: string[];
  langkah: string[];
  catatan?: string;
  ilustrasi: { wadah: 'piring' | 'mangkuk'; kuah?: string; isi: ElemenHidangan[] };
  foto?: string; // opsional: /gambar/menu/<berkas>.webp bila sudah ada foto asli
}

export const RESEP: Resep[] = [
  {
    kunci: 'tinutuan',
    nama: 'Bubur Manado (Tinutuan) + Telur Rebus',
    waktu: 'sarapan',
    bahanUtama: 'telur',
    label: 'Tinggi serat',
    deskripsi: 'Bubur beras dengan labu kuning, jagung pipil, bayam, dan kangkung. Aroma kemangi dan serai membuatnya harum tanpa banyak garam.',
    menit: 35,
    porsi: '2 orang',
    metode: 'Direbus',
    gizi: { natrium: 'rendah', kalium: 'tinggi', serat: 'tinggi' },
    rahasiaGurih: 'Rebus beras bersama serai dan daun salam, lalu masukkan kemangi di akhir. Aromanya kuat sehingga garam cukup sejumput.',
    bahan: [
      '½ gelas beras (bisa dicampur beras merah)',
      '1 potong labu kuning (±200 gram), potong dadu',
      '1 buah jagung manis, dipipil',
      '1 ikat kecil bayam dan 1 ikat kecil kangkung, dipetik',
      '1 genggam daun kemangi',
      '1 batang serai, memarkan; 2 lembar daun salam',
      '2 siung bawang putih, cincang',
      '2 butir telur, direbus',
      'Garam sejumput (paling banyak ¼ sendok teh untuk 2 porsi)',
    ],
    langkah: [
      'Rebus beras dengan ±1 liter air, serai, daun salam, dan bawang putih hingga beras mulai lunak.',
      'Masukkan labu kuning dan jagung. Masak sambil diaduk hingga labu hancur dan bubur mengental.',
      'Tambahkan bayam dan kangkung, masak sebentar sampai layu.',
      'Matikan api, masukkan kemangi, lalu cicipi. Tambahkan sejumput garam di akhir bila perlu.',
      'Sajikan hangat dengan telur rebus.',
    ],
    catatan: 'Sambal dabu-dabu (tomat, cabai, bawang merah, perasan jeruk) cocok sebagai pendamping tanpa tambahan garam.',
    ilustrasi: { wadah: 'mangkuk', kuah: '#f2c46b', isi: ['sayur', 'jagung', 'telur'] },
  },
  {
    kunci: 'ubi-jagung-tempe-kukus',
    nama: 'Ubi & Jagung Rebus + Tempe Kukus Bumbu Kuning',
    waktu: 'sarapan',
    bahanUtama: 'nabati',
    label: 'Kaya kalium',
    deskripsi: 'Sarapan sederhana dari ubi dan jagung rebus dengan tempe yang dikukus bersama bumbu kunyit, ketumbar, dan bawang putih.',
    menit: 25,
    porsi: '2 orang',
    metode: 'Direbus & dikukus',
    gizi: { natrium: 'rendah', kalium: 'tinggi', serat: 'tinggi' },
    rahasiaGurih: 'Haluskan kunyit, ketumbar, dan bawang putih, lalu lumuri tempe. Kukus bersama daun salam agar bumbu meresap tanpa digoreng.',
    bahan: [
      '2 buah ubi jalar ukuran sedang',
      '1 buah jagung manis, potong dua',
      '½ papan tempe, potong tebal',
      '2 cm kunyit, 1 sendok teh ketumbar, 2 siung bawang putih (dihaluskan)',
      '2 lembar daun salam',
      'Garam sejumput (boleh dilewatkan)',
    ],
    langkah: [
      'Rebus ubi dan jagung hingga empuk, angkat dan tiriskan.',
      'Lumuri tempe dengan bumbu halus, diamkan ±10 menit.',
      'Kukus tempe bersama daun salam selama ±15 menit.',
      'Sajikan ubi, jagung, dan tempe kukus selagi hangat.',
    ],
    ilustrasi: { wadah: 'piring', isi: ['ubi', 'jagung', 'tempe'] },
  },
  {
    kunci: 'pepes-nila-kemangi',
    nama: 'Pepes Ikan Nila Kuning Kemangi + Sayur Bening Bayam',
    waktu: 'siang',
    bahanUtama: 'ikan',
    label: 'Rendah natrium',
    deskripsi: 'Ikan nila dibumbui kunyit, jahe, dan kemangi, dibungkus daun pisang lalu dikukus. Ditemani sayur bening bayam dan nasi merah.',
    menit: 45,
    porsi: '2 orang',
    metode: 'Pepes (dikukus)',
    gizi: { natrium: 'rendah', kalium: 'tinggi', serat: 'sedang' },
    rahasiaGurih: 'Kemangi, tomat, belimbing wuluh, dan daun salam memberi rasa segar dan gurih alami tanpa penyedap atau garam berlebih.',
    bahan: [
      '2 ekor ikan nila ukuran sedang, bersihkan',
      '1 ikat daun kemangi, 1 buah tomat (iris), 4 buah belimbing wuluh (iris)',
      'Bumbu halus: 4 bawang merah, 3 bawang putih, 2 cm kunyit, 2 cm jahe, 3 kemiri sangrai',
      '2 lembar daun salam, 1 batang serai',
      'Daun pisang secukupnya',
      'Sayur bening: 1 ikat bayam, 1 buah jagung (dipipil), 2 bawang merah iris, 1 ruas temu kunci',
      'Nasi merah untuk 2 porsi',
    ],
    langkah: [
      'Lumuri ikan dengan bumbu halus, diamkan ±15 menit.',
      'Letakkan ikan di atas daun pisang, tambahkan kemangi, tomat, belimbing wuluh, salam, dan serai. Bungkus rapat.',
      'Kukus selama ±30 menit, lalu panggang sebentar di wajan tanpa minyak agar harum (boleh dilewati).',
      'Sayur bening: didihkan air dengan bawang merah dan temu kunci, masukkan jagung lalu bayam. Masak sebentar.',
      'Sajikan pepes dan sayur bening dengan nasi merah.',
    ],
    ilustrasi: { wadah: 'piring', isi: ['nasi-merah', 'pepes', 'sayur'] },
  },
  {
    kunci: 'ayam-panggang-lengkuas',
    nama: 'Ayam Ungkep Panggang Lengkuas + Sayur Asem Bening',
    waktu: 'siang',
    bahanUtama: 'ayam',
    label: 'Protein tanpa lemak',
    deskripsi: 'Dada ayam tanpa kulit diungkep dengan lengkuas dan ketumbar, lalu dipanggang tanpa minyak. Segar dengan sayur asem bening.',
    menit: 50,
    porsi: '2 orang',
    metode: 'Diungkep & dipanggang',
    gizi: { natrium: 'rendah', kalium: 'sedang', serat: 'sedang' },
    rahasiaGurih: 'Asam jawa dan tomat pada sayur asem membuat lidah tidak mencari garam. Lengkuas parut membuat ayam harum dan gurih.',
    bahan: [
      '2 potong dada ayam tanpa kulit',
      '3 cm lengkuas parut, 1 sendok teh ketumbar, 3 bawang putih, 2 cm kunyit (dihaluskan)',
      '2 lembar daun salam, 1 batang serai',
      'Sayur asem: labu siam, kacang panjang, jagung, melinjo, 2 buah tomat, 1 sendok makan asam jawa',
      'Garam paling banyak ¼ sendok teh untuk 2 porsi (ditambahkan di akhir)',
    ],
    langkah: [
      'Ungkep ayam dengan bumbu halus, salam, serai, dan ±1 gelas air hingga air menyusut dan ayam empuk.',
      'Panggang ayam di teflon atau bara api sampai kecokelatan, tanpa tambahan minyak.',
      'Sayur asem: rebus jagung dan melinjo, lalu masukkan labu siam, kacang panjang, tomat, dan air asam jawa.',
      'Cicipi rasa sayur di akhir sebelum menambahkan garam.',
    ],
    ilustrasi: { wadah: 'piring', isi: ['nasi', 'ayam', 'sayur'] },
  },
  {
    kunci: 'gado-gado-kukus',
    nama: 'Gado-gado Sayur Kukus + Saus Kacang Buatan Sendiri',
    waktu: 'siang',
    bahanUtama: 'nabati',
    label: 'Tinggi serat',
    deskripsi: 'Sayuran kukus, tahu, tempe, dan telur dengan saus kacang tanpa kecap asin dan tanpa terasi. Kerupuk diganti emping panggang sedikit atau dilewatkan.',
    menit: 30,
    porsi: '2 orang',
    metode: 'Dikukus',
    gizi: { natrium: 'sedang', kalium: 'tinggi', serat: 'tinggi' },
    rahasiaGurih: 'Sangrai kacang tanah tanpa garam, lalu haluskan bersama bawang putih, cabai, kencur, dan sedikit gula merah. Perasan jeruk limau membuatnya segar.',
    bahan: [
      'Kol, kacang panjang, tauge, wortel, dan bayam secukupnya',
      '1 potong tahu dan 1 potong tempe, dikukus',
      '1 butir telur rebus',
      '100 gram kacang tanah sangrai tanpa garam',
      '2 bawang putih, 1–2 cabai, 1 ruas kencur, 1 sendok teh gula merah',
      '1 buah jeruk limau',
    ],
    langkah: [
      'Kukus sayuran sebentar agar tetap renyah, lalu kukus tahu dan tempe.',
      'Haluskan kacang sangrai dengan bawang putih, cabai, kencur, dan gula merah. Tambahkan air matang hingga kental.',
      'Beri perasan jeruk limau pada saus kacang.',
      'Tata sayur, tahu, tempe, dan telur, lalu siram saus kacang secukupnya.',
    ],
    catatan: 'Saus kacang mengandung lemak. Pakai secukupnya, sekitar 2 sendok makan per porsi.',
    ilustrasi: { wadah: 'piring', isi: ['sayur', 'tahu', 'saus-kacang'] },
  },
  {
    kunci: 'sup-ikan-kuah-kuning',
    nama: 'Sup Ikan Kuah Kuning Kemangi',
    waktu: 'malam',
    bahanUtama: 'ikan',
    label: 'Rendah natrium',
    deskripsi: 'Ikan kembung atau patin dimasak dalam kuah kunyit, serai, dan jeruk nipis. Hangat, segar, dan ringan untuk makan malam.',
    menit: 30,
    porsi: '2 orang',
    metode: 'Direbus',
    gizi: { natrium: 'rendah', kalium: 'tinggi', serat: 'sedang' },
    rahasiaGurih: 'Tumis bumbu kuning dengan sedikit minyak sampai harum sebelum diberi air. Perasan jeruk nipis di akhir menambah rasa segar.',
    bahan: [
      '2 ekor ikan kembung (atau 2 potong patin)',
      'Bumbu halus: 4 bawang merah, 2 bawang putih, 3 cm kunyit, 2 cm jahe',
      '1 batang serai, 2 lembar daun jeruk, 1 ruas lengkuas',
      '1 buah tomat, 1 genggam kemangi, 1 buah jeruk nipis',
      'Garam sejumput (boleh dilewatkan)',
    ],
    langkah: [
      'Lumuri ikan dengan perasan jeruk nipis, diamkan sebentar, lalu bilas.',
      'Tumis bumbu halus dengan 1 sendok teh minyak bersama serai, daun jeruk, dan lengkuas hingga harum.',
      'Tuang ±600 ml air, didihkan, lalu masukkan ikan. Masak ±10 menit dengan api sedang.',
      'Masukkan tomat dan kemangi. Cicipi sebelum menambahkan garam.',
    ],
    ilustrasi: { wadah: 'mangkuk', kuah: '#f4c84f', isi: ['ikan', 'tomat', 'sayur'] },
  },
  {
    kunci: 'tumis-tahu-brokoli',
    nama: 'Tumis Tahu Brokoli Bawang Putih + Nasi Merah',
    waktu: 'malam',
    bahanUtama: 'nabati',
    label: 'Kaya magnesium',
    deskripsi: 'Tahu putih dan brokoli ditumis dengan bawang putih, jahe, dan sedikit minyak. Tanpa saus tiram dan kecap asin.',
    menit: 20,
    porsi: '2 orang',
    metode: 'Ditumis sedikit minyak',
    gizi: { natrium: 'rendah', kalium: 'sedang', serat: 'tinggi' },
    rahasiaGurih: 'Bawang putih yang ditumis sampai keemasan dan jahe iris memberi rasa gurih. Tambahkan sedikit air kaldu rebusan sayur buatan sendiri.',
    bahan: [
      '1 kotak tahu putih, potong dadu',
      '1 bonggol brokoli, potong per kuntum',
      '1 buah wortel, iris tipis',
      '4 siung bawang putih, 1 ruas jahe (iris)',
      '1 sendok makan minyak',
      'Nasi merah untuk 2 porsi',
    ],
    langkah: [
      'Panaskan minyak, tumis bawang putih dan jahe hingga harum.',
      'Masukkan wortel dan brokoli, beri sedikit air, masak hingga setengah matang.',
      'Masukkan tahu, aduk perlahan. Masak sebentar hingga bumbu rata.',
      'Sajikan dengan nasi merah.',
    ],
    ilustrasi: { wadah: 'piring', isi: ['nasi-merah', 'brokoli', 'tahu'] },
  },
  {
    kunci: 'sop-ayam-jahe',
    nama: 'Sop Ayam Bening Jahe + Sayuran',
    waktu: 'malam',
    bahanUtama: 'ayam',
    label: 'Hangat & ringan',
    deskripsi: 'Sop ayam tanpa kulit dengan wortel, kentang, buncis, dan seledri. Kaldu dari rebusan ayam dan rempah, tanpa kaldu bubuk.',
    menit: 40,
    porsi: '2 orang',
    metode: 'Direbus',
    gizi: { natrium: 'rendah', kalium: 'tinggi', serat: 'sedang' },
    rahasiaGurih: 'Bawang putih geprek, jahe, pala sedikit, dan daun bawang seledri membuat kaldu harum sehingga tidak perlu kaldu bubuk.',
    bahan: [
      '1 potong dada ayam tanpa kulit, potong-potong',
      '1 buah wortel, 1 buah kentang, 1 genggam buncis',
      '3 siung bawang putih geprek, 1 ruas jahe geprek, sejumput pala',
      'Daun bawang dan seledri secukupnya',
      'Garam paling banyak ¼ sendok teh untuk 2 porsi',
    ],
    langkah: [
      'Rebus ayam dengan bawang putih, jahe, dan pala ±20 menit. Buang busa yang muncul.',
      'Masukkan kentang dan wortel, masak hingga empuk, lalu buncis.',
      'Tambahkan daun bawang dan seledri. Cicipi sebelum menambahkan garam.',
    ],
    ilustrasi: { wadah: 'mangkuk', kuah: '#f6e7c4', isi: ['ayam', 'sayur', 'tomat'] },
  },
  {
    kunci: 'rujak-buah-segar',
    nama: 'Rujak Buah Segar Sambal Jeruk',
    waktu: 'selingan',
    bahanUtama: 'buah',
    label: 'Kaya kalium',
    deskripsi: 'Pepaya, bengkuang, nanas, dan jambu air dengan sambal jeruk ringan. Tanpa terasi dan tanpa garam tambahan.',
    menit: 15,
    porsi: '2 orang',
    metode: 'Tanpa dimasak',
    gizi: { natrium: 'rendah', kalium: 'tinggi', serat: 'tinggi' },
    rahasiaGurih: 'Haluskan cabai, sedikit gula merah, dan perasan jeruk limau. Rasa asam-pedas membuat rujak tetap nikmat tanpa terasi.',
    bahan: [
      'Pepaya, bengkuang, nanas, jambu air, dan mentimun secukupnya',
      '1–2 cabai rawit, 1 sendok makan gula merah sisir',
      '1 buah jeruk limau',
    ],
    langkah: [
      'Cuci dan potong buah sesuai selera.',
      'Haluskan cabai dan gula merah, lalu beri perasan jeruk limau dan sedikit air matang.',
      'Sajikan buah dengan sambal di wadah terpisah. Pakai sambal secukupnya.',
    ],
    ilustrasi: { wadah: 'piring', isi: ['buah', 'pisang', 'buah'] },
  },
  {
    kunci: 'kacang-hijau-jahe',
    nama: 'Bubur Kacang Hijau Jahe Santan Encer',
    waktu: 'selingan',
    bahanUtama: 'nabati',
    label: 'Kaya magnesium',
    deskripsi: 'Kacang hijau direbus dengan jahe dan daun pandan, diberi sedikit gula aren dan santan encer.',
    menit: 45,
    porsi: '4 orang',
    metode: 'Direbus',
    gizi: { natrium: 'rendah', kalium: 'tinggi', serat: 'tinggi' },
    rahasiaGurih: 'Jahe dan pandan memberi aroma hangat sehingga gula cukup sedikit. Santan dibuat encer dan tidak perlu diberi garam.',
    bahan: [
      '150 gram kacang hijau, rendam ±2 jam',
      '2 ruas jahe geprek, 2 lembar daun pandan',
      '2 sendok makan gula aren sisir',
      '1 gelas santan encer',
    ],
    langkah: [
      'Rebus kacang hijau dengan ±1 liter air, jahe, dan pandan hingga merekah.',
      'Masukkan gula aren, aduk sampai larut.',
      'Tuang santan encer, masak sebentar sambil diaduk agar tidak pecah.',
    ],
    catatan: 'Untuk Anda yang juga mengatur gula darah, kurangi gula aren atau bicarakan dengan ahli gizi.',
    ilustrasi: { wadah: 'mangkuk', kuah: '#b8c98a', isi: ['saus-kacang', 'sayur'] },
  },
  {
    kunci: 'pisang-yogurt',
    nama: 'Pisang & Pepaya dengan Yogurt Tawar',
    waktu: 'selingan',
    bahanUtama: 'buah',
    label: 'Sumber kalsium',
    deskripsi: 'Potongan pisang dan pepaya dengan yogurt tawar rendah lemak dan taburan kacang tanah sangrai tanpa garam.',
    menit: 5,
    porsi: '1 orang',
    metode: 'Tanpa dimasak',
    gizi: { natrium: 'rendah', kalium: 'tinggi', serat: 'sedang' },
    rahasiaGurih: 'Rasa manis alami pisang matang sudah cukup, sehingga tidak perlu tambahan gula atau susu kental manis.',
    bahan: ['1 buah pisang', '1 potong pepaya', '½ gelas yogurt tawar rendah lemak', '1 sendok makan kacang tanah sangrai tanpa garam'],
    langkah: ['Potong pisang dan pepaya.', 'Tuang yogurt tawar di atasnya.', 'Taburi kacang sangrai dan sajikan.'],
    ilustrasi: { wadah: 'mangkuk', kuah: '#fbf6ec', isi: ['pisang', 'buah', 'pisang'] },
  },
];

export const LABEL_TINGKAT: Record<Tingkat, string> = { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' };

export function cariResep(kunci: string): Resep | undefined {
  return RESEP.find((r) => r.kunci === kunci);
}

// Menu pilihan hari ini: berganti setiap hari (zona Asia/Jakarta), sama untuk semua responden.
export function resepHariIni(tanggal = new Date()): Resep {
  const hari = Math.floor((tanggal.getTime() + 7 * 3600_000) / 86_400_000);
  const kandidat = RESEP.filter((r) => r.waktu === 'siang' || r.waktu === 'malam');
  return kandidat[hari % kandidat.length];
}
