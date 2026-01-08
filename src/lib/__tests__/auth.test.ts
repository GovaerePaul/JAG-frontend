import { signUp, signIn, logout, getFirebaseErrorKey, getUserProfileFromBackend, updateUserProfileOnBackend, deleteUserAccountOnBackend } from '../auth'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth'
import { getDoc, setDoc, updateDoc } from 'firebase/firestore'
import authApiClient from '../api-client'

// Mock Firebase functions
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}))

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

// Mock Firebase auth
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  },
  db: {}, // Mock Firestore
}))

// Mock authApiClient
jest.mock('../api-client', () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  deleteUserAccount: jest.fn(),
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}))

const mockAuthApiClient = authApiClient as jest.Mocked<typeof authApiClient>


const mockCreateUser = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>
const mockSignInUser = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>

describe('Auth Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signUp', () => {
    it('should successfully create user account', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
        getIdToken: jest.fn().mockResolvedValue('mock-token')
      }
      const mockUserCredential = { user: mockUser }

      mockCreateUser.mockResolvedValue(mockUserCredential as unknown)
      mockUpdateProfile.mockResolvedValue(undefined)
      
      // Mock getDoc to return exists: true immediately (to avoid polling)
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ uid: 'test-uid', email: 'test@example.com' })
      } as any)
      mockUpdateDoc.mockResolvedValue(undefined)

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        role: 'both'
      })

      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      )
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Test User'
      })
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    }, 10000)

    it('should handle signup errors', async () => {
      const error = new Error('Email already in use')
      mockCreateUser.mockRejectedValue(error)

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      })

      expect(result.user).toBeNull()
      expect(result.error).toBe('Email already in use')
    })

    it('should handle unknown errors', async () => {
      mockCreateUser.mockRejectedValue('Unknown error')

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      })

      expect(result.user).toBeNull()
      expect(result.error).toBe('Authentication failed')
    })
  })

  describe('signIn', () => {
    it('should successfully sign in user', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        getIdToken: jest.fn().mockResolvedValue('mock-token')
      }
      const mockUserCredential = { user: mockUser }

      mockSignInUser.mockResolvedValue(mockUserCredential as unknown)

      const result = await signIn({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(mockSignInUser).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      )
      expect(mockUser.getIdToken).toHaveBeenCalled()
      expect(authApiClient.setAuthToken).toHaveBeenCalledWith('mock-token')
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('should handle signin errors', async () => {
      const error = new Error('Invalid credentials')
      mockSignInUser.mockRejectedValue(error)

      const result = await signIn({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      expect(result.user).toBeNull()
      expect(result.error).toBe('Invalid credentials')
      expect(authApiClient.setAuthToken).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('should successfully sign out user', async () => {
      mockSignOut.mockResolvedValue(undefined)

      const result = await logout()

      expect(mockSignOut).toHaveBeenCalledWith(expect.anything())
      expect(authApiClient.clearAuthToken).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed')
      mockSignOut.mockRejectedValue(error)

      const result = await logout()

      expect(result.error).toBe('Logout failed')
    })
  })

  describe('getFirebaseErrorKey', () => {
    it('should map common Firebase error codes to translation keys', () => {
      const translations = [
        ['auth/email-already-in-use', 'auth.errors.emailAlreadyInUse'],
        ['auth/weak-password', 'auth.errors.weakPassword'],
        ['auth/invalid-email', 'auth.errors.invalidEmail'],
        ['auth/user-not-found', 'auth.errors.userNotFound'],
        ['auth/wrong-password', 'auth.errors.wrongPassword'],
        ['auth/invalid-credential', 'auth.errors.invalidCredential'],
        ['auth/too-many-requests', 'auth.errors.tooManyRequests']
      ]

      translations.forEach(([code, expectedKey]) => {
        expect(getFirebaseErrorKey(code)).toBe(expectedKey)
      })
    })

    it('should return default key for unknown error codes', () => {
      const unknownError = 'auth/unknown-error'
      const result = getFirebaseErrorKey(unknownError)
      
      expect(result).toBe('auth.errors.unknown')
    })

    it('should handle empty or undefined error codes', () => {
      expect(getFirebaseErrorKey('')).toBe('auth.errors.unknown')
      expect(getFirebaseErrorKey(undefined as unknown as string)).toBe('auth.errors.unknown')
    })
  })

  describe('getUserProfileFromBackend', () => {
    it('should return profile data on success', async () => {
      const mockProfile = { displayName: 'Test User', email: 'test@example.com' }
      mockAuthApiClient.getUserProfile.mockResolvedValue({
        success: true,
        data: mockProfile,
        error: null
      })

      const result = await getUserProfileFromBackend()

      expect(result.profile).toEqual(mockProfile)
      expect(result.error).toBeNull()
      expect(mockAuthApiClient.getUserProfile).toHaveBeenCalledTimes(1)
    })

    it('should return error on failure', async () => {
      const mockError = 'Failed to fetch profile'
      mockAuthApiClient.getUserProfile.mockResolvedValue({
        success: false,
        data: null,
        error: mockError
      })

      const result = await getUserProfileFromBackend()

      expect(result.profile).toBeNull()
      expect(result.error).toBe(mockError)
    })
  })

  describe('updateUserProfileOnBackend', () => {
    it('should return success when update succeeds', async () => {
      mockAuthApiClient.updateUserProfile.mockResolvedValue({
        success: true,
        error: null
      })

      const updateData = { displayName: 'New Name', photoURL: 'https://example.com/photo.jpg' }
      const result = await updateUserProfileOnBackend(updateData)

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(mockAuthApiClient.updateUserProfile).toHaveBeenCalledWith(updateData)
    })

    it('should return error when update fails', async () => {
      const mockError = 'Update failed'
      mockAuthApiClient.updateUserProfile.mockResolvedValue({
        success: false,
        error: mockError
      })

      const updateData = { displayName: 'New Name' }
      const result = await updateUserProfileOnBackend(updateData)

      expect(result.success).toBe(false)
      expect(result.error).toBe(mockError)
    })
  })

  describe('deleteUserAccountOnBackend', () => {
    it('should return success when deletion succeeds', async () => {
      mockAuthApiClient.deleteUserAccount.mockResolvedValue({
        success: true,
        error: null
      })

      const result = await deleteUserAccountOnBackend()

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(mockAuthApiClient.deleteUserAccount).toHaveBeenCalledTimes(1)
    })

    it('should return error when deletion fails', async () => {
      const mockError = 'Deletion failed'
      mockAuthApiClient.deleteUserAccount.mockResolvedValue({
        success: false,
        error: mockError
      })

      const result = await deleteUserAccountOnBackend()

      expect(result.success).toBe(false)
      expect(result.error).toBe(mockError)
    })
  })
})
