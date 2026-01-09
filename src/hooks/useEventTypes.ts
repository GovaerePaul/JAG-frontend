'use client';

import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchEventTypes = async () => {
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
      }
    };

    fetchEventTypes();
  }, [locale]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
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
    }
  }, [locale]);

  return {
    eventTypes,
    loading,
    error,
    refetch,
  };
}
