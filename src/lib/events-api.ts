'use client';

import { ApiResponse } from '@/types/common';
import type { EventType } from '@/types/events';
import { getEventTypesDirect } from './firestore-client';

// Re-export types for backward compatibility
export type { EventCategory, EventType } from '@/types/events';

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
