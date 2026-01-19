'use client';

import { ApiResponse } from './types';
import { getEventTypesDirect } from './firestore-client';

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
    const eventTypes = await getEventTypesDirect(locale);
    return { success: true, data: eventTypes as EventType[] };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get event types'
    };
  }
}
