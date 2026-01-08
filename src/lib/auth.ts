import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import authApiClient from './api-client';

export type UserRole = 'sender' | 'receiver' | 'both';

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
}

export const signUp = async ({ email, password, displayName, role }: SignUpData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    const userRef = doc(db, 'users', user.uid);
    
    // Wait for the trigger to create the user profile in Firestore
    // Poll until the document exists (max 10 attempts, 500ms between each)
    let attempts = 0;
    let docExists = false;
    
    while (!docExists && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        docExists = true;
        // Update only the role and displayName (trigger already set points, level, etc.)
        await updateDoc(userRef, {
          displayName,
          role,
          updatedAt: new Date(),
        });
        break;
      }
      attempts++;
    }

    // If document still doesn't exist after waiting (e.g., in emulator or trigger failed),
    // create it manually with all required fields including points and level
    if (!docExists) {
      const now = new Date();
      const initialPoints = 50; // Same as POINTS.REGISTRATION in backend
      const initialLevel = 1; // Level 1 for 50 points
      
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName,
        photoURL: user.photoURL || '',
        createdAt: now,
        updatedAt: now,
        isActive: true,
        role,
        points: initialPoints,
        level: initialLevel,
        totalPointsEarned: initialPoints,
      }, { merge: true }); // merge: true ensures we don't overwrite if trigger created it meanwhile
    }

    return { user, error: null };
  } catch (error: unknown) {
    return { user: null, error: error instanceof Error ? error.message : 'Authentication failed' };
  }
};

export const signIn = async ({ email, password }: SignInData) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const token = await userCredential.user.getIdToken();
    authApiClient.setAuthToken(token);
    
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    return { user: null, error: error instanceof Error ? error.message : 'Authentication failed' };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    authApiClient.clearAuthToken();
    return { error: null };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Logout failed' };
  }
};

export const getUserProfileFromBackend = async () => {
  const result = await authApiClient.getUserProfile();
  if (result.success) {
    return { profile: result.data, error: null };
  }
  return { profile: null, error: result.error };
};

export const updateUserProfileOnBackend = async (data: { displayName?: string; photoURL?: string }) => {
  const result = await authApiClient.updateUserProfile(data);
  return { success: result.success, error: result.error };
};

export const deleteUserAccountOnBackend = async () => {
  const result = await authApiClient.deleteUserAccount();
  return { success: result.success, error: result.error };
};

/**
 * Map Firebase error codes to translation keys
 * Returns a translation key that should be used with t() from useTranslations
 */
export const getFirebaseErrorKey = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'auth.errors.emailAlreadyInUse';
    case 'auth/weak-password':
      return 'auth.errors.weakPassword';
    case 'auth/invalid-email':
      return 'auth.errors.invalidEmail';
    case 'auth/user-not-found':
      return 'auth.errors.userNotFound';
    case 'auth/wrong-password':
      return 'auth.errors.wrongPassword';
    case 'auth/invalid-credential':
      return 'auth.errors.invalidCredential';
    case 'auth/too-many-requests':
      return 'auth.errors.tooManyRequests';
    // OAuth specific errors
    case 'auth/popup-closed':
      return 'auth.oauth.errors.popupClosed';
    case 'auth/popup-blocked':
      return 'auth.oauth.errors.popupBlocked';
    case 'auth/account-exists-different-credential':
      return 'auth.oauth.errors.accountExistsDifferent';
    case 'auth/user-disabled':
      return 'auth.oauth.errors.userDisabled';
    case 'auth/operation-not-allowed':
      return 'auth.oauth.errors.operationNotAllowed';
    case 'auth/unauthorized-domain':
      return 'auth.oauth.errors.unauthorizedDomain';
    default:
      return 'auth.errors.unknown';
  }
};
