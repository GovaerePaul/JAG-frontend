import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import authApiClient from './api-client';
import { getUserEmail } from './userUtils';

/**
 * Sign in with Google OAuth provider
 */
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    await handleOAuthSignIn(result);
    
    return { user: result.user, error: null };
  } catch (error) {
    return handleOAuthError(error);
  }
};

/**
 * Sign in with Facebook OAuth provider
 */
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
    
    const result = await signInWithPopup(auth, provider);
    await handleOAuthSignIn(result);
    
    return { user: result.user, error: null };
  } catch (error) {
    return handleOAuthError(error);
  }
};

/**
 * Handle OAuth sign-in success
 * Creates or updates Firestore document based on email
 */
const handleOAuthSignIn = async (result: UserCredential) => {
  const user = result.user;
  
  // Debug: Log all available data
  console.log('🔍 UserCredential result:', {
    'user.uid': user.uid,
    'user.email': user.providerData[0]?.email,
    'user.displayName': user.displayName,
    'user.photoURL': user.photoURL,
    'providerData': user.providerData?.map(p => ({
      providerId: p.providerId,
      email: p.email,
      displayName: p.displayName,
      photoURL: p.photoURL
    }))
  });
  
  // Get email from providerData (Facebook puts it there, not in user.email)
  const userEmail = getUserEmail(user);
  
  if (!userEmail) {
    console.error('❌ No email found in UserCredential');
    throw new Error('No email provided by OAuth provider');
  }
  
  console.log('✅ OAuth sign-in with email:', userEmail);
  
  try {
    // Backend trigger handles document creation/migration:
    // - If no document exists with this email → creates new document with user.uid as ID
    // - If document already exists with this email → migrates to new UID (preserves data)
    
    // Wait a bit for backend trigger to complete (it's async)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Document should now exist with user.uid as ID (after migration if needed)
    // The useAuth hook will automatically pick it up via the onSnapshot listener
    
    // Set auth token for API client
    const token = await user.getIdToken();
    authApiClient.setAuthToken(token);
    
    console.log('✅ OAuth sign-in complete');
  } catch (error) {
    console.error('❌ Error in handleOAuthSignIn:', error);
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
