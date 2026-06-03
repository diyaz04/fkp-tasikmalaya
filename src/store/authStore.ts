/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/src/lib/firebase';
import { dbService } from '@/src/lib/db';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'dpd' | 'pk' | 'visitor';
  pkId?: string; // If role is 'pk', which kecamatan ID
  nama_kecamatan?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  loginAsDemo: (role: 'dpd' | 'pk', email?: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  loginAsDemo: async (role, email) => {
    set({ loading: true, error: null });
    try {
      if (role === 'dpd') {
        set({
          user: {
            uid: 'demo_dpd_uid',
            email: 'sriwulandari16092000@gmail.com',
            displayName: 'Sri Wulandari (DPD Ketua Admin)',
            role: 'dpd'
          },
          loading: false
        });
      } else {
        const testEmail = email || 'pk.singaparna@gmail.com';
        const pks = await dbService.getPKs();
        const foundPK = pks.find(p => p.email === testEmail);
        
        set({
          user: {
            uid: 'demo_pk_uid_' + (foundPK?.id || 'singaparna'),
            email: testEmail,
            displayName: `Ahmad (PK ${foundPK?.nama_kecamatan || 'Singaparna'})`,
            role: 'pk',
            pkId: foundPK?.id || 'pk_singaparna',
            nama_kecamatan: foundPK?.nama_kecamatan || 'Singaparna'
          },
          loading: false
        });
      }
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error('Firebase signOut error', e);
      }
    }
    set({ user: null, loading: false });
  },

  signInWithGoogle: async () => {
    if (!isFirebaseConfigured) {
      // Direct demo login to make sure preview is fully interactive
      set({ loading: true });
      set({
        user: {
          uid: 'demo_dpd_uid',
          email: 'sriwulandari16092000@gmail.com',
          displayName: 'Sri Wulandari (DPD Ketua Admin)',
          role: 'dpd'
        },
        loading: false
      });
      return;
    }

    set({ loading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const firebaseUser = result.user;
        const mapped = await mapFirebaseUserToAuthUser(firebaseUser);
        set({ user: mapped, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  initAuth: () => {
    if (!isFirebaseConfigured) {
      set({ loading: false });
      return;
    }

    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      set({ loading: true });
      if (firebaseUser) {
        const mapped = await mapFirebaseUserToAuthUser(firebaseUser);
        set({ user: mapped, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    });
  }
}));

// Map Google Account details to internal roles
async function mapFirebaseUserToAuthUser(firebaseUser: FirebaseUser): Promise<AuthUser> {
  const email = firebaseUser.email;
  
  // DPD hardcoded email check (Admin)
  if (email === 'sriwulandari16092000@gmail.com') {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || 'Admin DPD',
      role: 'dpd'
    };
  }

  // PK email database lookup
  try {
    const pks = await dbService.getPKs();
    const foundPK = pks.find(p => p.email && p.email.toLowerCase() === email?.toLowerCase());
    if (foundPK) {
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || `PK ${foundPK.nama_kecamatan}`,
        role: 'pk',
        pkId: foundPK.id,
        nama_kecamatan: foundPK.nama_kecamatan
      };
    }
  } catch (error) {
    console.error('Error finding PK by email', error);
  }

  // Default fallback is visitor
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || 'Visitor',
    role: 'visitor'
  };
}
