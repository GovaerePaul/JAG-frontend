import { Timestamp } from 'firebase/firestore';
import type { UserRole } from './users';

// Re-export UserRole for convenience
export type { UserRole };

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
