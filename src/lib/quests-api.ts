'use client';

import { ApiResponse } from './types';
import { auth } from './firebase';
import { getAllQuestsDirect, getUserQuestsDirect } from './firestore-client';

export type QuestCategory = 'profile' | 'messages' | 'engagement';
export type QuestActionType = 
  | 'update_favorites' 
  | 'send_message' 
  | 'receive_message' 
  | 'update_location'
  | 'update_photo';

export interface Quest {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  category: QuestCategory;
  pointsReward: number;
  targetValue: number;
  actionType: QuestActionType;
  isActive: boolean;
  order: number;
}

export interface UserQuestStatus {
  quest: Quest;
  isCompleted: boolean;
  progress: number;
  progressPercent: number;
}

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
