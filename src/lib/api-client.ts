'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-functions';
import { ApiResponse } from './types';

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

  private async callFunction<TRequest, TResponse>(
    functionName: string,
    data?: TRequest,
    errorMessage?: string
  ): Promise<ApiResponse<TResponse>> {
    try {
      const fn = httpsCallable<TRequest, TResponse>(functions, functionName);
      const result = await fn(data as TRequest);
      return { success: true, data: result.data };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : errorMessage || `Failed to call ${functionName}`
      };
    }
  }

  public async getUserProfile(): Promise<ApiResponse> {
    return this.callFunction('getUserProfileFunction', undefined, 'Failed to get user profile');
  }

  public async updateUserProfile(data: UpdateProfileRequest): Promise<ApiResponse> {
    return this.callFunction('updateUserProfileFunction', data, 'Failed to update user profile');
  }

  public async deleteUserAccount(): Promise<ApiResponse> {
    const result = await this.callFunction('deleteUserAccountFunction', undefined, 'Failed to delete user account');
    if (result.success) {
      this.clearAuthToken();
    }
    return result;
  }

  public async getUserStats(email?: string): Promise<ApiResponse> {
    return this.callFunction('getUserStatsFunction', email ? {email} : undefined, 'Failed to get user stats');
  }
}

const authApiClient = new AuthApiClient();
export default authApiClient;
