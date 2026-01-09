'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { getEventTypes, EventType } from '@/lib/events-api';

interface UseEventTypesReturn {
  eventTypes: EventType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEventTypes(): UseEventTypesReturn {
  const locale = useLocale();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef<Promise<void> | null>(null);

  const fetchEventTypes = useCallback(async () => {
    // If already fetching, wait for that promise
    if (fetchingRef.current) {
      await fetchingRef.current;
      return;
    }

    setLoading(true);
    setError(null);
    const fetchPromise = (async () => {
      try {
        const response = await getEventTypes(locale);
        if (response.success && response.data) {
          setEventTypes(response.data);
        } else {
          setError(response.error || 'Failed to fetch event types');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event types';
        setError(errorMessage);
      } finally {
        setLoading(false);
        fetchingRef.current = null;
      }
    })();

    fetchingRef.current = fetchPromise;
    await fetchPromise;
  }, [locale]);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  const refetch = useCallback(async () => {
    await fetchEventTypes();
  }, [fetchEventTypes]);

  return {
    eventTypes,
    loading,
    error,
    refetch,
  };
}
