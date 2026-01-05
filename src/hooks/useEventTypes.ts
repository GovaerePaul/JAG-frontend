'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEventTypes, EventType } from '@/lib/events-api';

interface UseEventTypesReturn {
  eventTypes: EventType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEventTypes(): UseEventTypesReturn {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await getEventTypes();

    if (response.success && response.data) {
      setEventTypes(response.data);
    } else {
      setError(response.error || 'Failed to fetch event types');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  return {
    eventTypes,
    loading,
    error,
    refetch: fetchEventTypes,
  };
}
