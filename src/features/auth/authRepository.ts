'use client';

import { auth } from '@/lib/firebase';
import { getUserProfileDirect } from '@/lib/firestore-client';
import authApiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/common';
import type { UserProfile } from '@/types/auth';

export class AuthRepository {
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const profile = await getUserProfileDirect(user.uid);
      if (!profile) {
        return { success: false, error: 'User profile not found' };
      }

      return { success: true, data: profile };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user profile',
      };
    }
  }

  async updateUserProfile(data: { displayName?: string; photoURL?: string }): Promise<ApiResponse> {
    return authApiClient.updateUserProfile(data);
  }

  async deleteUserAccount(): Promise<ApiResponse> {
    return authApiClient.deleteUserAccount();
  }
}

export const authRepository = new AuthRepository();
