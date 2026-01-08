import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  linkWithPopup,
  UserCredential,
  AuthError,
  fetchSignInMethodsForEmail,
  OAuthProvider
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import authApiClient from './api-client';

/**
 * Sign in with Google OAuth provider
 * 
 * Google OAuth returns:
 * - user.uid: Firebase UID (unique)
 * - user.email: Email (always provided, verified)
 * - user.displayName: Full name ("Jean Dupont")
 * - user.photoURL: Profile photo URL (high quality)
 * - user.emailVerified: true (always verified by Google)
 */
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Request additional scopes for profile info
    provider.addScope('profile');
    provider.addScope('email');
    
    // Check if user is already signed in - if so, link the account instead
    const currentUser = auth.currentUser;
    let result: UserCredential;
    
    if (currentUser) {
      // User already signed in - link Google account to existing account
      result = await linkWithPopup(currentUser, provider);
    } else {
      // User not signed in - normal sign in
      result = await signInWithPopup(auth, provider);
    }
    
    await handleOAuthSignIn(result);
    
    return { user: result.user, error: null };
  } catch (error) {
    return handleOAuthError(error);
  }
};

/**
 * Sign in with Facebook OAuth provider
 * 
 * Facebook OAuth returns:
 * - user.uid: Firebase UID (unique)
 * - user.email: Email (should be provided with 'email' scope)
 * - user.displayName: Full name ("Jean Dupont")
 * - user.photoURL: Profile photo URL (standard quality)
 * - user.emailVerified: true (if email is provided)
 */
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    // Request additional scopes for profile info
    provider.addScope('email');
    provider.addScope('public_profile');
    
    // Check if user is already signed in - if so, link the account instead
    const currentUser = auth.currentUser;
    let result: UserCredential;
    
    if (currentUser) {
      // User already signed in - link Facebook account to existing account
      result = await linkWithPopup(currentUser, provider);
    } else {
      // User not signed in - normal sign in
      result = await signInWithPopup(auth, provider);
    }
    
    await handleOAuthSignIn(result);
    
    return { user: result.user, error: null };
  } catch (error) {
    return handleOAuthError(error);
  }
};

/**
 * Handle OAuth sign-in success - auto-merge accounts based on email
 * 
 * Mapping OAuth user data to UserProfile:
 * - uid: Firebase Auth UID
 * - email: User email (required)
 * - displayName: Full name from OAuth provider
 * - photoURL: Profile picture URL from OAuth provider
 * - role: Default 'both' for OAuth users
 * - points/level: Initial gamification values
 * - isActive: true by default
 * - location/birthDate/preferences: Not provided by OAuth (user can set later)
 */
const handleOAuthSignIn = async (result: UserCredential) => {
  const user = result.user;
  const userEmail = user.email;
  
  // Email is required - OAuth providers should always provide it
  if (!userEmail) {
    throw new Error('No email provided by OAuth provider');
  }
  
  try {
    // Step 1: Check if a profile already exists with this email (from any provider)
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', userEmail));
    const existingUsers = await getDocs(emailQuery);
    
    if (!existingUsers.empty) {
      // Found existing profile with same email - AUTO-MERGE
      const existingDoc = existingUsers.docs[0];
      const existingData = existingDoc.data();
      const existingProfileRef = doc(db, 'users', existingDoc.id);
      
      console.log('Auto-merging account:', {
        existingUID: existingDoc.id,
        newUID: user.uid,
        email: userEmail,
        provider: result.providerId
      });
      
      // Update existing profile with OAuth data (only if OAuth data is better/newer)
      await updateDoc(existingProfileRef, {
        // Update displayName only if OAuth provides one and existing is empty/default
        displayName: user.displayName || existingData.displayName || 'User',
        // Update photoURL only if OAuth provides one and existing is empty
        photoURL: user.photoURL || existingData.photoURL || '',
        updatedAt: new Date(),
        // Store secondary provider UID for reference (for multi-provider support)
        secondaryProviderUIDs: [
          ...(existingData.secondaryProviderUIDs || []),
          user.uid
        ].filter((uid, index, self) => self.indexOf(uid) === index), // Remove duplicates
      });
      
      // Create an alias document for the new UID pointing to the main profile
      const newUserRef = doc(db, 'users', user.uid);
      const newUserSnapshot = await getDoc(newUserRef);
      
      if (!newUserSnapshot.exists()) {
        await setDoc(newUserRef, {
          isAlias: true,
          mainProfileUID: existingDoc.id,
          email: userEmail,
          createdAt: new Date(),
        });
      }
      
    } else {
      // No existing profile - create new one
      const userRef = doc(db, 'users', user.uid);
      const docSnapshot = await getDoc(userRef);
      
      if (docSnapshot.exists()) {
        // Profile already exists for this UID - just update with fresh OAuth data
        await updateDoc(userRef, {
          displayName: user.displayName || docSnapshot.data().displayName || 'User',
          photoURL: user.photoURL || docSnapshot.data().photoURL || '',
          email: user.email || docSnapshot.data().email,
          updatedAt: new Date(),
        });
      } else {
        // Create new profile from OAuth data
        const now = new Date();
        const initialPoints = 50; // Same as POINTS.REGISTRATION in backend
        const initialLevel = 1; // Level 1 for 50 points
        
        await setDoc(userRef, {
          // === Required fields ===
          uid: user.uid,                              // Firebase Auth UID
          email: userEmail,                           // User email (validated above)
          isActive: true,                             // Active by default
          role: 'both',                               // Default: can send and receive
          
          // === OAuth provided fields ===
          displayName: user.displayName || 'User',    // Full name from Google/Facebook
          photoURL: user.photoURL || '',              // Profile picture URL
          
          // === Timestamps ===
          createdAt: now,
          updatedAt: now,
          
          // === Gamification ===
          points: initialPoints,                      // Initial points for registration
          level: initialLevel,                        // Starting level
          totalPointsEarned: initialPoints,
          
          // === Multi-provider support ===
          secondaryProviderUIDs: [],                  // For tracking linked providers
          
          // === Optional fields (not provided by OAuth) ===
          // location: undefined,                     // User can set later
          // birthDate: undefined,                    // User can set later
          // preferences: undefined,                  // User can set later
        });
      }
    }
    
    // Set auth token for API client
    const token = await user.getIdToken();
    authApiClient.setAuthToken(token);
    
  } catch (error) {
    console.error('Error handling OAuth sign-in:', error);
    throw error;
  }
};

/**
 * Handle OAuth errors and return user-friendly error messages
 */
const handleOAuthError = (error: unknown): { user: null; error: string } => {
  if (!error || typeof error !== 'object') {
    return { user: null, error: 'auth/unknown-error' };
  }
  
  const authError = error as AuthError;
  const errorCode = authError.code;
  
  // Map Firebase Auth error codes to our error keys
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return { user: null, error: 'auth/popup-closed' };
    case 'auth/cancelled-popup-request':
      return { user: null, error: 'auth/popup-closed' };
    case 'auth/popup-blocked':
      return { user: null, error: 'auth/popup-blocked' };
    case 'auth/account-exists-with-different-credential':
      // This should not happen anymore with auto-merge, but keep for safety
      return { user: null, error: 'auth/account-exists-different-credential' };
    case 'auth/user-disabled':
      return { user: null, error: 'auth/user-disabled' };
    case 'auth/operation-not-allowed':
      return { user: null, error: 'auth/operation-not-allowed' };
    case 'auth/unauthorized-domain':
      return { user: null, error: 'auth/unauthorized-domain' };
    default:
      return { user: null, error: errorCode || 'auth/unknown-error' };
  }
};

