/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { auth } from './firebase';

export async function changeCurrentUserPassword(currentPassword: string, newPassword: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    throw new Error('Sesi akun tidak ditemukan. Silakan login ulang.');
  }

  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  await reauthenticateWithCredential(currentUser, credential);
  await updatePassword(currentUser, newPassword);
}

export function getPasswordChangeMessage(error: any): string {
  if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
    return 'Password lama tidak sesuai.';
  }
  if (error?.code === 'auth/weak-password') {
    return 'Password baru terlalu lemah. Minimal 6 karakter.';
  }
  if (error?.code === 'auth/requires-recent-login') {
    return 'Sesi login sudah terlalu lama. Silakan logout lalu login ulang.';
  }
  if (error?.code === 'auth/network-request-failed') {
    return 'Koneksi internet bermasalah. Silakan coba lagi.';
  }
  return error?.message || 'Gagal mengganti password.';
}
