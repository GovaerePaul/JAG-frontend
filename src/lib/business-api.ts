'use client';

import apiClient from './axios';
import { ApiResponse } from './api-client';
import { AxiosError } from 'axios';

export interface CreateGiftData {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  recipientId?: string;
}

// Future business logic API calls (gifts, wishlists, etc.)
class BusinessApiClient {
  
  // Example future endpoints
  public async getGifts(): Promise<ApiResponse> {
    try {
      const response = await apiClient.get('/gifts');
      return response.data;
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof AxiosError ? error.message : 'Failed to get gifts'
      };
    }
  }

  public async createGift(data: CreateGiftData): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/gifts', data);
      return response.data;
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof AxiosError ? error.message : 'Failed to create gift'
      };
    }
  }

  // Add more business logic methods here as needed
}

const businessApiClient = new BusinessApiClient();
export default businessApiClient;
