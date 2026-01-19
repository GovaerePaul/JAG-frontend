import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const userDisplayNamesCache: Record<string, {
  displayName: string;
  timestamp: number;
}> = {};

const USER_NAMES_CACHE_DURATION = 300000;

export async function getCachedUserDisplayName(userId: string): Promise<string> {
  const now = Date.now();
  const cached = userDisplayNamesCache[userId];
  
  if (cached && (now - cached.timestamp) < USER_NAMES_CACHE_DURATION) {
    return cached.displayName;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const displayName = userData.displayName || userData.email || userId;
      
      userDisplayNamesCache[userId] = {
        displayName,
        timestamp: Date.now(),
      };
      
      return displayName;
    }
  } catch (_err) {}
  
  userDisplayNamesCache[userId] = {
    displayName: userId,
    timestamp: Date.now(),
  };
  
  return userId;
}

export async function getCachedUserDisplayNames(userIds: string[]): Promise<Record<string, string>> {
  const uniqueUserIds = [...new Set(userIds)];
  const namesMap: Record<string, string> = {};
  const now = Date.now();

  const userIdsToFetch: string[] = [];
  
  uniqueUserIds.forEach((userId) => {
    const cached = userDisplayNamesCache[userId];
    if (cached && (now - cached.timestamp) < USER_NAMES_CACHE_DURATION) {
      namesMap[userId] = cached.displayName;
    } else {
      userIdsToFetch.push(userId);
    }
  });

  if (userIdsToFetch.length > 0) {
    await Promise.all(
      userIdsToFetch.map(async (userId) => {
        namesMap[userId] = await getCachedUserDisplayName(userId);
      })
    );
  }

  return namesMap;
}

export function invalidateUserDisplayNameCache(userId?: string) {
  if (userId) {
    delete userDisplayNamesCache[userId];
  } else {
    Object.keys(userDisplayNamesCache).forEach((key) => {
      delete userDisplayNamesCache[key];
    });
  }
}

