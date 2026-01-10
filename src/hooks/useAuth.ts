'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, limit, onSnapshot, getDocs, Timestamp } from 'firebase/firestore';
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
  availableProviders?: string[]; // ["google", "facebook", "password"]
  userProviderIds?: Record<string, string>; // { "google": "uid_google", "facebook": "uid_facebook" }
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
  secondaryProviderUIDs?: string[]; // Deprecated - use userProviderIds instead
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
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let loadingSet = false;

    // Find document by email (since document might have different UID if user logged in with different provider)
    const usersRef = collection(db, 'users');
    const userEmail = user.email;
    const qByEmail = userEmail 
      ? query(usersRef, where('email', '==', userEmail), limit(1))
      : query(usersRef, where('uid', '==', user.uid), limit(1)); // Fallback to UID if no email
    
    const unsubscribe = onSnapshot(
      qByEmail,
      (querySnapshot) => {
        if (!isMounted) return;
        
        if (!querySnapshot.empty) {
          const profileData = querySnapshot.docs[0].data() as UserProfile;
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
          // Wait a bit for backend trigger to create document (max 3 seconds)
          if (!timeoutId) {
            timeoutId = setTimeout(() => {
              if (!isMounted || loadingSet) return;
              setUserProfile(null);
              setLoading(false);
              loadingSet = true;
            }, 3000);
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
