import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  const userEmail = user.providerData[0]?.email || user.email;
  
  if (!userEmail) {
    console.error('❌ No email found in UserCredential');
    throw new Error('No email provided by OAuth provider');
  }
  
  console.log('✅ OAuth sign-in with email:', userEmail);
  
  try {
    // IMPORTANT: Backend might have created document with empty email (if not deployed yet)
    // So we need to update BOTH: the document with this email AND the document with user.uid
    
    // Step 1: Check if backend created a document for this UID (might have empty email)
    const currentUserRef = doc(db, 'users', user.uid);
    const currentUserDoc = await getDoc(currentUserRef);
    
    // Step 2: Check if a document already exists with this email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const snapshot = await getDocs(q);
    
    if (currentUserDoc.exists()) {
      // Backend already created a document for this UID
      const currentData = currentUserDoc.data();
      
      if (!currentData.email || currentData.email === '') {
        // Document has empty email → update it with correct email
        console.log('📝 Updating current UID document with correct email:', user.uid);
        await updateDoc(currentUserRef, {
          email: userEmail,
          displayName: user.displayName || currentData.displayName || 'User',
          photoURL: user.photoURL || currentData.photoURL || '',
          updatedAt: new Date(),
        });
      } else {
        // Document already has correct email → just update other fields
        console.log('📝 Updating current UID document:', user.uid);
        await updateDoc(currentUserRef, {
          displayName: user.displayName || currentData.displayName || 'User',
          photoURL: user.photoURL || currentData.photoURL || '',
          updatedAt: new Date(),
        });
      }
      
      // If there's ALSO another document with this email (different UID), update it too
      if (!snapshot.empty && snapshot.docs[0].id !== user.uid) {
        const oldDocRef = doc(db, 'users', snapshot.docs[0].id);
        const oldData = snapshot.docs[0].data();
        console.log('📝 Also updating old document with same email:', snapshot.docs[0].id);
        await updateDoc(oldDocRef, {
          displayName: user.displayName || oldData.displayName || 'User',
          photoURL: user.photoURL || oldData.photoURL || '',
          updatedAt: new Date(),
        });
      }
    } else if (!snapshot.empty) {
      // No document for current UID, but one exists with this email → update it
      const docRef = doc(db, 'users', snapshot.docs[0].id);
      const existingData = snapshot.docs[0].data();
      
      console.log('📝 Updating existing document:', snapshot.docs[0].id);
      
      await updateDoc(docRef, {
        displayName: user.displayName || existingData.displayName || 'User',
        photoURL: user.photoURL || existingData.photoURL || '',
        updatedAt: new Date(),
      });
    } else {
      // No document found - backend trigger will create it
      console.log('⏳ Waiting for backend to create document:', user.uid);
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
