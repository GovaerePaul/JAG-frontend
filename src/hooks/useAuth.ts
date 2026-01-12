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
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let loadingSet = false;

    // Find document by email (Google OAuth and email/password always provide user.email)
    const userEmail = user.email;
    
    const usersRef = collection(db, 'users');
    let q;
    const searchedByEmail = !!userEmail; // Track if we searched by email
    
    if (userEmail) {
      // Prioritize search by email
      q = query(usersRef, where('email', '==', userEmail), limit(1));
    } else {
      // Fallback to UID if email is not available (should not happen with current scopes)
      console.warn('⚠️ useAuth: No email available, falling back to UID search');
      q = query(usersRef, where('uid', '==', user.uid), limit(1));
    }
    
    const unsubscribe = onSnapshot(
      q,
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
          // If not found by email, try by UID (for existing users with old structure)
          if (searchedByEmail) {
            // Current query was by email, try UID as fallback
            const qByUid = query(usersRef, where('uid', '==', user.uid), limit(1));
            getDocs(qByUid).then(uidQuerySnapshot => {
              if (!isMounted) return;
              if (!uidQuerySnapshot.empty) {
                const profileData = uidQuerySnapshot.docs[0].data() as UserProfile;
                console.log('📊 UserProfile loaded from Firestore (by UID fallback):', profileData);
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
                // Wait a bit for backend trigger to create document (max 5 seconds)
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
            }).catch(error => {
              if (!isMounted || loadingSet) return;
              console.error('Error loading profile by UID:', error);
              // Wait a bit for backend trigger to create document (max 5 seconds)
              if (!timeoutId) {
                timeoutId = setTimeout(() => {
                  if (!isMounted || loadingSet) return;
                  setUserProfile(null);
                  setLoading(false);
                  loadingSet = true;
                }, 5000);
              }
            });
          } else {
            // Wait a bit for backend trigger to create document (max 5 seconds)
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
  }, [user?.uid, user?.email]);

  const canSend = userProfile?.role === 'sender' || userProfile?.role === 'both';
  const canReceive = userProfile?.role === 'receiver' || userProfile?.role === 'both';

  return { user, userProfile, loading, canSend, canReceive };
};
