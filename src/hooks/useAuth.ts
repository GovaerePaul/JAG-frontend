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
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let emailFallbackDone = false;
    let emailUnsubscribe: (() => void) | null = null;

    // Try to find document by UID first (normal case)
    const usersRef = collection(db, 'users');
    const qByUid = query(usersRef, where('uid', '==', user.uid), limit(1));
    
    const unsubscribe = onSnapshot(
      qByUid,
      (querySnapshot) => {
        if (!isMounted) return;
        
        if (!querySnapshot.empty) {
          // Found by UID - normal case
          setUserProfile(querySnapshot.docs[0].data() as UserProfile);
          setLoading(false);
          emailFallbackDone = true; // Prevent email fallback
          // Clean up email listener if it exists
          if (emailUnsubscribe) {
            emailUnsubscribe();
            emailUnsubscribe = null;
          }
        } else if (user.email && !emailFallbackDone) {
          // Not found by UID - try by email (Facebook OAuth case) - only once
          emailFallbackDone = true;
          console.log('⚠️ Document not found by UID, searching by email:', user.email);
          
          // Use onSnapshot for email query too (so it updates if document changes)
          const qByEmail = query(usersRef, where('email', '==', user.email), limit(1));
          emailUnsubscribe = onSnapshot(
            qByEmail,
            (emailSnapshot) => {
              if (!isMounted) return;
              
              if (!emailSnapshot.empty) {
                setUserProfile(emailSnapshot.docs[0].data() as UserProfile);
                console.log('✅ Found document by email:', emailSnapshot.docs[0].id);
              } else {
                console.error('❌ No document found for email:', user.email);
                setUserProfile(null);
              }
              setLoading(false);
            },
            (error) => {
              if (!isMounted) return;
              console.error('Error searching by email:', error);
              setUserProfile(null);
              setLoading(false);
            }
          );
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

    return () => {
      isMounted = false;
      unsubscribe();
      if (emailUnsubscribe) {
        emailUnsubscribe();
      }
    };
  }, [user]);

  const canSend = userProfile?.role === 'sender' || userProfile?.role === 'both';
  const canReceive = userProfile?.role === 'receiver' || userProfile?.role === 'both';

  return { user, userProfile, loading, canSend, canReceive };
};
