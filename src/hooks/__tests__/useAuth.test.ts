import { renderHook, waitFor, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { onAuthStateChanged } from 'firebase/auth'

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  },
}))

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with loading true and no user', () => {
    // Mock onAuthStateChanged to not call the callback immediately
    mockOnAuthStateChanged.mockImplementation(() => jest.fn())

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
  })

  it('should set user and loading false when authenticated', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    }

    // Mock onAuthStateChanged to call callback with user
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser as unknown)
      return jest.fn() // unsubscribe function
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toEqual(mockUser)
    })
  })

  it('should set user to null and loading false when not authenticated', async () => {
    // Mock onAuthStateChanged to call callback with null
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null)
      return jest.fn() // unsubscribe function
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toBe(null)
    })
  })

  it('should call unsubscribe on cleanup', () => {
    const mockUnsubscribe = jest.fn()
    mockOnAuthStateChanged.mockImplementation(() => mockUnsubscribe)

    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should handle auth state changes', async () => {
    let authStateCallback: ((user: unknown) => void) | null = null

    // Capture the callback function
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback
      return jest.fn()
    })

    const { result } = renderHook(() => useAuth())

    // Initially no user
    expect(result.current.user).toBe(null)
    expect(result.current.loading).toBe(true)

    // Simulate user login
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    }

    if (authStateCallback) {
      act(() => {
        authStateCallback(mockUser)
      })
    }

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.loading).toBe(false)
    })

    // Simulate user logout
    if (authStateCallback) {
      act(() => {
        authStateCallback(null)
      })
    }

    await waitFor(() => {
      expect(result.current.user).toBe(null)
      expect(result.current.loading).toBe(false)
    })
  })
})
