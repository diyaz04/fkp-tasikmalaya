/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './firebase';
import { 
  ProfilOrganisasi, 
  PKFKP, 
  Berita, 
  Agenda, 
  UMKM, 
  Kontak 
} from '@/src/types';

// ==========================================
// 1. ERROR HANDLERS (As required by skill)
// ==========================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Info:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection if configured
if (isFirebaseConfigured) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration: Client is offline.");
      }
    }
  };
  testConnection();
}

// ==========================================
// 2. SEED DATA FOR LOCALSTORAGE FALLBACK
// ==========================================

export const DEFAULT_PROFIL: ProfilOrganisasi = {
  id: "fkp_dpd_profile_default",
  nama_organisasi: "Forum Kewirausahaan Pemuda Kabupaten Tasikmalaya",
  singkatan: "FKP Tasikmalaya",
  visi: "Terwujudnya Wirausaha Muda Kabupaten Tasikmalaya yang Inovatif, Mandiri, Berkarakter, dan Berdaya Saing Global di Era Digital.",
  misi: [
    "Menanamkan jiwa kewirausahaan (entrepreneurship) di kalangan pemuda Kabupaten Tasikmalaya.",
    "Mendorong sinergi dan kolaborasi pentahelix antara pemerintah, akademisi, komunitas wirausaha, industri, dan media.",
    "Memfasilitasi peningkatan kompetensi wirausaha muda melalui pelatihan, mentoring, dan akses teknologi modern.",
    "Memperluas jejaring pasar dan akses modal usaha bagi wirausaha pemuda di setiap kecamatan."
  ],
  sejarah: "Forum Kewirausahaan Pemuda (FKP) Kabupaten Tasikmalaya dibentuk sebagai wadah berhimpun dan kolaborasi para pelaku usaha generasi muda di wilayah Kabupaten Tasikmalaya. Didorong oleh besarnya potensi produk lokal dan kearifan lokal seperti kerajinan bordir Singaparna, payung geulis, anyaman rajapolah, hingga kuliner khas Tasikmalaya, FKP hadir untuk mensinergikan kekuatan wirausaha muda di tingkat Kecamatan hingga Kabupaten guna meningkatkan perekonomian daerah.",
  logo_url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80",
  hero_title: "Sinergi Pemuda, Sukses Berwirausaha!",
  hero_subtitle: "Wadah Kolaborasi, Kreasi, dan Transaksi Wirausaha Muda Kabupaten Tasikmalaya Menuju Kemandirian Ekonomi.",
  hero_bg_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
  hero_mode: "static",
  hero_blur_level: "md",
  nama_ketua_dpd: "Aris Rahman, M.Pd.",
  foto_ketua_dpd: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  nama_sekretaris_dpd: "Nanda Septian, S.Kom.",
  foto_sekretaris_dpd: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  nama_bendahara_dpd: "Rina Marlina, S.Ak.",
  foto_bendahara_dpd: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  updated_at: "2026-06-02T14:30:00Z",
  featured_umkm_ids: []
};

