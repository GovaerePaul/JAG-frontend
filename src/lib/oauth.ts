import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import authApiClient from './api-client';

const isCapacitor = typeof window !== 'undefined' && (window as { Capacitor?: unknown }).Capacitor !== undefined;

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    if (isCapacitor) {
      await signInWithRedirect(auth, provider);
      return { user: null, error: null };
    } else {
      const result = await signInWithPopup(auth, provider);
      await handleOAuthSignIn(result);
      return { user: result.user, error: null };
    }
  } catch (error) {
    return handleOAuthError(error);
  }
};

export const signInWithApple = async () => {
  try {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    if (isCapacitor) {
      await signInWithRedirect(auth, provider);
      return { user: null, error: null };
    } else {
      const result = await signInWithPopup(auth, provider);
      await handleOAuthSignIn(result);
      return { user: result.user, error: null };
    }
  } catch (error) {
    return handleOAuthError(error);
  }
};

export const checkOAuthRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      await handleOAuthSignIn(result);
      return { user: result.user, error: null };
    }
    return { user: null, error: null };
  } catch (error) {
    return handleOAuthError(error);
  }
};

const handleOAuthSignIn = async (result: UserCredential) => {
  const user = result.user;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!user.email) {
      throw new Error('User email not available');
    }
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found after sign-in');
    }
    
    const token = await user.getIdToken();
    authApiClient.setAuthToken(token);
  } catch (error) {
    console.error('Error in handleOAuthSignIn:', error);
    throw error;
  }
};

const handleOAuthError = (error: unknown): { user: null; error: string } => {
  if (!error || typeof error !== 'object') {
    return { user: null, error: 'auth/unknown-error' };
  }
  
  const authError = error as AuthError;
  const errorCode = authError.code;
  
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
