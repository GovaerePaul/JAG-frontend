'use client';

import apiClient from './axios';
import { ApiResponse } from '@/types/common';
import { AxiosError } from 'axios';

export interface CreateGiftData {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  recipientId?: string;
}

class BusinessApiClient {
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
}

const businessApiClient = new BusinessApiClient();
export default businessApiClient;
