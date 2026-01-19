import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Global cache for user display names
const userDisplayNamesCache: Record<string, {
  displayName: string;
  timestamp: number;
}> = {};

const USER_NAMES_CACHE_DURATION = 300000; // 5 minutes

/**
 * Get user display name with caching to avoid repeated Firestore reads
 * @param userId User ID to fetch name for
 * @returns Display name or userId if not found
 */
export async function getCachedUserDisplayName(userId: string): Promise<string> {
  const now = Date.now();
  const cached = userDisplayNamesCache[userId];
  
  // Return cached value if still valid
  if (cached && (now - cached.timestamp) < USER_NAMES_CACHE_DURATION) {
    return cached.displayName;
  }

  // Fetch from Firestore
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const displayName = userData.displayName || userData.email || userId;
      
      // Cache the result
      userDisplayNamesCache[userId] = {
        displayName,
        timestamp: Date.now(),
      };
      
      return displayName;
    }
  } catch (_err) {
    // Silent fail
  }
  
  // Cache the fallback value to avoid repeated failures
  userDisplayNamesCache[userId] = {
    displayName: userId,
    timestamp: Date.now(),
  };
  
  return userId;
}

/**
 * Get multiple user display names with caching
 * @param userIds Array of user IDs to fetch names for
 * @returns Map of userId to displayName
 */
export async function getCachedUserDisplayNames(userIds: string[]): Promise<Record<string, string>> {
  const uniqueUserIds = [...new Set(userIds)];
  const namesMap: Record<string, string> = {};
  const now = Date.now();

  // Separate cached and non-cached user IDs
  const userIdsToFetch: string[] = [];
  
  uniqueUserIds.forEach((userId) => {
    const cached = userDisplayNamesCache[userId];
    if (cached && (now - cached.timestamp) < USER_NAMES_CACHE_DURATION) {
      namesMap[userId] = cached.displayName;
    } else {
      userIdsToFetch.push(userId);
    }
  });

  // Fetch only non-cached user names
  if (userIdsToFetch.length > 0) {
    await Promise.all(
      userIdsToFetch.map(async (userId) => {
        namesMap[userId] = await getCachedUserDisplayName(userId);
      })
    );
  }

  return namesMap;
}

/**
 * Invalidate cache for a specific user or all users
 * @param userId Optional user ID to invalidate, or undefined to clear all
 */
export function invalidateUserDisplayNameCache(userId?: string) {
  if (userId) {
    delete userDisplayNamesCache[userId];
  } else {
    Object.keys(userDisplayNamesCache).forEach((key) => {
      delete userDisplayNamesCache[key];
    });
  }
}

