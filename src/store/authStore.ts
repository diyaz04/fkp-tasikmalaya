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
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
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
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  initAuth: () => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  setError: (error) => set({ error }),

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

  signInWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // 1. Look up if this email is an imported/registered PK Kecamatan
      let foundPK: any = null;
      try {
        const pks = await dbService.getPKs();
        foundPK = pks.find(p => p.email && p.email.toLowerCase() === email?.toLowerCase());
      } catch (dbErr) {
        console.error('Error looking up PK in login flow:', dbErr);
      }

      if (foundPK) {
        // If a preset password is saved for this PK, check if it matches first
        if (foundPK.password && foundPK.password !== password) {
          throw new Error('Kata sandi salah. Silakan coba kembali.');
        }

        // Try to sign in with standard Firebase Auth
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          if (result.user) {
            const mapped = await mapFirebaseUserToAuthUser(result.user);
            set({ user: mapped, loading: false });
          } else {
            set({ loading: false });
          }
        } catch (authError: any) {
          // If password matches the database preset, but Firebase Auth fails (e.g. user-not-found/invalid-credential),
          // it means their Firebase Auth record hasn't been created yet. Let's auto-create it on-the-fly now!
          if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found') {
            try {
              const registerResult = await createUserWithEmailAndPassword(auth, email, password);
              if (registerResult.user) {
                await updateProfile(registerResult.user, { displayName: `PK ${foundPK.nama_kecamatan}` });
                const mapped = await mapFirebaseUserToAuthUser(registerResult.user);
                set({ user: mapped, loading: false });
              } else {
                set({ loading: false });
              }
            } catch (createErr: any) {
              console.error('Failed auto-registration on login:', createErr);
              throw authError; // fallback to original error
            }
          } else {
            throw authError;
          }
        }
      } else {
        // Fallback for non-PK logins (e.g. DPD admindpdfkp@gmail.com)
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (result.user) {
          const mapped = await mapFirebaseUserToAuthUser(result.user);
          set({ user: mapped, loading: false });
        } else {
          set({ loading: false });
        }
      }
    } catch (e: any) {
      let friendlyMessage = e.message;
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        friendlyMessage = 'Email atau sandi salah atau tidak terdaftar. Silakan periksa kembali.';
      } else if (e.code === 'auth/invalid-email') {
        friendlyMessage = 'Format alamat email tidak valid.';
      } else if (e.code === 'auth/network-request-failed') {
        friendlyMessage = 'Koneksi internet bermasalah. Silakan coba lagi.';
      }
      set({ error: friendlyMessage, loading: false });
      throw new Error(friendlyMessage);
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await updateProfile(result.user, { displayName });
        // Fetch fresh mapping with display name loaded
        const mapped = await mapFirebaseUserToAuthUser(result.user);
        // Overwrite mapped display name if it empty/null
        if (!mapped.displayName) {
          mapped.displayName = displayName;
        }
        set({ user: mapped, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (e: any) {
      let friendlyMessage = e.message;
      if (e.code === 'auth/email-already-in-use') {
        friendlyMessage = 'Email ini sudah terdaftar. Silakan pilih email lain atau silakan masuk.';
      } else if (e.code === 'auth/weak-password') {
        friendlyMessage = 'Kata sandi terlalu lemah. Minimal 6 karakter.';
      } else if (e.code === 'auth/invalid-email') {
        friendlyMessage = 'Format alamat email tidak valid.';
      }
      set({ error: friendlyMessage, loading: false });
      throw new Error(friendlyMessage);
    }
  },

  signInWithGoogle: async () => {
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
  if (email === 'admindpdfkp@gmail.com' || email === 'sriwulandari16092000@gmail.com') {
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
