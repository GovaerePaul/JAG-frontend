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

export function useReceivableUsers(): UseReceivableUsersReturn {
  const { user } = useAuth();
  const [users, setUsers] = useState<ReceivableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!user) {
      setUsers([]);
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch };
}

