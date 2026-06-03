/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, User, ChevronRight, LayoutGrid } from 'lucide-react';
import { dbService } from '@/src/lib/db';
import { Berita } from '@/src/types';

export default function NewsList() {
  const navigate = useNavigate();
  const [beritas, setBeritas] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'dpd' | 'pk'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await dbService.getBerita();
        // Only show published articles in public listing
        setBeritas(data.filter(b => b.status === 'published'));
      } catch (error) {
        console.error("Gagal memuat Berita", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter Logic
  const filteredBeritas = beritas.filter((b) => {
    const matchesSearch = 
      b.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.penulis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = 
      sourceFilter === 'all' ||
      (sourceFilter === 'dpd' && b.sumber === 'dpd') ||
      (sourceFilter === 'pk' && b.sumber !== 'dpd');

    return matchesSearch && matchesSource;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50 gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin"></div>
        <p className="text-slate-500 font-semibold text-xs">Memuat kumpulan kabar berita...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12" id="berita-list-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title and Intro */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kabar Kewirausahaan <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">FKP Tasikmalaya</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold uppercase tracking-wider">
            Informasi, Berita Acara, Liputan Kegiatan, dan Inspirasi Wirausaha Pemuda dari Seluruh Kecamatan
          </p>
        </div>

        {/* Toolbar Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul berita atau penulis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium text-slate-700"
            />
          </div>

          {/* Sourcing Toggles */}
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setSourceFilter('all')}
              className={`flex-1 md:flex-initial text-xs font-semibold px-4 py-2.5 rounded-full transition-colors ${
                sourceFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua Berita
            </button>
            <button
              onClick={() => setSourceFilter('dpd')}
              className={`flex-1 md:flex-initial text-xs font-semibold px-4 py-2.5 rounded-full transition-colors ${
                sourceFilter === 'dpd'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              DPD Kabupaten
            </button>
            <button
              onClick={() => setSourceFilter('pk')}
              className={`flex-1 md:flex-initial text-xs font-semibold px-4 py-2.5 rounded-full transition-colors ${
                sourceFilter === 'pk'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pengurus Kecamatan
            </button>
          </div>
        </div>

        {/* Catalog grid */}
        {filteredBeritas.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center max-w-md mx-auto space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-300">Kosong</p>
            <p className="text-sm font-bold text-slate-700">Berita tidak ditemukan</p>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Belum ada artikel yang dipulbikasikan dengan kata kunci pencarian Anda saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBeritas.map((ber) => (
              <article 
                key={ber.id}
                onClick={() => navigate(`/berita/${ber.id}`)}
                className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden group hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Category overlay */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={ber.thumbnail_url || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80"}
                      alt={ber.judul}
                      className="w-full h-full object-cover group-hover:scale-105 duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-cyan-400 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                      {ber.sumber === 'dpd' ? 'DPD KABUPATEN' : 'PK KECAMATAN'}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                      <Calendar className="w-3 h-3 text-cyan-500 shrink-0" />
                      <span>{new Date(ber.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold leading-snug text-slate-800 transition-colors group-hover:text-blue-600 line-clamp-2">
                      {ber.judul}
                    </h3>

                    {/* Sanitize simple HTML excerpts */}
                    <div 
                      className="text-xs text-slate-500 line-clamp-3 leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: ber.konten }}
                    ></div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-50 mt-4 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ber.penulis}</span>
                  </div>
                  <span className="font-extrabold text-blue-600 group-hover:text-cyan-500 inline-flex items-center gap-0.5 duration-200">
                    Selengkapnya
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
