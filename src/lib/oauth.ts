import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithCredential,
  AuthError
} from 'firebase/auth';
import { auth } from './firebase';

const isCapacitor = typeof window !== 'undefined' && (window as { Capacitor?: unknown }).Capacitor !== undefined;

export const signInWithGoogle = async () => {
  try {
    if (isCapacitor) {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      if (!idToken) {
        return { user: null, error: 'auth/no-id-token' };
      }
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return { user: userCredential.user, error: null };
    } else {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      return { user: result.user, error: null };
    }
  } catch (error) {
    return handleOAuthError(error);
  }
};

export const signInWithApple = async () => {
  try {
    if (isCapacitor) {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      const result = await FirebaseAuthentication.signInWithApple();
      const idToken = result.credential?.idToken;
      const nonce = result.credential?.nonce;
      if (!idToken) {
        return { user: null, error: 'auth/no-id-token' };
      }
      const appleProvider = new OAuthProvider('apple.com');
      const credential = appleProvider.credential({ idToken, rawNonce: nonce });
      const userCredential = await signInWithCredential(auth, credential);
      return { user: userCredential.user, error: null };
    } else {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const result = await signInWithPopup(auth, provider);
      return { user: result.user, error: null };
    }
  } catch (error) {
    return handleOAuthError(error);
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
