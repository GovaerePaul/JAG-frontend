'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './useAuth';
import { getReceivableUsers, ReceivableUser } from '@/lib/users-api';

interface UseReceivableUsersReturn {
  users: ReceivableUser[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReceivableUsers(): UseReceivableUsersReturn {
  const { user } = useAuth();
  const [users, setUsers] = useState<ReceivableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedUidRef = useRef<string | null>(null);

  // Stabilize user identifier
  const userId = useMemo(() => user?.uid || null, [user?.uid]);

  useEffect(() => {
    if (!userId) {
      setUsers([]);
      setLoading(false);
      lastFetchedUidRef.current = null;
      return;
    }

    // Skip if we already fetched for this user
    if (lastFetchedUidRef.current === userId) {
      return;
    }

    lastFetchedUidRef.current = userId;
    setLoading(true);
    setError(null);
    
    const fetchUsers = async () => {
      try {
        const response = await getReceivableUsers();
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          setError(response.error || 'Failed to fetch users');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId]);

  const refetch = useCallback(async () => {
    if (!user) return;

    // Reset the ref to allow fetching again
    lastFetchedUidRef.current = null;
    setLoading(true);
    setError(null);
    
    try {
      const response = await getReceivableUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error || 'Failed to fetch users');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { users, loading, error, refetch };
}

