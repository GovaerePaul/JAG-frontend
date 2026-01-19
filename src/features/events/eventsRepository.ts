'use client';

import { getEventTypesDirect } from '@/lib/firestore-client';
import type { ApiResponse } from '@/lib/types';
import type { EventType } from '@/lib/events-api';

export class EventsRepository {
  async getEventTypes(locale: string = 'en'): Promise<ApiResponse<EventType[]>> {
    try {
      const eventTypes = await getEventTypesDirect(locale);
      return { success: true, data: eventTypes as EventType[] };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event types',
      };
    }
  }
}

export const eventsRepository = new EventsRepository();
