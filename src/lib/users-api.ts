'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-functions';
import { ApiResponse } from '@/types/common';
import type { UserPreferences } from '@/types/auth';
import type {
  ReceivableUser,
  UserLocation,
  SearchCitiesResponse,
  DiscoverUsersParams,
  DiscoverUsersResponse,
} from '@/types/users';
import { auth } from './firebase';
import { getReceivableUsersDirect } from './firestore-client';

export async function getReceivableUsers(): Promise<ApiResponse<ReceivableUser[]>> {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'User not authenticated' };

    const users = await getReceivableUsersDirect(user.uid);
    return { success: true, data: users as ReceivableUser[] };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get receivable users'
    };
  }
}

export async function discoverUsers(params: DiscoverUsersParams): Promise<ApiResponse<DiscoverUsersResponse>> {
  try {
    const fn = httpsCallable<DiscoverUsersParams, DiscoverUsersResponse>(
      functions,
      'discoverUsersFunction'
    );
    const result = await fn(params);
    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to discover users'
    };
  }
}

export async function searchCities(searchQuery: string, maxResults?: number): Promise<ApiResponse<SearchCitiesResponse>> {
  try {
    const limitCount = maxResults || 10;
    const encodedQuery = encodeURIComponent(searchQuery.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limitCount}&addressdetails=1&featuretype=settlement`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'JustAGift/1.0' },
    });

    if (!response.ok) {
      return { success: false, error: `Nominatim API error: ${response.status}` };
    }

    const data = await response.json();
    const cityTypes = ['city', 'town', 'village', 'municipality'];

    interface NominatimResult {
      type?: string;
      class?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        state?: string;
        region?: string;
        county?: string;
        country?: string;
      };
      display_name?: string;
    }

    const cities = (data as NominatimResult[])
      .filter((item) => {
        const type = item.type || item.class;
        if (type && cityTypes.includes(type.toLowerCase())) return true;
        const address = item.address || {};
        return !!(address.city || address.town || address.village || address.municipality);
      })
      .map((item) => {
        const address = item.address || {};
        const cityName = address.city || address.town || address.village || address.municipality || (item.display_name?.split(',')[0] || '');
        const region = address.state || address.region || address.county;
        const country = address.country;
        const parts = [cityName];
        if (region) parts.push(region);
        if (country) parts.push(country);
        return {
          city: cityName,
          region: region || undefined,
          country: country || undefined,
          displayName: parts.join(', '),
        };
      })
      .filter((item) => item.city && item.city.trim().length > 0)
      .slice(0, limitCount);

    return { success: true, data: { cities } };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search cities',
    };
  }
}

export async function updateUserLocationByCity(city: string): Promise<ApiResponse<UserLocation>> {
  try {
    const fn = httpsCallable<{ city: string }, { success: boolean; location: UserLocation }>(
      functions,
      'updateUserLocationByCityFunction'
    );
    const result = await fn({ city });
    if (result.data.success) {
      return { success: true, data: result.data.location };
    }
    return { success: false, error: 'Failed to update location' };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update location'
    };
  }
}

export async function updateUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const fn = httpsCallable<{ preferences: Partial<UserPreferences> }, { success: boolean; message: string }>(
      functions,
      'updateUserPreferencesFunction'
    );
    const result = await fn({ preferences });
    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user preferences'
    };
  }
}
