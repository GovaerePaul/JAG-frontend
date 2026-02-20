'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-functions';
import { auth } from './firebase';
import { getUserProfileDirect, getUserStatsDirect } from './firestore-client';
import { ApiResponse } from '@/types/common';

export interface UpdateProfileRequest {
  displayName?: string;
  photoURL?: string;
}

class AuthApiClient {

  public async getUserProfile(): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: 'User not authenticated' };
      
      const profile = await getUserProfileDirect(user.uid);
      if (!profile) return { success: false, error: 'User profile not found' };
      
      return { success: true, data: profile };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user profile'
      };
    }
  }

  public async getUserStats(): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: 'User not authenticated' };
      
      const stats = await getUserStatsDirect(user.uid);
      if (!stats) return { success: false, error: 'User stats not found' };
      
      return { success: true, data: stats };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user stats'
      };
    }
  }

  public async updateUserProfile(data: UpdateProfileRequest): Promise<ApiResponse> {
    try {
      const fn = httpsCallable(functions, 'updateUserProfileFunction');
      const result = await fn(data);
      return { success: true, data: result.data };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user profile'
      };
    }
  }

  public async deleteUserAccount(): Promise<ApiResponse> {
    try {
      const fn = httpsCallable(functions, 'deleteUserAccountFunction');
      const result = await fn();
      return { success: true, data: result.data };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user account'
      };
    }
  }
}

const authApiClient = new AuthApiClient();
export default authApiClient;
