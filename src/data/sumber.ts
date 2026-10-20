// Daftar sumber materi. Setiap modul merujuk sumber lewat `id`.
// Seluruh rujukan perlu dicek ulang oleh peneliti/ahli sebelum versi dibekukan.
export interface Sumber {
  id: string;
  sitasi: string;
  url?: string;
}

export const daftarSumber: Sumber[] = [
  {
    id: 'nhlbi-dash',
    sitasi:
      'National Heart, Lung, and Blood Institute (NHLBI). DASH Eating Plan. National Institutes of Health, Amerika Serikat.',
    url: 'https://www.nhlbi.nih.gov/education/dash-eating-plan',
  },
  {
    id: 'nhlbi-panduan',
    sitasi:
      'NHLBI. Your Guide to Lowering Your Blood Pressure with DASH. NIH Publication No. 06-4082; 2006.',
  },
  {
    id: 'appel-1997',
    sitasi:
      'Appel LJ, Moore TJ, Obarzanek E, dkk. A clinical trial of the effects of dietary patterns on blood pressure. N Engl J Med. 1997;336(16):1117–1124.',
  },
  {
    id: 'sacks-2001',
    sitasi:
      'Sacks FM, Svetkey LP, Vollmer WM, dkk. Effects on blood pressure of reduced dietary sodium and the Dietary Approaches to Stop Hypertension (DASH) diet. N Engl J Med. 2001;344(1):3–10.',
  },
  {
    id: 'filippou-2020',
    sitasi:
      'Filippou CD, Tsioufis CP, Thomopoulos CG, dkk. Dietary Approaches to Stop Hypertension (DASH) diet and blood pressure reduction in adults with and without hypertension: a systematic review and meta-analysis of randomized controlled trials. Adv Nutr. 2020;11(5):1150–1160.',
  },
  {
    id: 'perhi-2021',
    sitasi:
      'Perhimpunan Dokter Hipertensi Indonesia (PERHI). Konsensus Penatalaksanaan Hipertensi 2021.',
  },
  {
    id: 'who-hipertensi',
    sitasi: 'World Health Organization. Hypertension — Fact sheet.',
    url: 'https://www.who.int/news-room/fact-sheets/detail/hypertension',
  },
  {
    id: 'who-natrium',
    sitasi:
      'World Health Organization. Guideline: Sodium intake for adults and children. Jenewa: WHO; 2012.',
  },
  {
    id: 'riskesdas-2018',
    sitasi:
      'Kementerian Kesehatan RI. Laporan Nasional Riset Kesehatan Dasar (Riskesdas) 2018. Badan Penelitian dan Pengembangan Kesehatan.',
  },
  {
    id: 'pgs-2014',
    sitasi:
      'Peraturan Menteri Kesehatan RI Nomor 41 Tahun 2014 tentang Pedoman Gizi Seimbang.',
  },
  {
    id: 'permenkes-ggl',
    sitasi:
      'Peraturan Menteri Kesehatan RI Nomor 30 Tahun 2013 tentang Pencantuman Informasi Kandungan Gula, Garam, dan Lemak serta Pesan Kesehatan untuk Pangan Olahan dan Pangan Siap Saji (diubah dengan Permenkes Nomor 63 Tahun 2015).',
  },
  {
    id: 'bpom-label',
    sitasi:
      'Peraturan Badan Pengawas Obat dan Makanan Nomor 26 Tahun 2021 tentang Informasi Nilai Gizi pada Label Pangan Olahan.',
  },
];

export function ambilSumber(ids: string[]): Sumber[] {
  return ids.map((id) => {
    const s = daftarSumber.find((x) => x.id === id);
    if (!s) throw new Error(`Sumber tidak ditemukan: ${id}`);
    return s;
  });
}
