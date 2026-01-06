'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-functions';
import { ApiResponse } from './types';

export type UserRole = 'sender' | 'receiver' | 'both';

export interface ReceivableUser {
  uid: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
}

export async function getReceivableUsers(): Promise<ApiResponse<ReceivableUser[]>> {
  try {
    const fn = httpsCallable<void, ReceivableUser[]>(functions, 'getReceivableUsersFunction');
    const result = await fn();
    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get receivable users'
    };
  }
}

