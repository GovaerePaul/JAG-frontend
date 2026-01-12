'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'sender' | 'receiver' | 'both';

export interface UserLocation {
  city?: string;
  region?: string;
  country?: string;
  lastUpdated?: Timestamp;
}

export interface UserPreferences {
  shareLocation?: boolean;
  shareAge?: boolean;
  favoriteEventTypeIdsForReceiving?: string[]; // Types d'événements qu'il veut recevoir (vide par défaut)
  favoriteEventTypeIdsForSending?: string[]; // Types d'événements qu'il veut envoyer (tous par défaut)
}

export interface UserProfile {
  uid: string;
  email: string;
  provider?: "google" | "password"; // Single provider (no longer an array)
  displayName?: string;
  photoURL?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  isActive: boolean;
  role: UserRole;
  points?: number;
  level?: number;
  totalPointsEarned?: number;
  location?: UserLocation;
  birthDate?: Timestamp;
  preferences?: UserPreferences;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to user profile changes in Firestore
  // Use direct document snapshot (document ID = UID) for real-time updates
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let loadingSet = false;

    // Listen directly to document by UID (document ID = UID in backend)
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (!isMounted) return;
        
        if (docSnapshot.exists()) {
          const profileData = docSnapshot.data() as UserProfile;
          console.log('📊 UserProfile loaded from Firestore:', profileData);
          setUserProfile({ ...profileData });
          if (!loadingSet) {
            setLoading(false);
            loadingSet = true;
          }
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        } else {
          // Document doesn't exist yet, wait for backend trigger (max 5 seconds)
          if (!timeoutId) {
            timeoutId = setTimeout(() => {
              if (!isMounted || loadingSet) return;
              console.warn('⚠️ useAuth: Timeout waiting for user profile');
              setUserProfile(null);
              setLoading(false);
              loadingSet = true;
            }, 5000);
          }
        }
      },
      (error) => {
        if (!isMounted || loadingSet) return;
        console.error('Error loading profile:', error);
        setUserProfile(null);
        setLoading(false);
        loadingSet = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user?.uid]);

  const canSend = userProfile?.role === 'sender' || userProfile?.role === 'both';
  const canReceive = userProfile?.role === 'receiver' || userProfile?.role === 'both';

  return { user, userProfile, loading, canSend, canReceive };
};
