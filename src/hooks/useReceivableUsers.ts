'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getReceivableUsers, ReceivableUser } from '@/lib/users-api';

interface UseReceivableUsersReturn {
  users: ReceivableUser[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global cache to share receivable users across components
export const receivableUsersCache = {
  data: null as ReceivableUser[] | null,
  timestamp: 0,
  promise: null as Promise<void> | null,
};

export function invalidateReceivableUsersCache() {
  receivableUsersCache.data = null;
  receivableUsersCache.timestamp = 0;
}

const CACHE_DURATION = 60000; // 60 seconds

export function useReceivableUsers(): UseReceivableUsersReturn {
  const { user } = useAuth();
  const [users, setUsers] = useState<ReceivableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!user) {
      setUsers([]);
      return;
    }

    // Check cache first
    const now = Date.now();
    if (receivableUsersCache.data && (now - receivableUsersCache.timestamp) < CACHE_DURATION) {
      setUsers(receivableUsersCache.data);
      return;
    }

    // If already fetching, wait for that promise
    if (receivableUsersCache.promise) {
      await receivableUsersCache.promise;
      if (receivableUsersCache.data) {
        setUsers(receivableUsersCache.data);
      }
      return;
    }

    setLoading(true);
    setError(null);
    const fetchPromise = (async () => {
      try {
        const response = await getReceivableUsers();
        if (response.success && response.data) {
          receivableUsersCache.data = response.data;
          receivableUsersCache.timestamp = Date.now();
          setUsers(response.data);
        } else {
          setError(response.error || 'Failed to fetch users');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
        setError(errorMessage);
      } finally {
        setLoading(false);
        receivableUsersCache.promise = null;
      }
    })();

    receivableUsersCache.promise = fetchPromise;
    await fetchPromise;
  }, [user]);

  // No automatic fetch - components must call refetch() manually
  // This avoids unnecessary API calls when components mount

  const refetch = useCallback(async () => {
    invalidateReceivableUsersCache();
    await fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch };
}

