/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
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
  LogOut,
  Eye,
  LayoutGrid,
  List,
  Search
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
  Kontak,
  BiroOrganisasi,
  PengurusPK
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
  const [heroUmkmSearch, setHeroUmkmSearch] = useState('');

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
    pengurus: [],
    password: ''
  });
  
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [newAgenda, setNewAgenda] = useState<Partial<Agenda>>({
    judul: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '', lokasi: '', poster_url: '', is_active: true
  });

  const [editingUMKM, setEditingUMKM] = useState<UMKM | null>(null);
  const [newUMKM, setNewUMKM] = useState<Partial<UMKM>>({
    nama_usaha: '', nama_pemilik: '', kategori: 'kuliner', deskripsi: '', produk_jasa: [], foto_url: '', no_whatsapp: '', kecamatan: '', is_active: true, pk_id: '', status: 'approved', has_katalog: false, katalog: []
  });

  const [creatingBerita, setCreatingBerita] = useState(false);
  const [newBerita, setNewBerita] = useState<Partial<Berita>>({
    judul: '', konten: '', thumbnail_url: '', penulis: 'Admin DPD', status: 'draft', sumber: 'dpd'
  });

  const [pkModalOpen, setPkModalOpen] = useState(false);
  const [pkViewMode, setPkViewMode] = useState<'grid' | 'list'>('grid');
  const [agendaModalOpen, setAgendaModalOpen] = useState(false);
  const [umkmModalOpen, setUmkmModalOpen] = useState(false);

  const [showStatusNotesId, setShowStatusNotesId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Editing and Reviewing state for pending news from PK
  const [reviewingBerita, setReviewingBerita] = useState<Berita | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editorDpdName, setEditorDpdName] = useState('Admin DPD');
  const [editedThumbnailUrl, setEditedThumbnailUrl] = useState('');

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

  const handleAddBiro = () => {
    if (!profil) return;
    const newBiro: BiroOrganisasi = {
      id: `biro_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      nama_biro: '',
      deskripsi: '',
      jajaran: []
    };
    setProfil({
      ...profil,
      struktur_biro: [...(profil.struktur_biro || []), newBiro]
    });
  };

  const handleUpdateBiro = (biroIndex: number, data: Partial<BiroOrganisasi>) => {
    if (!profil) return;
    const strukturBiro = [...(profil.struktur_biro || [])];
    strukturBiro[biroIndex] = { ...strukturBiro[biroIndex], ...data };
    setProfil({ ...profil, struktur_biro: strukturBiro });
  };

  const handleRemoveBiro = (biroIndex: number) => {
    if (!profil) return;
    const strukturBiro = (profil.struktur_biro || []).filter((_, index) => index !== biroIndex);
    setProfil({ ...profil, struktur_biro: strukturBiro });
  };

  const handleAddBiroMember = (biroIndex: number) => {
    if (!profil) return;
    const strukturBiro = [...(profil.struktur_biro || [])];
    const targetBiro = strukturBiro[biroIndex];
    if (!targetBiro) return;
    const newMember: PengurusPK = { jabatan: '', nama: '', foto_url: '' };
    strukturBiro[biroIndex] = {
      ...targetBiro,
      jajaran: [...(targetBiro.jajaran || []), newMember]
    };
    setProfil({ ...profil, struktur_biro: strukturBiro });
  };

  const handleUpdateBiroMember = (biroIndex: number, memberIndex: number, data: Partial<PengurusPK>) => {
    if (!profil) return;
    const strukturBiro = [...(profil.struktur_biro || [])];
    const targetBiro = strukturBiro[biroIndex];
    if (!targetBiro) return;
    const jajaran = [...(targetBiro.jajaran || [])];
    jajaran[memberIndex] = { ...jajaran[memberIndex], ...data };
    strukturBiro[biroIndex] = { ...targetBiro, jajaran };
    setProfil({ ...profil, struktur_biro: strukturBiro });
  };

  const handleRemoveBiroMember = (biroIndex: number, memberIndex: number) => {
    if (!profil) return;
    const strukturBiro = [...(profil.struktur_biro || [])];
    const targetBiro = strukturBiro[biroIndex];
    if (!targetBiro) return;
    strukturBiro[biroIndex] = {
      ...targetBiro,
      jajaran: (targetBiro.jajaran || []).filter((_, index) => index !== memberIndex)
    };
    setProfil({ ...profil, struktur_biro: strukturBiro });
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
        hero_blur_level: profil.hero_blur_level || 'md',
        featured_umkm_ids: profil.featured_umkm_ids || []
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
        created_at: editingPK ? editingPK.created_at : new Date().toISOString(),
        password: newPK.password || ''
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
        pengurus: [],
        password: ''
      });
      setPkModalOpen(false);
      loadAllDatabase();
      triggerSuccess('Data PK Kecamatan berhasil disimpan!');
    } catch (err) {
      console.error(err);
    }
  };

  const downloadExcelTemplate = () => {
    try {
      const headers = [
        ["nama_kecamatan", "email", "password", "nama_ketua", "nama_sekretaris", "nama_bendahara", "deskripsi"],
        ["Singaparna", "pk.singaparna@gmail.com", "sandi123", "Hendra Gunawan", "Siti Rahmawati", "Dewi Lestari", "Kecamatan Singaparna berkomitmen memajukan potensi industri kreatif lokal"]
      ];
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(headers);
      XLSX.utils.book_append_sheet(wb, ws, "Template Import PK");
      XLSX.writeFile(wb, "template_import_pk.xlsx");
      triggerSuccess('Berhasil mengunduh Template Excel (.xlsx)!');
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh template Excel.");
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result;
      if (!data) return;

      try {
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Read as array of arrays
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rows.length < 2) {
          alert("File Excel kosong atau tidak memiliki data.");
          return;
        }

        const headers = rows[0].map((h: any) => String(h || '').trim().toLowerCase());
        
        const idxKecamatan = headers.indexOf("nama_kecamatan");
        const idxEmail = headers.indexOf("email");
        const idxPassword = headers.indexOf("password");
        const idxKetua = headers.indexOf("nama_ketua");
        const idxSekretaris = headers.indexOf("nama_sekretaris");
        const idxBendahara = headers.indexOf("nama_bendahara");
        const idxDeskripsi = headers.indexOf("deskripsi");

        if (idxKecamatan === -1 || idxEmail === -1) {
          alert("Format spreadsheet tidak valid. Harus menyertakan kolom label 'nama_kecamatan' dan 'email'.");
          return;
        }

        let importedCount = 0;
        const importedPKs: PKFKP[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0 || !row[idxKecamatan]) continue;

          const nama_kecamatan = String(row[idxKecamatan] || '').trim();
          const email = String(row[idxEmail] || '').trim();
          const pwd = idxPassword !== -1 && row[idxPassword] ? String(row[idxPassword]).trim() : "sandi123";
          const nama_ketua = idxKetua !== -1 && row[idxKetua] ? String(row[idxKetua]).trim() : "Belum Diatur";
          const nama_sekretaris = idxSekretaris !== -1 && row[idxSekretaris] ? String(row[idxSekretaris]).trim() : "";
          const nama_bendahara = idxBendahara !== -1 && row[idxBendahara] ? String(row[idxBendahara]).trim() : "";
          const deskripsi = idxDeskripsi !== -1 && row[idxDeskripsi] ? String(row[idxDeskripsi]).trim() : `Pengurus Kecamatan FKP Kecamatan ${nama_kecamatan}`;

          if (!nama_kecamatan || !email) continue;

          // Stable pkId matching DPD's naming standard
          const pkId = 'pk_' + nama_kecamatan.toLowerCase().replace(/[^a-z0-9]+/g, '_');

          const payload: PKFKP = {
            id: pkId,
            nama_kecamatan,
            email,
            password: pwd,
            nama_ketua,
            nama_sekretaris,
            nama_bendahara,
            deskripsi,
            foto_ketua_url: "",
            foto_sekretaris_url: "",
            foto_bendahara_url: "",
            is_active: true,
            pengurus: [],
            created_at: new Date().toISOString()
          };

          importedPKs.push(payload);
          importedCount++;
        }

        if (importedPKs.length === 0) {
          alert("Tidak ada data PK Kecamatan yang valid.");
          return;
        }

        for (const pkItem of importedPKs) {
          await dbService.savePK(pkItem);
        }

        triggerSuccess(`Berhasil mengimpor ${importedCount} Kecamatan PK baru dari Excel!`);
        loadAllDatabase();
      } catch (err) {
        console.error("Gagal mengimpor Excel", err);
        alert("Gagal mengurai file Excel (.xlsx). Pastikan format tabel sesuai.");
      }
    };
    reader.readAsBinaryString(file);
    // clear input
    e.target.value = "";
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

  const handleOpenReviewModal = (b: Berita) => {
    setReviewingBerita(b);
    setEditedTitle(b.judul);
    setEditedContent(b.konten);
    setEditedThumbnailUrl(b.thumbnail_url || '');
    setEditorDpdName(b.editor_dpd || 'Admin DPD');
    setReviewNote(b.catatan_review || '');
  };

  const handleSaveAndPublishPKBerita = async () => {
    if (!reviewingBerita) return;
    try {
      const bSlug = editedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const updated: Berita = {
        ...reviewingBerita,
        judul: editedTitle,
        slug: bSlug,
        konten: editedContent,
        thumbnail_url: editedThumbnailUrl,
        editor_dpd: editorDpdName || 'Admin DPD',
        status: 'published',
        published_at: new Date().toISOString(),
        catatan_review: null
      };
      await dbService.saveBerita(updated);
      setReviewingBerita(null);
      loadAllDatabase();
      triggerSuccess('Berita PK berhasil diedit & dipublikasikan secara resmi!');
    } catch (err) {
      console.error('Failed to save & publish PK news', err);
    }
  };

  const handleRejectWithNote = async (noteText: string) => {
    if (!reviewingBerita) return;
    try {
      const updated: Berita = {
        ...reviewingBerita,
        status: 'rejected',
        catatan_review: noteText || 'Perbaiki konten sesuai instruksi.',
        published_at: null
      };
      await dbService.saveBerita(updated);
      setReviewingBerita(null);
      loadAllDatabase();
      triggerSuccess('Berita PK ditolak dengan catatan perbaikan.');
    } catch (err) {
      console.error('Failed to reject PK news', err);
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
        created_at: editingUMKM ? editingUMKM.created_at : new Date().toISOString(),
        status: editingUMKM ? (editingUMKM.status || 'approved') : 'approved', // Direct DPD entries are auto-approved
        has_katalog: newUMKM.has_katalog || false,
        katalog: newUMKM.katalog || [],
        catatan_review: editingUMKM ? (editingUMKM.catatan_review || null) : null
      };
      await dbService.saveUMKM(payload);
      setEditingUMKM(null);
      setNewUMKM({ nama_usaha: '', nama_pemilik: '', kategori: 'kuliner', deskripsi: '', produk_jasa: [], foto_url: '', no_whatsapp: '', kecamatan: '', is_active: true, pk_id: '', status: 'approved', has_katalog: false, katalog: [] });
      setUmkmModalOpen(false);
      loadAllDatabase();
      triggerSuccess('Data UMKM wirausaha disimpan!');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || String(err);
      try { const parsed = JSON.parse(err.message); if (parsed.error) errMsg = parsed.error; } catch {}
      alert(`Gagal menyimpan UMKM: ${errMsg}`);
    }
  };

  const handleApproveUMKM = async (umkm: UMKM) => {
    try {
      const payload: UMKM = {
        ...umkm,
        status: 'approved',
        is_active: true,
        catatan_review: null
      };
      await dbService.saveUMKM(payload);
      loadAllDatabase();
      triggerSuccess(`UMKM "${umkm.nama_usaha}" berhasil disetujui untuk dipublikasikan!`);
    } catch (err) {
      console.error(err);
      alert("Gagal menyetujui UMKM");
    }
  };

  const handleRejectUMKM = async (umkm: UMKM) => {
    const reason = prompt(`Masukkan alasan penolakan review untuk "${umkm.nama_usaha}":`);
    if (reason === null) return; // cancelled
    try {
      const payload: UMKM = {
        ...umkm,
        status: 'rejected',
        is_active: false,
        catatan_review: reason.trim() || 'Revisi berkas diperlukan'
      };
      await dbService.saveUMKM(payload);
      loadAllDatabase();
      triggerSuccess(`UMKM "${umkm.nama_usaha}" telah ditolak dengan catatan.`);
    } catch (err) {
      console.error(err);
      alert("Gagal menolak pengajuan UMKM");
    }
  };

  const handleDeleteUMKM = async (id: string) => {
    if (!confirm('Hapus wirausaha UMKM dari database?')) return;
    try {
      await dbService.deleteUMKM(id);
      loadAllDatabase();
      triggerSuccess('UMKM berhasil dihapus.');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || String(err);
      try { const parsed = JSON.parse(err.message); if (parsed.error) errMsg = parsed.error; } catch {}
      alert(`Gagal menghapus UMKM: ${errMsg}`);
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
                          onClick={() => handleOpenReviewModal(b)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Tinjau &amp; Edit
                        </button>
                        <button
                          onClick={() => {
                            setReviewNote('Diterima dan dipublikasikan secara langsung.');
                            handleReviewBerita(b.id, 'published');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-750 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Setujui Cepat
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
                        <button
                          onClick={() => handleDeleteBerita(b.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold p-1.5 rounded-lg flex items-center justify-center border border-rose-200 transition-all hover:scale-105"
                          title="Hapus Berita PK secara Permanen"
                        >
                          <Trash2 className="w-4 h-4" />
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

            {/* Struktur Organisasi Biro DPD */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-cyan-600" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                      Struktur Organisasi Biro DPD
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                    Tambahkan Biro, lalu isi jajaran pengurus di bawahnya dengan jabatan, nama, dan foto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddBiro}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Biro
                </button>
              </div>

              {(!profil.struktur_biro || profil.struktur_biro.length === 0) ? (
                <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/60">
                  <p className="text-xs text-slate-400 font-semibold">
                    Belum ada struktur Biro. Klik Tambah Biro untuk mulai mengisi jajaran organisasi.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {(profil.struktur_biro || []).map((biro, biroIndex) => (
                    <div key={biro.id || biroIndex} className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 sm:p-5 space-y-4">
                      <div className="flex flex-col lg:flex-row gap-3 lg:items-start">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Nama Biro / Bidang</label>
                            <input
                              type="text"
                              value={biro.nama_biro}
                              onChange={(e) => handleUpdateBiro(biroIndex, { nama_biro: e.target.value })}
                              className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              placeholder="Contoh: Biro Humas & Publikasi"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Keterangan Singkat</label>
                            <input
                              type="text"
                              value={biro.deskripsi || ''}
                              onChange={(e) => handleUpdateBiro(biroIndex, { deskripsi: e.target.value })}
                              className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              placeholder="Contoh: Mengelola publikasi, media, dan dokumentasi"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveBiro(biroIndex)}
                          className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-2 rounded-lg inline-flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus Biro
                        </button>
                      </div>

                      <div className="border-t border-slate-200/70 pt-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            Jajaran di bawah {biro.nama_biro || `Biro #${biroIndex + 1}`} ({biro.jajaran?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddBiroMember(biroIndex)}
                            className="text-xs font-bold text-blue-600 bg-white border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-50 inline-flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Tambah Jajaran
                          </button>
                        </div>

                        {(!biro.jajaran || biro.jajaran.length === 0) ? (
                          <p className="text-xs text-slate-400 font-semibold py-5 text-center border border-dashed border-slate-200 rounded-xl bg-white">
                            Belum ada jajaran pada Biro ini.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {(biro.jajaran || []).map((member, memberIndex) => (
                              <div key={`${biro.id || biroIndex}_${memberIndex}`} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    Jajaran #{memberIndex + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBiroMember(biroIndex, memberIndex)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                                    title="Hapus jajaran"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Jabatan</label>
                                    <input
                                      type="text"
                                      value={member.jabatan}
                                      onChange={(e) => handleUpdateBiroMember(biroIndex, memberIndex, { jabatan: e.target.value })}
                                      className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white focus:border-blue-500"
                                      placeholder="Contoh: Kepala Biro"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Nama Lengkap</label>
                                    <input
                                      type="text"
                                      value={member.nama}
                                      onChange={(e) => handleUpdateBiroMember(biroIndex, memberIndex, { nama: e.target.value })}
                                      className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold focus:bg-white focus:border-blue-500"
                                      placeholder="Nama pengurus"
                                      required
                                    />
                                  </div>
                                </div>

                                <ImageUploader
                                  value={member.foto_url || ''}
                                  onChange={(url) => handleUpdateBiroMember(biroIndex, memberIndex, { foto_url: url })}
                                  label="Foto Pengurus"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

              {/* UMKM Pilihan Hero */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                    Tampilkan UMKM Pilihan di Hero Beranda
                  </h4>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">
                    Pilih beberapa UMKM binaan yang sudah disetujui (Approved) untuk ditampilkan secara bergantian dalam slideshow utama di halaman beranda. UMKM ini akan ditayangkan bersama dengan berita terpopuler.
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari UMKM berdasarkan nama usaha atau kecamatan..."
                    value={heroUmkmSearch}
                    onChange={(e) => setHeroUmkmSearch(e.target.value)}
                    className="w-full text-xs p-2.5 pl-9 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1 border border-slate-105 bg-slate-50/20 rounded-xl" id="hero-umkm-checklist-container">
                  {(() => {
                    const approvedUmkms = umkms.filter(u => u.status === 'approved' || !u.status);
                    const filtered = approvedUmkms.filter(u => 
                      u.nama_usaha.toLowerCase().includes(heroUmkmSearch.toLowerCase()) ||
                      u.nama_pemilik.toLowerCase().includes(heroUmkmSearch.toLowerCase()) ||
                      (u.kecamatan || '').toLowerCase().includes(heroUmkmSearch.toLowerCase())
                    );

                    if (approvedUmkms.length === 0) {
                      return (
                        <div className="col-span-full py-8 text-center text-xs text-slate-400 font-semibold">
                          Belum ada UMKM terdaftar yang disetujui (Approved). Silakan setujui beberapa UMKM terlebih dahulu di tab UMKM.
                        </div>
                      );
                    }

                    if (filtered.length === 0) {
                      return (
                        <div className="col-span-full py-8 text-center text-xs text-slate-400 font-semibold">
                          Tidak ada UMKM yang cocok dengan pencarian Anda.
                        </div>
                      );
                    }

                    return filtered.map((u) => {
                      const selectedIds = profil.featured_umkm_ids || [];
                      const isSelected = selectedIds.includes(u.id);

                      const handleToggleSelect = () => {
                        const updatedIds = isSelected 
                          ? selectedIds.filter(id => id !== u.id)
                          : [...selectedIds, u.id];
                        setProfil({ ...profil, featured_umkm_ids: updatedIds });
                      };

                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={handleToggleSelect}
                          className={`p-3 rounded-xl border text-left flex gap-3 transition-all cursor-pointer items-start select-none ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 shadow-sm'
                              : 'bg-white border-slate-150 hover:border-slate-350'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative">
                            <img src={u.foto_url || "https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=150&q=80"} alt={u.nama_usaha} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                                <span className="text-white text-[10px] font-black bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center border border-white">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="text-xs font-black text-slate-800 truncate leading-snug">{u.nama_usaha}</div>
                            <div className="text-[10px] text-slate-500 font-semibold leading-none truncate">Pemilik: {u.nama_pemilik}</div>
                            <div className="flex items-center gap-1 text-[9px] text-blue-600 font-bold bg-blue-50/50 border border-blue-105 px-1.5 py-0.5 rounded w-max mt-1">
                              Kec. {u.kecamatan || 'Tasikmalaya'}
                            </div>
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-2 pt-1">
                  <span>Total terpilih: <span className="text-blue-650">{(profil.featured_umkm_ids || []).length}</span> UMKM Unggulan</span>
                  {(profil.featured_umkm_ids || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setProfil({ ...profil, featured_umkm_ids: [] })}
                      className="text-red-500 hover:text-red-600 hover:underline cursor-pointer font-bold"
                    >
                      Bersihkan Pilihan
                    </button>
                  )}
                </div>
              </div>
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
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => handleOpenReviewModal(b)}
                            className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                            title="Tinjau &amp; Edit Berita"
                          >
                            <Eye className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDeleteBerita(b.id)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                            title="Hapus Berita secara Permanen"
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
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 mb-4 gap-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">Daftar Wilayah Resmi PK FKP Kabupaten</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {/* View Toggles */}
                  <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200/50 mr-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPkViewMode('grid')}
                      className={`p-1.5 rounded-full transition-all duration-200 ${
                        pkViewMode === 'grid' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Tampilan Grid Kartu"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPkViewMode('list')}
                      className={`p-1.5 rounded-full transition-all duration-200 ${
                        pkViewMode === 'list' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Tampilan Tabel List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={downloadExcelTemplate}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition animate-fade-in"
                  >
                    Unduh Template Excel
                  </button>
                  <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition animate-fade-in">
                    <span>Impor Data Excel</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleImportExcel}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
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
                        pengurus: [],
                        password: ''
                      });
                      setPkModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Daftarkan PK Baru
                  </button>
                </div>
              </div>
              
              {pkViewMode === 'grid' ? (
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
                        <p className="text-[10px] text-slate-450 font-semibold block truncate mt-0.5">Sandi: {p.password || 'sandi123'}</p>
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
              ) : (
                <div className="overflow-x-auto border border-slate-200/60 rounded-xl max-w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Nama Kecamatan</th>
                        <th className="py-3 px-4">Nama Ketua</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Kata Sandi</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Aksi Keanggotaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {pks.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">Kec. {p.nama_kecamatan}</td>
                          <td className="py-3.5 px-4 text-slate-600">{p.nama_ketua || 'Belum diisi'}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{p.email || '-'}</td>
                          <td className="py-3.5 px-4 text-rose-600 font-mono text-[11px]">{p.password || 'sandi123'}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {p.is_active ? 'Aktif' : 'Beku'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end gap-1.5 text-[10px] font-bold">
                              <button
                                onClick={() => {
                                  setEditingPK(p);
                                  setNewPK(p);
                                  setPkModalOpen(true);
                                }}
                                className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 transition"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeletePK(p.id)}
                                className="bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 transition"
                              >
                                <Trash2 className="w-3 h-3" /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pks.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                            Belum ada PK Kecamatan terdaftar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Kata Sandi Akses (Preset Login)</label>
                      <input
                        type="text"
                        value={newPK.password || ''}
                        onChange={(e) => setNewPK({ ...newPK, password: e.target.value })}
                        placeholder="Sandi preset..."
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
            
            {/* 1. SEKSI REVIEW AJUAN UMKM DARI KECAMATAN / PK */}
            {umkms.filter(u => u.status === 'pending' || !u.status).length > 0 && (
              <div className="bg-amber-50/75 border border-amber-200 p-6 rounded-2xl shadow-sm text-slate-600 text-xs font-semibold">
                <div className="border-b border-amber-200 pb-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-800">Review Ajuan UMKM Baru (Persetujuan DPD)</h3>
                  </div>
                  <span className="bg-amber-100/80 text-amber-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider text-[9px] border border-amber-200">
                    {umkms.filter(u => u.status === 'pending' || !u.status).length} Menunggu Review
                  </span>
                </div>

                <div className="space-y-4">
                  {umkms.filter(u => u.status === 'pending' || !u.status).map((u) => (
                    <div key={u.id} className="p-5 bg-white border border-amber-100 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-start font-sans">
                      <div className="md:col-span-2 space-y-2">
                        <div className="flex gap-2 items-center">
                          <span className="font-extrabold text-sm text-slate-800 font-sans">{u.nama_usaha}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-extrabold uppercase">{u.kategori}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{u.deskripsi}</p>
                        <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-400 font-mono">
                          <div>Owner: <span className="text-slate-700 font-semibold">{u.nama_pemilik}</span></div>
                          <div>Kecamatan: <span className="text-slate-700 font-semibold">{u.kecamatan}</span></div>
                          <div>WhatsApp: <span className="text-slate-700 font-semibold">{u.no_whatsapp}</span></div>
                          <div>Katalog?: <span className={`font-semibold ${u.has_katalog ? 'text-cyan-600' : 'text-slate-500'}`}>{u.has_katalog ? `Ya (${u.katalog?.length || 0} produk)` : 'Tidak'}</span></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {u.has_katalog && u.katalog && u.katalog.length > 0 ? (
                          <div className="p-2.5 border border-slate-100 rounded-lg bg-slate-50 max-h-[100px] overflow-y-auto space-y-1">
                            <div className="text-[9px] text-slate-400 uppercase font-extrabold border-b pb-0.5 mb-1">Daftar Produk Katalog:</div>
                            {u.katalog.map((prod, pIdx) => (
                              <div key={pIdx} className="text-[10px] text-slate-600 truncate flex justify-between gap-1">
                                <span>- {prod.nama_produk}</span>
                                <span className="font-bold text-slate-700 shrink-0">Rp {prod.harga.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic py-3 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">Tidak menyertakan katalog produk</div>
                        )}
                      </div>

                      <div className="flex md:flex-col justify-end items-end gap-2 h-full pt-2 md:pt-0 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApproveUMKM(u)}
                          className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Setujui & Terbitkan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectUMKM(u)}
                          className="w-full text-center bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Tolak & Revisi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. DAFTAR DIREKTORI UTAMA */}
            <div className="bg-white border border-slate-200/50 p-6 rounded-2xl shadow w-full text-slate-600 text-xs font-semibold">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">Direktori Wirausaha Utama (Semua Kecamatan)</h3>
                <button
                  onClick={() => {
                    setEditingUMKM(null);
                    setNewUMKM({ nama_usaha: '', nama_pemilik: '', kategori: 'kuliner', deskripsi: '', produk_jasa: [], foto_url: '', no_whatsapp: '', kecamatan: '', is_active: true, pk_id: '', status: 'approved', has_katalog: false, katalog: [] });
                    setUmkmModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Tambah UMKM Baru
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left font-semibold text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Nama Usaha</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Pemilik</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Kecamatan</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Kategori</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px]">Persetujuan</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider font-extrabold text-[10px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {umkms.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400 font-semibold">Belum ada UMKM terdaftar</td>
                      </tr>
                    ) : (
                      umkms.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-semibold text-slate-800 pr-2">
                            <div>{u.nama_usaha}</div>
                            {u.catatan_review && (
                              <div className="text-[10px] text-red-500 font-medium italic mt-0.5">Catatan: {u.catatan_review}</div>
                            )}
                          </td>
                          <td className="py-3">{u.nama_pemilik}</td>
                          <td className="py-3">{u.kecamatan}</td>
                          <td className="py-3 uppercase tracking-wider text-[10px] font-bold text-slate-500">{u.kategori}</td>
                          <td className="py-3 font-semibold">
                            {u.status === 'approved' || !u.status ? (
                              <span className="bg-emerald-50 border border-emerald-250 text-emerald-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Disetujui</span>
                            ) : u.status === 'rejected' ? (
                              <span className="bg-rose-50 border border-rose-250 text-rose-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Ditolak</span>
                            ) : (
                              <span className="bg-amber-50 border border-amber-250 text-amber-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Ajuan (Pending)</span>
                            )}
                          </td>
                          <td className="py-3 text-right space-x-1.5 shrink-0 whitespace-nowrap">
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

                    {/* PILIHAN KATALOG PRODUK */}
                    <div className="p-4 border border-slate-200/85 rounded-xl space-y-4 bg-slate-50/55">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="has_katalog"
                          checked={newUMKM.has_katalog || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setNewUMKM({
                              ...newUMKM,
                              has_katalog: checked,
                              katalog: checked ? (newUMKM.katalog?.length ? newUMKM.katalog : [{ foto_url: '', nama_produk: '', harga: 0, deskripsi: '' }]) : []
                            });
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="has_katalog" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                          Sertakan Katalog Produk?
                        </label>
                      </div>

                      {newUMKM.has_katalog && (
                        <div className="space-y-4 pt-2 border-t border-slate-200 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold uppercase text-[10px] text-slate-600">Daftar Produk Katalog ({newUMKM.katalog?.length || 0})</span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentKatalog = newUMKM.katalog || [];
                                setNewUMKM({
                                  ...newUMKM,
                                  katalog: [...currentKatalog, { foto_url: '', nama_produk: '', harga: 0, deskripsi: '' }]
                                });
                              }}
                              className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded"
                            >
                              + Tambah Produk
                            </button>
                          </div>

                          {(newUMKM.katalog || []).length === 0 ? (
                            <p className="text-[11px] text-slate-400 text-center py-2 italic font-medium">Klik "+ Tambah Produk" untuk menambahkan katalog.</p>
                          ) : (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                              {(newUMKM.katalog || []).map((prod, idx) => (
                                <div key={idx} className="p-3 bg-white border border-slate-250 rounded-lg space-y-3 relative shadow-sm">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = (newUMKM.katalog || []).filter((_, pIdx) => pIdx !== idx);
                                      setNewUMKM({ ...newUMKM, katalog: updated });
                                    }}
                                    className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700 font-bold"
                                  >
                                    Hapus
                                  </button>
                                  <div className="font-extrabold text-[10px] text-slate-500">PRODUK #{idx + 1}</div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-bold text-slate-500 uppercase">Nama Produk</label>
                                      <input
                                        type="text"
                                        value={prod.nama_produk}
                                        onChange={(e) => {
                                          const updated = [...(newUMKM.katalog || [])];
                                          updated[idx].nama_produk = e.target.value;
                                          setNewUMKM({ ...newUMKM, katalog: updated });
                                        }}
                                        className="w-full text-xs p-2 border border-slate-200 rounded text-slate-700 font-semibold focus:bg-white"
                                        placeholder="Nama produk"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-bold text-slate-500 uppercase">Harga (Rp)</label>
                                      <input
                                        type="number"
                                        value={prod.harga || ''}
                                        onChange={(e) => {
                                          const updated = [...(newUMKM.katalog || [])];
                                          updated[idx].harga = Number(e.target.value);
                                          setNewUMKM({ ...newUMKM, katalog: updated });
                                        }}
                                        className="w-full text-xs p-2 border border-slate-200 rounded text-slate-700 font-semibold focus:bg-white"
                                        placeholder="Harga"
                                        required
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase">Deskripsi</label>
                                    <textarea
                                      value={prod.deskripsi}
                                      onChange={(e) => {
                                        const updated = [...(newUMKM.katalog || [])];
                                        updated[idx].deskripsi = e.target.value;
                                        setNewUMKM({ ...newUMKM, katalog: updated });
                                      }}
                                      className="w-full text-xs p-2 border border-slate-200 rounded text-slate-700 font-semibold focus:bg-white"
                                      rows={2}
                                      placeholder="Deskripsi singkat produk"
                                      required
                                    />
                                  </div>

                                  <ImageUploader
                                    value={prod.foto_url}
                                    onChange={(url) => {
                                      const updated = [...(newUMKM.katalog || [])];
                                      updated[idx].foto_url = url;
                                      setNewUMKM({ ...newUMKM, katalog: updated });
                                    }}
                                    label="Foto Produk"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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

        {/* ======================================================== */}
        {/* MODAL: TINJAU & EDIT BERITA PK DENGAN NAMA EDITOR DPD     */}
        {/* ======================================================== */}
        {reviewingBerita && (
          <div 
            onClick={() => setReviewingBerita(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-100 cursor-default overflow-hidden animate-scale-up"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full ${
                    reviewingBerita.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                    reviewingBerita.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    reviewingBerita.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    Status Berita: {reviewingBerita.status}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 uppercase mt-2">
                    {reviewingBerita.sumber === 'dpd' ? 'Review & Edit Berita DPD' : 'Tinjau &amp; Edit Naskah Berita PK'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Ditulis oleh: <span className="text-blue-600 font-extrabold">{reviewingBerita.penulis}</span> {reviewingBerita.pk_id && `(PK ID: ${reviewingBerita.pk_id})`}
                  </p>
                </div>
                <button 
                  onClick={() => setReviewingBerita(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1 text-left">
                {/* Judul */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Judul Artikel Berita (Dapat Diedit DPD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Ketik judul tulisan berita..."
                    className="w-full text-xs p-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-800 font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                    required
                  />
                </div>

                {/* Konten Utama */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Seluruh Naskah / Isi Berita (Dapat Diubah DPD) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[10px] text-slate-400 font-semibold mb-1">
                    Harap periksa tata bahasa, ejaan, informasi hoaks, atau unsur SARA sebelum mempublikasikan berita PK ke khalayak luas.
                  </p>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder="Ketik isi lengkap berita..."
                    rows={10}
                    className="w-full text-xs p-3.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:bg-white focus:border-blue-500 transition-all outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Nama Editor DPD */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Nama Editor DPD Yang Memeriksa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editorDpdName}
                      onChange={(e) => setEditorDpdName(e.target.value)}
                      placeholder="Nama Anda selaku perwakilan / pengurus DPD..."
                      className="w-full text-xs p-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-800 font-semibold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      required
                    />
                    <span className="text-[9px] text-slate-400 block font-semibold leading-relaxed">
                      Akan dicatat dan ditampilkan secara transparan sebagai editor pendamping naskah PK di halaman depan.
                    </span>
                  </div>

                  {/* Catatan Alasan Perbaikan */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Catatan Masukan Alasan Penolakan (Hanya jika menolak)
                    </label>
                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Ketik catatan perbaikan di sini jika Anda bermaksud menolak draf berita PK untuk direvisi..."
                      rows={3}
                      className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-600 font-semibold focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Thumbnail URL */}
                <div className="border-t border-slate-100 pt-4">
                  <ImageUploader
                    value={editedThumbnailUrl}
                    onChange={(url) => setEditedThumbnailUrl(url)}
                    label="Gambar Utama Banner Berita (Thumbnail)"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-2 justify-end items-center">
                <button
                  type="button"
                  onClick={() => setReviewingBerita(null)}
                  className="text-xs font-bold px-4 py-2.5 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-xl cursor-pointer"
                >
                  Batal
                </button>

                {reviewingBerita.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleRejectWithNote(reviewNote || 'Draf berita perlu direvisi oleh pengurus PK.')}
                    className="text-xs font-bold px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    Tolak &amp; Beri Masukan
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveAndPublishPKBerita}
                  disabled={!editedTitle.trim() || !editedContent.trim() || !editorDpdName.trim()}
                  className="text-xs bg-emerald-600 hover:bg-emerald-775 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-3.5 h-3.5" />
                  {reviewingBerita.status === 'pending' ? 'Simpan, Setujui & Terbit' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
