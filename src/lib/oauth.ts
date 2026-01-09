import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  UserCredential,
  AuthError,
  reload
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
    
    // Check if user is already signed in
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      // User already signed in - update Firestore to track Google as available
      await updateFirestoreForExistingUser(currentUser.email || '', 'google');
      return { user: currentUser, error: null };
    }
    
    // User not signed in - normal sign in
    // This will create a new Firebase Auth account if needed, but Firestore will merge by email
    const result = await signInWithPopup(auth, provider);
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
    
    // Check if user is already signed in
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      // User already signed in - update Firestore to track Facebook as available
      await updateFirestoreForExistingUser(currentUser.email || '', 'facebook');
      return { user: currentUser, error: null };
    }
    
    // User not signed in - normal sign in
    // This will create a new Firebase Auth account if needed, but Firestore will merge by email
    const result = await signInWithPopup(auth, provider);
    
    // Handle OAuth sign-in (Firestore operations)
    // Wrap in try-catch to prevent infinite loops if there's an error
    try {
      await handleOAuthSignIn(result);
    } catch (handleError) {
      // If handleOAuthSignIn fails, still return the user but log the error
      // This prevents infinite loops if there's an error in Firestore operations
      console.error('Error in handleOAuthSignIn (non-blocking):', handleError);
      // Don't throw - return user anyway so they can still sign in
      // The error will be logged but won't block the sign-in
    }
    
    return { user: result.user, error: null };
  } catch (error) {
    return handleOAuthError(error);
  }
};

/**
 * Update Firestore to track that a provider is available for an existing user
 * This is called when a user is already signed in and clicks on an OAuth provider button
 */
const updateFirestoreForExistingUser = async (userEmail: string, provider: 'google' | 'facebook') => {
  if (!userEmail) return;
  
  try {
    // Find existing profile by email
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', userEmail));
    const existingUsers = await getDocs(emailQuery);
    
    if (!existingUsers.empty) {
      // Found existing profile - update it to track the provider
      const existingDoc = existingUsers.docs[0];
      const existingProfileRef = doc(db, 'users', existingDoc.id);
      const existingData = existingDoc.data();
      
      const availableProviders = existingData.availableProviders || [];
      if (!availableProviders.includes(provider)) {
        await updateDoc(existingProfileRef, {
          availableProviders: [...availableProviders, provider],
          updatedAt: new Date(),
        });
        console.log(`Tracked ${provider} as available provider for user ${userEmail}`);
      }
    }
  } catch (error) {
    console.error('Error updating Firestore for existing user:', error);
    // Don't throw - this is not critical
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
  let userEmail = user.email;
  
  // For Facebook, email might not be immediately available in user.email
  // Try multiple methods to get it
  if (!userEmail && result.providerId === 'facebook.com') {
    // Method 1: Reload user to get updated data
    try {
      await reload(user);
      userEmail = user.email;
      console.log('✅ Email after reload:', userEmail);
    } catch (reloadError) {
      console.warn('Could not reload user:', reloadError);
    }
    
    // Method 2: Try to get from providerData
    if (!userEmail && user.providerData && user.providerData.length > 0) {
      const facebookProvider = user.providerData.find(p => p.providerId === 'facebook.com');
      if (facebookProvider?.email) {
        userEmail = facebookProvider.email;
        console.log('✅ Email found in providerData:', userEmail);
      }
    }
    
    // Method 3: Fetch from Facebook Graph API using access token
    if (!userEmail) {
      const credential = FacebookAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        try {
          const response = await fetch(
            `https://graph.facebook.com/me?fields=email&access_token=${credential.accessToken}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.email) {
              userEmail = data.email;
              console.log('✅ Email from Facebook Graph API:', userEmail);
            } else {
              console.warn('⚠️ Facebook Graph API response:', data);
            }
          } else {
            const errorData = await response.json();
            console.error('❌ Facebook Graph API error:', errorData);
          }
        } catch (error) {
          console.error('❌ Error calling Facebook Graph API:', error);
        }
      }
    }
  }
  
  // Email is required
  if (!userEmail) {
    console.error('❌ No email found. User data:', {
      'user.email': user.email,
      'providerId': result.providerId,
      'providerData': user.providerData?.map(p => ({ providerId: p.providerId, email: p.email }))
    });
    throw new Error('No email provided by OAuth provider. Please ensure your Facebook account has a verified email address.');
  }
  
  console.log('✅ Using email for OAuth sign-in:', userEmail);
  
  try {
    // Check if a profile already exists with this email (from any provider)
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', userEmail));
    const existingUsers = await getDocs(emailQuery);
    
    // Also check if profile exists for current UID (might have been created by trigger)
    const currentUserRef = doc(db, 'users', user.uid);
    const currentUserSnapshot = await getDoc(currentUserRef);
    
    if (!existingUsers.empty) {
      // Found existing profile with same email - AUTO-MERGE
      const existingDoc = existingUsers.docs[0];
      const existingData = existingDoc.data();
      const existingProfileRef = doc(db, 'users', existingDoc.id);
      
      // If the existing profile is the same as current UID, just update it
      if (existingDoc.id === user.uid) {
        console.log('Updating existing profile for current UID');
        const providerName = result.providerId === 'google.com' ? 'google' : 'facebook';
        const availableProviders = existingData.availableProviders || [];
        const updatedProviders = availableProviders.includes(providerName)
          ? availableProviders
          : [...availableProviders, providerName];
        
        await updateDoc(existingProfileRef, {
          displayName: user.displayName || existingData.displayName || 'User',
          photoURL: user.photoURL || existingData.photoURL || '',
          email: userEmail, // Ensure email is set
          availableProviders: updatedProviders,
          updatedAt: new Date(),
        });
      } else {
        // Different UID - merge into existing profile
        console.log('Auto-merging account:', {
          existingUID: existingDoc.id,
          newUID: user.uid,
          email: userEmail,
          provider: result.providerId
        });
        
        // Determine provider name from providerId
        const providerName = result.providerId === 'google.com' ? 'google' : 'facebook';
        const availableProviders = existingData.availableProviders || [];
        const updatedProviders = availableProviders.includes(providerName)
          ? availableProviders
          : [...availableProviders, providerName];
        
        // Update existing profile with OAuth data (only non-critical fields)
        await updateDoc(existingProfileRef, {
          // Update displayName only if OAuth provides one and existing is empty/default
          displayName: user.displayName || existingData.displayName || 'User',
          // Update photoURL only if OAuth provides one and existing is empty
          photoURL: user.photoURL || existingData.photoURL || '',
          // Track available providers
          availableProviders: updatedProviders,
          updatedAt: new Date(),
        });
        
        // Also update/create profile for current UID to avoid Firestore errors
        if (!currentUserSnapshot.exists()) {
          await setDoc(currentUserRef, {
            uid: user.uid,
            email: userEmail,
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            role: 'both',
            points: 50,
            level: 1,
            totalPointsEarned: 50,
            availableProviders: [providerName],
          });
        }
      }
      
    } else if (currentUserSnapshot.exists()) {
      // No existing profile - create new one with current UID
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
        
        // Determine provider name
        const providerName = result.providerId === 'google.com' ? 'google' : 'facebook';
        
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
          availableProviders: [providerName],
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