const DEFAULT_PKS: PKFKP[] = [
  {
    id: "pk_singaparna",
    nama_kecamatan: "Singaparna",
    foto_ketua_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    nama_ketua: "Hendra Gunawan, S.E.",
    deskripsi: "Kecamatan Singaparna merupakan ibu kota Kabupaten Tasikmalaya, dengan fokus pengembangan sosiopreneur, kuliner olahan lokal, serta pusat akselerasi digital bagi wirausaha muda.",
    pengurus: [
      { jabatan: "Ketua", nama: "Hendra Gunawan, S.E.", foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
      { jabatan: "Wakil Ketua", nama: "Ahmad Fauzi", foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
      { jabatan: "Sekretaris", nama: "Siti Rahmawati", foto_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
      { jabatan: "Bendahara", nama: "Dewi Lestari", foto_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80" }
    ],
    is_active: true,
    created_at: "2026-01-10T08:00:00Z",
    email: "pk.singaparna@gmail.com"
  },
  {
    id: "pk_rajapolah",
    nama_kecamatan: "Rajapolah",
    foto_ketua_url: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=400&q=80",
    nama_ketua: "Dian Nurhidayat",
    deskripsi: "Pusat kerajinan anyaman mendong, bambu, dan industri kreatif anyaman tangan. PK FKP Rajapolah membina ratusan UMKM kerajinan untuk pasar ekspor.",
    pengurus: [
      { jabatan: "Ketua", nama: "Dian Nurhidayat", foto_url: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=400&q=80" },
      { jabatan: "Sekretaris", nama: "Irvan Maulana", foto_url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80" },
      { jabatan: "Bendahara", nama: "Neni Maryani", foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" }
    ],
    is_active: true,
    created_at: "2026-01-15T08:00:00Z",
    email: "pk.rajapolah@gmail.com"
  },
  {
    id: "pk_ciawi",
    nama_kecamatan: "Ciawi",
    foto_ketua_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    nama_ketua: "Riska Rahmawati",
    deskripsi: "Gerbang perdagangan utara Kabupaten Tasikmalaya yang aktif membina usaha sektor agribisnis, peternakan, serta perdagangan jasa pemuda.",
    pengurus: [
      { jabatan: "Ketua", nama: "Riska Rahmawati", foto_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80" },
      { jabatan: "Sekretaris", nama: "Dani Ramdani", foto_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" }
    ],
    is_active: true,
    created_at: "2026-02-01T08:00:00Z",
    email: "pk.ciawi@gmail.com"
  }
];

const DEFAULT_BERITA: Berita[] = [
  {
    id: "b_1",
    judul: "Dukung Digitalisasi, FKP Kabupaten Tasikmalaya Gelar Roadshow UMKM Kecamatan",
    slug: "dukung-digitalisasi-fkp-kabupaten-tasikmalaya-gelar-roadshow-umkm",
    konten: "<p>Dalam upaya mendorong wirausaha muda naik kelas, Pengurus DPD Forum Kewirausahaan Pemuda (FKP) Kabupaten Tasikmalaya menyelenggarakan rangkaian Roadshow Digitalisasi UMKM ke berbagai kecamatan.</p><p>Acara perdana dimulai di Singaparna dan diikuti oleh puluhan peserta dari kalangan wirausaha muda. Dalam materi yang disampaikan, narasumber menekankan pentingnya adopsi e-commerce, optimalisasi media sosial, pencatatan keuangan tersistem, serta pendaftaran legalitas usaha seperti NIB (Nomor Induk Berusaha).</p><p>Hendra Gunawan, Ketua PK FKP Singaparna menyatakan, 'Kegiatan seperti ini sangat kami butuhkan untuk membuka mindset teman-teman di kecamatan agar tidak tertinggal eksistensi produknya di kancah nasional.'</p>",
    thumbnail_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
    penulis: "Humas DPD",
    sumber: "dpd",
    pk_id: null,
    status: "published",
    catatan_review: null,
    published_at: "2026-05-20T09:00:00Z",
    created_at: "2026-05-19T08:00:00Z"
  },
  {
    id: "b_2",
    judul: "Rajapolah Kerajinan Festival: Kebangkitan Ekonomi Pemuda Kreatif",
    slug: "rajapolah-kerajinan-festival-kebangkitan-ekonomi-pemuda-kreatif",
    konten: "<p>Pengurus Kecamatan (PK) FKP Rajapolah menggelar Rajapolah Kerajinan Festival yang menghadirkan aneka kreasi anyaman mendong, bambu, dan serat alam hasil karya pengrajin muda.</p><p>Festival ini berhasil menarik minat buyar daerah maupun nasional. Dian Nurhidayat selaku ketua PK mengemukakan bahwa kerajinan Rajapolah kini tampil dengan desain modern untuk menyesuaikan estetika milenial dan gen-Z, seperti tas anyaman minimalis, hiasan dinding boho, dan tempat penyimpanan eco-friendly.</p>",
    thumbnail_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    penulis: "Dian Nurhidayat",
    sumber: "pk_rajapolah",
    pk_id: "pk_rajapolah",
    status: "published",
    catatan_review: "Sangat baik, berita menginspirasi pemuda kreatif lainnya.",
    published_at: "2026-05-28T10:00:00Z",
    created_at: "2026-05-27T12:00:00Z"
  }
];

const DEFAULT_AGENDA: Agenda[] = [
  {
    id: "a_1",
    judul: "Kopdar Wirausaha Muda & Temu Bisnis Kabupaten Tasikmalaya",
    deskripsi: "Pertemuan berkala seluruh pengurus DPD dan PK FKP serta seluruh anggota UMKM binaan FKP se-Kabupaten Tasikmalaya untuk sharing session, kolaborasi kemitraan, dan buka peluang pasar baru.",
    tanggal_mulai: "2026-06-15",
    tanggal_selesai: "2026-06-15",
    lokasi: "Gedung Pusat Kajian Islam (Puspas), Singaparna",
    poster_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    is_active: true,
    created_at: "2026-05-01T10:00:00Z"
  },
  {
    id: "a_2",
    judul: "Pelatihan & Mentoring Intensif Ekspor UMKM Rajapolah",
    deskripsi: "Pendampingan mendalam cara ekspor mandiri untuk wirausaha kriya Tasikmalaya, pembekalan dokumen ekspor, standardisasi mutu, dan optimalisasi platform niaga global.",
    tanggal_mulai: "2026-07-05",
    tanggal_selesai: "2026-07-06",
    lokasi: "Aula PKG Rajapolah",
    poster_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    is_active: true,
    created_at: "2026-05-15T11:00:00Z"
  }
];

const DEFAULT_UMKM: UMKM[] = [
  {
    id: "u_1",
    pk_id: "pk_singaparna",
    nama_usaha: "Singaparna Coffee Roasters",
    nama_pemilik: "Rian Hidayat",
    kategori: "kuliner",
    deskripsi: "Roastery kopi lokal yang memproses biji kopi specialty pilihan khas pegunungan Tasikmalaya dengan cita rasa otentik bodi kuat dan manis alami.",
    produk_jasa: ["Kopi Arabika Galunggung 250gr", "Fine Robusta Tasik 250gr", "Cold Brew Botol", "Jasa Roasting Biji Kopi"],
    foto_url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80",
    no_whatsapp: "6281234567890",
    kecamatan: "Singaparna",
    is_active: true,
    created_at: "2026-02-10T11:00:00Z",
    status: "approved",
    has_katalog: true,
    katalog: [
      {
        nama_produk: "Kopi Arabika Galunggung 250gr",
        harga: 65000,
        deskripsi: "Kopi Arabika asli pegunungan Galunggung dengan tingkat keasaman medium dan rasa buah yang segar.",
        foto_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80"
      },
      {
        nama_produk: "Fine Robusta Tasik 250gr",
        harga: 45000,
        deskripsi: "Kopi Robusta pilihan dengan body tebal dan rasa cokelat kacang yang klasik.",
        foto_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80"
      }
    ]
  },
  {
    id: "u_2",
    pk_id: "pk_rajapolah",
    nama_usaha: "Rajapolah Mendong Craft",
    nama_pemilik: "Endang Permana",
    kategori: "kerajinan",
    deskripsi: "Produsen dekorasi rumah anyaman mendong ramah lingkungan. Kami memproduksi keranjang cucian, karpet, tikar lipat, serta tas etnik stylish.",
    produk_jasa: ["Laundry Basket Mendong", "Karpet Serat Alam Ø120cm", "Slipper Suite Hotel", "Tas Clucth Etnik Khas Tasik"],
    foto_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
    no_whatsapp: "6282233445566",
    kecamatan: "Rajapolah",
    is_active: true,
    created_at: "2026-02-25T03:00:00Z",
    status: "approved",
    has_katalog: true,
    katalog: [
      {
        nama_produk: "Laundry Basket Mendong",
        harga: 120000,
        deskripsi: "Keranjang tempat pakaian kotor yang dianyam dari serat tanaman mendong berkualitas tinggi, awet, dan estetik.",
        foto_url: "https://images.unsplash.com/photo-1591081658714-f576fb7ea3ed?auto=format&fit=crop&w=400&q=80"
      },
      {
        nama_produk: "Karpet Serat Alam Ø120cm",
        harga: 250000,
        deskripsi: "Karpet anyaman melingkar berbahan mendong alami. Sangat cocok diletakkan di ruang tamu atau kamar tidur Anda.",
        foto_url: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=80"
      }
    ]
  },
  {
    id: "u_3",
    pk_id: "pk_ciawi",
    nama_usaha: "Dapoer Moeda Ciawi",
    nama_pemilik: "Siti Maryam",
    kategori: "kuliner",
    deskripsi: "Camilan keripik kaca pedas dan seblak instan kering yang dikemas modern dan Higienis. Siap kirim ke seluruh nusantara sebagai oleh-oleh khas Pasundan.",
    produk_jasa: ["Keripik Kaca Original 100gr", "Keripik Kaca Daun Jeruk Pedas", "Seblak Kering Kemasan Pouch"],
    foto_url: "https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=600&q=80",
    no_whatsapp: "6289988776655",
    kecamatan: "Ciawi",
    is_active: true,
    created_at: "2026-03-05T09:00:00Z",
    status: "approved",
    has_katalog: false
  }
];

const DEFAULT_KONTAK: Kontak = {
  id: "kontak_fkp_tasikmalaya",
  alamat: "Jl. Pemda Singaparna No. 12, Kompleks Perkantoran Bojongkoneng, Singaparna, Kabupaten Tasikmalaya, Jawa Barat 46181",
  email: "fkp.tasikmalaya@gmail.com",
  telepon: "0265-543210",
  whatsapp: "6281234567890",
  instagram: "fkptasikmalayaofficial",
  facebook: "FKP Kab Tasikmalaya",
  youtube: "FKPTasikmalayaTV",
  tiktok: "fkptasikmalaya",
  embed_maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.4025178556694!2d108.11239857500122!3d-7.308696892699478s!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e61543b593efae3%3A0xe51ebec75fbfeee3!2sSingaparna%2C%20Tasikmalaya%20Regency%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1717315200000!5m2!1sen!2sid",
  updated_at: "2026-06-02T14:30:00Z"
};

// Key getters helper
function getLocal<T>(key: string, defaultVal: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
}

function setLocal<T>(key: string, val: T): void {
  localStorage.setItem(key, JSON.stringify(val));
}

// Ensure local storage is seeded on import
if (typeof window !== 'undefined') {
  getLocal<ProfilOrganisasi>('fkp_profil', DEFAULT_PROFIL);
  getLocal<PKFKP[]>('fkp_pks', DEFAULT_PKS);
  getLocal<Berita[]>('fkp_berita', DEFAULT_BERITA);
  getLocal<Agenda[]>('fkp_agenda', DEFAULT_AGENDA);
  getLocal<UMKM[]>('fkp_umkm', DEFAULT_UMKM);
  getLocal<Kontak>('fkp_kontak', DEFAULT_KONTAK);
}

// ==========================================
// 3. UNIFIED DATA API (MOCK / FIREBASE)
// ==========================================

export const dbService = {
  // PROFIL ORGANISASI
  async getProfil(): Promise<ProfilOrganisasi> {
    if (isFirebaseConfigured) {
      const path = 'profil_organisasi/fkp_dpd_profile_default';
      try {
        const snap = await getDoc(doc(db, 'profil_organisasi', 'fkp_dpd_profile_default'));
        if (snap.exists()) return snap.data() as ProfilOrganisasi;
        return DEFAULT_PROFIL;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
    return getLocal<ProfilOrganisasi>('fkp_profil', DEFAULT_PROFIL);
  },

  async updateProfil(data: Partial<ProfilOrganisasi>): Promise<ProfilOrganisasi> {
    if (isFirebaseConfigured) {
      const path = 'profil_organisasi/fkp_dpd_profile_default';
      try {
        const ref = doc(db, 'profil_organisasi', 'fkp_dpd_profile_default');
        const snap = await getDoc(ref);
        const current = snap.exists() ? (snap.data() as ProfilOrganisasi) : DEFAULT_PROFIL;
        const updated = { ...current, ...data, updated_at: new Date().toISOString() };
        await setDoc(ref, updated, { merge: true });
        return updated;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
    const current = getLocal<ProfilOrganisasi>('fkp_profil', DEFAULT_PROFIL);
    const updated = { ...current, ...data, updated_at: new Date().toISOString() };
    setLocal('fkp_profil', updated);
    return updated;
  },

  // PK FKP (Kecamatan / PK)
  async getPKs(): Promise<PKFKP[]> {
    if (isFirebaseConfigured) {
      const path = 'pk_fkp';
      try {
        const snap = await getDocs(collection(db, path));
        const res: PKFKP[] = [];
        snap.forEach(d => res.push(d.data() as PKFKP));
        return res.length > 0 ? res : DEFAULT_PKS;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
    return getLocal<PKFKP[]>('fkp_pks', DEFAULT_PKS);
  },

  async getPK(id: string): Promise<PKFKP | null> {
    if (isFirebaseConfigured) {
      const path = `pk_fkp/${id}`;
      try {
        const snap = await getDoc(doc(db, 'pk_fkp', id));
        if (snap.exists()) return snap.data() as PKFKP;
        return DEFAULT_PKS.find(p => p.id === id) || null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
    const pks = getLocal<PKFKP[]>('fkp_pks', DEFAULT_PKS);
    return pks.find(p => p.id === id) || null;
  },

  async savePK(data: PKFKP): Promise<PKFKP> {
    if (isFirebaseConfigured) {
      const path = `pk_fkp/${data.id}`;
      try {
        await setDoc(doc(db, 'pk_fkp', data.id), data);
        return data;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    const pks = getLocal<PKFKP[]>('fkp_pks', DEFAULT_PKS);
    const idx = pks.findIndex(p => p.id === data.id);
    if (idx !== -1) {
      pks[idx] = data;
    } else {
      pks.push(data);
    }
    setLocal('fkp_pks', pks);
    return data;
  },

  async deletePK(id: string): Promise<void> {
    if (isFirebaseConfigured) {
      const path = `pk_fkp/${id}`;
      try {
        await deleteDoc(doc(db, 'pk_fkp', id));
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
    const pks = getLocal<PKFKP[]>('fkp_pks', DEFAULT_PKS);
    const filtered = pks.filter(p => p.id !== id);
    setLocal('fkp_pks', filtered);
  },

  // BERITA
  async getBerita(): Promise<Berita[]> {
    if (isFirebaseConfigured) {
      const path = 'berita';
      try {
        const snap = await getDocs(collection(db, path));
        const res: Berita[] = [];
        snap.forEach(d => res.push(d.data() as Berita));
        return res.length > 0 ? res : DEFAULT_BERITA;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
    return getLocal<Berita[]>('fkp_berita', DEFAULT_BERITA);
  },

  async getBeritaById(id: string): Promise<Berita | null> {
    if (isFirebaseConfigured) {
      const path = `berita/${id}`;
      try {
        const snap = await getDoc(doc(db, 'berita', id));
        if (snap.exists()) return snap.data() as Berita;
        return DEFAULT_BERITA.find(b => b.id === id) || null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
    const berita = getLocal<Berita[]>('fkp_berita', DEFAULT_BERITA);
    return berita.find(b => b.id === id) || null;
  },

  async saveBerita(data: Berita): Promise<Berita> {
    if (isFirebaseConfigured) {
      const path = `berita/${data.id}`;
      try {
        await setDoc(doc(db, 'berita', data.id), data);
        return data;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    const berita = getLocal<Berita[]>('fkp_berita', DEFAULT_BERITA);
    const idx = berita.findIndex(b => b.id === data.id);
    if (idx !== -1) {
      berita[idx] = data;
    } else {
      berita.push(data);
    }
    setLocal('fkp_berita', berita);
    return data;
  },

  async deleteBerita(id: string): Promise<void> {
    if (isFirebaseConfigured) {
      const path = `berita/${id}`;
      try {
        await deleteDoc(doc(db, 'berita', id));
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
    const berita = getLocal<Berita[]>('fkp_berita', DEFAULT_BERITA);
    const filtered = berita.filter(b => b.id !== id);
    setLocal('fkp_berita', filtered);
  },

  // AGENDA / EVENTS
  async getAgendas(): Promise<Agenda[]> {
    if (isFirebaseConfigured) {
      const path = 'agenda';
      try {
        const snap = await getDocs(collection(db, path));
        const res: Agenda[] = [];
        snap.forEach(d => res.push(d.data() as Agenda));
        return res.length > 0 ? res : DEFAULT_AGENDA;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
    return getLocal<Agenda[]>('fkp_agenda', DEFAULT_AGENDA);
  },

  async saveAgenda(data: Agenda): Promise<Agenda> {
    if (isFirebaseConfigured) {
      const path = `agenda/${data.id}`;
      try {
        await setDoc(doc(db, 'agenda', data.id), data);
        return data;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    const agenda = getLocal<Agenda[]>('fkp_agenda', DEFAULT_AGENDA);
    const idx = agenda.findIndex(a => a.id === data.id);
    if (idx !== -1) {
      agenda[idx] = data;
    } else {
      agenda.push(data);
    }
    setLocal('fkp_agenda', agenda);
    return data;
  },

  async deleteAgenda(id: string): Promise<void> {
    if (isFirebaseConfigured) {
      const path = `agenda/${id}`;
      try {
        await deleteDoc(doc(db, 'agenda', id));
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
    const agenda = getLocal<Agenda[]>('fkp_agenda', DEFAULT_AGENDA);
    const filtered = agenda.filter(a => a.id !== id);
    setLocal('fkp_agenda', filtered);
  },

  // UMKM
  async getUMKMs(): Promise<UMKM[]> {
    if (isFirebaseConfigured) {
      const path = 'umkm';
      try {
        const snap = await getDocs(collection(db, path));
        const res: UMKM[] = [];
        snap.forEach(d => res.push(d.data() as UMKM));
        return res.length > 0 ? res : DEFAULT_UMKM;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
    return getLocal<UMKM[]>('fkp_umkm', DEFAULT_UMKM);
  },

  async saveUMKM(data: UMKM): Promise<UMKM> {
    if (isFirebaseConfigured) {
      const path = `umkm/${data.id}`;
      try {
        await setDoc(doc(db, 'umkm', data.id), data);
        return data;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    const umkms = getLocal<UMKM[]>('fkp_umkm', DEFAULT_UMKM);
    const idx = umkms.findIndex(u => u.id === data.id);
    if (idx !== -1) {
      umkms[idx] = data;
    } else {
      umkms.push(data);
    }
    setLocal('fkp_umkm', umkms);
    return data;
  },

  async deleteUMKM(id: string): Promise<void> {
    if (isFirebaseConfigured) {
      const path = `umkm/${id}`;
      try {
        await deleteDoc(doc(db, 'umkm', id));
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
    const umkms = getLocal<UMKM[]>('fkp_umkm', DEFAULT_UMKM);
    const filtered = umkms.filter(u => u.id !== id);
    setLocal('fkp_umkm', filtered);
  },

  // KONTAK
  async getKontak(): Promise<Kontak> {
    if (isFirebaseConfigured) {
      const path = 'kontak/kontak_fkp_tasikmalaya';
      try {
        const snap = await getDoc(doc(db, 'kontak', 'kontak_fkp_tasikmalaya'));
        if (snap.exists()) return snap.data() as Kontak;
        return DEFAULT_KONTAK;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
    return getLocal<Kontak>('fkp_kontak', DEFAULT_KONTAK);
  },

  async updateKontak(data: Partial<Kontak>): Promise<Kontak> {
    if (isFirebaseConfigured) {
      const path = 'kontak/kontak_fkp_tasikmalaya';
      try {
        const ref = doc(db, 'kontak', 'kontak_fkp_tasikmalaya');
        const snap = await getDoc(ref);
        const current = snap.exists() ? (snap.data() as Kontak) : DEFAULT_KONTAK;
        const updated = { ...current, ...data, updated_at: new Date().toISOString() };
        await setDoc(ref, updated, { merge: true });
        return updated;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
    const current = getLocal<Kontak>('fkp_kontak', DEFAULT_KONTAK);
    const updated = { ...current, ...data, updated_at: new Date().toISOString() };
    setLocal('fkp_kontak', updated);
    return updated;
  }
};
