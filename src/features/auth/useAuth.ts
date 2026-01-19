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

  useEffect(() => {
    if (!user && !authLoading && !hasClearedRef.current) {
      hasClearedRef.current = true;
      dispatch(clearAuth());
      dispatch(clearUser());
      dispatch(clearMessages());
      dispatch(clearQuests());
    }
    
    if (user) {
      hasClearedRef.current = false;
    }
  }, [user, authLoading, dispatch]);

  const isReady = useMemo(() => !!(user && !authLoading), [user, authLoading]);

  useEffect(() => {
    if (!user || !isReady) return;
    if (userProfileFromRedux && !profileLoadingFromRedux) return;
    dispatch(fetchUserProfile());
  }, [dispatch, user, isReady, userProfileFromRedux, profileLoadingFromRedux]);

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
