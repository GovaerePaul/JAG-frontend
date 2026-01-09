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
    // IMPORTANT: Backend trigger creates document asynchronously
    // We need to wait for it to be created before checking/updating
    
    const currentUserRef = doc(db, 'users', user.uid);
    let currentUserDoc;
    let retries = 0;
    const maxRetries = 10; // Wait up to 5 seconds (10 * 500ms)
    
    // Wait for backend to create the document
    while (retries < maxRetries) {
      currentUserDoc = await getDoc(currentUserRef);
      if (currentUserDoc.exists()) {
        console.log('✅ Backend created document, found after', retries * 500, 'ms');
        break;
      }
      console.log('⏳ Waiting for backend to create document... (attempt', retries + 1, ')');
      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    }
    
    if (!currentUserDoc || !currentUserDoc.exists()) {
      console.error('❌ Backend did not create document after 5 seconds');
      throw new Error('Document creation timeout');
    }
    
    // Step 2: Check if a document already exists with this email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const snapshot = await getDocs(q);
    
    if (currentUserDoc.exists()) {
      // Backend already created a document for this UID
      const currentData = currentUserDoc.data();
      
      if (!currentData.email || currentData.email === '') {
        // Document has empty email → update ONLY the email (don't overwrite user's profile changes)
        console.log('📝 Updating email only for document:', user.uid);
        await updateDoc(currentUserRef, {
          email: userEmail,
          updatedAt: new Date(),
        });
      } else {
        // Document already complete → don't update anything (user may have customized their profile)
        console.log('✅ Document already complete, no update needed:', user.uid);
      }
      
      // If there's ALSO another document with this email (different UID), don't touch it either
      if (!snapshot.empty && snapshot.docs[0].id !== user.uid) {
        console.log('⚠️ Found another document with same email (not updating it):', snapshot.docs[0].id);
      }
    } else if (!snapshot.empty) {
      // No document for current UID, but one exists with this email
      // This means user is signing in with a different provider for the same email
      // Don't update anything - the existing profile should be preserved
      console.log('✅ Existing document found with this email (preserving user data):', snapshot.docs[0].id);
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
