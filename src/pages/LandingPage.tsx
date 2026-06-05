/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Clock, 
  Award, 
  Users, 
  Lightbulb, 
  TrendingUp,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { dbService, DEFAULT_PROFIL } from '@/src/lib/db';
import { ProfilOrganisasi, PKFKP, Berita, Agenda, Kontak, UMKM } from '@/src/types';
import { getWhatsAppLink } from '@/src/lib/utils';

export default function LandingPage() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState<ProfilOrganisasi | null>(null);
  const [pks, setPks] = useState<PKFKP[]>([]);
  const [beritas, setBeritas] = useState<Berita[]>([]);
  const [allBeritas, setAllBeritas] = useState<Berita[]>([]);
  const [allUmkms, setAllUmkms] = useState<UMKM[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [kontak, setKontak] = useState<Kontak | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [limitCount, setLimitCount] = useState(6);

  function stripHtml(html: string) {
    if (!html) return '';
    const clean = html.replace(/<\/?[^>]+(>|$)/g, "");
    if (clean.length > 155) {
      return clean.slice(0, 155) + '...';
    }
    return clean;
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, pkData, beritaData, agendaData, kontakData, umkmData] = await Promise.all([
          dbService.getProfil(),
          dbService.getPKs(),
          dbService.getBerita(),
          dbService.getAgendas(),
          dbService.getKontak(),
          dbService.getUMKMs()
        ]);
        setProfil(profData);
        setPks(pkData.filter(p => p.is_active));
        const published = beritaData.filter(b => b.status === 'published');
        setAllBeritas(published);
        setBeritas(published.slice(0, 3));
        setAgendas(agendaData.filter(a => a.is_active).slice(0, 3));
        setKontak(kontakData);
        setAllUmkms(umkmData);
      } catch (error) {
        console.error("Gagal memuat data landing page", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Find UMKMs that are in the featured_umkm_ids list of DPD profile and make sure they are approved
  const featuredUmkmList = (profil?.featured_umkm_ids || [])
    .map(id => allUmkms.find(u => u.id === id))
    .filter((u): u is UMKM => !!u && (u.status === 'approved' || !u.status));

  // Combined slides: includes news (published) and featured UMKMs
  const heroSlides: ({ type: 'berita'; data: Berita } | { type: 'umkm'; data: UMKM })[] = [
    ...allBeritas.map(b => ({ type: 'berita' as const, data: b })),
    ...featuredUmkmList.map(u => ({ type: 'umkm' as const, data: u }))
  ];

  useEffect(() => {
    if (profil?.hero_mode === 'dynamic' && heroSlides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [profil?.hero_mode, heroSlides.length]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin"></div>
        <p className="text-slate-500 font-semibold text-sm">Menyelaraskan data wirausaha muda...</p>
      </div>
    );
  }

  // Active slide determination
  const isDynamicHero = profil?.hero_mode === 'dynamic' && heroSlides.length > 0;
  const activeSlide = isDynamicHero ? heroSlides[currentSlideIndex] : null;

  // Blur map for the dynamic popular news panel on the hero
  const blurMap: Record<string, string> = {
    none: 'backdrop-blur-none',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl',
    '3xl': 'backdrop-blur-3xl'
  };
  const heroBlurClass = blurMap[profil?.hero_blur_level || 'md'] || 'backdrop-blur-md';

  // Hero BG inline element
  const heroBg = activeSlide 
    ? (activeSlide.type === 'berita' ? activeSlide.data.thumbnail_url : activeSlide.data.foto_url)
    : (profil?.hero_bg_url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80");

  return (
    <div className="bg-white text-slate-800 font-sans" id="landing-page-parent">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 min-h-[90vh] sm:min-h-[85vh] flex items-center">
        {/* Background Subtle Watermark Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-700 ease-in-out">
          <img 
            src={heroBg} 
            alt="Hero background watermark" 
            className="w-full h-full object-cover opacity-10 filter blur-sm transition-all duration-1000 scale-105"
            loading="lazy"
          />
        </div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-5 left-5 w-72 h-72 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:py-20 sm:px-6 lg:px-8 text-center sm:text-left w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Badge element */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold bg-blue-50 border border-blue-100 text-blue-600 uppercase tracking-widest shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                    {isDynamicHero && activeSlide
                      ? activeSlide.type === 'berita'
                        ? `Kabar Berita Wilayah: Oleh ${activeSlide.data.penulis || 'Humas'}`
                        : `UMKM UNGGULAN: ${activeSlide.data.kategori.toUpperCase()}`
                      : "Sinergi Pentahelix Tasikmalaya"}
                  </span>
                </motion.div>
              </AnimatePresence>
              
              {/* Title element */}
              <div className="min-h-[120px] sm:min-h-[150px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={currentSlideIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]"
                  >
                    {isDynamicHero && activeSlide ? (
                      activeSlide.type === 'berita' ? activeSlide.data.judul : activeSlide.data.nama_usaha
                    ) : profil?.hero_title ? (
                      profil.hero_title.includes("Pemuda") ? (
                        <span>
                          {profil.hero_title.split("Pemuda")[0]}
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Pemuda</span>
                          {profil.hero_title.split("Pemuda")[1]}
                        </span>
                      ) : (
                        profil.hero_title
                      )
                    ) : (
                      <span>
                        Sinergi <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Pemuda</span>, Sukses Berwirausaha!
                      </span>
                    )}
                  </motion.h1>
                </AnimatePresence>
              </div>

              {/* Subtitle element */}
              <div className="min-h-[60px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentSlideIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm sm:text-base text-slate-500 max-w-2xl font-semibold leading-relaxed"
                  >
                    {isDynamicHero && activeSlide 
                      ? activeSlide.type === 'berita' 
                        ? stripHtml(activeSlide.data.konten)
                        : activeSlide.data.deskripsi
                      : profil?.hero_subtitle || "Wadah Kolaborasi, Kreasi, dan Transaksi Wirausaha Muda Kabupaten Tasikmalaya Menuju Kemandirian Ekonomi."}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Slider Buttons / Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start pt-2">
                {isDynamicHero && activeSlide ? (
                  activeSlide.type === 'berita' ? (
                    <>
                      <Link
                        to={`/berita/${activeSlide.data.id}`}
                        className="px-8 py-3.5 text-xs sm:text-sm font-extrabold rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/20 hover:shadow-cyan-500/35 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Baca Berita Selengkapnya
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/umkm"
                        className="px-8 py-3.5 text-xs sm:text-sm font-bold rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-md transition-all text-center cursor-pointer"
                      >
                        Jelajahi Direktori UMKM
                      </Link>
                    </>
                  ) : (
                    <>
                      <a
                        href={getWhatsAppLink(activeSlide.data.no_whatsapp, `Halo ${activeSlide.data.nama_usaha}, saya tertarik dengan produk Anda di portal FKP Kabupaten Tasikmalaya.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-8 py-3.5 text-xs sm:text-sm font-extrabold rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-xl shadow-green-500/20 hover:shadow-emerald-500/35 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Hubungi via WhatsApp
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <Link
                        to="/umkm"
                        className="px-8 py-3.5 text-xs sm:text-sm font-bold rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-md transition-all text-center cursor-pointer"
                      >
                        Jelajahi Produk Lainnya
                      </Link>
                    </>
                  )
                ) : (
                  <>
                    <Link
                      to="/umkm"
                      className="px-8 py-3.5 text-sm font-extrabold rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Jelajahi UMKM Pemuda
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="#tentang"
                      className="px-8 py-3.5 text-sm font-bold rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-md transition-all text-center cursor-pointer"
                    >
                      Mengenal Forum
                    </a>
                  </>
                )}
              </div>

              {/* Beautiful Slide Indicator Dots */}
              {isDynamicHero && heroSlides.length > 1 && (
                <div className="flex gap-2 justify-center sm:justify-start pt-4 items-center">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                        currentSlideIndex === idx 
                          ? 'bg-blue-600 w-6' 
                          : 'bg-slate-200 hover:bg-slate-300 w-2'
                      }`}
                      title={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Hero Right Visual Emblem */}
            <div className="lg:col-span-6 flex flex-col justify-center items-center lg:items-end relative">
              <div className="w-80 h-80 sm:w-[26rem] sm:h-[26rem] md:w-[32rem] md:h-[32rem] relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 rounded-[4rem] sm:rounded-[5rem] rotate-6"></div>
                <div className="absolute inset-0 bg-white rounded-[4rem] sm:rounded-[5rem] shadow-2xl border border-slate-100 p-4 sm:p-5">
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlideIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full rounded-[3rem] sm:rounded-[4rem] overflow-hidden relative z-10 group shadow-lg border border-slate-100/50"
                    >
                      {isDynamicHero && activeSlide ? (
                        activeSlide.type === 'berita' ? (
                          <div className="w-full h-full relative">
                            <img 
                              src={activeSlide.data.thumbnail_url || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80"} 
                              alt={activeSlide.data.judul} 
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            {/* Upper Floating Badge */}
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-13">
                              <span className="text-[9px] font-mono bg-blue-600/90 text-white font-black uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm tracking-widest">
                                INFO BERITA // BARU
                              </span>
                              <span className="text-[9px] font-mono bg-red-600/90 text-white font-black uppercase px-2.5 py-1 rounded-full shadow-md animate-pulse tracking-widest">
                                HOT
                              </span>
                            </div>

                            {/* Beautiful frosted overlay dark title panel at the bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent text-white space-y-1.5 pt-12">
                              <span className="inline-block text-[9px] font-black text-cyan-300 uppercase tracking-widest bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-md">
                                Kec. {activeSlide.data.sumber === 'dpd' ? 'DPD' : pks.find(p => p.id === activeSlide.data.sumber)?.nama_kecamatan || 'Kecamatan'}
                              </span>
                              <h3 className="text-xs sm:text-sm md:text-base font-extrabold line-clamp-2 leading-snug">
                                {activeSlide.data.judul}
                              </h3>
                              <div className="flex items-center gap-2 pt-1.5 border-t border-white/10 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                                  Rotasi Slide Berita
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            <img 
                              src={activeSlide.data.foto_url || "https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=600&q=80"} 
                              alt={activeSlide.data.nama_usaha} 
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            {/* Upper Floating Badge */}
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-13">
                              <span className="text-[9px] font-mono bg-amber-500/95 text-white font-black uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm tracking-widest">
                                UMKM PILIHAN // DPD
                              </span>
                              <span className="text-[9px] font-mono bg-emerald-600/95 text-white font-black uppercase px-2.5 py-1 rounded-full shadow-md animate-pulse tracking-widest">
                                UNGGULAN
                              </span>
                            </div>

                            {/* Beautiful frosted overlay dark title panel at the bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent text-white space-y-1.5 pt-12">
                              <span className="inline-block text-[9px] font-black text-amber-300 uppercase tracking-widest bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-md">
                                Kec. {activeSlide.data.kecamatan || 'Tasikmalaya'}
                              </span>
                              <h3 className="text-xs sm:text-sm md:text-base font-extrabold line-clamp-2 leading-snug">
                                {activeSlide.data.nama_usaha}
                              </h3>
                              <p className="text-[10px] text-slate-300 font-medium leading-none">
                                Pemilik: {activeSlide.data.nama_pemilik}
                              </p>
                              <div className="flex items-center gap-2 pt-1.5 border-t border-white/10 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                                  Sorotan UMKM Unggulan
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full relative">
                          <img 
                            src={heroBg} 
                            alt="Hero main cover" 
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          
                          {/* Beautiful frosted overlay title panel at the bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent text-white space-y-1.5 pt-12">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono bg-blue-600/95 text-white font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-widest">
                                FKP // KABUPATEN TASIK
                              </span>
                              <Award className="w-5 h-5 text-yellow-400 drop-shadow-md shrink-0" />
                            </div>
                            
                            <h3 className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-white leading-snug">
                              Kolaborasi Kewirausahaan Pemuda
                            </h3>
                            <p className="text-[10px] text-slate-200 font-semibold leading-relaxed line-clamp-2">
                              Mensinergikan 39 Kecamatan dalam mendesain lokomotif ekonomi lokal yang mandiri dan berintegritas.
                            </p>
                            
                            <div className="flex items-center gap-2 pt-1.5 border-t border-white/10 shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                              <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                                Platform Digital Aktif
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS OVERVIEW */}
      <section className="relative z-20 -mt-10 max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
            <span className="text-3xl font-black text-slate-800">{pks.length || 39}</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Kecamatan Aktif</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">1,250+</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Anggota Aktif</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
            <span className="text-3xl font-black text-slate-800">350+</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">UMKM Terdaftar</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
            <span className="text-3xl font-black text-slate-800">15+</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Program Unggulan</span>
          </div>
        </div>
      </section>

      {/* QUICK ACCESS SECTION */}
      <section className="max-w-5xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="#berita-terbaru" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-blue-200 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Berita Terbaru</h3>
              <p className="text-xs text-slate-500 font-medium">Update kegiatan DPD dan PK FKP.</p>
            </div>
          </a>
          <a href="#agenda-events" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-cyan-200 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Agenda Mendatang</h3>
              <p className="text-xs text-slate-500 font-medium">Pelatihan, seminar, dan networking.</p>
            </div>
          </a>
          <a href="#pk-kecamatan" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-indigo-200 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Pengurus</h3>
              <p className="text-xs text-slate-500 font-medium">Hubungi PK di wilayah Anda.</p>
            </div>
          </a>
        </div>
      </section>

      {/* 3. TENTANG & VISI MISI */}
      <section className="py-20 bg-slate-50" id="tentang">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 pb-2">Visi & Misi Forum</h2>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-2">Mendasari Setiap Langkah Perjuangan Kewirausahaan Pemuda</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Visi & Sejarah */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full transform translate-x-10 -translate-y-10"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Visi Organisasi</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed font-semibold italic">
                  "{profil?.visi || DEFAULT_PROFIL.visi}"
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Sejarah Pendirian</h3>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  {profil?.sejarah || DEFAULT_PROFIL.sejarah}
                </p>
              </div>
            </div>

            {/* Right Column: Misi Cards */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3 mb-6 bg-white py-3 px-4 rounded-xl border border-slate-100 shadow-sm">
                <Award className="w-6 h-6 text-yellow-500 shrink-0" />
                <span className="text-sm font-extrabold text-slate-800">Menyusun Landasan Aksi Melalui Misi Strategis:</span>
              </div>

              {(profil?.misi && profil.misi.length > 0 ? profil.misi : DEFAULT_PROFIL.misi).map((misi, index) => (
                <div 
                  key={index}
                  className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex gap-4 items-start transition-shadow"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-slate-600 text-xs sm:text-sm font-semibold leading-relaxed">
                    {misi}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 BADAN PENGURUS HARIAN DPD KABUPATEN (KSB) */}
      <section className="py-20 bg-slate-50/60" id="dpd-presidium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 pb-2">
              Presidium Utama (KSB) DPD
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              Ketua, Sekretaris, & Bendahara Dewan Pengurus Daerah Kabupaten Tasikmalaya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* 1. Ketua */}
            <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-blue-500 transition-colors p-1 bg-slate-50 mb-5 relative shrink-0">
                <img 
                  src={profil?.foto_ketua_dpd || DEFAULT_PROFIL.foto_ketua_dpd} 
                  alt="Ketua DPD" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-2 font-mono">
                Ketua DPD
              </span>
              <h3 className="text-base font-extrabold text-slate-950">
                {profil?.nama_ketua_dpd || DEFAULT_PROFIL.nama_ketua_dpd}
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                FKP Kabupaten Tasikmalaya
              </p>
            </div>

            {/* 2. Sekretaris */}
            <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-cyan-500 transition-colors p-1 bg-slate-50 mb-5 relative shrink-0">
                <img 
                  src={profil?.foto_sekretaris_dpd || DEFAULT_PROFIL.foto_sekretaris_dpd} 
                  alt="Sekretaris DPD" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[10px] bg-cyan-50 text-cyan-600 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-2 font-mono">
                Sekretaris DPD
              </span>
              <h3 className="text-base font-extrabold text-slate-950">
                {profil?.nama_sekretaris_dpd || DEFAULT_PROFIL.nama_sekretaris_dpd}
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                FKP Kabupaten Tasikmalaya
              </p>
            </div>

            {/* 3. Bendahara */}
            <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-teal-500 transition-colors p-1 bg-slate-50 mb-5 relative shrink-0">
                <img 
                  src={profil?.foto_bendahara_dpd || DEFAULT_PROFIL.foto_bendahara_dpd} 
                  alt="Bendahara DPD" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[10px] bg-teal-50 text-teal-600 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-2 font-mono">
                Bendahara DPD
              </span>
              <h3 className="text-base font-extrabold text-slate-950">
                {profil?.nama_bendahara_dpd || DEFAULT_PROFIL.nama_bendahara_dpd}
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                FKP Kabupaten Tasikmalaya
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DIREKTORI PK KECAMATAN */}
      <section className="py-20 bg-white" id="pk-kecamatan">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 pb-2">Pengurus Kecamatan (PK)</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daftar Wilayah Sinergitas PK FKP Kabupaten Tasikmalaya</p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-4 py-2 rounded-full">
              Aktif: {pks.length} PK / 39 Kecamatan
            </span>
          </div>

          {/* Controls Panel (Search & Limit) */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-fade-in">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari berdasarkan kecamatan, ketua, sekretaris, bendahara, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition"
              />
            </div>

            {/* Custom Limit and Statistics */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tampilkan:</span>
                <select
                  value={limitCount}
                  onChange={(e) => setLimitCount(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition cursor-pointer"
                >
                  <option value={3}>3 PK Kecamatan</option>
                  <option value={6}>6 PK Kecamatan (Default)</option>
                  <option value={12}>12 PK Kecamatan</option>
                  <option value={24}>24 PK Kecamatan</option>
                  <option value={-1}>Tampilkan Semua</option>
                </select>
              </div>

              {/* Status information */}
              {(() => {
                const filtered = pks.filter(pk => {
                  const query = searchQuery.toLowerCase();
                  return (
                    pk.nama_kecamatan.toLowerCase().includes(query) ||
                    (pk.nama_ketua && pk.nama_ketua.toLowerCase().includes(query)) ||
                    (pk.nama_sekretaris && pk.nama_sekretaris.toLowerCase().includes(query)) ||
                    (pk.nama_bendahara && pk.nama_bendahara.toLowerCase().includes(query)) ||
                    (pk.deskripsi && pk.deskripsi.toLowerCase().includes(query))
                  );
                });
                const displayCount = limitCount === -1 ? filtered.length : Math.min(limitCount, filtered.length);
                return (
                  <div className="text-[11px] font-extrabold text-slate-500 bg-slate-100/80 px-3.5 py-2.5 rounded-xl border border-slate-200/50">
                    Menampilkan <span className="text-blue-600">{displayCount}</span> dari <span className="text-slate-700">{filtered.length}</span> PK yang cocok
                  </div>
                );
              })()}
            </div>
          </div>

          {(() => {
            const filtered = pks.filter(pk => {
              const query = searchQuery.toLowerCase();
              return (
                pk.nama_kecamatan.toLowerCase().includes(query) ||
                (pk.nama_ketua && pk.nama_ketua.toLowerCase().includes(query)) ||
                (pk.nama_sekretaris && pk.nama_sekretaris.toLowerCase().includes(query)) ||
                (pk.nama_bendahara && pk.nama_bendahara.toLowerCase().includes(query)) ||
                (pk.deskripsi && pk.deskripsi.toLowerCase().includes(query))
              );
            });
            const displayed = limitCount === -1 ? filtered : filtered.slice(0, limitCount);

            if (displayed.length === 0) {
              return (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl py-16 px-4 text-center max-w-lg mx-auto animate-fade-in">
                  <p className="text-sm font-bold text-slate-500">Tidak ada pengurus kecamatan yang cocok dengan "{searchQuery}"</p>
                  <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                  <button 
                    type="button"
                    onClick={() => { setSearchQuery(''); setLimitCount(6); }}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition"
                  >
                    Reset Filter & Pencarian
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayed.map((pk) => (
                  <div 
                    key={pk.id}
                    onClick={() => navigate(`/pk/${pk.id}`)}
                    className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden group hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={pk.foto_ketua_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s"}
                          alt={pk.nama_ketua}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s';
                          }}
                        />
                        <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[11px] font-mono tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-sm font-bold">
                          Kec. {pk.nama_kecamatan}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          PK FKP {pk.nama_kecamatan}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold mb-3">Ketua: {pk.nama_ketua}</p>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {pk.deskripsi || "Berkomitmen memajukan potensi industri kreatif dan mendirikan inkubator kewirausahaan pemuda."}
                        </p>

                        {/* Sekretaris & Bendahara if filled */}
                        {(pk.nama_sekretaris || pk.nama_bendahara) && (
                          <div className="mt-4 pt-3 border-t border-slate-100/80 grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                            {pk.nama_sekretaris && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200/65">
                                  <img
                                    src={pk.foto_sekretaris_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s'}
                                    alt={pk.nama_sekretaris}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s';
                                    }}
                                  />
                                </div>
                                <div className="truncate">
                                  <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">Sekretaris</span>
                                  <span className="block text-slate-700 font-extrabold truncate leading-tight mt-0.5">{pk.nama_sekretaris}</span>
                                </div>
                              </div>
                            )}
                            {pk.nama_bendahara && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200/65">
                                  <img
                                    src={pk.foto_bendahara_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s'}
                                    alt={pk.nama_bendahara}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s';
                                    }}
                                  />
                                </div>
                                <div className="truncate">
                                  <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">Bendahara</span>
                                  <span className="block text-slate-700 font-extrabold truncate leading-tight mt-0.5">{pk.nama_bendahara}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-slate-50 mt-4 flex justify-between items-center">
                      <span className="text-slate-400 text-[11px] font-mono">Didirikan: 2026</span>
                      <div className="text-xs font-bold text-blue-600 group-hover:text-cyan-500 inline-flex items-center gap-1 transition-colors">
                        Lihat Profil PK
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

        </div>
      </section>

      {/* 5. AGENDA / EVENTS KEY */}
      <section className="py-20 bg-slate-50" id="agenda-events">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 pb-2">Kalender Agenda & Event</h2>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mt-2">Geliat & Ruang Kreasi Kolaborasi Wirausaha Kabupaten</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Interactive Timeline Events */}
            <div className="lg:col-span-8 space-y-6">
              {agendas.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center font-medium text-slate-400 text-xs uppercase">
                  Belum ada agenda terdekat saat ini. Hubungi sekretariat untuk mendaftarkan event kecamatan Anda.
                </div>
              ) : (
                agendas.map((ag) => (
                  <div 
                    key={ag.id}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-100 flex flex-col sm:flex-row gap-6 hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="w-full sm:w-44 h-28 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                      <img
                        src={ag.poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80"}
                        alt={ag.judul}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{ag.judul}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">{ag.deskripsi}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 font-semibold pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span>{ag.tanggal_mulai} {ag.tanggal_selesai && ag.tanggal_selesai !== ag.tanggal_mulai ? `s/d ${ag.tanggal_selesai}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span className="truncate max-w-[200px]">{ag.lokasi}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar info with Pentahelix quote */}
            <div className="lg:col-span-4 bg-gradient-to-br from-blue-900 to-slate-950 text-white rounded-2xl p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">Kolaborasi Resmi</span>
              </div>
              <h3 className="text-lg font-extrabold leading-tight">Ikuti & Ramaikan Berbagai Event Kewirausahaan!</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                Setiap pengurus Kecamatan (PK) berhak berkolaborasi menyelenggarakan agenda temu bisnis, pelatihan sosiopreneur, pameran UMKM lokal, hingga mentoring permodalan bekerja sama dengan DPD Kabupaten.
              </p>
              <div className="border-t border-slate-800 pt-4 flex gap-4">
                <div className="text-center flex-1">
                  <span className="block text-2xl font-bold font-mono text-cyan-400">03</span>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mt-1">Agenda Bulan Ini</span>
                </div>
                <div className="w-[1px] bg-slate-800"></div>
                <div className="text-center flex-1">
                  <span className="block text-2xl font-bold font-mono text-cyan-400">12</span>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mt-1">Estimasi Pemateri</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. LATEST NEWS */}
      <section className="py-20 bg-white" id="berita-terbaru">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 pb-2">Kabar & Artikel FKP</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Dapatkan Wawasan, Peluang Bisnis, dan Liputan Aktivitas Pemuda</p>
            </div>
            <Link 
              to="/berita"
              className="text-xs font-extrabold text-blue-600 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 px-5 py-2 rounded-full flex items-center gap-1 hover:border-slate-300 duration-200"
            >
              Lihat Semua Berita
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {beritas.map((ber) => (
              <article 
                key={ber.id}
                className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden group hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
                onClick={() => navigate(`/berita/${ber.id}`)}
              >
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={ber.thumbnail_url || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80"}
                      alt={ber.judul}
                      className="w-full h-full object-cover group-hover:scale-105 duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute bottom-3 left-3 bg-cyan-500 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                      {ber.sumber === 'dpd' ? 'DPD KABUPATEN' : 'PK KECAMATAN'}
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <p className="text-[10px] text-slate-400 font-mono tracking-wider">{new Date(ber.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    <h3 className="text-sm sm:text-base font-extrabold leading-tight text-slate-800 line-clamp-2 hover:text-blue-600 transition-colors">
                      {ber.judul}
                    </h3>
                    <div className="text-xs text-slate-500 line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: ber.konten }}></div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-50 mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Oleh: {ber.penulis}</span>
                  <span className="font-bold text-blue-600 inline-flex items-center gap-1">
                    Baca Detail Misi
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. HUBUNGI KAMI & GOOGLE MAPS */}
      <section className="py-20 bg-slate-50" id="hubungikami">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 pb-2">Hubungi Sekretariat</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Dapatkan Layanan Informasi & Koordinasi Anggota</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                Silakan datang langsung ke sekretariat utama kami, hubungi telepon, WhatsApp, atau jangkau kami di berbagai media sosial resmi FKP Kabupaten Tasikmalaya.
              </p>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 text-xs font-bold text-slate-600">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Alamat Sekretariat DPD</span>
                    <span className="leading-relaxed">{kontak?.alamat || 'Singaparna, Kabupaten Tasikmalaya, Jawa Barat'}</span>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <MessageSquare className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">WhatsApp Admin</span>
                    <a href={getWhatsAppLink(kontak?.whatsapp || '6281234567890', 'Halo Admin DPD FKP Kabupaten Tasikmalaya, saya ingin bertanya mengenai kepengurusan/UMKM.')} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
                      +{(kontak?.whatsapp || '6281234567890')} (Hubungi Sekarang)
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Google Maps */}
            <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg min-h-[350px]">
              <iframe
                title="Google Maps Sekretariat"
                src={kontak?.embed_maps || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.4025178556694!2d108.11239857500122!3d-7.308696892699478s!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e61543b593efae3%3A0xe51ebec75fbfeee3!2sSingaparna%2C%20Tasikmalaya%20Regency%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1717315200000!5m2!1sen!2sid"}
                className="w-full h-full min-h-[350px] border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
