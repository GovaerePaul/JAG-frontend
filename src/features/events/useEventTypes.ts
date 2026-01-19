'use client';

import { useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEventTypes } from './eventsSlice';
import {
  selectEventTypes,
  selectEventsLoading,
  selectEventsError,
  selectEventsLocale,
} from './eventsSelectors';

interface UseEventTypesReturn {
  eventTypes: ReturnType<typeof selectEventTypes>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEventTypes(): UseEventTypesReturn {
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const eventTypes = useAppSelector(selectEventTypes);
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);
  const storedLocale = useAppSelector(selectEventsLocale);

  useEffect(() => {
    if (eventTypes.length > 0 && storedLocale === locale && !loading) return;
    dispatch(fetchEventTypes(locale));
  }, [locale, eventTypes.length, storedLocale, dispatch]);

  const refetch = useCallback(async () => {
    await dispatch(fetchEventTypes(locale));
  }, [dispatch, locale]);

  return { eventTypes, loading, error, refetch };
}
