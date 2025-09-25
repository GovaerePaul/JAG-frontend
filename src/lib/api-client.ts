'use client';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp, getApps } from 'firebase/app';
import { AxiosError } from 'axios';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const functions = getFunctions(app, 'europe-west1');

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  photoURL?: string;
}

class AuthApiClient {
  
  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  }

  public clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }

  public async getUserProfile(): Promise<ApiResponse> {
    try {
      const getUserProfile = httpsCallable(functions, 'getUserProfileFunction');
      const result = await getUserProfile();
      
      return {
        success: true,
        data: result.data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof AxiosError ? error.message : 'Failed to get user profile'
      };
    }
  }

  public async updateUserProfile(data: UpdateProfileRequest): Promise<ApiResponse> {
    try {
      const updateUserProfile = httpsCallable(functions, 'updateUserProfileFunction');
      const result = await updateUserProfile(data);
      
      return {
        success: true,
        data: result.data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof AxiosError ? error.message : 'Failed to update user profile'
      };
    }
  }

  public async deleteUserAccount(): Promise<ApiResponse> {
    try {
      const deleteUserAccount = httpsCallable(functions, 'deleteUserAccountFunction');
      const result = await deleteUserAccount();
      
      this.clearAuthToken();
      return {
        success: true,
        data: result.data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof AxiosError ? error.message : 'Failed to delete user account'
      };
    }
  }

  public async getUserStats(): Promise<ApiResponse> {
    try {
      const getUserStats = httpsCallable(functions, 'getUserStatsFunction');
      const result = await getUserStats();
      
      return {
        success: true,
        data: result.data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof AxiosError ? error.message : 'Failed to get user stats'
      };
    }
  }
}

const authApiClient = new AuthApiClient();
export default authApiClient;
