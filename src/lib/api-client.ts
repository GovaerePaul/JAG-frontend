'use client';

import apiClient, { ApiResponse } from './axios';

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
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.error || 'Failed to get user profile'
      };
    }
  }

  public async updateUserProfile(data: UpdateProfileRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.error || 'Failed to update user profile'
      };
    }
  }

  public async deleteUserAccount(): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete('/auth/profile');
      this.clearAuthToken();
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.error || 'Failed to delete user account'
      };
    }
  }
}

const authApiClient = new AuthApiClient();
export default authApiClient;
