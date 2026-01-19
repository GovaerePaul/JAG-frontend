'use client';

import { ApiResponse } from '@/types/common';
import type { Quest, UserQuestStatus } from '@/types/quests';
import { auth } from './firebase';
import { getAllQuestsDirect, getUserQuestsDirect } from './firestore-client';

export async function getUserQuests(): Promise<ApiResponse<UserQuestStatus[]>> {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'User not authenticated' };
    
    const quests = await getUserQuestsDirect(user.uid);
    return { success: true, data: quests as UserQuestStatus[] };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user quests'
    };
  }
}

export async function getAllQuests(): Promise<ApiResponse<Quest[]>> {
  try {
    const quests = await getAllQuestsDirect();
    return { success: true, data: quests as Quest[] };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get all quests'
    };
  }
}
