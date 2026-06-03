/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { isFirebaseConfigured } from '@/src/lib/firebase';

export default function Login() {
  const { user, loading, error, signInWithGoogle, loginAsDemo } = useAuthStore();
  const navigate = useNavigate();
  const [selectedDemoEmail, setSelectedDemoEmail] = useState('pk.singaparna@gmail.com');

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
    await signInWithGoogle();
  };

  const handleDemoLogin = async (role: 'dpd' | 'pk') => {
    if (role === 'dpd') {
      await loginAsDemo('dpd');
    } else {
      await loginAsDemo('pk', selectedDemoEmail);
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
          
          <div className="text-center text-xs text-slate-500 font-semibold leading-relaxed">
            Selamat datang di Portal Pengurus DPD & PK FKP Kabupaten Tasikmalaya. Gunakan Google Sign-In untuk login ke akun resmi Anda.
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs flex gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Gagal login: {error}</span>
            </div>
          )}

          {/* Core Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-extrabold rounded-full text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Menghubungkan Akun...' : 'Masuk Dengan Google'}
          </button>

          {/* Detailed Demo Mode Section (CRITICAL FOR PREVIEW AND TESTING) */}
          <div className="relative flex py-2 items-center justify-center text-xs text-slate-400 font-extrabold">
            <span className="bg-white px-3 z-10 uppercase tracking-widest text-[10px]">Portal Pengujian Cepat</span>
            <div className="absolute w-full h-[1px] bg-slate-200"></div>
          </div>

          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 space-y-4">
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Anda berada di lingkungan pengembangan. Gunakan akses cepat di bawah ini untuk menguji hak akses DPD Kabupaten (Admin) atau Pengurus Kecamatan (PK):
            </p>

            <div className="space-y-3">
              {/* Demo button DPD */}
              <button
                onClick={() => handleDemoLogin('dpd')}
                className="w-full py-2 px-3 bg-white hover:bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold rounded-xl transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Masuk Sebagai DPD (Admin)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="h-[1px] bg-blue-100"></div>

              {/* Demo selectors PK */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Akses Kecamatan PK:</label>
                <select
                  value={selectedDemoEmail}
                  onChange={(e) => setSelectedDemoEmail(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-600 mb-2"
                >
                  <option value="pk.singaparna@gmail.com">Kec. Singaparna (pk.singaparna@gmail.com)</option>
                  <option value="pk.rajapolah@gmail.com">Kec. Rajapolah (pk.rajapolah@gmail.com)</option>
                  <option value="pk.ciawi@gmail.com">Kec. Ciawi (pk.ciawi@gmail.com)</option>
                </select>
                
                <button
                  onClick={() => handleDemoLogin('pk')}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span>Masuk Sebagai PK Terpilih</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
