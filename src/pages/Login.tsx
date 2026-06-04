/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Mail, Lock, Info } from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';

export default function Login() {
  const { user, loading, error, signInWithGoogle, signInWithEmail, setError } = useAuthStore();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    // Clear global error state when loading page
    setError(null);
    setLocalError(null);
  }, [setError]);

  useEffect(() => {
    if (user) {
      if (user.role === 'dpd') {
        navigate('/dashboard');
      } else if (user.role === 'pk') {
        navigate('/dashboard-pk');
      } else {
        // Fallback visitor
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setLocalError(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      // Handled in store
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);

    // Form client-side validation
    if (!email || !email.includes('@')) {
      setLocalError('Silakan masukkan format email yang valid.');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('Kata sandi harus terdiri dari minimal 6 karakter.');
      return;
    }

    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      // Error is already stored in authStore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" id="login-entry-portal">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {/* Emblem Brand */}
        <div className="flex justify-center">
          <img 
            src="https://lh3.googleusercontent.com/d/1mJoucoBL-xS9gWnQYaaHcJ3hsumyG7Qb" 
            alt="FKP Kabupaten Tasikmalaya Logo" 
            className="h-16 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Pengurus FKP</h2>
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Kabupaten Tasikmalaya</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-100 shadow-xl rounded-3xl sm:px-10 space-y-6">
          
          <p className="text-center text-xs text-slate-500 font-medium leading-relaxed px-2">
            Silakan masuk menggunakan email & kata sandi terdaftar Anda, atau masuk langsung menggunakan akun Google yang sah.
          </p>

          {/* Validation & Error Alerts */}
          {(localError || error) && (
            <div className="p-3.5 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs flex gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Gagal: {localError || error}</span>
            </div>
          )}

          {/* Form Email & Password */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Alamat Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-sm pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold text-slate-800 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Kata Sandi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full text-sm pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold text-slate-800 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 text-sm font-extrabold rounded-full text-white bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 mt-2 shadow-md shadow-slate-100"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Masuk...' : 'Masuk Sekarang'}
            </button>
          </form>

          {/* Separator / Divider */}
          <div className="relative flex py-2 items-center justify-center text-xs text-slate-400 font-extrabold">
            <span className="bg-white px-3 z-10 uppercase tracking-widest text-[9px]">Atau Masuk Dengan</span>
            <div className="absolute w-full h-[1px] bg-slate-200"></div>
          </div>

          {/* federated Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2.5 py-3.5 px-4 text-sm font-extrabold rounded-full text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 disabled:bg-slate-100 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-6.16-4.53z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {loading ? 'Menghubungkan Akun...' : 'Google Sign-In'}
          </button>

          {/* Informational Guidelines card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Informasi Akses</span>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Admin Utama menggunakan email: <span className="font-extrabold text-slate-700">admindpdfkp@gmail.com</span>. Pastikan akun email Anda sudah terdaftar di database pengurus agar otomatis dialihkan ke dashboard yang sesuai setelah masuk.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
