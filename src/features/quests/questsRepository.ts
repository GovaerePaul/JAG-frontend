'use client';

import { auth } from '@/lib/firebase';
import { getUserQuestsDirect } from '@/lib/firestore-client';
import type { ApiResponse } from '@/types/common';
import type { UserQuestStatus } from '@/types/quests';

export class QuestsRepository {
  async getUserQuests(): Promise<ApiResponse<UserQuestStatus[]>> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const quests = await getUserQuestsDirect(user.uid);
      return { success: true, data: quests as UserQuestStatus[] };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user quests',
      };
    }
  }
}

export const questsRepository = new QuestsRepository();
