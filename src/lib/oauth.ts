import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
 * Creates or updates Firestore document based on email
 */
const handleOAuthSignIn = async (result: UserCredential) => {
  const user = result.user;
  
  // Get email from providerData (Facebook puts it there, not in user.email)
  const userEmail = user.providerData[0]?.email || user.email;
  
  if (!userEmail) {
    throw new Error('No email provided by OAuth provider');
  }
  
  console.log('✅ OAuth sign-in with email:', userEmail);
  
  try {
    // Check if document already exists with this email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Document exists → update it
      const docRef = doc(db, 'users', snapshot.docs[0].id);
      const existingData = snapshot.docs[0].data();
      
      console.log('📝 Updating existing document:', snapshot.docs[0].id);
      
      await updateDoc(docRef, {
        displayName: user.displayName || existingData.displayName || 'User',
        photoURL: user.photoURL || existingData.photoURL || '',
        updatedAt: new Date(),
      });
    } else {
      // Document doesn't exist → create it
      const docRef = doc(db, 'users', user.uid);
      
      console.log('✨ Creating new document:', user.uid);
      
      await setDoc(docRef, {
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
      });
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
