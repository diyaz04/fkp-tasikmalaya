/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Search, MapPin, Phone, RefreshCw, LayoutGrid, CheckCircle } from 'lucide-react';
import { dbService } from '@/src/lib/db';
import { UMKM, PKFKP } from '@/src/types';

export default function UMKMDirectory() {
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [pks, setPks] = useState<PKFKP[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'kuliner', label: 'Kuliner' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'kerajinan', label: 'Kerajinan / Kriya' },
    { value: 'jasa', label: 'Jasa / Trade' },
    { value: 'pertanian', label: 'Agribisnis / Pertanian' },
    { value: 'teknologi', label: 'Teknologi' },
    { value: 'lainnya', label: 'Lain-lain' }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [umkmData, pkData] = await Promise.all([
          dbService.getUMKMs(),
          dbService.getPKs()
        ]);
        setUmkms(umkmData.filter(u => u.is_active));
        setPks(pkData);
      } catch (error) {
        console.error("Gagal mengambil direktori UMKM", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter Logic
  const filteredUmkms = umkms.filter((u) => {
    const matchesSearch = 
      u.nama_usaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nama_pemilik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.produk_jasa && u.produk_jasa.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || u.kategori === selectedCategory;
    const matchesKecamatan = selectedKecamatan === 'all' || u.pk_id === selectedKecamatan;

    return matchesSearch && matchesCategory && matchesKecamatan;
  });

  const getKecamatanName = (pkId: string) => {
    const found = pks.find(p => p.id === pkId);
    return found ? `Kec. ${found.nama_kecamatan}` : 'Kab. Tasikmalaya';
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedKecamatan('all');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50 gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
        <p className="text-slate-500 font-semibold text-xs">Memuat katalog UMKM pemuda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12" id="umkm-directory-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Grid */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Direktori <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">UMKM Pemuda</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed uppercase tracking-wider">
            Temukan produk kreatif, kuliner otentik, kerajinan lokal, dan jasa profesional binaan FKP Kabupaten Tasikmalaya
          </p>
        </div>

        {/* Filter Toolbar Card with Grid layouts */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* 1. Keyword search */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Cari Usaha / Produk</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik nama toko, produk, pemilik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {/* 2. Select Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Kategori Usaha</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-slate-600"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* 3. Select Kecamatan */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Kecamatan (PK)</label>
              <select
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
                className="w-full text-sm py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-slate-600"
              >
                <option value="all">Semua Kecamatan</option>
                {pks.map((p) => (
                  <option key={p.id} value={p.id}>{p.nama_kecamatan}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Reset Filters Option */}
          {(searchQuery || selectedCategory !== 'all' || selectedKecamatan !== 'all') && (
            <div className="flex justify-end mt-4">
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5 bg-red-50 hover:bg-red-100/60 px-4 py-1.5 rounded-full"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Atur Ulang Filter
              </button>
            </div>
          )}
        </div>

        {/* Directory Listings Count indicator */}
        <div className="flex justify-between items-center mb-6 text-xs text-slate-500 font-semibold px-2">
          <span>Menampilkan {filteredUmkms.length} wirausaha pemuda</span>
          <span className="flex items-center gap-1 text-slate-400">
            <LayoutGrid className="w-3.5 h-3.5" /> Grid View
          </span>
        </div>

        {/* Catalog Grid */}
        {filteredUmkms.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center max-w-xl mx-auto space-y-3">
            <p className="text-sm font-extrabold text-slate-700">Wirausaha Tidak Ditemukan</p>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Mungkin kategori, kecamatan, atau kata kunci pencarian Anda saat ini tidak memiliki kecocokan. Silakan reset filter Anda.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors"
            >
              Cari Semua Usaha
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUmkms.map((u) => (
              <div 
                key={u.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo with fallback */}
                  <div className="relative h-48 bg-slate-50 overflow-hidden">
                    <img
                      src={u.foto_url || "https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=600&q=80"}
                      alt={u.nama_usaha}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full px-2.5 shadow-md">
                      {u.kategori}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6">
                    <div className="flex gap-1.5 items-center text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1">
                      <MapPin className="w-3 h-3 text-cyan-500" />
                      <span>{getKecamatanName(u.pk_id)}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                      {u.nama_usaha}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mb-3">Pemilik: {u.nama_pemilik}</p>
                    
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-4 line-clamp-3">
                      {u.deskripsi || "Pelaku wirausaha muda aktif yang digerakkan oleh dedikasi kemandirian wirausaha nasional."}
                    </p>

                    {/* Highly dynamic list of products/services */}
                    {u.produk_jasa && u.produk_jasa.length > 0 && (
                      <div className="space-y-1.5 border-t border-slate-50 pt-3">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Keunggulan Produk:</span>
                        <div className="flex flex-wrap gap-1">
                          {u.produk_jasa.map((prod, idx) => (
                            <span 
                              key={idx}
                              className="text-[10px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200/50 px-2 py-0.5 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <CheckCircle className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                              {prod}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp call to action button */}
                <div className="p-6 pt-0 mt-4">
                  <a
                    href={`https://wa.me/${u.no_whatsapp}?text=Halo%20${encodeURIComponent(u.nama_usaha)}%2C%20saya%20tertarik%20dengan%20produk%20Anda%20di%20portal%20FKP%20Kabupaten%20Tasikmalaya.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2.5 px-4 text-xs font-bold rounded-full text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-md hover:scale-[1.02] hover:-shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Hubungi WhatsApp Usaha
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Informative CTA Banner for registering UMKM */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden" id="umkm-registration-cta">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_45%)]" />
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <span className="text-[10px] sm:text-xs font-bold text-sky-400 bg-sky-500/10 px-4 py-1.5 rounded-full uppercase tracking-wider inline-block">
              Pendaftaran Direktori UMKM
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Ingin Usaha Kreatif Anda Tampil di Portal Ini?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Sesuai regulasi organisasi, direktori UMKM binaan dikelola secara satu pintu. Data usaha dapat diinputkan secara gratis ke dalam sistem oleh **Pengurus Kecamatan (PK) FKP** wilayah masing-masing, atau dibantu langsung oleh **Admin DPD FKP Kabupaten Tasikmalaya**.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-3">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20FKP%20Tasikmalaya%2C%20saya%20ingin%20mendaftarkan%20usaha%20UMKM%20saya%20ke%20website%20portal%20direktori."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-bold text-xs px-6 py-3 rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Hubungi Pengurus FKP
              </a>
              <a
                href="/login"
                className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white font-bold text-xs border border-white/20 px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2"
              >
                Masuk ke Dashboard
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
