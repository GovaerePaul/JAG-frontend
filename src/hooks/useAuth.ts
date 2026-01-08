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
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const loadProfile = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      
      unsubscribe = onSnapshot(
        userDocRef,
        async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            
            // Check if this is an alias account (from OAuth auto-merge)
            if (data.isAlias && data.mainProfileUID) {
              // Load the main profile instead
              const mainProfileRef = doc(db, 'users', data.mainProfileUID);
              const mainUnsubscribe = onSnapshot(
                mainProfileRef,
                (mainSnapshot) => {
                  if (mainSnapshot.exists()) {
                    setUserProfile(mainSnapshot.data() as UserProfile);
                  } else {
                    setUserProfile(null);
                  }
                  setLoading(false);
                },
                (error) => {
                  console.error('Error loading main profile:', error);
                  setUserProfile(null);
                  setLoading(false);
                }
              );
              
              // Replace unsubscribe function
              if (unsubscribe) {
                const oldUnsubscribe = unsubscribe;
                unsubscribe = () => {
                  oldUnsubscribe();
                  mainUnsubscribe();
                };
              }
            } else {
              // Normal profile
              setUserProfile(data as UserProfile);
              setLoading(false);
            }
          } else {
            setUserProfile(null);
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error loading profile:', error);
          setUserProfile(null);
          setLoading(false);
        }
      );
    };

    loadProfile();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const canSend = userProfile?.role === 'sender' || userProfile?.role === 'both';
  const canReceive = userProfile?.role === 'receiver' || userProfile?.role === 'both';

  return { user, userProfile, loading, canSend, canReceive };
};
