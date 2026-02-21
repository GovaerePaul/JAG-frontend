'use client';

import axios from 'axios';
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

interface GooglePlacePrediction {
  placeId: string;
  text?: { text: string };
  structuredFormat?: {
    mainText?: { text: string };
    secondaryText?: { text: string };
  };
}

interface GoogleAddressComponent {
  longText: string;
  types: string[];
}

export async function searchCities(searchQuery: string, maxResults?: number): Promise<ApiResponse<SearchCitiesResponse>> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Google Maps API key not configured' };
    }

    const limitCount = maxResults || 10;
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:autocomplete',
      { input: searchQuery.trim(), includedPrimaryTypes: ['locality', 'sublocality'] },
      { headers: { 'X-Goog-Api-Key': apiKey } }
    );

    const data = response.data;
    const suggestions: { placePrediction: GooglePlacePrediction }[] = data.suggestions || [];

    const cities = suggestions
      .slice(0, limitCount)
      .map((s) => {
        const pred = s.placePrediction;
        const mainText = pred.structuredFormat?.mainText?.text || pred.text?.text?.split(',')[0] || '';
        const secondaryText = pred.structuredFormat?.secondaryText?.text || '';
        const parts = secondaryText.split(',').map((p) => p.trim()).filter(Boolean);
        const region = parts.length > 1 ? parts[0] : undefined;
        const country = parts.length > 0 ? parts[parts.length - 1] : undefined;
        const displayParts = [mainText];
        if (region) displayParts.push(region);
        if (country && country !== region) displayParts.push(country);
        return {
          placeId: pred.placeId,
          city: mainText,
          region,
          country,
          displayName: displayParts.join(', '),
        };
      })
      .filter((c) => c.city.trim().length > 0);

    return { success: true, data: { cities } };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search cities',
    };
  }
}

export async function getCityDetails(placeId: string): Promise<ApiResponse<{
  city: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
}>> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Google Maps API key not configured' };
    }

    const response = await axios.get(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,addressComponents,location',
      },
    });

    const data = response.data;
    const location = data.location as { latitude?: number; longitude?: number } | undefined;
    if (!location?.latitude || !location?.longitude) {
      return { success: false, error: 'No coordinates found for this place' };
    }

    const components: GoogleAddressComponent[] = data.addressComponents || [];
    const city =
      components.find((c) => c.types.includes('locality') || c.types.includes('sublocality'))?.longText ||
      (data.displayName as { text?: string } | undefined)?.text ||
      '';
    const region = components.find((c) => c.types.includes('administrative_area_level_1'))?.longText;
    const country = components.find((c) => c.types.includes('country'))?.longText;

    return {
      success: true,
      data: {
        city,
        region,
        country,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get city details',
    };
  }
}

export async function updateUserLocationByCity(
  city: string,
  region?: string,
  country?: string,
  latitude?: number,
  longitude?: number,
): Promise<ApiResponse<UserLocation>> {
  try {
    const fn = httpsCallable<
      { city: string; region?: string; country?: string; latitude?: number; longitude?: number },
      { success: boolean; location: UserLocation }
    >(functions, 'updateUserLocationByCityFunction');
    const result = await fn({ city, region, country, latitude, longitude });
    if (result.data.success) {
      return { success: true, data: result.data.location };
    }
    return { success: false, error: 'Failed to update location' };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update location',
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
