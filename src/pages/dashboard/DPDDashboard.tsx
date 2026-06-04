/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  FileText, 
  Users, 
  Calendar, 
  ShoppingBag, 
  Contact, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Menu,
  X, 
  ThumbsUp, 
  ThumbsDown, 
  Monitor, 
  AlertCircle,
  Home,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { dbService } from '@/src/lib/db';
import ImageUploader from '@/src/components/ImageUploader';
import { 
  ProfilOrganisasi, 
  PKFKP, 
  Berita, 
  Agenda, 
  UMKM, 
  Kontak 
} from '@/src/types';

type TabType = 'overview' | 'profil' | 'hero' | 'berita' | 'pk' | 'agenda' | 'umkm' | 'kontak';

export default function DPDDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  // Database States
  const [profil, setProfil] = useState<ProfilOrganisasi | null>(null);
  const [pks, setPks] = useState<PKFKP[]>([]);
  const [beritas, setBeritas] = useState<Berita[]>([]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [kontak, setKontak] = useState<Kontak | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // CRUD & Edit Temporaries
  const [editingPK, setEditingPK] = useState<PKFKP | null>(null);
  const [newPK, setNewPK] = useState<Partial<PKFKP>>({
    nama_kecamatan: '', 
    nama_ketua: '', 
    foto_ketua_url: '', 
    nama_sekretaris: '',
    foto_sekretaris_url: '',
    nama_bendahara: '',
    foto_bendahara_url: '',
    deskripsi: '', 
    email: '', 
    is_active: true, 
    pengurus: []
  });
  
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [newAgenda, setNewAgenda] = useState<Partial<Agenda>>({
    judul: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '', lokasi: '', poster_url: '', is_active: true
  });

  const [editingUMKM, setEditingUMKM] = useState<UMKM | null>(null);
  const [newUMKM, setNewUMKM] = useState<Partial<UMKM>>({
    nama_usaha: '', nama_pemilik: '', kategori: 'kuliner', deskripsi: '', produk_jasa: [], foto_url: '', no_whatsapp: '', kecamatan: '', is_active: true, pk_id: ''
  });

  const [creatingBerita, setCreatingBerita] = useState(false);
  const [newBerita, setNewBerita] = useState<Partial<Berita>>({
    judul: '', konten: '', thumbnail_url: '', penulis: 'Admin DPD', status: 'draft', sumber: 'dpd'
  });

  const [pkModalOpen, setPkModalOpen] = useState(false);
  const [agendaModalOpen, setAgendaModalOpen] = useState(false);
  const [umkmModalOpen, setUmkmModalOpen] = useState(false);

  const [showStatusNotesId, setShowStatusNotesId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Save/Edit success notifications
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Auth Guard
    if (!authLoading && (!user || user.role !== 'dpd')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const loadAllDatabase = async () => {
    setDataLoading(true);
    try {
      const [p, k, b, a, u, kt] = await Promise.all([
        dbService.getProfil(),
        dbService.getPKs(),
        dbService.getBerita(),
        dbService.getAgendas(),
        dbService.getUMKMs(),
        dbService.getKontak()
      ]);
      setProfil(p);
      setPks(k);
      setBeritas(b);
      setAgendas(a);
      setUmkms(u);
      setKontak(kt);
    } catch (e) {
      console.error('Failed to load database on dashboard', e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'dpd') {
      loadAllDatabase();
    }
  }, [user]);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // ==========================================
  // HANDLERS: PROFIL ORGANISASI
  // ==========================================
  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profil) return;
    try {
      await dbService.updateProfil(profil);
      triggerSuccess('Profil organisasi berhasil diperbarui!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMisi = () => {
    if (!profil) return;
    setProfil({
      ...profil,
      misi: [...profil.misi, ""]
    });
  };

  const handleMisiChange = (index: number, val: string) => {
    if (!profil) return;
    const newMisi = [...profil.misi];
    newMisi[index] = val;
    setProfil({ ...profil, misi: newMisi });
  };

  const handleRemoveMisi = (index: number) => {
    if (!profil) return;
    const newMisi = profil.misi.filter((_, i) => i !== index);
    setProfil({ ...profil, misi: newMisi });
  };

  // ==========================================
  // HANDLERS: HERO SECTION
  // ==========================================
  const handleUpdateHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profil) return;
    try {
      await dbService.updateProfil({
        hero_title: profil.hero_title,
        hero_subtitle: profil.hero_subtitle,
        hero_bg_url: profil.hero_bg_url,
        hero_mode: profil.hero_mode || 'static',
        hero_blur_level: profil.hero_blur_level || 'md'
      });
      triggerSuccess('Hero Banner utama berhasil diperbarui!');
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // HANDLERS: KECAMATAN / PK ACCOUNTS
  // ==========================================
  const handleSavePK = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pkId = editingPK ? editingPK.id : 'pk_' + Date.now();
      const payload: PKFKP = {
        id: pkId,
        nama_kecamatan: newPK.nama_kecamatan || '',
        nama_ketua: newPK.nama_ketua || '',
        foto_ketua_url: newPK.foto_ketua_url || '',
        nama_sekretaris: newPK.nama_sekretaris || '',
        foto_sekretaris_url: newPK.foto_sekretaris_url || '',
        nama_bendahara: newPK.nama_bendahara || '',
        foto_bendahara_url: newPK.foto_bendahara_url || '',
        deskripsi: newPK.deskripsi || '',
        email: newPK.email || null,
        is_active: newPK.is_active !== undefined ? newPK.is_active : true,
        pengurus: editingPK ? editingPK.pengurus : [],
        created_at: editingPK ? editingPK.created_at : new Date().toISOString()
      };
      await dbService.savePK(payload);
      setEditingPK(null);
      setNewPK({ 
        nama_kecamatan: '', 
        nama_ketua: '', 
        foto_ketua_url: '', 
        nama_sekretaris: '',
        foto_sekretaris_url: '',
        nama_bendahara: '',
        foto_bendahara_url: '',
        deskripsi: '', 
        email: '', 
        is_active: true, 
        pengurus: [] 
      });
      setPkModalOpen(false);
      loadAllDatabase();
      triggerSuccess('Data PK Kecamatan berhasil disimpan!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePK = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menolak & menghapus jajaran PK kecamatan ini?')) return;
    try {
      await dbService.deletePK(id);
      loadAllDatabase();
      triggerSuccess('Akun PK berhasil dihapus.');
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // HANDLERS: BERITA / NEWS MANAGERS
  // ==========================================
  const handleCreateBerita = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bSlug = (newBerita.judul || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload: Berita = {
        id: 'b_' + Date.now(),
        judul: newBerita.judul || '',
        slug: bSlug,
        konten: newBerita.konten || '',
        thumbnail_url: newBerita.thumbnail_url || '',
        penulis: newBerita.penulis || 'Admin DPD',
        sumber: 'dpd',
        pk_id: null,
        status: 'published',
        catatan_review: null,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      await dbService.saveBerita(payload);
      setCreatingBerita(false);
      setNewBerita({ judul: '', konten: '', thumbnail_url: '', penulis: 'Admin DPD', status: 'draft', sumber: 'dpd' });
      loadAllDatabase();
      triggerSuccess('Artikel berita DPD berhasil diterbitkan!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewBerita = async (id: string, status: 'published' | 'rejected') => {
    const b = beritas.find(x => x.id === id);
    if (!b) return;
    try {
      const updated: Berita = {
        ...b,
        status,
        catatan_review: reviewNote || null,
        published_at: status === 'published' ? new Date().toISOString() : null
      };
      await dbService.saveBerita(updated);
      setShowStatusNotesId(null);
      setReviewNote('');
      loadAllDatabase();
      triggerSuccess(`Materi berita status updated to: ${status}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBerita = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel berita ini?')) return;
    try {
      await dbService.deleteBerita(id);
      loadAllDatabase();
      triggerSuccess('Artikel berita berhasil dihapus.');
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // HANDLERS: AGENDA
  // ==========================================
  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const aId = editingAgenda ? editingAgenda.id : 'a_' + Date.now();
      const payload: Agenda = {
        id: aId,
        judul: newAgenda.judul || '',
        deskripsi: newAgenda.deskripsi || '',
        tanggal_mulai: newAgenda.tanggal_mulai || '',
        tanggal_selesai: newAgenda.tanggal_selesai || '',
        lokasi: newAgenda.lokasi || '',
        poster_url: newAgenda.poster_url || '',
        is_active: newAgenda.is_active !== undefined ? newAgenda.is_active : true,
        created_at: editingAgenda ? editingAgenda.created_at : new Date().toISOString()
      };
      await dbService.saveAgenda(payload);
      setEditingAgenda(null);
      setNewAgenda({ judul: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '', lokasi: '', poster_url: '', is_active: true });
      setAgendaModalOpen(false);
      loadAllDatabase();
      triggerSuccess('Agenda kegiatan disimpan!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAgenda = async (id: string) => {
    if (!confirm('Hapus agenda kegiatan?')) return;
    try {
      await dbService.deleteAgenda(id);
      loadAllDatabase();
      triggerSuccess('Agenda berhasil dinonaktifkan.');
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // HANDLERS: UMKM (ALL)
  // ==========================================
  const handleSaveUMKM = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uId = editingUMKM ? editingUMKM.id : 'u_' + Date.now();
      const payload: UMKM = {
        id: uId,
        pk_id: newUMKM.pk_id || 'pk_singaparna',
        nama_usaha: newUMKM.nama_usaha || '',
        nama_pemilik: newUMKM.nama_pemilik || '',
        kategori: newUMKM.kategori as any || 'kuliner',
        deskripsi: newUMKM.deskripsi || '',
        produk_jasa: newUMKM.produk_jasa || [],
        foto_url: newUMKM.foto_url || '',
        no_whatsapp: newUMKM.no_whatsapp || '',
        kecamatan: pks.find(p => p.id === newUMKM.pk_id)?.nama_kecamatan || 'Singaparna',
        is_active: newUMKM.is_active !== undefined ? newUMKM.is_active : true,
        created_at: editingUMKM ? editingUMKM.created_at : new Date().toISOString()
      };
      await dbService.saveUMKM(payload);
      setEditingUMKM(null);
      setNewUMKM({ nama_usaha: '', nama_pemilik: '', kategori: 'kuliner', deskripsi: '', produk_jasa: [], foto_url: '', no_whatsapp: '', kecamatan: '', is_active: true, pk_id: '' });
      setUmkmModalOpen(false);
      loadAllDatabase();
      triggerSuccess('Data UMKM wirausaha disimpan!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUMKM = async (id: string) => {
    if (!confirm('Hapus wirausaha UMKM dari database?')) return;
    try {
      await dbService.deleteUMKM(id);
      loadAllDatabase();
      triggerSuccess('UMKM berhasil dihapus.');
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // HANDLERS: KONTAK INFO
  // ==========================================
  const handleUpdateKontak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kontak) return;
    try {
      await dbService.updateKontak(kontak);
      triggerSuccess('Kontak DPD & Social Media berhasil diperbarui!');
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
        <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Penyelarasan Konsol Administrasi DPD...</p>
      </div>
    );
  }

  const pendingBerita = beritas.filter(b => b.status === 'pending');

  const menuItems = [
    { type: 'overview', label: 'Ringkasan Stats', icon: LayoutDashboard },
    { type: 'profil', label: 'Profil Organisasi', icon: Settings },
    { type: 'hero', label: 'Banner Utama Layout', icon: Monitor },
    { type: 'berita', label: 'Liputan Kabar Berita', icon: FileText, badge: pendingBerita.length },
    { type: 'pk', label: 'Kelola PK Kecamatan', icon: Users },
    { type: 'agenda', label: 'Kalender Agenda', icon: Calendar },
    { type: 'umkm', label: 'Direktori UMKM', icon: ShoppingBag },
    { type: 'kontak', label: 'Sekretariat & Kontak', icon: Contact }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans" id="dpd-dashboard-parent-layout">
      
      {/* Toast Alert pop */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-emerald-500/20 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Mobile Sticky Header Bar */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 px-1.5 rounded-md flex items-center justify-center shadow-sm shrink-0">
            <img 
              src="https://lh3.googleusercontent.com/d/1mJoucoBL-xS9gWnQYaaHcJ3hsumyG7Qb" 
              alt="FKP Logo" 
              className="h-5 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-extrabold text-sm tracking-tight">Konsol Kab. Tasik</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:text-white focus:outline-none"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Side-Navigation Panel */}
      <aside className={`bg-slate-900 text-slate-300 w-full md:w-64 shrink-0 transition-all border-r border-slate-800 md:h-screen md:sticky md:top-0 flex flex-col ${sidebarOpen ? 'block' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="bg-white p-1 px-1.5 rounded-md flex items-center justify-center shadow-sm shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/d/1mJoucoBL-xS9gWnQYaaHcJ3hsumyG7Qb" 
                alt="FKP Logo" 
                className="h-5 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate">Konsol Kab. Tasik</span>
          </div>
          <span className="text-[9px] bg-blue-500/10 border border-blue-500/25 text-cyan-400 font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0">DPD</span>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.type;
            return (
              <button
                key={item.type}
                onClick={() => {
                  setActiveTab(item.type as TabType);
                  setCreatingBerita(false);
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full text-left py-2.5 px-4 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-extrabold' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer buttons */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-2 mt-auto">
          <button
            onClick={() => navigate('/')}
            className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg flex items-center gap-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Kembali ke Beranda</span>
          </button>
          
          <button
            onClick={async () => {
              const { logout } = useAuthStore.getState();
              await logout();
              navigate('/');
            }}
            className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg flex items-center gap-2.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Keluar Sesi (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Console Workspace */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Workspace banner info */}
        <header className="mb-8 border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 capitalize">
              {activeTab === 'overview' ? 'Ringkasan Ekosistem Kewirausahaan' : `${activeTab} Management`}
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">DPD Forum Kewirausahaan Pemuda • Kabupaten Tasikmalaya</p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Platform: <span className="text-cyan-600 font-bold">Local Hybrid Live</span>
          </div>
        </header>

        {/* ------------------------------------- */}
        {/* SECTION: OVERVIEW */}
        {/* ------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in" id="dpd-overview-subsection">
            
            {/* Counts grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              
              <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 shrink-0"><Users className="w-5 h-5" /></div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Kecamatan (PK)</span>
                  <span className="text-2xl font-black text-slate-800">{pks.length}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-600 shrink-0"><ShoppingBag className="w-5 h-5" /></div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Total UMKM</span>
                  <span className="text-2xl font-black text-slate-800">{umkms.length}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-orange-100 text-orange-600 shrink-0"><FileText className="w-5 h-5" /></div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Berita Terbit</span>
                  <span className="text-2xl font-black text-slate-800">{beritas.filter(b => b.status === 'published').length}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 shrink-0"><Calendar className="w-5 h-5" /></div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Agenda Aktif</span>
                  <span className="text-2xl font-black text-slate-800">{agendas.filter(a => a.is_active).length}</span>
                </div>
              </div>

            </div>

            {/* Pending actions container */}
            <div className="bg-white border border-slate-200/50 rounded-2xl shadow p-6">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Saran Hubungan & Persetujuan Berita PK ({pendingBerita.length})
              </h3>

              {pendingBerita.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center">Bagus! Tidak ada draf berita PK kecamatan yang butuh persetujuan saat ini.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingBerita.map((b) => (
                    <div key={b.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 leading-normal">{b.judul}</h4>
                        <span className="text-[10px] text-slate-400 block font-semibold">Diajukan Oleh: {b.penulis} • PK ID: {b.pk_id || 'Kecamatan'}</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setReviewNote('Diterima dan dipublikasikan secara langsung.');
                            handleReviewBerita(b.id, 'published');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Setujui
                        </button>
                        <button
                          onClick={() => {
                            setShowStatusNotesId(b.id);
                            setReviewNote('');
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          Tolak / Catatan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews edit modal notes box */}
            {showStatusNotesId && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 max-w-lg">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 block">Catatan Review Penolakan:</label>
                <textarea
                  placeholder="Ketik alasan mengapa berita draf PK kecamatan ini perlu ditolak / diperbaiki..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg text-slate-600 font-semibold"
                  rows={2}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowStatusNotesId(null)}
                    className="text-xs font-semibold px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleReviewBerita(showStatusNotesId, 'rejected')}
                    className="text-xs font-bold px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Kirim Penolakan
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------- */}
        {/* SECTION: EDIT ORGANISASI PROFIL */}
        {/* ------------------------------------- */}
        {activeTab === 'profil' && profil && (
          <form onSubmit={handleUpdateProfil} className="bg-white border border-slate-200/50 rounded-2xl p-6 md:p-8 shadow space-y-6 animate-fade-in" id="dpd-profil-subsection">
            <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Identitias Utama Organisasi</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Nama Lengkap Organisasi</label>
                <input
                  type="text"
                  value={profil.nama_organisasi}
                  onChange={(e) => setProfil({ ...profil, nama_organisasi: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Singkatan Resmi</label>
                <input
                  type="text"
                  value={profil.singkatan}
                  onChange={(e) => setProfil({ ...profil, singkatan: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase">Visi Utama DPD</label>
              <textarea
                value={profil.visi}
                onChange={(e) => setProfil({ ...profil, visi: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                rows={2}
                required
              />
            </div>

            {/* Misi structure (Array editing list) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Misi Utama (Daftar Poin)</label>
                <button
                  type="button"
                  onClick={handleAddMisi}
                  className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100"
                >
                  + Tambah Baris Misi
                </button>
              </div>

              <div className="space-y-2">
                {profil.misi.map((m, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={m}
                      onChange={(e) => handleMisiChange(idx, e.target.value)}
                      className="flex-1 text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                      placeholder={`Pernyataan misi nomor #${idx + 1}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMisi(idx)}
                      className="p-2 text-red-500 hover:bg-red-55 border border-slate-200 hover:border-red-100 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase">Sejarah Singkat Pendirian</label>
              <textarea
                value={profil.sejarah}
                onChange={(e) => setProfil({ ...profil, sejarah: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                rows={3}
                required
              />
            </div>

            {/* Image Upload for Logo */}
            <ImageUploader 
              value={profil.logo_url} 
              onChange={(url) => setProfil({ ...profil, logo_url: url })} 
              label="Logo Organisasi" 
            />

            {/* Pengurus Inti KSB DPD Kabupaten */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 animate-pulse" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  Pengurus Inti KSB DPD Kabupaten (Ketua, Sekretaris, Bendahara)
                </h4>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                Silakan isi data nama dan lampirkan foto formal dari para Pengurus Utama DPD Kabupaten untuk dipublikasikan pada halaman muka (Landing Page).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* 1. Ketua */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl space-y-4">
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">
                    Ketua DPD
                  </span>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Nama Lengkap Ketua</label>
                    <input
                      type="text"
                      value={profil.nama_ketua_dpd || ''}
                      onChange={(e) => setProfil({ ...profil, nama_ketua_dpd: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Contoh: Aris Rahman, M.Pd."
                    />
                  </div>
                  <ImageUploader 
                    value={profil.foto_ketua_dpd || ''} 
                    onChange={(url) => setProfil({ ...profil, foto_ketua_dpd: url })} 
                    label="Foto Ketua (Formal)" 
                  />
                </div>

                {/* 2. Sekretaris */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl space-y-4">
                  <span className="text-[10px] bg-cyan-100 text-cyan-700 font-black px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">
                    Sekretaris DPD
                  </span>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Nama Lengkap Sekretaris</label>
                    <input
                      type="text"
                      value={profil.nama_sekretaris_dpd || ''}
                      onChange={(e) => setProfil({ ...profil, nama_sekretaris_dpd: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Contoh: Nanda Septian, S.Kom."
                    />
                  </div>
                  <ImageUploader 
                    value={profil.foto_sekretaris_dpd || ''} 
                    onChange={(url) => setProfil({ ...profil, foto_sekretaris_dpd: url })} 
                    label="Foto Sekretaris" 
                  />
                </div>

                {/* 3. Bendahara */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl space-y-4">
                  <span className="text-[10px] bg-teal-100 text-teal-700 font-black px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">
                    Bendahara DPD
                  </span>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Nama Lengkap Bendahara</label>
                    <input
                      type="text"
                      value={profil.nama_bendahara_dpd || ''}
                      onChange={(e) => setProfil({ ...profil, nama_bendahara_dpd: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Contoh: Rina Marlina, S.Ak."
                    />
                  </div>
                  <ImageUploader 
                    value={profil.foto_bendahara_dpd || ''} 
                    onChange={(url) => setProfil({ ...profil, foto_bendahara_dpd: url })} 
                    label="Foto Bendahara" 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
              >
                Simpan Profil Identitas
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------- */}
        {/* SECTION: EDIT HERO SECTION */}
        {/* ------------------------------------- */}
        {activeTab === 'hero' && profil && (
          <form onSubmit={handleUpdateHero} className="bg-white border border-slate-200/50 rounded-2xl p-6 md:p-8 shadow space-y-6 animate-fade-in" id="dpd-hero-subsection">
            <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Tampilan Hero Utama Beranda</h3>

            {/* Mode Switcher */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">Format Tampilan Hero</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setProfil({ ...profil, hero_mode: 'static' })}
                  className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    (!profil.hero_mode || profil.hero_mode === 'static')
                      ? 'border-blue-600 bg-blue-50/20 shadow-sm'
                      : 'border-slate-150 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Mode Slogan Statis</span>
                  <span className="text-[11px] text-slate-400 font-semibold mt-1 leading-relaxed">
                    Menampilkan judul, penjelasan, dan gambar latar belakang yang Anda atur secara manual di halaman ini.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfil({ ...profil, hero_mode: 'dynamic' })}
                  className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    profil.hero_mode === 'dynamic'
                      ? 'border-cyan-500 bg-cyan-50/20 shadow-sm'
                      : 'border-slate-150 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Mode Slideshow Berita Dinamis</span>
                  <span className="text-[11px] text-slate-400 font-semibold mt-1 leading-relaxed">
                    Sistem otomatis mengumpulkan berita terbitan terbaru (Published) & memutarnya sebagai slider di halaman beranda.
                  </span>
                </button>
              </div>
            </div>

            {profil.hero_mode === 'dynamic' && (
              <div className="space-y-4 pt-2">
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-200 rounded-xl p-4 text-xs text-cyan-800 font-semibold flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse mt-1.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Slide Berita Aktif:</strong> Saat ini Anda menggunakan mode dinamis. Banner utama beranda akan berputar otomatis menampilkan seluruh berita terbaru yang sudah lolos review & terbit.
                  </p>
                </div>

                {/* Blur level selection control */}
                <div className="space-y-2 border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Tingkat Keburaman Panel Berita Terpopuler (Backdrop Blur)</label>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase shrink-0">
                      {profil.hero_blur_level === 'none' && 'Tanpa Blur'}
                      {profil.hero_blur_level === 'sm' && 'Sangat Halus (sm)'}
                      {(profil.hero_blur_level === 'md' || !profil.hero_blur_level) && 'Sedang (md)'}
                      {profil.hero_blur_level === 'lg' && 'Tebal (lg)'}
                      {profil.hero_blur_level === 'xl' && 'Sangat Tebal (xl)'}
                      {profil.hero_blur_level === '2xl' && 'Maksimum (2xl)'}
                      {profil.hero_blur_level === '3xl' && 'Ekstrem (3xl)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Bisa diatur untuk menyesuaikan keterbacaan teks ringkasan berita terpopuler yang tampil melayang di atas gambar/thumbnail berita utama.</p>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1.5">
                    {[
                      { key: 'none', label: 'None' },
                      { key: 'sm', label: 'sm' },
                      { key: 'md', label: 'md' },
                      { key: 'lg', label: 'lg' },
                      { key: 'xl', label: 'xl' },
                      { key: '2xl', label: '2xl' },
                      { key: '3xl', label: '3xl' }
                    ].map((level) => {
                      const isActive = profil.hero_blur_level === level.key || (!profil.hero_blur_level && level.key === 'md');
                      return (
                        <button
                          key={level.key}
                          type="button"
                          onClick={() => setProfil({ ...profil, hero_blur_level: level.key as any })}
                          className={`py-2 px-1 text-center rounded-lg border text-[10px] font-black transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                          }`}
                        >
                          {level.label.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {profil.hero_mode === 'dynamic' ? 'Data Cadangan (Fallback)' : 'Pengaturan Banner Statis'}
                </span>
                <div className="h-[1px] bg-slate-100 flex-1"></div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Judul Hero Banner (Heading Utama)</label>
                <input
                  type="text"
                  value={profil.hero_title}
                  onChange={(e) => setProfil({ ...profil, hero_title: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Sub-judul Hero Banner (Paragraf Penjelas)</label>
                <textarea
                  value={profil.hero_subtitle}
                  onChange={(e) => setProfil({ ...profil, hero_subtitle: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                  rows={3}
                  required
                />
              </div>

              <ImageUploader
                value={profil.hero_bg_url}
                onChange={(url) => setProfil({ ...profil, hero_bg_url: url })}
                label="Foto Perlengkapan Cover Beranda (Hero Background Image)"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-full shadow-md cursor-pointer hover:scale-105 transition-all"
              >
                Simpan Penyesuaian Hero Beranda
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------- */}
        {/* SECTION: BERITA MANAGEMENT */}
        {/* ------------------------------------- */}
        {activeTab === 'berita' && (
          <div className="space-y-6 animate-fade-in" id="dpd-berita-subsection">
            
            <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">Katalog Berita Kabupaten</h3>
                <button
                  onClick={() => {
                    if (!newBerita.judul && !newBerita.konten) {
                      setNewBerita({ judul: '', konten: '', thumbnail_url: '', penulis: 'Admin DPD', status: 'draft', sumber: 'dpd' });
                    }
                    setCreatingBerita(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Tulis Berita DPD
                </button>
              </div>

              <div className="overflow-x-auto text-slate-600 text-xs font-semibold">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400">
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Judul Artikel</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Penulis</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Asal Sumber</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Status</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {beritas.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-slate-800 pr-4 max-w-[250px] truncate">{b.judul}</td>
                        <td className="py-3">{b.penulis}</td>
                        <td className="py-3 capitalize">{b.sumber === 'dpd' ? 'DPD' : 'PK Kecamatan'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                            b.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            b.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleDeleteBerita(b.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Popup Tulis Berita */}
            {creatingBerita && (
              <div 
                onClick={() => setCreatingBerita(false)}
                className="fixed inset-0 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-5 sm:space-y-6 border border-slate-100/10 cursor-default"
                >
                  {/* Swipe Pull Handle indicator for classy mobile look */}
                  <div className="mx-auto w-12 h-1.5 bg-slate-250 rounded-full mb-1 sm:hidden shrink-0" />
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 sm:pb-4 gap-4">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800 uppercase tracking-tight">Tulis & Terbitkan Berita Baru</h3>
                    <button
                      type="button"
                      onClick={() => setCreatingBerita(false)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full font-bold shrink-0 transition-all hover:scale-105"
                    >
                      Tutup
                    </button>
                  </div>

                  <form onSubmit={handleCreateBerita} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase">Judul Artikel Berita</label>
                      <input
                        type="text"
                        value={newBerita.judul}
                        onChange={(e) => setNewBerita({ ...newBerita, judul: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                        placeholder="Contoh: FKP Dorong Penguatan Ekonomi Pemuda Bojongkoneng"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase">Konten Materi (Dukungan Format HTML Sederhana)</label>
                      <textarea
                        value={newBerita.konten}
                        onChange={(e) => setNewBerita({ ...newBerita, konten: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                        rows={6}
                        placeholder="Gunakan tag <p> untuk menyusun paragraf atau tulis langsung..."
                        required
                      />
                    </div>

                    <ImageUploader
                      value={newBerita.thumbnail_url || ''}
                      onChange={(url) => setNewBerita({ ...newBerita, thumbnail_url: url })}
                      label="Thumbnail / Foto Utama Artikel"
                    />

                    <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
                      <button
                        type="button"
                        onClick={() => setCreatingBerita(false)}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-full"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-full shadow cursor-pointer"
                      >
                        Terbitkan Berita
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------- */}
        {/* SECTION: PK ACCOUNTS */}
        {/* ------------------------------------- */}
        {activeTab === 'pk' && (
          <div className="space-y-6 animate-fade-in" id="dpd-pk-subsection">
            
            <div className="bg-white border border-slate-200/50 p-6 rounded-2xl shadow w-full">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">Daftar Wilayah Resmi PK FKP Kabupaten</h3>
                <button
                  onClick={() => {
                    setEditingPK(null);
                    if (!newPK.nama_kecamatan && !newPK.nama_ketua && !newPK.email) {
                      setNewPK({ 
                        nama_kecamatan: '', 
                        nama_ketua: '', 
                        foto_ketua_url: '', 
                        nama_sekretaris: '',
                        foto_sekretaris_url: '',
                        nama_bendahara: '',
                        foto_bendahara_url: '',
                        deskripsi: '', 
                        email: '', 
                        is_active: true, 
                        pengurus: [] 
                      });
                    }
                    setPkModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Daftarkan PK Baru
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pks.map((p) => (
                  <div key={p.id} className="p-4 border border-slate-100 rounded-xl space-y-3 flex flex-col justify-between hover:border-blue-100 transition-colors bg-slate-50/50">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-extrabold text-slate-800 uppercase">Kec. {p.nama_kecamatan}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.is_active ? 'Aktif' : 'Beku'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold block mt-1">Ketua: {p.nama_ketua}</p>
                      <p className="text-[10px] text-slate-400 font-semibold block truncate mt-0.5">Email: {p.email || 'Belum diatur'}</p>
                    </div>

                    <div className="flex justify-end gap-1.5 border-t border-slate-200/50 pt-2 text-[10px] font-bold">
                      <button
                        onClick={() => {
                          setEditingPK(p);
                          setNewPK(p);
                          setPkModalOpen(true);
                        }}
                        className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 px-3 py-1 rounded-md"
                      >
                        <Edit3 className="w-3 h-3 inline mr-0.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeletePK(p.id)}
                        className="bg-white border border-slate-200 text-red-600 hover:bg-red-50 px-3 py-1 rounded-md"
                      >
                        <Trash2 className="w-3 h-3 inline mr-0.5" /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Popup PK Register / Edit */}
            {pkModalOpen && (
              <div 
                onClick={() => setPkModalOpen(false)}
                className="fixed inset-0 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-5 sm:space-y-6 border border-slate-100/10 cursor-default"
                >
                  {/* Swipe Pull Handle indicator for classy mobile look */}
                  <div className="mx-auto w-12 h-1.5 bg-slate-250 rounded-full mb-1 sm:hidden shrink-0" />
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 sm:pb-4 gap-4">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800 uppercase tracking-tight">
                      {editingPK ? 'Edit Kecamatan Account' : 'Buat Akun PK Kecamatan Baru'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPkModalOpen(false)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full font-bold shrink-0 transition-all hover:scale-105"
                    >
                      Tutup
                    </button>
                  </div>

                  <form onSubmit={handleSavePK} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Nama Kecamatan</label>
                      <input
                        type="text"
                        value={newPK.nama_kecamatan}
                        onChange={(e) => setNewPK({ ...newPK, nama_kecamatan: e.target.value })}
                        placeholder="Contoh: Singaparna"
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Akun Gmail Terkait (Untuk Google login)</label>
                      <input
                        type="email"
                        value={newPK.email || ''}
                        onChange={(e) => setNewPK({ ...newPK, email: e.target.value })}
                        placeholder="pk.username@gmail.com"
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Nama Lengkap Ketua PK</label>
                      <input
                        type="text"
                        value={newPK.nama_ketua}
                        onChange={(e) => setNewPK({ ...newPK, nama_ketua: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Deskripsi / Bidang Fokus</label>
                      <textarea
                        value={newPK.deskripsi}
                        onChange={(e) => setNewPK({ ...newPK, deskripsi: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        rows={3}
                      />
                    </div>

                    <ImageUploader
                      value={newPK.foto_ketua_url || ''}
                      onChange={(url) => setNewPK({ ...newPK, foto_ketua_url: url })}
                      label="Foto Jajaran Ketua PK"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">Nama Lengkap Sekretaris</label>
                        <input
                          type="text"
                          value={newPK.nama_sekretaris || ''}
                          onChange={(e) => setNewPK({ ...newPK, nama_sekretaris: e.target.value })}
                          placeholder="Nama Sekretaris"
                          className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        />
                      </div>
                      <ImageUploader
                        value={newPK.foto_sekretaris_url || ''}
                        onChange={(url) => setNewPK({ ...newPK, foto_sekretaris_url: url })}
                        label="Foto Sekretaris PK"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">Nama Lengkap Bendahara</label>
                        <input
                          type="text"
                          value={newPK.nama_bendahara || ''}
                          onChange={(e) => setNewPK({ ...newPK, nama_bendahara: e.target.value })}
                          placeholder="Nama Bendahara"
                          className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        />
                      </div>
                      <ImageUploader
                        value={newPK.foto_bendahara_url || ''}
                        onChange={(url) => setNewPK({ ...newPK, foto_bendahara_url: url })}
                        label="Foto Bendahara PK"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Status Keaktifan</label>
                      <select
                        value={newPK.is_active ? 'yes' : 'no'}
                        onChange={(e) => setNewPK({ ...newPK, is_active: e.target.value === 'yes' })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg font-semibold text-slate-600 focus:bg-white"
                      >
                        <option value="yes">Aktif</option>
                        <option value="no">Non-Aktif / Bekukan</option>
                      </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setPkModalOpen(false);
                          // Preserve input details to satisfy user's safety request
                        }}
                        className="text-xs font-bold px-4 py-2.5 border bg-red-50 text-red-600 rounded-full hover:bg-red-100"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full shadow"
                      >
                        {editingPK ? 'Perbarui Data PK' : 'Daftarkan PK Baru'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------- */}
        {/* SECTION: KALENDER AGENDA */}
        {/* ------------------------------------- */}
        {activeTab === 'agenda' && (
          <div className="space-y-6 animate-fade-in" id="dpd-agenda-subsection">
            
            <div className="bg-white border border-slate-200/50 p-6 rounded-2xl shadow w-full">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">Kalender Agenda & Kegiatan</h3>
                <button
                  onClick={() => {
                    setEditingAgenda(null);
                    if (!newAgenda.judul && !newAgenda.deskripsi) {
                      setNewAgenda({ judul: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '', lokasi: '', poster_url: '', is_active: true });
                    }
                    setAgendaModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Agenda Baru
                </button>
              </div>
              
              <div className="divide-y divide-slate-100 text-slate-600 text-xs font-semibold">
                {agendas.length === 0 ? (
                  <p className="py-4 text-center text-slate-400 font-semibold">Belum ada agenda terdaftar</p>
                ) : (
                  agendas.map((a) => (
                    <div key={a.id} className="py-3.5 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm leading-normal">{a.judul}</h4>
                        <span className="text-[11px] text-slate-400 block font-semibold">{a.tanggal_mulai} • {a.lokasi}</span>
                      </div>
                      <div className="flex gap-2 text-[10px] font-bold shrink-0">
                        <button
                          onClick={() => {
                            setEditingAgenda(a);
                            setNewAgenda(a);
                            setAgendaModalOpen(true);
                          }}
                          className="bg-white p-2 border border-slate-200 text-slate-700 hover:text-blue-600 rounded-lg hover:shadow"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAgenda(a.id)}
                          className="bg-white p-2 border border-slate-200 text-red-600 hover:bg-red-50 rounded-lg hover:shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Popup Agenda Add / Edit */}
            {agendaModalOpen && (
              <div 
                onClick={() => setAgendaModalOpen(false)}
                className="fixed inset-0 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-5 sm:space-y-6 border border-slate-100/10 cursor-default"
                >
                  {/* Swipe Pull Handle indicator for classy mobile look */}
                  <div className="mx-auto w-12 h-1.5 bg-slate-250 rounded-full mb-1 sm:hidden shrink-0" />
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 sm:pb-4 gap-4">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800 uppercase tracking-tight">
                      {editingAgenda ? 'Edit Kegiatan Agenda' : 'Tambah Kegiatan Agenda Baru'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setAgendaModalOpen(false)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full font-bold shrink-0 transition-all hover:scale-105"
                    >
                      Tutup
                    </button>
                  </div>

                  <form onSubmit={handleSaveAgenda} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Judul Kegiatan</label>
                      <input
                        type="text"
                        value={newAgenda.judul}
                        onChange={(e) => setNewAgenda({ ...newAgenda, judul: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        placeholder="Contoh: Temu Bisnis UMKM Bojong"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Rincian Deskripsi</label>
                      <textarea
                        value={newAgenda.deskripsi}
                        onChange={(e) => setNewAgenda({ ...newAgenda, deskripsi: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        rows={3.5}
                        placeholder="Tuliskan detail agenda kegiatan disini..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">Mulai</label>
                        <input
                          type="date"
                          value={newAgenda.tanggal_mulai}
                          onChange={(e) => setNewAgenda({ ...newAgenda, tanggal_mulai: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">Selesai</label>
                        <input
                          type="date"
                          value={newAgenda.tanggal_selesai}
                          onChange={(e) => setNewAgenda({ ...newAgenda, tanggal_selesai: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Lokasi Penyelenggaraan</label>
                      <input
                        type="text"
                        value={newAgenda.lokasi}
                        onChange={(e) => setNewAgenda({ ...newAgenda, lokasi: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        placeholder="Contoh: Gedung Puspas Singaparna"
                        required
                      />
                    </div>

                    <ImageUploader
                      value={newAgenda.poster_url || ''}
                      onChange={(url) => setNewAgenda({ ...newAgenda, poster_url: url })}
                      label="Poster / Gambar Kegiatan"
                    />

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setAgendaModalOpen(false);
                          // Preserve input details to satisfy user's safety request
                        }}
                        className="text-xs font-bold px-4 py-2.5 border bg-red-50 text-red-600 rounded-full hover:bg-red-100"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full shadow"
                      >
                        {editingAgenda ? 'Perbarui Kegiatan' : 'Simpan Agenda Baru'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------- */}
        {/* SECTION: DIREKTORI UMKM (ALL KECAMATAN) */}
        {/* ------------------------------------- */}
        {activeTab === 'umkm' && (
          <div className="space-y-6 animate-fade-in" id="dpd-umkm-subsection">
            
            <div className="bg-white border border-slate-200/50 p-6 rounded-2xl shadow w-full text-slate-600 text-xs font-semibold">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">Anggota Direktori Wirausaha</h3>
                <button
                  onClick={() => {
                    setEditingUMKM(null);
                    if (!newUMKM.nama_usaha && !newUMKM.nama_pemilik && !newUMKM.deskripsi) {
                      setNewUMKM({ nama_usaha: '', nama_pemilik: '', kategori: 'kuliner', deskripsi: '', produk_jasa: [], foto_url: '', no_whatsapp: '', kecamatan: '', is_active: true, pk_id: '' });
                    }
                    setUmkmModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Tambah UMKM Baru
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left font-semibold">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Nama Usaha</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Pemilik</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Kecamatan</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Kategori</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {umkms.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400 font-semibold">Belum ada UMKM terdaftar</td>
                      </tr>
                    ) : (
                      umkms.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-semibold text-slate-800 pr-2">{u.nama_usaha}</td>
                          <td className="py-3">{u.nama_pemilik}</td>
                          <td className="py-3">{u.kecamatan}</td>
                          <td className="py-3 uppercase tracking-wider text-[10px] font-bold text-slate-500">{u.kategori}</td>
                          <td className="py-3 text-right space-x-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setEditingUMKM(u);
                                setNewUMKM(u);
                                setUmkmModalOpen(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 p-0.5"
                            >
                              <Edit3 className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={() => handleDeleteUMKM(u.id)}
                              className="text-red-500 hover:text-red-700 p-0.5"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Popup UMKM Add / Edit */}
            {umkmModalOpen && (
              <div 
                onClick={() => setUmkmModalOpen(false)}
                className="fixed inset-0 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-5 sm:space-y-6 border border-slate-100/10 cursor-default"
                >
                  {/* Swipe Pull Handle indicator for classy mobile look */}
                  <div className="mx-auto w-12 h-1.5 bg-slate-250 rounded-full mb-1 sm:hidden shrink-0" />
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 sm:pb-4 gap-4">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800 uppercase tracking-tight">
                      {editingUMKM ? 'Edit UMKM Wirausaha' : 'Tambah UMKM Binaan Baru dari DPD'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setUmkmModalOpen(false)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full font-bold shrink-0 transition-all hover:scale-105"
                    >
                      Tutup
                    </button>
                  </div>

                  <form onSubmit={handleSaveUMKM} className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Kecamatan Asal Cek (PK)</label>
                      <select
                        value={newUMKM.pk_id}
                        onChange={(e) => setNewUMKM({ ...newUMKM, pk_id: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg font-semibold text-slate-600 focus:bg-white"
                        required
                      >
                        <option value="">Pilih Pengurus Kecamatan...</option>
                        {pks.map((p) => (
                          <option key={p.id} value={p.id}>{p.nama_kecamatan}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Nama Usaha / Toko</label>
                      <input
                        type="text"
                        value={newUMKM.nama_usaha}
                        onChange={(e) => setNewUMKM({ ...newUMKM, nama_usaha: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Nama Lengkap Owner</label>
                      <input
                        type="text"
                        value={newUMKM.nama_pemilik}
                        onChange={(e) => setNewUMKM({ ...newUMKM, nama_pemilik: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">Sektor Kategori</label>
                        <select
                          value={newUMKM.kategori}
                          onChange={(e) => setNewUMKM({ ...newUMKM, kategori: e.target.value as any })}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg font-semibold text-slate-600 focus:bg-white"
                        >
                          <option value="kuliner">Kuliner</option>
                          <option value="fashion">Fashion</option>
                          <option value="kerajinan">Kerajinan</option>
                          <option value="jasa">Jasa</option>
                          <option value="pertanian">Pertanian</option>
                          <option value="teknologi">Teknologi</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">No WhatsApp (Format: 62xx)</label>
                        <input
                          type="text"
                          value={newUMKM.no_whatsapp}
                          onChange={(e) => setNewUMKM({ ...newUMKM, no_whatsapp: e.target.value })}
                          placeholder="6281234567"
                          className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Deskripsi Penjelasan Usaha</label>
                      <textarea
                        value={newUMKM.deskripsi}
                        onChange={(e) => setNewUMKM({ ...newUMKM, deskripsi: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Keunggulan Produk (Pecah koma untuk list)</label>
                      <input
                        type="text"
                        value={newUMKM.produk_jasa ? newUMKM.produk_jasa.join(', ') : ''}
                        onChange={(e) => setNewUMKM({ ...newUMKM, produk_jasa: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        placeholder="Contoh: Kopi Bubuk Galunggung, Cold Brew Botol"
                      />
                    </div>

                    <ImageUploader
                      value={newUMKM.foto_url || ''}
                      onChange={(url) => setNewUMKM({ ...newUMKM, foto_url: url })}
                      label="Foto Outlet / Produk UMKM"
                    />

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setUmkmModalOpen(false);
                          // Preserve input details to satisfy user's safety request
                        }}
                        className="text-xs font-bold px-4 py-2.5 border bg-red-50 text-red-600 rounded-full hover:bg-red-100"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full shadow"
                      >
                        {editingUMKM ? 'Perbarui Data UMKM' : 'Simpan UMKM Baru'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------- */}
        {/* SECTION: KONTAK & SOSMED LAYOUTS */}
        {/* ------------------------------------- */}
        {activeTab === 'kontak' && kontak && (
          <form onSubmit={handleUpdateKontak} className="bg-white border border-slate-200/50 rounded-2xl p-6 md:p-8 shadow space-y-6 animate-fade-in" id="dpd-kontak-subsection">
            <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Kontak Sekretariat & Media Sosial</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Alamat Kantor Sekretariat Utama</label>
                <textarea
                  value={kontak.alamat}
                  onChange={(e) => setKontak({ ...kontak, alamat: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Tautan Embed Google Maps (Source Link Only)</label>
                <textarea
                  value={kontak.embed_maps}
                  onChange={(e) => setKontak({ ...kontak, embed_maps: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                  rows={2}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Email Resmi FKP</label>
                <input
                  type="email"
                  value={kontak.email}
                  onChange={(e) => setKontak({ ...kontak, email: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Telepon Kantor</label>
                <input
                  type="text"
                  value={kontak.telepon}
                  onChange={(e) => setKontak({ ...kontak, telepon: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Nomor WhatsApp Sekretariat (Contoh: 6281xxxx)</label>
                <input
                  type="text"
                  value={kontak.whatsapp}
                  onChange={(e) => setKontak({ ...kontak, whatsapp: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                  required
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 border-t border-slate-100 pt-6">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Username Instagram (Tanpa @)</label>
                <input
                  type="text"
                  value={kontak.instagram}
                  onChange={(e) => setKontak({ ...kontak, instagram: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Nama Halaman Facebook</label>
                <input
                  type="text"
                  value={kontak.facebook}
                  onChange={(e) => setKontak({ ...kontak, facebook: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Username YouTube Channel</label>
                <input
                  type="text"
                  value={kontak.youtube}
                  onChange={(e) => setKontak({ ...kontak, youtube: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Username TikTok (Tanpa @)</label>
                <input
                  type="text"
                  value={kontak.tiktok}
                  onChange={(e) => setKontak({ ...kontak, tiktok: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                />
              </div>

            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-full shadow cursor-pointer"
              >
                Simpan & Singkron Kontak
              </button>
            </div>
          </form>
        )}

      </main>

    </div>
  );
}
