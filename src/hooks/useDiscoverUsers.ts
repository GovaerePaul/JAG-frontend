'use client';

import { useState, useEffect, useCallback } from 'react';
import { discoverUsers, DiscoverUsersParams, DiscoveredUser, Coordinates } from '@/lib/users-api';
import { useAuth } from './useAuth';

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
  search: (params: { search?: string; filters?: DiscoverUsersParams['filters'] }) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

const DISTANCE_STEPS = [50, 75, 100, 150, 200, 300, 500];

export function useDiscoverUsers(
  options: UseDiscoverUsersOptions = {}
): UseDiscoverUsersReturn {
  const { userProfile } = useAuth();
  const {
    initialDistance = 50,
    maxDistance = 500,
    autoExpand = true,
  } = options;

  const [users, setUsers] = useState<DiscoveredUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDistance, setCurrentDistance] = useState(initialDistance);
  const [isExpanding, setIsExpanding] = useState(false);
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [currentFilters, setCurrentFilters] = useState<DiscoverUsersParams['filters']>();
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    city: string;
    coordinates: Coordinates;
  } | null>(null);

  // Get user location on mount
  useEffect(() => {
    if (userProfile?.location?.city && userProfile.preferences?.shareLocation) {
      // Get coordinates for the city (simplified - in production, cache this)
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

  // Get coordinates from city name (simplified - in production use a proper service)
  const getCityCoordinates = async (cityName: string): Promise<Coordinates | null> => {
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
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    } catch (err) {
      console.error('Failed to get city coordinates:', err);
    }
    return null;
  };

  const performSearch = useCallback(
    async (
      searchParams: {
        search?: string;
        filters?: DiscoverUsersParams['filters'];
        distance?: number;
        reset?: boolean;
      },
      expandDistance = false
    ) => {
      setLoading(true);
      setError(null);

      if (expandDistance) {
        setIsExpanding(true);
      }

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
          search: searchParams.search,
          limit: 20,
          offset: searchParams.reset ? 0 : offset,
        };

        const response = await discoverUsers(params);

        if (response.success && response.data) {
          if (searchParams.reset) {
            setUsers(response.data.users);
            setOffset(response.data.users.length);
          } else {
            setUsers((prev) => [...prev, ...response.data.users]);
            setOffset((prev) => prev + response.data.users.length);
          }
          setHasMore(response.data.hasMore);

          // Auto-expand if no results and autoExpand is enabled
          if (
            autoExpand &&
            response.data.users.length === 0 &&
            searchDistance < maxDistance
          ) {
            const nextDistance = DISTANCE_STEPS.find((d) => d > searchDistance);
            if (nextDistance && nextDistance <= maxDistance) {
              setTimeout(() => {
                performSearch(
                  {
                    search: searchParams.search,
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
        } else {
          setError(response.error || 'Failed to discover users');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to discover users');
      } finally {
        setLoading(false);
        setIsExpanding(false);
      }
    },
    [userLocation, currentDistance, offset, autoExpand, maxDistance]
  );

  const search = useCallback(
    async (params: { search?: string; filters?: DiscoverUsersParams['filters'] }) => {
      setCurrentSearch(params.search || '');
      setCurrentFilters(params.filters);
      setCurrentDistance(initialDistance);
      setOffset(0);
      await performSearch(
        {
          search: params.search,
          filters: params.filters,
          distance: initialDistance,
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
          search: currentSearch,
          filters: currentFilters,
          distance: currentDistance,
          reset: false,
        },
        false
      );
    }
  }, [loading, hasMore, currentSearch, currentFilters, currentDistance, performSearch]);

  const reset = useCallback(() => {
    setUsers([]);
    setOffset(0);
    setCurrentDistance(initialDistance);
    setError(null);
    setCurrentSearch('');
    setCurrentFilters(undefined);
  }, [initialDistance]);

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

