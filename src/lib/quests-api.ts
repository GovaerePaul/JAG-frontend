'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-functions';
import { ApiResponse } from './types';

export type QuestCategory = 'profile' | 'messages' | 'engagement';
export type QuestActionType = 
  | 'update_favorites' 
  | 'send_message' 
  | 'receive_message' 
  | 'update_location'
  | 'update_photo';

export interface Quest {
  id: string;
  name: Record<string, string>; // Translations: { "en": "...", "fr": "..." }
  description: Record<string, string>; // Translations
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

export interface GetUserQuestsResponse {
  success: boolean;
  quests: UserQuestStatus[];
}

export interface GetAllQuestsResponse {
  success: boolean;
  quests: Quest[];
}

export async function getUserQuests(): Promise<ApiResponse<UserQuestStatus[]>> {
  try {
    const fn = httpsCallable<void, GetUserQuestsResponse>(
      functions,
      'getUserQuestsFunction'
    );
    const result = await fn();
    if (result.data.success) {
      return { success: true, data: result.data.quests };
    }
    return {
      success: false,
      error: 'Failed to get user quests'
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user quests'
    };
  }
}

export async function getAllQuests(): Promise<ApiResponse<Quest[]>> {
  try {
    const fn = httpsCallable<void, GetAllQuestsResponse>(
      functions,
      'getAllQuestsFunction'
    );
    const result = await fn();
    if (result.data.success) {
      return { success: true, data: result.data.quests };
    }
    return {
      success: false,
      error: 'Failed to get all quests'
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get all quests'
    };
  }
}

