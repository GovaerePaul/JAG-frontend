'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  search: (params: { filters?: DiscoverUsersParams['filters'] }) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

// Removed DISTANCE_STEPS - now using simple +100km increments

// Global cache for city coordinates to avoid repeated API calls
const cityCoordinatesCache: Record<string, {
  coordinates: Coordinates | null;
  timestamp: number;
}> = {};

const COORDINATES_CACHE_DURATION = 86400000; // 24 hours (coordinates don't change)

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
  const [currentFilters, setCurrentFilters] = useState<DiscoverUsersParams['filters']>();
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const attemptCountRef = useRef(0);
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

  // Trigger initial search when location becomes available
  const hasSearchedRef = useRef(false);

  // Get coordinates from city name with caching
  const getCityCoordinates = async (cityName: string): Promise<Coordinates | null> => {
    // Check cache first
    const cached = cityCoordinatesCache[cityName];
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < COORDINATES_CACHE_DURATION) {
      return cached.coordinates;
    }

    // Fetch from API
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
        
        // Cache the result
        cityCoordinatesCache[cityName] = {
          coordinates,
          timestamp: Date.now(),
        };
        
        return coordinates;
      }
    } catch (err) {
      // Silent fail
    }
    
    // Cache null result to avoid repeated failed calls
    cityCoordinatesCache[cityName] = {
      coordinates: null,
      timestamp: Date.now(),
    };
    
    return null;
  };

  const performSearch = useCallback(
    async (
      searchParams: {
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

      // Track attempt count for expansion logic
      // Only reset on first search, not on expansion
      if (searchParams.reset && !expandDistance) {
        attemptCountRef.current = 1; // First attempt
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

        const response = await discoverUsers(params);

        if (response.success && response.data) {
          const data = response.data;
          if (searchParams.reset) {
            setUsers(data.users);
            setOffset(data.users.length);
          } else {
            setUsers((prev) => [...prev, ...data.users]);
            setOffset((prev) => prev + data.users.length);
          }
          setHasMore(data.hasMore);

          // Auto-expand if no users found and autoExpand is enabled (max 3 attempts: current +100km, +200km)
          if (
            autoExpand &&
            data.users.length === 0 &&
            attemptCountRef.current < 3 &&
            searchDistance < maxDistance
          ) {
            const nextAttempt = attemptCountRef.current + 1;
            const nextDistance = initialDistance + (nextAttempt - 1) * 100; // +100km per attempt

            if (nextDistance <= maxDistance) {
              attemptCountRef.current = nextAttempt;
              // Don't set loading to false here - let the next search handle it
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
              return; // Exit early, don't set loading to false
            }
          }
          
          // Set loading to false when done (found users or max attempts reached)
          setLoading(false);
          setIsExpanding(false);
        } else {
          setError(response.error || 'Failed to discover users');
          setLoading(false);
          setIsExpanding(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to discover users');
        setLoading(false);
        setIsExpanding(false);
      }
    },
    [userLocation, currentDistance, offset, autoExpand, maxDistance, initialDistance]
  );

  const search = useCallback(
    async (params: { filters?: DiscoverUsersParams['filters'] }) => {
      const searchDistance = params.filters?.maxDistance || initialDistance;
      setCurrentFilters(params.filters);
      setCurrentDistance(searchDistance);
      setOffset(0);
      attemptCountRef.current = 0;
      hasSearchedRef.current = true; // Mark as searched when manually triggered
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
    setError(null);
    setCurrentFilters(undefined);
    attemptCountRef.current = 0;
    hasSearchedRef.current = false;
  }, [initialDistance]);

  // Trigger initial search when location becomes available (only once)
  const performSearchRef = useRef(performSearch);
  performSearchRef.current = performSearch;

  useEffect(() => {
    // Only trigger search once when userLocation becomes available
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

