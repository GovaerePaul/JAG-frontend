import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import authApiClient from './api-client';

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
 * Backend trigger creates or updates Firestore document based on email
 */
const handleOAuthSignIn = async (result: UserCredential) => {
  const user = result.user;
  
  try {
    // Backend trigger creates or updates document based on email
    // Wait a bit for backend trigger to complete (it's async)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify document exists by email (since document ID might be different UID)
    // Get email from user.email or providerData
    let userEmail = user.email || '';
    
    // If email is not in user.email, try to get it from providerData
    if (!userEmail && user.providerData && user.providerData.length > 0) {
      // Check all providerData entries for email
      for (const provider of user.providerData) {
        if (provider.email) {
          userEmail = provider.email;
          console.log(`📧 Email found in providerData: ${provider.providerId} -> ${userEmail}`);
          break;
        }
      }
    }
    
    if (!userEmail) {
      console.error('❌ No email available from user or providerData:', {
        uid: user.uid,
        email: user.email,
        providerData: user.providerData,
      });
      throw new Error('User email not available');
    }
    
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', userEmail), limit(1));
    const querySnapshot = await getDocs(emailQuery);
    
    if (querySnapshot.empty) {
      // Fallback: try to find by UID (for backward compatibility)
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error('❌ No document found for email:', user.email, 'or UID:', user.uid);
        throw new Error('User document not found after sign-in');
      }
      
      console.log('✅ User document found by UID (fallback):', user.uid);
    } else {
      const userDoc = querySnapshot.docs[0];
      console.log('✅ User document found by email:', userEmail, '(document ID:', userDoc.id, ')');
    }
    
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
