/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UMKM, PKFKP } from '@/src/types';

export const DUMMY_PER_KECAMATAN = 10;

export const DUMMY_CLEARED_PREFIX = 'dummy_cleared_';

export function isDummyUMKM(u: Pick<UMKM, 'id' | 'is_dummy'>): boolean {
  return !!u.is_dummy || u.id.startsWith('dummy_');
}

export function isDummyClearedMarker(u: Pick<UMKM, 'id'>): boolean {
  return u.id.startsWith(DUMMY_CLEARED_PREFIX);
}

interface Template {
  nama: (kec: string) => string;
  kategori: UMKM['kategori'];
  deskripsi: (kec: string) => string;
  produk: { nama: string; harga: number; deskripsi: string; foto: string }[];
  foto: string;
}

const img = (id: string, w = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const TEMPLATES: Template[] = [
  {
    nama: (k) => `Seblak Teh Imas ${k}`,
    kategori: 'kuliner',
    deskripsi: (k) => `Seblak prasmanan dengan kencur segar dan level pedas bisa diatur. Buka tiap sore di ${k}, tersedia juga seblak kering kemasan untuk oleh-oleh.`,
    produk: [
      { nama: 'Seblak Prasmanan Komplit', harga: 15000, deskripsi: 'Kerupuk, makaroni, sosis, ceker, dan telur dimasak dengan bumbu kencur khas.', foto: img('photo-1555126634-323283e090fa', 400) },
      { nama: 'Seblak Kering Pouch 100gr', harga: 18000, deskripsi: 'Seblak instan kering, tinggal seduh air panas. Tahan 3 bulan.', foto: img('photo-1599490659213-e2b9527bb087', 400) },
    ],
    foto: img('photo-1555126634-323283e090fa'),
  },
  {
    nama: (k) => `Kopi Tanah Priangan ${k}`,
    kategori: 'kuliner',
    deskripsi: () => `Kedai dan roastery kopi kecil yang mengolah biji arabika dan robusta dari petani Priangan Timur. Cocok untuk ngopi santai maupun beli biji untuk dibawa pulang.`,
    produk: [
      { nama: 'Biji Kopi Arabika 200gr', harga: 55000, deskripsi: 'Medium roast, aroma floral dengan after taste manis.', foto: img('photo-1559056199-641a0ac8b55e', 400) },
      { nama: 'Es Kopi Susu Aren', harga: 18000, deskripsi: 'Espresso, susu segar, dan gula aren asli.', foto: img('photo-1514432324607-a09d9b4aefdd', 400) },
    ],
    foto: img('photo-1442512595331-e89e73853f31'),
  },
  {
    nama: (k) => `Dapur Kue Bu Neneng ${k}`,
    kategori: 'kuliner',
    deskripsi: () => `Usaha kue basah dan kue kering rumahan menerima pesanan harian, hajatan, dan parcel Lebaran. Menggunakan bahan tanpa pengawet.`,
    produk: [
      { nama: 'Nastar Keju Toples 500gr', harga: 85000, deskripsi: 'Nastar lembut berisi selai nanas homemade dengan taburan keju.', foto: img('photo-1558961363-fa8fdf82db35', 400) },
      { nama: 'Paket Kue Basah 20 pcs', harga: 60000, deskripsi: 'Isi risoles, lemper, dadar gulung, dan kue lapis.', foto: img('photo-1486427944299-d1955d23e34d', 400) },
    ],
    foto: img('photo-1486427944299-d1955d23e34d'),
  },
  {
    nama: (k) => `Bordir Kreasi ${k}`,
    kategori: 'fashion',
    deskripsi: (k) => `Konveksi dan butik bordir tangan serta mesin khas Tasikmalaya. Melayani kebaya, mukena, kerudung, dan seragam bordir pesanan dari ${k} dan sekitarnya.`,
    produk: [
      { nama: 'Mukena Bordir Katun Rayon', harga: 275000, deskripsi: 'Mukena adem dengan bordir halus di bagian dada dan tepi.', foto: img('photo-1610030469983-98e550d6193c', 400) },
      { nama: 'Kerudung Voal Bordir', harga: 95000, deskripsi: 'Kerudung segi empat bordir pinggir, tersedia 8 warna.', foto: img('photo-1583744946564-b52ac1c389c8', 400) },
    ],
    foto: img('photo-1610030469983-98e550d6193c'),
  },
  {
    nama: (k) => `Anyaman Pandan Sari ${k}`,
    kategori: 'kerajinan',
    deskripsi: () => `Pengrajin muda yang mengembangkan anyaman pandan dan mendong menjadi tas, tempat tisu, dan hiasan rumah bergaya modern. Bahan dari pengrajin lokal.`,
    produk: [
      { nama: 'Tas Anyaman Pandan Bulat', harga: 125000, deskripsi: 'Tas tangan anyaman rapat dengan lapisan kain dan resleting.', foto: img('photo-1591081658714-f576fb7ea3ed', 400) },
      { nama: 'Tempat Tisu Mendong', harga: 35000, deskripsi: 'Tempat tisu anyaman rapi, cocok untuk meja makan.', foto: img('photo-1600121848594-d8644e57abab', 400) },
    ],
    foto: img('photo-1513519245088-0e12902e5a38'),
  },
  {
    nama: (k) => `Payung Geulis Dewi ${k}`,
    kategori: 'kerajinan',
    deskripsi: () => `Kerajinan payung hias lukis tangan terinspirasi payung geulis Tasikmalaya. Untuk dekorasi, properti foto pernikahan, dan suvenir.`,
    produk: [
      { nama: 'Payung Hias Lukis Diameter 60cm', harga: 150000, deskripsi: 'Payung kertas lukis tangan motif bunga, dekoratif.', foto: img('photo-1520975661595-6453be3f7070', 400) },
      { nama: 'Gantungan Kunci Payung Mini', harga: 12000, deskripsi: 'Suvenir payung mini untuk oleh-oleh dan hampers.', foto: img('photo-1513364776144-60967b0f800f', 400) },
    ],
    foto: img('photo-1513364776144-60967b0f800f'),
  },
  {
    nama: (k) => `Servis & Laundry Express ${k}`,
    kategori: 'jasa',
    deskripsi: (k) => `Layanan laundry kiloan dan satuan dengan antar-jemput gratis untuk area ${k}. Selesai 24 jam untuk paket express.`,
    produk: [
      { nama: 'Laundry Kiloan Reguler', harga: 7000, deskripsi: 'Cuci setrika per kilogram, selesai 2 hari.', foto: img('photo-1545173168-9f1947eebb7f', 400) },
      { nama: 'Cuci Sepatu & Tas', harga: 35000, deskripsi: 'Cuci dalam-luar dengan perawatan bahan.', foto: img('photo-1582735689369-4fe89db7114c', 400) },
    ],
    foto: img('photo-1545173168-9f1947eebb7f'),
  },
  {
    nama: (k) => `Fotografi & Videografi ${k} Creative`,
    kategori: 'jasa',
    deskripsi: () => `Jasa dokumentasi acara, foto produk, prewedding, dan video promosi untuk UMKM. Tim anak muda dengan peralatan lengkap.`,
    produk: [
      { nama: 'Paket Foto Produk 10 Foto', harga: 250000, deskripsi: 'Foto produk dengan background bersih dan editing.', foto: img('photo-1492691527719-9d1e07e534b4', 400) },
      { nama: 'Paket Dokumentasi Acara 4 Jam', harga: 1200000, deskripsi: 'Foto dan video dokumentasi, hasil dalam 5 hari.', foto: img('photo-1511795409834-ef04bbd61622', 400) },
    ],
    foto: img('photo-1492691527719-9d1e07e534b4'),
  },
  {
    nama: (k) => `Tani Muda Organik ${k}`,
    kategori: 'pertanian',
    deskripsi: (k) => `Kelompok tani muda ${k} yang membudidayakan sayuran organik dan hidroponik. Dijual segar langsung kebun atau paket langganan mingguan.`,
    produk: [
      { nama: 'Paket Sayur Organik Mingguan', harga: 75000, deskripsi: 'Isi 6 jenis sayur segar sesuai panen, diantar tiap Sabtu.', foto: img('photo-1540420773420-3366772f4999', 400) },
      { nama: 'Selada Hidroponik 250gr', harga: 15000, deskripsi: 'Selada segar tanpa pestisida kimia.', foto: img('photo-1622205313162-be1d5712a43f', 400) },
    ],
    foto: img('photo-1500382017468-9049fed747ef'),
  },
  {
    nama: (k) => `Digital Desa ${k}`,
    kategori: 'teknologi',
    deskripsi: () => `Jasa pembuatan website, desain kemasan, dan pengelolaan media sosial untuk pelaku UMKM. Membantu usaha lokal go digital.`,
    produk: [
      { nama: 'Paket Katalog Online + Toko Marketplace', harga: 1500000, deskripsi: 'Setup toko, foto produk, dan deskripsi untuk marketplace.', foto: img('photo-1460925895917-afdab827c52f', 400) },
      { nama: 'Desain Logo & Kemasan', harga: 450000, deskripsi: 'Desain logo dan label kemasan dengan 2x revisi.', foto: img('photo-1626785774573-4b799315345d', 400) },
    ],
    foto: img('photo-1460925895917-afdab827c52f'),
  },
];

// Template ke-10: usaha kategori "lainnya" (dibuat terpisah supaya sebaran kategori beragam).
TEMPLATES.push({
  nama: (k) => `Toko Perlengkapan Bayi & Ibu ${k}`,
  kategori: 'lainnya',
  deskripsi: (k) => `Toko perlengkapan bayi, ibu, dan kebutuhan rumah tangga di ${k}. Melayani pembelian langsung dan pesan antar lewat WhatsApp.`,
  produk: [
    { nama: 'Paket Hampers Newborn', harga: 225000, deskripsi: 'Isi bedong, sarung tangan, topi, dan perlengkapan mandi bayi.', foto: img('photo-1522771930-78848d9293e8', 400) },
    { nama: 'Botol Susu Kaca 240ml', harga: 65000, deskripsi: 'Botol kaca tahan panas dengan dot silikon.', foto: img('photo-1584515933487-779824d29309', 400) },
  ],
  foto: img('photo-1522771930-78848d9293e8'),
});

const OWNER_NAMES = [
  'Imas Siti Rohimah', 'Rian Hidayat', 'Neneng Kartika', 'Yayan Suryana', 'Lilis Suryani',
  'Asep Saepudin', 'Dewi Nurjanah', 'Yusuf Maulana', 'Nia Kurniasih', 'Ujang Ramdani',
  'Euis Komariah', 'Dede Supriatna', 'Rini Marlina', 'Fahmi Nugraha', 'Tati Rohaeti',
  'Ridwan Fauzi', 'Santi Wulandari', 'Agus Setiawan', 'Yuni Amalia', 'Deni Gunawan',
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function buildDummyUMKMs(pk: PKFKP): UMKM[] {
  const base = hash(pk.id);
  return TEMPLATES.slice(0, DUMMY_PER_KECAMATAN).map((t, i) => {
    const owner = OWNER_NAMES[(base + i * 7) % OWNER_NAMES.length];
    // Nomor dummy 08xx-0000-xxxx, tidak dipakai nomor aktif nyata.
    const wa = `62812${String(base % 1000).padStart(3, '0')}${String(1000 + i).padStart(4, '0')}`;
    return {
      id: `dummy_${pk.id}_${i + 1}`,
      pk_id: pk.id,
      nama_usaha: t.nama(pk.nama_kecamatan),
      nama_pemilik: owner,
      kategori: t.kategori,
      deskripsi: t.deskripsi(pk.nama_kecamatan),
      produk_jasa: t.produk.map(p => p.nama),
      foto_url: t.foto,
      no_whatsapp: wa,
      kecamatan: pk.nama_kecamatan,
      is_active: true,
      is_dummy: true,
      created_at: '2026-01-20T08:00:00Z',
      status: 'approved',
      has_katalog: true,
      katalog: t.produk.map(p => ({ nama_produk: p.nama, harga: p.harga, deskripsi: p.deskripsi, foto_url: p.foto })),
    } as UMKM;
  });
}
