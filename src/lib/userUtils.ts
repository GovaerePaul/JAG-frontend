import { User } from 'firebase/auth';

/**
 * Get user email
 * @param user - Firebase User object
 * @returns User email or null if not available
 */
export function getUserEmail(user: User | null | undefined): string | null {
  if (!user) return null;
  return user.email || null;
}
