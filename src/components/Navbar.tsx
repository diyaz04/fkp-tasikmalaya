/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNavLinkClick = (path: string) => {
    setIsOpen(false);
    setIsMoreOpen(false);
    if (path.startsWith('/#') && location.pathname === '/') {
      const targetId = path.replace('/#', '');
      window.setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  const navLinks = [
    { name: 'Beranda', path: '/', primary: true },
    { name: 'Pengurus Kecamatan', path: '/#pk-kecamatan', primary: false },
    { name: 'Direktori UMKM', path: '/umkm', primary: true },
    { name: 'Galeri', path: '/#galeri-kegiatan', primary: true },
    { name: 'Berita & Artikel', path: '/berita', primary: false }
  ];
  const primaryNavLinks = navLinks.filter(link => link.primary);
  const secondaryNavLinks = navLinks.filter(link => !link.primary);

  const isNavLinkActive = (path: string) => path.includes('#')
    ? location.pathname === '/' && location.hash === path.replace('/', '')
    : location.pathname === path;
  const isMoreActive = secondaryNavLinks.some(link => isNavLinkActive(link.path));

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm" id="main-navigation-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="https://lh3.googleusercontent.com/d/1mJoucoBL-xS9gWnQYaaHcJ3hsumyG7Qb" 
                alt="FKP Kabupaten Tasikmalaya Logo" 
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="leading-tight border-l border-slate-200 pl-2.5">
                <span className="block font-extrabold text-slate-800 text-[10px] sm:text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                  DPD FKP Kabupaten Tasikmalaya
                </span>
                <span className="block text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Forum Kewirausahaan Pemuda
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4 lg:gap-5">
            {primaryNavLinks.map((link) => {
              const isActive = isNavLinkActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => handleNavLinkClick(link.path)}
                  className={`text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                    isActive 
                      ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`text-sm font-semibold whitespace-nowrap transition-colors duration-200 inline-flex items-center gap-1 ${
                  isMoreActive
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lainnya
                <ChevronDown className={`w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200/70 z-50">
                  {secondaryNavLinks.map((link) => {
                    const isActive = isNavLinkActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => handleNavLinkClick(link.path)}
                        className={`block rounded-xl px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-slate-200"></div>

            {/* User Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {user.role === 'dpd' ? 'Admin DPD' : `PK ${user.nama_kecamatan}`}
                </span>
                <Link
                  to={user.role === 'dpd' ? '/dashboard' : '/dashboard-pk'}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 text-xs font-bold bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full transition-all shadow-sm whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xs font-bold px-5 py-2 rounded-full transition-all duration-200 hover:shadow-md hover:shadow-cyan-100"
              >
                Masuk Pengurus
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 p-2 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Menu List */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-4 space-y-2 shadow-inner">
          {navLinks.map((link) => {
            const isActive = isNavLinkActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => handleNavLinkClick(link.path)}
                className={`block px-3 py-2 text-sm font-semibold rounded-xl ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="border-t border-slate-100 my-2 pt-2"></div>

          {user ? (
            <div className="space-y-2 px-3">
              <div className="text-xs font-semibold text-slate-500 mb-1">
                Akun: {user.role === 'dpd' ? 'Admin DPD' : `PK ${user.nama_kecamatan}`}
              </div>
              <Link
                to={user.role === 'dpd' ? '/dashboard' : '/dashboard-pk'}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-slate-700 hover:text-blue-600 text-sm font-semibold py-1"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Pengurus
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 text-red-500 text-sm font-semibold py-1 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Masuk / Keluar Akun
              </button>
            </div>
          ) : (
            <div className="px-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold py-2 rounded-xl"
              >
                Masuk Pengurus
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
