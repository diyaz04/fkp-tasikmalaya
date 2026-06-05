/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Search, MapPin, Phone, RefreshCw, LayoutGrid, CheckCircle } from 'lucide-react';
import { dbService } from '@/src/lib/db';
import { UMKM, PKFKP } from '@/src/types';
import { getWhatsAppLink } from '@/src/lib/utils';

export default function UMKMDirectory() {
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [pks, setPks] = useState<PKFKP[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
  const [activeUMKM, setActiveUMKM] = useState<UMKM | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  // Counts of UMKM in each business category
  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat.value === 'all') {
      acc[cat.value] = umkms.length;
    } else {
      acc[cat.value] = umkms.filter(u => u.kategori === cat.value).length;
    }
    return acc;
  }, {} as Record<string, number>);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedKecamatan]);

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
    // Search based on: Business Name, Owner Name, products listed in produk_jasa array, or Catalog Product Names!
    const matchesCatalogProduct = u.has_katalog && u.katalog && u.katalog.some(prod => 
      prod.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesSearch = 
      u.nama_usaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nama_pemilik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.produk_jasa && u.produk_jasa.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      matchesCatalogProduct;

    const matchesCategory = selectedCategory === 'all' || u.kategori === selectedCategory;
    const matchesKecamatan = selectedKecamatan === 'all' || u.pk_id === selectedKecamatan;

    return matchesSearch && matchesCategory && matchesKecamatan;
  });

  // Slicing for Pagination
  const totalPages = Math.ceil(filteredUmkms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUmkms = filteredUmkms.slice(startIndex, startIndex + itemsPerPage);

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

        {/* Category Stats Deck */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8" id="category-stats-deck">
          {categories.map((cat) => {
            const count = categoryCounts[cat.value] || 0;
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col justify-between items-center gap-1.5 h-20 shadow-sm hover:scale-[1.02] active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-500 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700 hover:bg-slate-50/75'
                }`}
              >
                <span className={`text-[9px] font-extrabold uppercase tracking-widest line-clamp-1 ${isSelected ? 'text-blue-105' : 'text-slate-400'}`}>
                  {cat.label.replace('Semua Kategori', 'Semua').replace(' / Kriya', '').replace(' / Trade', '').replace(' / Pertanian', '')}
                </span>
                <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-slate-850'}`}>
                  {count} <span className="text-[9px] font-semibold text-slate-400">Usaha</span>
                </span>
              </button>
            );
          })}
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
                  <option key={cat.value} value={cat.value}>
                    {cat.label} ({categoryCounts[cat.value] || 0})
                  </option>
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
          <span>Menampilkan {filteredUmkms.length} wirausaha pemuda {totalPages > 1 && `(Halaman ${currentPage} dari ${totalPages})`}</span>
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
            {paginatedUmkms.map((u) => (
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

                {/* Action buttons stack */}
                <div className="p-6 pt-0 mt-auto space-y-2 shrink-0">
                  <button
                    onClick={() => setActiveUMKM(u)}
                    className="w-full text-center py-2.5 px-4 text-xs font-bold rounded-full text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    Lihat Info & Katalog
                  </button>
                  <a
                    href={getWhatsAppLink(u.no_whatsapp, `Halo ${u.nama_usaha}, saya tertarik dengan produk Anda di portal FKP Kabupaten Tasikmalaya.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2.5 px-4 text-xs font-bold rounded-full text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-md hover:scale-[1.02] flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Hubungi WhatsApp Usaha
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Dynamic Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm" id="umkm-directory-pagination">
            <span className="text-xs font-bold text-slate-500">
              Menampilkan <span className="text-blue-600">{startIndex + 1}</span> - <span className="text-blue-600">{Math.min(startIndex + itemsPerPage, filteredUmkms.length)}</span> dari <span className="text-slate-800">{filteredUmkms.length}</span> Wirausaha
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Prev button */}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  currentPage === 1 
                    ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                    : 'bg-white text-slate-705 border-slate-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
                }`}
              >
                Sebelumnya
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next button */}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  currentPage === totalPages 
                    ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                    : 'bg-white text-slate-707 border-slate-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
                }`}
              >
                Berikutnya (Next)
              </button>
            </div>
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

        {/* ==================================== */}
        {/* MODAL DETAL & KATALOG PRODUK UMKM    */}
        {/* ==================================== */}
        {activeUMKM && (
          <div 
            onClick={() => setActiveUMKM(null)}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 border border-slate-100/10 cursor-default"
            >
              {/* Header profile */}
              <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {activeUMKM.kategori}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight pt-1">
                    {activeUMKM.nama_usaha}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Pemilik: <span className="text-slate-700 font-bold">{activeUMKM.nama_pemilik}</span> | Kecamatan: <span className="text-slate-700 font-bold">{getKecamatanName(activeUMKM.pk_id)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveUMKM(null)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-full font-bold transition-all hover:scale-105 cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              {/* Business Overview Bento layout */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8 items-start">
                
                {/* Visual cover card */}
                <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                  <img 
                    src={activeUMKM.foto_url || "https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=600&q=80"} 
                    alt={activeUMKM.nama_usaha} 
                    className="w-full h-auto max-h-[250px] md:max-h-[350px] object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  <div className="p-4 bg-slate-900 text-white text-xs font-bold flex justify-between items-center">
                    <span>Hubungi Lewat WA:</span>
                    <a 
                      href={getWhatsAppLink(activeUMKM.no_whatsapp, `Halo ${activeUMKM.nama_usaha}, saya tertarik dengan produk UMKM Anda.`)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-cyan-400 hover:underline"
                    >
                      +{activeUMKM.no_whatsapp}
                    </a>
                  </div>
                </div>

                {/* Core descriptions */}
                <div className="md:col-span-3 space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-extrabold">Profil Ringkas Bisnis</h4>
                    <p className="text-sm text-slate-600 font-semibold leading-relaxed font-sans">
                      {activeUMKM.deskripsi || "Pelaku wirausaha pemuda Tasikmalaya yang berkomitmen menyediakan layanan dan kualitas produk terbaik bagi para pelanggannya."}
                    </p>
                  </div>

                  {activeUMKM.produk_jasa && activeUMKM.produk_jasa.length > 0 && (
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-extrabold">Keunggulan & Produk Unggulan</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {activeUMKM.produk_jasa.map((tag, tIdx) => (
                          <span 
                            key={tIdx} 
                            className="bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-[10px] px-3 py-1 rounded-lg flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Dynamic Product Catalog Gallery Section */}
              <div className="border-t border-slate-100 pt-6 sm:pt-8 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
                    🛍️ Katalog Menu / Produk Usaha
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">
                    {activeUMKM.has_katalog && activeUMKM.katalog?.length ? `${activeUMKM.katalog.length} Produk Tersedia` : 'Tidak Ada Produk Katalog'}
                  </span>
                </div>

                {activeUMKM.has_katalog && activeUMKM.katalog && activeUMKM.katalog.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeUMKM.katalog.map((prod, pIdx) => (
                      <div key={pIdx} className="bg-slate-50/50 rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          {/* Product visual code */}
                          <div className="h-40 bg-slate-200 relative">
                            <img 
                              src={prod.foto_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80"} 
                              alt={prod.nama_produk} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";
                              }}
                            />
                            <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-md shadow">
                              Rp {prod.harga.toLocaleString()}
                            </div>
                          </div>

                          {/* Product detailed information */}
                          <div className="p-4 space-y-1.5">
                            <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-1">{prod.nama_produk}</h4>
                            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed line-clamp-3">{prod.deskripsi || "Detail produk belum ditambahkan."}</p>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <a
                            href={getWhatsAppLink(activeUMKM.no_whatsapp, `Halo ${activeUMKM.nama_usaha}, saya tertarik dengan katalog produk Anda: *${prod.nama_produk}* (${"Rp " + prod.harga.toLocaleString()})`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-center py-2 px-3 bg-white hover:bg-slate-55 border border-slate-250 text-slate-700 font-extrabold text-[10px] sm:text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            Pesan Produk Lewat WA
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200/50 rounded-2xl">
                    <p className="text-xs text-slate-400 font-bold leading-relaxed">
                      Wirausaha belum mengunggah produk katalog foto terpisah ke platform. Silakan hubungi langsung via WhatsApp di atas untuk list lengkap katalog produk / jasa yang tersedia!
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Footer with Call actions */}
              <div className="flex gap-2 justify-end pt-5 border-t border-slate-100">
                <a
                  href={getWhatsAppLink(activeUMKM.no_whatsapp, `Halo ${activeUMKM.nama_usaha}, saya tertarik dengan produk Anda di portal FKP Kabupaten Tasikmalaya.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-md hover:scale-[1.01] text-white font-extrabold text-xs px-6 py-2.5 rounded-full flex items-center gap-2 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Hubungi Toko Sekarang
                </a>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
