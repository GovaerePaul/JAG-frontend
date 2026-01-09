import { User } from 'firebase/auth';

/**
 * Get user email, handling Facebook OAuth case where email is in providerData
 * @param user - Firebase User object
 * @returns User email or null if not available
 */
export function getUserEmail(user: User | null | undefined): string | null {
  if (!user) return null;
  return user.providerData?.[0]?.email || user.email || null;
}
