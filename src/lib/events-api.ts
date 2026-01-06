'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-functions';
import { ApiResponse } from './types';

export type EventCategory = 'joyful' | 'sad' | 'neutral';

export interface EventType {
  id: string;
  name: string;
  description: string;
  category: EventCategory;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

export async function getEventTypes(locale: string = 'en'): Promise<ApiResponse<EventType[]>> {
  try {
    const fn = httpsCallable<{locale: string}, EventType[]>(functions, 'getEventTypesFunction');
    const result = await fn({locale});
    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get event types'
    };
  }
}
