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

export async function searchCities(query: string, limit?: number): Promise<ApiResponse<SearchCitiesResponse>> {
  try {
    const fn = httpsCallable<{ query: string; limit?: number }, SearchCitiesResponse>(
      functions,
      'searchCitiesFunction'
    );
    const result = await fn({ query, limit });
    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search cities'
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
