'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile, clearAuth } from './authSlice';
import { clearUser } from '@/features/user/userSlice';
import { clearMessages } from '@/features/messages/messagesSlice';
import { clearQuests } from '@/features/quests/questsSlice';
import { selectUserProfile, selectAuthLoading } from './authSelectors';

// Re-export the type for compatibility
export type { UserProfile } from '@/types/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const userProfileFromRedux = useAppSelector(selectUserProfile);
  const profileLoadingFromRedux = useAppSelector(selectAuthLoading);
  
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const hasClearedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Clean all slices when user logs out (only once per logout)
  useEffect(() => {
    if (!user && !authLoading && !hasClearedRef.current) {
      hasClearedRef.current = true;
      // Dispatch all clear actions to reset Redux state
      dispatch(clearAuth());
      dispatch(clearUser());
      dispatch(clearMessages());
      dispatch(clearQuests());
    }
    
    // Reset flag when user logs back in
    if (user) {
      hasClearedRef.current = false;
    }
  }, [user, authLoading, dispatch]);

  // Calculate isReady early for use in effects
  const isReady = useMemo(() => !!(user && !authLoading), [user, authLoading]);

  // Fetch user profile to Redux once when user is available
  useEffect(() => {
    if (!user || !isReady) return;

    // If data already exists, don't fetch
    if (userProfileFromRedux && !profileLoadingFromRedux) return;

    dispatch(fetchUserProfile());
  }, [dispatch, user, isReady, userProfileFromRedux, profileLoadingFromRedux]);

  // Memoize derived values to avoid unnecessary re-renders
  const canSend = useMemo(
    () => userProfileFromRedux?.role === 'sender' || userProfileFromRedux?.role === 'both',
    [userProfileFromRedux?.role]
  );
  const canReceive = useMemo(
    () => userProfileFromRedux?.role === 'receiver' || userProfileFromRedux?.role === 'both',
    [userProfileFromRedux?.role]
  );
  
  const loading = authLoading || profileLoadingFromRedux;

  return { 
    user, 
    userProfile: userProfileFromRedux, 
    loading, 
    authLoading, 
    profileLoading: profileLoadingFromRedux, 
    canSend, 
    canReceive, 
    isReady 
  };
};
