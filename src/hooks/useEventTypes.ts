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

// Global cache to share event types across components (per locale)
const eventTypesCache: Record<string, {
  data: EventType[] | null;
  timestamp: number;
  promise: Promise<void> | null;
}> = {};

export const eventTypesCacheMap = eventTypesCache;

export function invalidateEventTypesCache(locale?: string) {
  if (locale) {
    if (eventTypesCache[locale]) {
      eventTypesCache[locale].data = null;
      eventTypesCache[locale].timestamp = 0;
    }
  } else {
    // Invalidate all locales
    Object.keys(eventTypesCache).forEach((loc) => {
      eventTypesCache[loc].data = null;
      eventTypesCache[loc].timestamp = 0;
    });
  }
}

const CACHE_DURATION = 60000; // 60 seconds (event types don't change often)

export function useEventTypes(): UseEventTypesReturn {
  const locale = useLocale();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize cache for this locale if it doesn't exist
  if (!eventTypesCache[locale]) {
    eventTypesCache[locale] = {
      data: null,
      timestamp: 0,
      promise: null,
    };
  }

  const cache = eventTypesCache[locale];

  const fetchEventTypes = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
      setEventTypes(cache.data);
      setLoading(false);
      return;
    }

    // If already fetching, wait for that promise
    if (cache.promise) {
      await cache.promise;
      if (cache.data) {
        setEventTypes(cache.data);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const fetchPromise = (async () => {
      try {
        const response = await getEventTypes(locale);
        if (response.success && response.data) {
          cache.data = response.data;
          cache.timestamp = Date.now();
          setEventTypes(response.data);
        } else {
          setError(response.error || 'Failed to fetch event types');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event types';
        setError(errorMessage);
      } finally {
        setLoading(false);
        cache.promise = null;
      }
    })();

    cache.promise = fetchPromise;
    await fetchPromise;
  }, [locale, cache]);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  const refetch = useCallback(async () => {
    invalidateEventTypesCache(locale);
    await fetchEventTypes();
  }, [locale, fetchEventTypes]);

  return {
    eventTypes,
    loading,
    error,
    refetch,
  };
}
