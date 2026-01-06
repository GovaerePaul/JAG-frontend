'use client';

import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const functions = getFunctions(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export type UserRole = 'sender' | 'receiver' | 'both';

export interface ReceivableUser {
  uid: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get all users who can receive messages (role = "receiver" or "both")
 * Excludes the current user
 */
export async function getReceivableUsers(): Promise<ApiResponse<ReceivableUser[]>> {
  try {
    const getReceivableUsersFn = httpsCallable<void, ReceivableUser[]>(
      functions,
      'getReceivableUsersFunction'
    );
    const result = await getReceivableUsersFn();

    return {
      success: true,
      data: result.data
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get receivable users'
    };
  }
}

