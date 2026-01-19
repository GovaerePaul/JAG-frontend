'use client';

import { auth } from '@/lib/firebase';
import { getUserStatsDirect, getReceivableUsersDirect } from '@/lib/firestore-client';
import { discoverUsers } from '@/lib/users-api';
import type { ApiResponse } from '@/lib/types';
import type { ReceivableUser, DiscoverUsersParams, DiscoverUsersResponse } from '@/lib/users-api';

export interface UserStats {
  points: number;
  level: number;
  totalPointsEarned: number;
  messagesSentCount: number;
  messagesReceivedCount: number;
}

export class UserRepository {
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const stats = await getUserStatsDirect(user.uid);
      if (!stats) {
        return { success: false, error: 'User stats not found' };
      }

      return { success: true, data: stats };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user stats',
      };
    }
  }

  async getReceivableUsers(): Promise<ApiResponse<ReceivableUser[]>> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const users = await getReceivableUsersDirect(user.uid);
      return { success: true, data: users };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get receivable users',
      };
    }
  }

  async discoverUsers(params: DiscoverUsersParams): Promise<ApiResponse<DiscoverUsersResponse>> {
    return discoverUsers(params);
  }
}

export const userRepository = new UserRepository();
