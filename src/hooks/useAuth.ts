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
  secondaryProviderUIDs?: string[]; // UIDs from linked OAuth providers (Google, Facebook, etc.)
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
  // Now that the trigger migrates documents to match UID, we only need to query by UID
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Query by document ID (which should match user.uid after migration)
    const usersRef = collection(db, 'users');
    const qByUid = query(usersRef, where('uid', '==', user.uid), limit(1));
    
    const unsubscribe = onSnapshot(
      qByUid,
      (querySnapshot) => {
        if (!isMounted) return;
        
        if (!querySnapshot.empty) {
          const profileData = querySnapshot.docs[0].data() as UserProfile;
          console.log('📊 UserProfile loaded from Firestore:', profileData);
          console.log('📊 Points:', profileData.points);
          console.log('📊 Level:', profileData.level);
          // Create a new object to ensure React detects the change
          setUserProfile({ ...profileData });
        } else {
          console.warn('⚠️ No document found for UID:', user.uid);
          setUserProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        if (!isMounted) return;
        console.error('Error loading profile:', error);
        setUserProfile(null);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user?.uid]);

  const canSend = userProfile?.role === 'sender' || userProfile?.role === 'both';
  const canReceive = userProfile?.role === 'receiver' || userProfile?.role === 'both';

  return { user, userProfile, loading, canSend, canReceive };
};
