import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './firebase';
import authApiClient from './api-client';

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const signUp = async ({ email, password, displayName }: SignUpData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: displayName
    });

    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signIn = async ({ email, password }: SignInData) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const token = await userCredential.user.getIdToken();
    authApiClient.setAuthToken(token);
    
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    authApiClient.clearAuthToken();
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
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
