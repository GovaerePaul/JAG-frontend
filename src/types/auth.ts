import { Timestamp } from 'firebase/firestore';
import type { UserRole } from './users';

// Re-export UserRole for convenience
export type { UserRole };

export interface UserLocation {
  city?: string;
  region?: string;
  country?: string;
  lastUpdated?: string; // ISO string for Redux serialization
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
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
  isActive: boolean;
  role: UserRole;
  points?: number;
  level?: number;
  totalPointsEarned?: number;
  location?: UserLocation;
  birthDate?: string; // ISO string for Redux serialization
  preferences?: UserPreferences;
  completedQuests?: string[];
  questProgress?: Record<string, number>;
}
