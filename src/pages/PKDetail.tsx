/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  CheckCircle, 
  ShoppingBag,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { dbService } from '@/src/lib/db';
import { PKFKP, UMKM } from '@/src/types';
import { getWhatsAppLink } from '@/src/lib/utils';

export default function PKDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pk, setPk] = useState<PKFKP | null>(null);
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    async function loadData() {
      if (!id) return;
      try {
        const [pkData, umkmList] = await Promise.all([
          dbService.getPK(id),
          dbService.getUMKMs()
        ]);
        setPk(pkData);
        setUmkms(umkmList.filter(u => u.pk_id === id && u.is_active));
      } catch (error) {
        console.error("Gagal memuat profil PK detail", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50 gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin"></div>
        <p className="text-slate-500 font-semibold text-xs">Memuat profil pengurus kecamatan...</p>
      </div>
    );
  }

  if (!pk) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
        <ShieldCheck className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Kecamatan Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
          Kecamatan FKP tersebut tidak terdaftar atau telah dinonaktifkan sementara oleh pengurus Kabupaten.
        </p>
        <Link
          to="/"
          className="inline-block bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 font-sans" id="pk-details-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link 
          to="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        {/* 1. KECAMATAN HEADER INFO CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-md mb-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/5 rounded-full transform translate-x-12 -translate-y-12"></div>
          
          <div className="space-y-4 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600 border border-blue-200 uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5" />
              PK FKP Kecamatan {pk.nama_kecamatan}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Sinergi Wirausaha Pemuda Kecamatan {pk.nama_kecamatan}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
              {pk.deskripsi || 'Berkomitmen memajukan potensi industri kreatif dan mendirikan inkubator kewirausahaan pemuda.'}
            </p>
            {pk.email && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-2">
                <Mail className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Email PK resmi: {pk.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. KETUA PROFILE & LEADERSHIP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Ketua card (Left panel) */}
          <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col justify-between align-middle text-center relative">
            <div className="absolute top-4 left-4 bg-yellow-400 text-slate-950 text-[10px] font-bold uppercase py-0.5 px-2.5 rounded-full tracking-wider shadow">
              Ketua PK
            </div>
            
            <div className="space-y-4 py-6">
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-slate-100 bg-slate-50 overflow-hidden relative shadow">
                <img
                  src={pk.foto_ketua_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s'}
                  alt={pk.nama_ketua}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s';
                  }}
                />
              </div>
              <div className="leading-tight">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{pk.nama_ketua}</h3>
                <span className="text-xs text-slate-400 font-bold tracking-wide block mt-1">Pembina Wirausaha Kecamatan</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">
              Masa Jabatan: 2026 - Sekarang
            </div>
          </div>

          {/* Pengurus/Staff Roster (Right panel) */}
          <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md">
            <h3 className="text-base font-extrabold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="w-5 h-5 text-blue-500" />
              Struktur Jajaran Pengurus Kecamatan
            </h3>

            {(!pk.pengurus || pk.pengurus.length === 0) && !pk.nama_sekretaris && !pk.nama_bendahara ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-8">Belum ada struktur pengurus yang dimasukkan.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {/* Explicit Sekretaris if defined */}
                {pk.nama_sekretaris && (
                  <div className="text-center space-y-2 border border-blue-50 bg-blue-50/20 p-3 rounded-2xl hover:bg-blue-50/40 duration-200">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 border border-slate-200 overflow-hidden shadow-sm">
                      <img
                        src={pk.foto_sekretaris_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s'}
                        alt={pk.nama_sekretaris}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s';
                        }}
                      />
                    </div>
                    <div className="leading-normal">
                      <h4 className="text-xs font-extrabold text-slate-800 truncate">{pk.nama_sekretaris}</h4>
                      <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider block mt-0.5">Sekretaris PK</span>
                    </div>
                  </div>
                )}

                {/* Explicit Bendahara if defined */}
                {pk.nama_bendahara && (
                  <div className="text-center space-y-2 border border-emerald-50 bg-emerald-50/20 p-3 rounded-2xl hover:bg-emerald-50/40 duration-200">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 border border-slate-200 overflow-hidden shadow-sm">
                      <img
                        src={pk.foto_bendahara_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s'}
                        alt={pk.nama_bendahara}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s';
                        }}
                      />
                    </div>
                    <div className="leading-normal">
                      <h4 className="text-xs font-extrabold text-slate-800 truncate">{pk.nama_bendahara}</h4>
                      <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider block mt-0.5">Bendahara PK</span>
                    </div>
                  </div>
                )}

                {/* Standard Pengurus list filtered of duplicate names */}
                {pk.pengurus && pk.pengurus
                  .filter(mgr => {
                    const nameLower = mgr.nama?.toLowerCase();
                    const jbLower = mgr.jabatan?.toLowerCase();
                    if (pk.nama_sekretaris && nameLower === pk.nama_sekretaris.toLowerCase()) return false;
                    if (pk.nama_bendahara && nameLower === pk.nama_bendahara.toLowerCase()) return false;
                    if (pk.nama_sekretaris && (jbLower === 'sekretaris' || jbLower === 'sekretaris pk')) return false;
                    if (pk.nama_bendahara && (jbLower === 'bendahara' || jbLower === 'bendahara pk')) return false;
                    return true;
                  })
                  .map((mgr, index) => (
                    <div key={index} className="text-center space-y-2 border border-slate-50 p-3 rounded-2xl hover:bg-slate-50/55 duration-200">
                      <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 border border-slate-200 overflow-hidden">
                        <img
                          src={mgr.foto_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s'}
                          alt={mgr.nama}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s';
                          }}
                        />
                      </div>
                      <div className="leading-normal">
                        <h4 className="text-xs font-extrabold text-slate-800 truncate">{mgr.nama}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">{mgr.jabatan}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

        </div>

        {/* 3. UMKM BINAAN KECAMATAN */}
        <section className="space-y-6">
          <div className="flex border-b border-slate-200 pb-3 justify-between items-end">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-500" />
              UMKM Binaan Kecamatan {pk.nama_kecamatan}
            </h2>
            <span className="text-[11px] font-extrabold bg-blue-50 text-blue-600 border border-blue-200/50 px-3 py-1 rounded-full">
              Sektor Aktif: {umkms.length} UMKM
            </span>
          </div>

          {umkms.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center max-w-md mx-auto space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-extrabold text-slate-700">Daftar UMKM Masih Kosong</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Belum ada database UMKM dari Kecamatan {pk.nama_kecamatan} yang terpublikasi. Hubungi pengurus Kecamatan untuk mendaftarkan usaha Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {umkms.map((u) => (
                <div 
                  key={u.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 bg-slate-100">
                      <img
                        src={u.foto_url || 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=400&q=80'}
                        alt={u.nama_usaha}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <span className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                        {u.kategori}
                      </span>
                    </div>

                    <div className="p-5">
                      <h4 className="text-base font-extrabold text-slate-800">{u.nama_usaha}</h4>
                      <p className="text-[11px] text-slate-400 font-bold mb-2">Pemilik: {u.nama_pemilik}</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold line-clamp-3 mb-4">{u.deskripsi}</p>
                      
                      {u.produk_jasa && u.produk_jasa.length > 0 && (
                        <div className="flex flex-wrap gap-1 border-t border-slate-50 pt-2">
                          {u.produk_jasa.slice(0, 3).map((p, idx) => (
                            <span key={idx} className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg inline-flex items-center gap-1">
                              <CheckCircle className="w-2 h-2 text-blue-500 inline shrink-0" />
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <a
                      href={getWhatsAppLink(u.no_whatsapp, `Halo ${u.nama_usaha}, saya melihat usaha Anda di portal FKP Kecamatan ${pk?.nama_kecamatan || ''}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center block py-2 px-3 text-xs font-bold rounded-full text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow shadow-sm transition-all"
                    >
                      Hubungi Pemilik
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
