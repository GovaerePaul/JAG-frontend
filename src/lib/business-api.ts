'use client';

import apiClient from './axios';
import { ApiResponse } from './api-client';

// Future business logic API calls (gifts, wishlists, etc.)
class BusinessApiClient {
  
  // Example future endpoints
  public async getGifts(): Promise<ApiResponse> {
    try {
      const response = await apiClient.get('/gifts');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.error || 'Failed to get gifts'
      };
    }
  }

  public async createGift(data: any): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/gifts', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.error || 'Failed to create gift'
      };
    }
  }

  // Add more business logic methods here as needed
}

const businessApiClient = new BusinessApiClient();
export default businessApiClient;
