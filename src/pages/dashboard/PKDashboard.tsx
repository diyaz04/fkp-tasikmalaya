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
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle,
  HelpCircle,
  Users,
  Menu,
  X,
  Home,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { dbService } from '@/src/lib/db';
import ImageUploader from '@/src/components/ImageUploader';
import { 
  PKFKP, 
  Berita, 
  UMKM 
} from '@/src/types';

type PKTabType = 'overview' | 'profil' | 'berita' | 'umkm';

export default function PKDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<PKTabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);
  
  // Database States
  const [pk, setPk] = useState<PKFKP | null>(null);
  const [beritas, setBeritas] = useState<Berita[]>([]);
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Success Notification state
  const [successMsg, setSuccessMsg] = useState('');

  // Edit states for Pengurus List
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffPhoto, setNewStaffPhoto] = useState('');
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  // CRUD news states
  const [creatingBerita, setCreatingBerita] = useState(false);
  const [newBerita, setNewBerita] = useState<Partial<Berita>>({
    judul: '', konten: '', thumbnail_url: '', status: 'pending'
  });

  // CRUD UMKM states
  const [editingUMKM, setEditingUMKM] = useState<UMKM | null>(null);
  const [newUMKM, setNewUMKM] = useState<Partial<UMKM>>({
    nama_usaha: '', nama_pemilik: '', kategori: 'kuliner', deskripsi: '', produk_jasa: [], foto_url: '', no_whatsapp: '', is_active: true
  });
  const [umkmModalOpen, setUmkmModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'pk')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const loadLocalPKData = async () => {
    if (!user || !user.pkId) return;
    setDataLoading(true);
    try {
      const [pkDetail, allBeritas, allUMKMs] = await Promise.all([
        dbService.getPK(user.pkId),
        dbService.getBerita(),
        dbService.getUMKMs()
      ]);
      setPk(pkDetail);
      
      // Filter strictly to their PK kecamatan ID (for security and compartmentalization)
      setBeritas(allBeritas.filter(b => b.pk_id === user.pkId));
      setUmkms(allUMKMs.filter(u => u.pk_id === user.pkId));
    } catch (err) {
      console.error("Gagal mendapatkan database PK", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'pk') {
      loadLocalPKData();
    }
  }, [user]);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // ==========================================
  // HANDLERS: PK PROFILE & PENGURUS ROSTER
  // ==========================================
  const handleUpdatePKProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pk) return;
    try {
      await dbService.savePK(pk);
      triggerSuccess('Profil pengurus kecamatan berhasil tersimpan!');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || String(err);
      try { const parsed = JSON.parse(err.message); if (parsed.error) errMsg = parsed.error; } catch {}
      alert(`Gagal menyimpan profil: ${errMsg}`);
    }
  };

  const handleAddStaffMember = () => {
    if (!pk || !newStaffName || !newStaffRole) return;
    const newStaff = {
      nama: newStaffName,
      jabatan: newStaffRole,
      foto_url: newStaffPhoto || ''
    };
    const updatedStaffList = [...(pk.pengurus || []), newStaff];
    setPk({ ...pk, pengurus: updatedStaffList });
    
    // Clear forms
    setNewStaffName('');
    setNewStaffRole('');
    setNewStaffPhoto('');
    setStaffModalOpen(false);
    triggerSuccess('Anggota pengurus ditambahkan sementara. Simpan profil untuk menyimpan permanen!');
  };

  const handleRemoveStaffMember = (index: number) => {
    if (!pk) return;
    const updated = (pk.pengurus || []).filter((_, i) => i !== index);
    setPk({ ...pk, pengurus: updated });
    triggerSuccess('Anggota pengurus dihapus. Ingat untuk menekan tombol Simpan!');
  };

  // ==========================================
  // HANDLERS: SUBMIT NEWS TO DPD FOR REVIEWS
  // ==========================================
  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.pkId || !pk) return;
    try {
      const bSlug = (newBerita.judul || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload: Berita = {
        id: 'b_' + Date.now(),
        judul: newBerita.judul || '',
        slug: bSlug,
        konten: newBerita.konten || '',
        thumbnail_url: newBerita.thumbnail_url || '',
        penulis: `PK ${pk.nama_kecamatan}`,
        sumber: 'pk',
        pk_id: user.pkId,
        status: 'pending', // Pending triggers review flag for county DPD panel!
        catatan_review: null,
        published_at: null,
        created_at: new Date().toISOString()
      };
      await dbService.saveBerita(payload);
      setCreatingBerita(false);
      setNewBerita({ judul: '', konten: '', thumbnail_url: '', status: 'pending' });
      loadLocalPKData();
      triggerSuccess('Artikel berita berhasil diajukan ke DPD untuk persetujuan terbit!');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || String(err);
      try { const parsed = JSON.parse(err.message); if (parsed.error) errMsg = parsed.error; } catch {}
      alert(`Gagal mengajukan berita: ${errMsg}`);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm('Apakah Anda rill ingin menghapus draf berita ini?')) return;
    try {
      await dbService.deleteBerita(newsId);
      loadLocalPKData();
      triggerSuccess('Artikel usulan rill dihapus.');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || String(err);
      try { const parsed = JSON.parse(err.message); if (parsed.error) errMsg = parsed.error; } catch {}
      alert(`Gagal menghapus berita: ${errMsg}`);
    }
  };

  // ==========================================
  // HANDLERS: MANAGING KECAMATAN LOCAL UMKMS
  // ==========================================
  const handleSaveLocalUMKM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.pkId || !pk) return;
    try {
      const uId = editingUMKM ? editingUMKM.id : 'u_' + Date.now();
      const namaUsahaBaru = (newUMKM.nama_usaha || '').trim().toLowerCase();
      const noWhatsappBaru = (newUMKM.no_whatsapp || '').trim();

      // Deteksi Duplikasi secara Global Real-Time
      const allUMKMs = await dbService.getUMKMs();
      const duplicateItem = allUMKMs.find(u => {
        if (u.id === uId) return false;
        const namaSama = u.nama_usaha.trim().toLowerCase() === namaUsahaBaru;
        const waSama = noWhatsappBaru && u.no_whatsapp && u.no_whatsapp.trim() === noWhatsappBaru;
        return namaSama || waSama;
      });

      if (duplicateItem) {
        const isNameMatch = duplicateItem.nama_usaha.trim().toLowerCase() === namaUsahaBaru;
        const reason = isNameMatch 
          ? `Nama usaha "${duplicateItem.nama_usaha}" sudah terdaftar di Kecamatan ${duplicateItem.kecamatan || 'lain'}`
          : `Nomor WhatsApp "${noWhatsappBaru}" sudah digunakan oleh usaha "${duplicateItem.nama_usaha}" di Kecamatan ${duplicateItem.kecamatan || 'lain'}`;
        alert(`Gagal menyimpan: Terdeteksi duplikat!\n\n${reason}.\n\nSilakan periksa kembali data usaha yang Anda inputkan.`);
        return;
      }

      const payload: UMKM = {
        id: uId,
        pk_id: user.pkId,
        nama_usaha: newUMKM.nama_usaha || '',
        nama_pemilik: newUMKM.nama_pemilik || '',
        kategori: newUMKM.kategori as any || 'kuliner',
        deskripsi: newUMKM.deskripsi || '',
        produk_jasa: newUMKM.produk_jasa || [],
        foto_url: newUMKM.foto_url || '',
        no_whatsapp: newUMKM.no_whatsapp || '',
        kecamatan: pk.nama_kecamatan,
        is_active: newUMKM.is_active !== undefined ? newUMKM.is_active : true,
        created_at: editingUMKM ? editingUMKM.created_at : new Date().toISOString()
      };
      await dbService.saveUMKM(payload);
      setEditingUMKM(null);
      setNewUMKM({ nama_usaha: '', nama_pemilik: '', kategori: 'kuliner', deskripsi: '', produk_jasa: [], foto_url: '', no_whatsapp: '', is_active: true });
      setUmkmModalOpen(false);
      loadLocalPKData();
      triggerSuccess('Data UMKM lokal berhasil disimpan!');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || String(err);
      try { const parsed = JSON.parse(err.message); if (parsed.error) errMsg = parsed.error; } catch {}
      alert(`Gagal menyimpan UMKM: ${errMsg}`);
    }
  };

  const handleDeleteLocalUMKM = async (targetId: string) => {
    if (!confirm('Apakah rill ingin menghapus UMKM ini dari kecamatan?')) return;
    try {
      await dbService.deleteUMKM(targetId);
      loadLocalPKData();
      triggerSuccess('Katalog UMKM berhasil dihapus.');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || String(err);
      try { const parsed = JSON.parse(err.message); if (parsed.error) errMsg = parsed.error; } catch {}
      alert(`Gagal menghapus UMKM: ${errMsg}`);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin"></div>
        <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Aktivasi Dashboard PK Kecamatan...</p>
      </div>
    );
  }

  const verifiedUMKMs = umkms.filter(u => u.is_active);

  const navigationOptions = [
    { type: 'overview', label: 'Dashboard Wilayah', icon: LayoutDashboard },
    { type: 'profil', label: 'Profil Kecamatan & Staf', icon: Settings },
    { type: 'berita', label: 'Ajukan Berita PK', icon: FileText },
    { type: 'umkm', label: 'Kelola UMKM Lokal', icon: ShoppingBag }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans" id="pk-dashboard-parent-container">
      
      {/* Toast Pop banner */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-cyan-500/20 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-fade-in animate-duration-200">
          <Check className="w-4 h-4 text-cyan-400" />
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
          <span className="font-extrabold text-sm tracking-tight truncate max-w-[150px]">
            PK {pk?.nama_kecamatan || 'Kecamatan'}
          </span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:text-white focus:outline-none"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* PK Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 w-full md:w-64 shrink-0 transition-all border-r border-slate-800 md:h-screen md:sticky md:top-0 flex flex-col ${sidebarOpen ? 'block' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center gap-2 animate-fade-in">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="bg-white p-1 px-1.5 rounded-md flex items-center justify-center shadow-sm shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/d/1mJoucoBL-xS9gWnQYaaHcJ3hsumyG7Qb" 
                alt="FKP Logo" 
                className="h-5 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate">
              PK {pk?.nama_kecamatan || 'Kecamatan'}
            </span>
          </div>
          <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-extrabold px-1.5 py-0.5 rounded uppercase font-bold shrink-0">PK</span>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navigationOptions.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.type;
            return (
              <button
                key={item.type}
                onClick={() => {
                  setActiveTab(item.type as PKTabType);
                  setCreatingBerita(false);
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full text-left py-2.5 px-4 text-xs font-semibold rounded-xl flex items-center justify-between transition-all ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md font-extrabold' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
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

      {/* Workspace Display */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Workspace banner info */}
        <header className="mb-8 border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 capitalize">
              {activeTab === 'overview' ? 'Sinergi Kemandirian Teritorial' : `${activeTab} Management`}
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">PK FKP Wilayah Kecamatan: {pk?.nama_kecamatan}</p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Akses Akun: <span className="text-blue-600 font-bold">{user?.email}</span>
          </div>
        </header>

        {/* ------------------------------------- */}
        {/* OVERVIEW PANEL */}
        {/* ------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in" id="pk-overview-subsection">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 shrink-0"><ShoppingBag className="w-5 h-5" /></div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">UMKM Binaan</span>
                  <span className="text-2xl font-black text-slate-800">{verifiedUMKMs.length}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-600 shrink-0"><FileText className="w-5 h-5" /></div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Materi Berita Diajukan</span>
                  <span className="text-2xl font-black text-slate-800">{beritas.length}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 shrink-0"><Users className="w-5 h-5" /></div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Struktur Pengurus</span>
                  <span className="text-2xl font-black text-slate-800">{pk?.pengurus?.length || 0} orang</span>
                </div>
              </div>

            </div>

            {/* Live review logs banner */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-wider border-b border-slate-100 pb-2">Status Audit Pengajuan Berita PK</h3>
              
              {beritas.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center">Belum ada usulan kabar berita dari wilayah Anda.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {beritas.map((b) => (
                    <div key={b.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-semibold text-slate-500">
                      <div className="max-w-[450px]">
                        <h4 className="font-extrabold text-slate-800 leading-normal">{b.judul}</h4>
                        {b.catatan_review && (
                          <div className="mt-1.5 p-2 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[10px] flex gap-1.5 font-semibold leading-normal">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Catatan Review DPD: "{b.catatan_review}"</span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                          b.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ------------------------------------- */}
        {/* PK PROFIL & STAFF list */}
        {/* ------------------------------------- */}
        {activeTab === 'profil' && pk && (
          <div className="space-y-8 animate-fade-in" id="pk-profil-subsection">
            
            <form onSubmit={handleUpdatePKProfil} className="bg-white border border-slate-200/50 rounded-2xl p-6 md:p-8 shadow space-y-6">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase border-b border-slate-100 pb-3">Profil Deskripsi & Kepemimpinan Kecamatan</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase">Nama Lengkap Ketua PK</label>
                  <input
                    type="text"
                    value={pk.nama_ketua}
                    onChange={(e) => setPk({ ...pk, nama_ketua: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 block uppercase">Email Resmi Koordinasi (Un-editable)</label>
                  <input
                    type="email"
                    value={pk.email || ''}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-100 rounded-lg text-slate-400 font-semibold cursor-not-allowed"
                    disabled
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase">Kata Sandi Akses Baru</label>
                  <input
                    type="text"
                    value={pk.password || ''}
                    onChange={(e) => setPk({ ...pk, password: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold text-rose-600 focus:text-slate-800"
                    placeholder="Sandi akses...."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase">Deskripsi/Visi Sektoral Kecamatan</label>
                <textarea
                  value={pk.deskripsi}
                  onChange={(e) => setPk({ ...pk, deskripsi: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold font-semibold"
                  rows={3}
                  required
                />
              </div>

              <ImageUploader
                value={pk.foto_ketua_url}
                onChange={(url) => setPk({ ...pk, foto_ketua_url: url })}
                label="Foto Profil Ketua PK"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase">Nama Lengkap Sekretaris PK</label>
                    <input
                      type="text"
                      value={pk.nama_sekretaris || ''}
                      onChange={(e) => setPk({ ...pk, nama_sekretaris: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold"
                      placeholder="Nama Sekretaris PK..."
                    />
                  </div>
                  <ImageUploader
                    value={pk.foto_sekretaris_url || ''}
                    onChange={(url) => setPk({ ...pk, foto_sekretaris_url: url })}
                    label="Foto Profil Sekretaris PK"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase">Nama Lengkap Bendahara PK</label>
                    <input
                      type="text"
                      value={pk.nama_bendahara || ''}
                      onChange={(e) => setPk({ ...pk, nama_bendahara: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold"
                      placeholder="Nama Bendahara PK..."
                    />
                  </div>
                  <ImageUploader
                    value={pk.foto_bendahara_url || ''}
                    onChange={(url) => setPk({ ...pk, foto_bendahara_url: url })}
                    label="Foto Profil Bendahara PK"
                  />
                </div>
              </div>

              {/* SAVE BTN FOR GENERAL PROFILES */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-full shadow"
                >
                  Simpan Perubahan Utama
                </button>
              </div>
            </form>

            {/* STRUCTURAL STAFF ROSTER LISTS */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-6 md:p-8 shadow space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-cyan-500" />
                  Daftar Jajaran Struktur Staf Jaringan Wilayah
                </h3>
                <button
                  onClick={() => {
                    setNewStaffName('');
                    setNewStaffRole('');
                    setNewStaffPhoto('');
                    setStaffModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Staf Baru
                </button>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Anggota Terdaftar Saat Ini ({pk.pengurus?.length || 0}):</span>
                
                {!pk.pengurus || pk.pengurus.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-8 text-center border border-dashed border-slate-200 rounded-xl">Belum ada staf pengurus terdaftar.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                    {pk.pengurus.map((mgr, index) => (
                      <div key={index} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                            <img
                              src={mgr.foto_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s'}
                              alt={mgr.nama}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdFy3D0_qsicyRaMCCGt4DeFcIPJ37FduSQ&s';
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 leading-snug">{mgr.nama}</h4>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{mgr.jabatan}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStaffMember(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ultimate save prompt */}
                <div className="border-t border-slate-100 pt-4 text-right flex justify-end items-center gap-4">
                  <p className="text-[10px] text-slate-400 font-semibold italic flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Jangan lupa simpan profil untuk menyimpan staf secara permanen!
                  </p>
                  <button
                    onClick={handleUpdatePKProfil}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow"
                  >
                    Kunci Perubahan Pengurus
                  </button>
                </div>

              </div>
            </div>

            {/* Modal Popup Staff Add */}
            {staffModalOpen && (
              <div 
                onClick={() => setStaffModalOpen(false)}
                className="fixed inset-0 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-5 sm:space-y-6 border border-slate-100/10 cursor-default"
                >
                  {/* Swipe Pull Handle indicator for classy mobile look */}
                  <div className="mx-auto w-12 h-1.5 bg-slate-250 rounded-full mb-1 sm:hidden shrink-0" />
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 sm:pb-4 gap-4">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                      <Users className="w-5 h-5 text-cyan-500" />
                      Tambah Anggota Pengurus Baru
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStaffModalOpen(false)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full font-bold shrink-0 transition-all hover:scale-105"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Nama Lengkap</label>
                      <input
                        type="text"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        placeholder="Contoh: Sri Wulandari"
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Jabatan Struktural</label>
                      <input
                        type="text"
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value)}
                        placeholder="Contoh: Sekretaris PK"
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                      />
                    </div>

                    <input
                      type="hidden"
                      value={newStaffPhoto}
                    />
                    
                    <ImageUploader 
                      value={newStaffPhoto} 
                      onChange={setNewStaffPhoto} 
                      label="Foto Profil Staf" 
                    />

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setStaffModalOpen(false);
                          // Preserve typed details to satisfy safety request
                        }}
                        className="text-xs font-bold px-4 py-2.5 border bg-red-50 text-red-600 rounded-full hover:bg-red-100"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleAddStaffMember}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full shadow"
                      >
                        Tambahkan Sementara
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------- */}
        {/* SUBMITTING NEWS LIST */}
        {/* ------------------------------------- */}
        {activeTab === 'berita' && (
          <div className="space-y-6 animate-fade-in" id="pk-berita-subsection">
            
            <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow w-full">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">Usulan Berita Wilayah Anda</h3>
                <button
                  onClick={() => {
                    if (!newBerita.judul && !newBerita.konten) {
                      setNewBerita({ judul: '', konten: '', thumbnail_url: '', status: 'pending' });
                    }
                    setCreatingBerita(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajukan Berita PK
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-slate-600 text-xs font-semibold">
                {beritas.length === 0 ? (
                  <p className="py-4 text-center text-slate-400 font-semibold">Belum ada usulan berita diajukan</p>
                ) : (
                  beritas.map((b) => (
                    <div key={b.id} className="py-3 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm leading-normal">{b.judul}</h4>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${
                          b.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {b.status === 'published' ? 'Terbit' : b.status === 'pending' ? 'Menunggu Review' : 'Draf/Batal'}
                        </span>
                      </div>
                      <div>
                        <button
                          onClick={() => handleDeleteNews(b.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 hover:border-red-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Popup Draft news form */}
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
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800 uppercase tracking-tight">Ajukan Berita Baru ke Pengurus DPD</h3>
                    <button
                      type="button"
                      onClick={() => setCreatingBerita(false)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full font-bold shrink-0 transition-all hover:scale-105"
                    >
                      Tutup
                    </button>
                  </div>

                  <form onSubmit={handleSubmitNews} className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Judul Berita Acara</label>
                      <input
                        type="text"
                        value={newBerita.judul}
                        onChange={(e) => setNewBerita({ ...newBerita, judul: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                        placeholder="Contoh: Rapat Koordinasi Anggota FKP Kecamatan Singaparna"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Tulisan / Konten Berita</label>
                      <textarea
                        value={newBerita.konten}
                        onChange={(e) => setNewBerita({ ...newBerita, konten: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white text-slate-700 font-semibold"
                        rows={6}
                        placeholder="Tulis detail lengkap di sini..."
                        required
                      />
                    </div>

                    <ImageUploader
                      value={newBerita.thumbnail_url || ''}
                      onChange={(url) => setNewBerita({ ...newBerita, thumbnail_url: url })}
                      label="Foto Kegiatan Utama / Cover"
                    />

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setCreatingBerita(false);
                          // Preserve typed details to satisfy user's safety request
                        }}
                        className="text-xs font-bold px-4 py-2.5 border bg-red-50 text-red-600 rounded-full hover:bg-red-100"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full shadow"
                      >
                        Kirim ke DPD untuk Review
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------- */}
        {/* KECAMATAN UMKM DIRECTORY LOCAL CRUD */}
        {/* ------------------------------------- */}
        {activeTab === 'umkm' && (
          <div className="space-y-6 animate-fade-in" id="pk-umkm-subsection">
            
            <div className="bg-white border border-slate-200/50 p-6 rounded-2xl shadow w-full text-slate-600 text-xs font-semibold">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">Database Wirausaha Anda</h3>
                <button
                  onClick={() => {
                    setEditingUMKM(null);
                    if (!newUMKM.nama_usaha && !newUMKM.nama_pemilik && !newUMKM.deskripsi) {
                      setNewUMKM({ nama_usaha: '', nama_pemilik: '', kategori: 'kuliner', deskripsi: '', produk_jasa: [], foto_url: '', no_whatsapp: '', is_active: true });
                    }
                    setUmkmModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Daftarkan UMKM Baru
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-semibold">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Nama Usaha</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Pemilik</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Kategori</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {umkms.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400 font-semibold">Belum ada UMKM terdaftar di Kecamatan Anda</td>
                      </tr>
                    ) : (
                      umkms.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-semibold text-slate-800 pr-2">{u.nama_usaha}</td>
                          <td className="py-3">{u.nama_pemilik}</td>
                          <td className="py-3 uppercase tracking-wider text-[10px] font-bold text-slate-400">{u.kategori}</td>
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
                              onClick={() => handleDeleteLocalUMKM(u.id)}
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
                      {editingUMKM ? 'Edit UMKM Terdaftar' : 'Daftarkan UMKM Kreatif Wilayah Anda'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setUmkmModalOpen(false)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full font-bold shrink-0 transition-all hover:scale-105"
                    >
                      Tutup
                    </button>
                  </div>

                  <form onSubmit={handleSaveLocalUMKM} className="space-y-4 text-left">
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
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Nama Lengkap Pemilik</label>
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
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">Kategori</label>
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
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">No WhatsApp (62xx)</label>
                        <input
                          type="text"
                          value={newUMKM.no_whatsapp}
                          onChange={(e) => setNewUMKM({ ...newUMKM, no_whatsapp: e.target.value })}
                          placeholder="6281234xxx"
                          className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Keterangan Deskripsi Bisnis</label>
                      <textarea
                        value={newUMKM.deskripsi}
                        onChange={(e) => setNewUMKM({ ...newUMKM, deskripsi: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Produk Unggulan (Pecah koma untuk list)</label>
                      <input
                        type="text"
                        value={newUMKM.produk_jasa ? newUMKM.produk_jasa.join(', ') : ''}
                        onChange={(e) => setNewUMKM({ ...newUMKM, produk_jasa: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white"
                        placeholder="Contoh: Tas Kulit Asli, Dompet Kulit Rajapolah"
                      />
                    </div>

                    <ImageUploader
                      value={newUMKM.foto_url || ''}
                      onChange={(url) => setNewUMKM({ ...newUMKM, foto_url: url })}
                      label="Poster / Foto Produk Jasa"
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

      </main>

    </div>
  );
}
