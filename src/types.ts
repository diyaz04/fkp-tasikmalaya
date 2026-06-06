/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProfilOrganisasi {
  id: string;
  nama_organisasi: string;
  singkatan: string;
  visi: string;
  misi: string[];
  sejarah: string;
  logo_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_bg_url: string;
  hero_mode?: 'static' | 'dynamic';
  hero_blur_level?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  nama_ketua_dpd?: string;
  foto_ketua_dpd?: string;
  nama_sekretaris_dpd?: string;
  foto_sekretaris_dpd?: string;
  nama_bendahara_dpd?: string;
  foto_bendahara_dpd?: string;
  updated_at: string;
  featured_umkm_ids?: string[];
}

export interface PengurusPK {
  jabatan: string;
  nama: string;
  foto_url: string;
}

export interface PKFKP {
  id: string;
  user_id?: string; // Auth link
  nama_kecamatan: string;
  foto_ketua_url: string;
  nama_ketua: string;
  nama_sekretaris?: string;
  foto_sekretaris_url?: string;
  nama_bendahara?: string;
  foto_bendahara_url?: string;
  deskripsi: string;
  pengurus: PengurusPK[];
  is_active: boolean;
  created_at: string;
  email: string | null; // For email mapping-based PK Auth login
  password?: string; // Preset password for on-the-fly Auth account creation
}

export interface Berita {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  thumbnail_url: string;
  penulis: string;
  sumber: 'dpd' | string; // 'dpd' or pk_id
  pk_id: string | null; // REFERENCES pk_fkp
  status: 'draft' | 'pending' | 'published' | 'rejected';
  catatan_review: string | null;
  published_at: string | null;
  created_at: string;
  editor_dpd?: string | null;
}

export interface Agenda {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string; // YYYY-MM-DD
  tanggal_selesai: string; // YYYY-MM-DD
  lokasi: string;
  poster_url: string;
  is_active: boolean;
  created_at: string;
}

export interface ProdukKatalog {
  foto_url: string;
  nama_produk: string;
  harga: number;
  deskripsi: string;
}

export interface UMKM {
  id: string;
  pk_id: string; // REFERENCES pk_fkp
  nama_usaha: string;
  nama_pemilik: string;
  kategori: 'kuliner' | 'fashion' | 'kerajinan' | 'jasa' | 'pertanian' | 'teknologi' | 'lainnya';
  deskripsi: string;
  produk_jasa: string[]; // List of products/services
  foto_url: string;
  no_whatsapp: string;
  kecamatan: string;
  is_active: boolean;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  catatan_review?: string | null;
  has_katalog: boolean;
  katalog?: ProdukKatalog[];
  shu_url?: string;
  nib_url?: string;
}

export interface Kontak {
  id: string;
  alamat: string;
  email: string;
  telepon: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  embed_maps: string;
  updated_at: string;
}

export interface AuthContextType {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: 'dpd' | 'pk' | 'visitor';
    pkId?: string; // If role is pk, which kecamatan ID they own
  } | null;
  loading: boolean;
}
