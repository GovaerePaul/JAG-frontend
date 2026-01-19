export type UserRole = 'sender' | 'receiver' | 'both';

export interface ReceivableUser {
  uid: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserLocation {
  city?: string;
  region?: string;
  country?: string;
}

export interface CitySuggestion {
  city: string;
  region?: string;
  country?: string;
  displayName: string;
}

export interface SearchCitiesResponse {
  cities: CitySuggestion[];
}

export interface DiscoverUsersFilters {
  minAge?: number;
  maxAge?: number;
  eventTypeId?: string;
  maxDistance?: number;
  preferredEventTypeIds?: string[];
}

export interface DiscoverUsersParams {
  userLocation?: {
    city: string;
    coordinates: Coordinates;
  };
  filters?: DiscoverUsersFilters;
  limit?: number;
  offset?: number;
}

export interface DiscoveredUser {
  user: {
    uid: string;
    displayName?: string;
    photoURL?: string;
    role: string;
  };
  distance?: number;
  favoriteEventTypeIds?: string[];
}

export interface DiscoverUsersResponse {
  users: DiscoveredUser[];
  total: number;
  hasMore: boolean;
}
