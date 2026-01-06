import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
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

    await new Promise((resolve) => setTimeout(resolve, 500));

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      displayName,
      role,
      updatedAt: new Date(),
    });

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

export const translateFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/invalid-email':
      return 'Adresse email invalide.';
    case 'auth/user-not-found':
      return 'Aucun compte associé à cette adresse email.';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect.';
    case 'auth/invalid-credential':
      return 'Identifiants invalides.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard.';
    default:
      return 'Une erreur est survenue. Veuillez réessayer.';
  }
};
