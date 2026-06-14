/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageSquare, Instagram, Facebook, Youtube } from 'lucide-react';
import { dbService } from '@/src/lib/db';
import { Kontak } from '@/src/types';

export default function Footer() {
  const [kontak, setKontak] = useState<Kontak | null>(null);

  useEffect(() => {
    dbService.getKontak().then(setKontak);
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 font-sans border-t border-slate-800" id="main-application-footer">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Organization brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 px-1.5 rounded-lg flex items-center justify-center shadow-sm">
                <img 
                  src="https://lh3.googleusercontent.com/d/1mJoucoBL-xS9gWnQYaaHcJ3hsumyG7Qb" 
                  alt="FKP Kabupaten Tasikmalaya Logo" 
                  className="h-8 w-auto object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="leading-tight">
                <span className="block font-extrabold text-white text-sm tracking-tight">FKP Tasikmalaya</span>
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Forum Kewirausahaan Pemuda</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Forum Kewirausahaan Pemuda (FKP) Kabupaten Tasikmalaya merupakan wadah akselerasi, jejaring, dan pembinaan bagi wirausaha muda kreatif di Kabupaten Tasikmalaya, Jawa Barat.
            </p>
            <div className="flex gap-3 pt-2">
              <a href={`https://instagram.com/${kontak?.instagram || 'fkptasikmalayaofficial'}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-cyan-400">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={`https://facebook.com/${kontak?.facebook || 'fkptasik'}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-blue-500">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={`https://youtube.com/${kontak?.youtube || ''}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-red-500">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-cyan-500 pl-2">Sitemap</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/" className="hover:text-white transition-colors text-slate-400">Beranda / Landing Page</Link></li>
              <li><Link to="/umkm" className="hover:text-white transition-colors text-slate-400">Direktori UMKM Pemuda</Link></li>
              <li><Link to="/berita" className="hover:text-white transition-colors text-slate-400">Kabar Berita & Artikel</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors text-slate-400">Portal Pengurus (DPD / PK)</Link></li>
            </ul>
          </div>

          {/* Column 3: Jam/Layanan / Slogan */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-cyan-500 pl-2">Pilar Sinergi</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold mb-3">
              "Sinergi Pemuda, Sukses Berwirausaha! Wujudkan Ekosistem Bisnis Kecamatan Berkarakter Lokal Berdaya Global."
            </p>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
              <span className="block text-[10px] text-cyan-400 uppercase font-extrabold tracking-widest">Sekretariat DPD</span>
              <span className="text-[11px] font-mono text-slate-300">Wadah Kolaborasi Tasik Solid</span>
            </div>
          </div>

          {/* Column 4: Contact Coordinates */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-cyan-500 pl-2">Hubungi Kami</h4>
            <ul className="space-y-3 text-xs text-slate-400 font-semibold">
              <li className="flex gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{kontak?.alamat || 'Singaparna, Kabupaten Tasikmalaya, Jawa Barat'}</span>
              </li>
              <li className="flex gap-2 items-center">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href={`mailto:${kontak?.email || 'fkp.tasikmalaya@gmail.com'}`} className="hover:text-white truncate">{kontak?.email || 'fkp.tasikmalaya@gmail.com'}</a>
              </li>
              <li className="flex gap-2 items-center">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{kontak?.telepon || '0265-543210'}</span>
              </li>
              <li className="flex gap-2 items-center">
                <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href={`https://wa.me/${kontak?.whatsapp || '6281234567890'}`} target="_blank" rel="noopener noreferrer" className="hover:text-white font-semibold text-cyan-400">
                  +{(kontak?.whatsapp || '6281234567890')} (WhatsApp)
                </a>
              </li>
            </ul>
          </div>
          
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 DPD Forum Kewirausahaan Pemuda (FKP) Kabupaten Tasikmalaya. Semua Hak Dilindungi.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Database Online</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Syarat & Ketentuan</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Kebijakan Privasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
