'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Timestamp, collection, query, getDocs, getDoc } from 'firebase/firestore';
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
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    // onAuthStateChanged is called immediately with the current auth state
    // and then whenever the auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Authentication state has been determined
      if (process.env.NODE_ENV === 'development') {
        console.log('[useAuth] onAuthStateChanged:', { hasUser: !!firebaseUser, uid: firebaseUser?.uid });
      }
      
      setUser(firebaseUser);
      setAuthLoading(false);
      
      if (!firebaseUser) {
        // No user authenticated, clear profile
        setUserProfile(null);
        setProfileLoading(false);
      }
      // If firebaseUser exists, the profile loading will be handled by the next useEffect
    });

    return () => unsubscribe();
  }, []);

  // Listen to user profile changes in Firestore
  // Document ID = UID (Firebase Auth UID)
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setProfileLoading(false);
      return;
    }

    let isMounted = true;
    setProfileLoading(true);

    // First, try to find document by UID (document ID)
    const findUserDocument = async () => {
      try {
        // Try direct lookup by UID (document ID)
        const userDocRef = doc(db, 'users', user.uid);
        const directDoc = await getDoc(userDocRef);
        
        if (directDoc.exists()) {
          // Document found with this UID
          const unsubscribe = onSnapshot(
            userDocRef,
            (docSnapshot) => {
              if (!isMounted) return;
              
              if (docSnapshot.exists()) {
                const profileData = docSnapshot.data() as UserProfile;
                setUserProfile({ ...profileData });
                setProfileLoading(false);
              } else {
                setUserProfile(null);
                setProfileLoading(false);
              }
            },
            (error) => {
              if (!isMounted) return;
              console.error('Error loading profile:', error);
              setUserProfile(null);
              setProfileLoading(false);
            }
          );
          
          return unsubscribe;
        }

        // Document not found at all
        if (isMounted) {
          setUserProfile(null);
          setProfileLoading(false);
        }
        return () => {};
      } catch (error) {
        console.error('Error finding user document:', error);
        if (isMounted) {
          setUserProfile(null);
          setProfileLoading(false);
        }
        return () => {};
      }
    };

    let unsubscribe: (() => void) | null = null;
    
    findUserDocument().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid]);

  const canSend = userProfile?.role === 'sender' || userProfile?.role === 'both';
  const canReceive = userProfile?.role === 'receiver' || userProfile?.role === 'both';
  
  // isReady is true when user is authenticated and authLoading is complete
  // This ensures that Firebase Auth has finished checking the authentication state
  // We don't wait for profileLoading - the profile can load in the background
  // All API calls (getUserStats, getReceivedMessages, etc.) will wait for isReady to be true
  // Calculate directly (not memoized) to ensure React detects changes and triggers re-render
  const isReady = !!(user && !authLoading);
  
  // Debug log (can be removed later)
  if (process.env.NODE_ENV === 'development') {
    console.log('[useAuth] isReady:', isReady, { user: !!user, authLoading, uid: user?.uid });
  }
  
  // loading is true if either auth or profile is loading
  const loading = authLoading || profileLoading;

  return { user, userProfile, loading, authLoading, profileLoading, canSend, canReceive, isReady };
};
