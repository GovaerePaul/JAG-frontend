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
  selectEventsLastFetched,
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
  const lastFetched = useAppSelector(selectEventsLastFetched);

  useEffect(() => {
    if (loading) return;
    if (lastFetched && storedLocale === locale) return;
    dispatch(fetchEventTypes(locale));
  }, [locale, storedLocale, lastFetched, loading, dispatch]);

  const refetch = useCallback(async () => {
    await dispatch(fetchEventTypes(locale));
  }, [dispatch, locale]);

  return { eventTypes, loading, error, refetch };
}
