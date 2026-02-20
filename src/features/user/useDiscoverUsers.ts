'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { discoverUsers as discoverUsersAction } from './userSlice';
import {
  selectDiscoverUsersLoading,
  selectUserError,
  selectDiscoveredUsersList,
  selectDiscoveredUsersHasMore,
} from './userSelectors';
import { useAuth } from '@/features/auth/useAuth';
import type { DiscoverUsersParams, DiscoveredUser } from '@/types/users';

interface UseDiscoverUsersOptions {
  initialDistance?: number;
}

interface UseDiscoverUsersReturn {
  users: DiscoveredUser[];
  loading: boolean;
  error: string | null;
  currentDistance: number;
  search: (params: { filters?: DiscoverUsersParams['filters'] }) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
  hasMore: boolean;
}

// Coordinates are now read directly from userProfile.location (no external API call needed)

export function useDiscoverUsers(
  options: UseDiscoverUsersOptions = {}
): UseDiscoverUsersReturn {
  const dispatch = useAppDispatch();
  const { userProfile } = useAuth();
  const { initialDistance = 50 } = options;

  const loading = useAppSelector(selectDiscoverUsersLoading);
  const error = useAppSelector(selectUserError);
  const usersFromStore = useAppSelector(selectDiscoveredUsersList);
  const hasMoreFromStore = useAppSelector(selectDiscoveredUsersHasMore);

  const [users, setUsers] = useState<DiscoveredUser[]>(() => usersFromStore);
  const [currentDistance, setCurrentDistance] = useState(initialDistance);
  const [currentFilters, setCurrentFilters] = useState<DiscoverUsersParams['filters']>();
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(hasMoreFromStore);
  const [userLocation, setUserLocation] = useState<{
    city: string;
    coordinates: { lat: number; lng: number };
  } | null>(null);
  const hasSearchedRef = useRef(false);

  useEffect(() => {
    if (
      userProfile?.location?.city &&
      userProfile.preferences?.shareLocation &&
      userProfile.location.latitude != null &&
      userProfile.location.longitude != null
    ) {
      setUserLocation({
        city: userProfile.location.city,
        coordinates: {
          lat: userProfile.location.latitude,
          lng: userProfile.location.longitude,
        },
      });
    }
  }, [userProfile]);

  const performSearch = useCallback(
    async (
      searchParams: {
        filters?: DiscoverUsersParams['filters'];
        distance?: number;
        reset?: boolean;
      }
    ) => {
      const searchDistance = searchParams.distance || currentDistance;
      if (searchDistance !== currentDistance) {
        setCurrentDistance(searchDistance);
      }

      try {
        const params: DiscoverUsersParams = {
          userLocation: userLocation || undefined,
          filters: {
            ...searchParams.filters,
            maxDistance: searchDistance,
          },
          limit: 20,
          cursor: searchParams.reset ? undefined : cursor || undefined,
        };

        const result = await dispatch(discoverUsersAction(params));
        
        if (discoverUsersAction.fulfilled.match(result)) {
          const data = result.payload;
          if (searchParams.reset) {
            setUsers(data.users);
          } else {
            setUsers((prev) => [...prev, ...data.users]);
          }
          setCursor(data.nextCursor || null);
          setHasMore(data.hasMore);
        }
      } catch (_err) {
        // Error handled by Redux
      }
    },
    [dispatch, userLocation, currentDistance, cursor]
  );

  const search = useCallback(
    async (params: { filters?: DiscoverUsersParams['filters'] }) => {
      const searchDistance = params.filters?.maxDistance || initialDistance;
      setCurrentFilters(params.filters);
      setCurrentDistance(searchDistance);
      setCursor(null);
      hasSearchedRef.current = true;
      await performSearch({
        filters: params.filters,
        distance: searchDistance,
        reset: true,
      });
    },
    [initialDistance, performSearch]
  );

  const loadMore = useCallback(async () => {
    if (!loading && hasMore && cursor) {
      await performSearch({
        filters: currentFilters,
        distance: currentDistance,
        reset: false,
      });
    }
  }, [loading, hasMore, cursor, currentFilters, currentDistance, performSearch]);

  const reset = useCallback(() => {
    setUsers([]);
    setCursor(null);
    setCurrentDistance(initialDistance);
    setCurrentFilters(undefined);
    setHasMore(false);
    hasSearchedRef.current = false;
  }, [initialDistance]);

  // Auto-search on mount when user location is available
  useEffect(() => {
    if (userLocation && !hasSearchedRef.current) {
      hasSearchedRef.current = true;
      performSearch({
        filters: currentFilters,
        distance: initialDistance,
        reset: true,
      });
    }
  }, [userLocation, currentFilters, initialDistance, performSearch]);

  return {
    users,
    loading,
    error,
    currentDistance,
    search,
    loadMore,
    reset,
    hasMore,
  };
}
