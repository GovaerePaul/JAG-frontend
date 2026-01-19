'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchReceivableUsers } from './userSlice';
import {
  selectReceivableUsers,
  selectReceivableUsersLoading,
  selectUserError,
} from './userSelectors';
import { useAuth } from '@/features/auth/useAuth';

interface UseReceivableUsersReturn {
  users: ReturnType<typeof selectReceivableUsers>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReceivableUsers(): UseReceivableUsersReturn {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const users = useAppSelector(selectReceivableUsers);
  const loading = useAppSelector(selectReceivableUsersLoading);
  const error = useAppSelector(selectUserError);

  const userId = useMemo(() => user?.uid || null, [user?.uid]);

  useEffect(() => {
    if (!userId) return;

    // If data already exists, don't fetch
    if (users.length > 0 && !loading) return;

    dispatch(fetchReceivableUsers());
  }, [userId, users.length, dispatch]);

  const refetch = useCallback(async () => {
    if (!user) return;
    await dispatch(fetchReceivableUsers());
  }, [dispatch, user]);

  return { users, loading, error, refetch };
}
