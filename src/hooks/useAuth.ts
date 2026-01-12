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
  // Document ID = UID (Firebase Auth UID)
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

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
                setLoading(false);
              } else {
                setUserProfile(null);
                setLoading(false);
              }
            },
            (error) => {
              if (!isMounted) return;
              console.error('Error loading profile:', error);
              setUserProfile(null);
              setLoading(false);
            }
          );
          
          return unsubscribe;
        }

        // Document not found at all
        console.warn('⚠️ User document not found for UID:', user.uid);
        if (isMounted) {
          setUserProfile(null);
          setLoading(false);
        }
        return () => {};
      } catch (error) {
        console.error('Error finding user document:', error);
        if (isMounted) {
          setUserProfile(null);
          setLoading(false);
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

  return { user, userProfile, loading, canSend, canReceive };
};
