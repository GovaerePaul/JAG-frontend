'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { discoverUsers as discoverUsersAction } from './userSlice';
import {
  selectDiscoveredUsers,
  selectDiscoverUsersLoading,
  selectUserError,
  selectDiscoveredUsersList,
  selectDiscoveredUsersHasMore,
} from './userSelectors';
import { useAuth } from '@/features/auth/useAuth';
import type { DiscoverUsersParams, DiscoveredUser } from '@/types/users';

interface UseDiscoverUsersOptions {
  initialDistance?: number;
  maxDistance?: number;
  autoExpand?: boolean;
}

interface UseDiscoverUsersReturn {
  users: DiscoveredUser[];
  loading: boolean;
  error: string | null;
  currentDistance: number;
  isExpanding: boolean;
  search: (params: { filters?: DiscoverUsersParams['filters'] }) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

// Global cache for city coordinates
const cityCoordinatesCache: Record<string, {
  coordinates: { lat: number; lng: number } | null;
  timestamp: number;
}> = {};

const COORDINATES_CACHE_DURATION = 86400000; // 24 hours

const getCityCoordinates = async (cityName: string): Promise<{ lat: number; lng: number } | null> => {
  const cached = cityCoordinatesCache[cityName];
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < COORDINATES_CACHE_DURATION) {
    return cached.coordinates;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`,
      {
        headers: {
          'User-Agent': 'JustAGift/1.0',
        },
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      
      cityCoordinatesCache[cityName] = {
        coordinates,
        timestamp: Date.now(),
      };
      
      return coordinates;
    }
  } catch (err) {
    // Silent fail
  }
  
  cityCoordinatesCache[cityName] = {
    coordinates: null,
    timestamp: Date.now(),
  };
  
  return null;
};

export function useDiscoverUsers(
  options: UseDiscoverUsersOptions = {}
): UseDiscoverUsersReturn {
  const dispatch = useAppDispatch();
  const { userProfile } = useAuth();
  const {
    initialDistance = 50,
    maxDistance = 500,
    autoExpand = true,
  } = options;

  const discoveredUsers = useAppSelector(selectDiscoveredUsers);
  const loading = useAppSelector(selectDiscoverUsersLoading);
  const error = useAppSelector(selectUserError);
  const usersFromStore = useAppSelector(selectDiscoveredUsersList);
  const hasMore = useAppSelector(selectDiscoveredUsersHasMore);

  const [users, setUsers] = useState<DiscoveredUser[]>([]);
  const [currentDistance, setCurrentDistance] = useState(initialDistance);
  const [isExpanding, setIsExpanding] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<DiscoverUsersParams['filters']>();
  const [offset, setOffset] = useState(0);
  const [userLocation, setUserLocation] = useState<{
    city: string;
    coordinates: { lat: number; lng: number };
  } | null>(null);
  const attemptCountRef = useRef(0);
  const hasSearchedRef = useRef(false);

  // Get user location on mount
  useEffect(() => {
    if (userProfile?.location?.city && userProfile.preferences?.shareLocation) {
      getCityCoordinates(userProfile.location.city).then((coords) => {
        if (coords) {
          setUserLocation({
            city: userProfile.location!.city!,
            coordinates: coords,
          });
        }
      });
    }
  }, [userProfile]);

  // Sync users from store
  useEffect(() => {
    if (usersFromStore.length > 0) {
      setUsers(usersFromStore);
    }
  }, [usersFromStore]);

  const performSearch = useCallback(
    async (
      searchParams: {
        filters?: DiscoverUsersParams['filters'];
        distance?: number;
        reset?: boolean;
      },
      expandDistance = false
    ) => {
      if (expandDistance) {
        setIsExpanding(true);
      }

      const searchDistance = searchParams.distance || currentDistance;
      if (searchDistance !== currentDistance) {
        setCurrentDistance(searchDistance);
      }

      if (searchParams.reset && !expandDistance) {
        attemptCountRef.current = 1;
      }

      try {
        const params: DiscoverUsersParams = {
          userLocation: userLocation || undefined,
          filters: {
            ...searchParams.filters,
            maxDistance: searchDistance,
          },
          limit: 20,
          offset: searchParams.reset ? 0 : offset,
        };

        const result = await dispatch(discoverUsersAction(params));
        
        if (discoverUsersAction.fulfilled.match(result)) {
          const data = result.payload;
          if (searchParams.reset) {
            setUsers(data.users);
            setOffset(data.users.length);
          } else {
            setUsers((prev) => [...prev, ...data.users]);
            setOffset((prev) => prev + data.users.length);
          }

          // Auto-expand if no users found and autoExpand is enabled
          if (
            autoExpand &&
            data.users.length === 0 &&
            attemptCountRef.current < 3 &&
            searchDistance < maxDistance
          ) {
            const nextAttempt = attemptCountRef.current + 1;
            const nextDistance = initialDistance + (nextAttempt - 1) * 100;

            if (nextDistance <= maxDistance) {
              attemptCountRef.current = nextAttempt;
              setTimeout(() => {
                performSearch(
                  {
                    filters: searchParams.filters,
                    distance: nextDistance,
                    reset: true,
                  },
                  true
                );
              }, 500);
              return;
            }
          }
          
          setIsExpanding(false);
        } else {
          setIsExpanding(false);
        }
      } catch (err) {
        setIsExpanding(false);
      }
    },
    [dispatch, userLocation, currentDistance, offset, autoExpand, maxDistance, initialDistance]
  );

  const search = useCallback(
    async (params: { filters?: DiscoverUsersParams['filters'] }) => {
      const searchDistance = params.filters?.maxDistance || initialDistance;
      setCurrentFilters(params.filters);
      setCurrentDistance(searchDistance);
      setOffset(0);
      attemptCountRef.current = 0;
      hasSearchedRef.current = true;
      await performSearch(
        {
          filters: params.filters,
          distance: searchDistance,
          reset: true,
        },
        false
      );
    },
    [initialDistance, performSearch]
  );

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await performSearch(
        {
          filters: currentFilters,
          distance: currentDistance,
          reset: false,
        },
        false
      );
    }
  }, [loading, hasMore, currentFilters, currentDistance, performSearch]);

  const reset = useCallback(() => {
    setUsers([]);
    setOffset(0);
    setCurrentDistance(initialDistance);
    setCurrentFilters(undefined);
    attemptCountRef.current = 0;
    hasSearchedRef.current = false;
  }, [initialDistance]);

  // Trigger initial search when location becomes available
  const performSearchRef = useRef(performSearch);
  performSearchRef.current = performSearch;

  useEffect(() => {
    if (userLocation && autoExpand && !hasSearchedRef.current) {
      hasSearchedRef.current = true;
      attemptCountRef.current = 0;
      setTimeout(() => {
        performSearchRef.current(
          {
            filters: currentFilters,
            distance: initialDistance,
            reset: true,
          },
          false
        );
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  return {
    users,
    loading,
    error,
    currentDistance,
    isExpanding,
    search,
    loadMore,
    reset,
  };
}
