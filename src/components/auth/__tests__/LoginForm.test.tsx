import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'
import { signIn, getFirebaseErrorKey } from '@/lib/auth'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
  getFirebaseErrorKey: jest.fn(),
}))

// Mock OAuth functions
jest.mock('@/lib/oauth', () => ({
  signInWithGoogle: jest.fn(),
  signInWithFacebook: jest.fn(),
}))

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  },
  db: {},
}))

// Mock Firebase Functions
jest.mock('@/lib/firebase-functions', () => ({
  functions: {},
}))

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
const mockGetFirebaseErrorKey = getFirebaseErrorKey as jest.MockedFunction<typeof getFirebaseErrorKey>

describe('LoginForm Component', () => {
  const mockOnSuccess = jest.fn()
  const mockOnSwitchToRegister = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderLoginForm = () => {
    return render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    )
  }

  it('should render login form with all fields', () => {
    renderLoginForm()

    expect(screen.getByText('login.title')).toBeInTheDocument()
    expect(screen.getByText('login.subtitle')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getAllByDisplayValue('')).toHaveLength(2)
    expect(screen.getByRole('button', { name: /loginbutton/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'login.signUp' })).toBeInTheDocument()
  })

  it('should disable submit button when fields are empty', () => {
    renderLoginForm()
    
    const submitButton = screen.getByRole('button', { name: /loginbutton/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when fields are filled', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getAllByDisplayValue('')[1]
    const submitButton = screen.getByRole('button', { name: /loginbutton/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    expect(submitButton).toBeEnabled()
  })

  it('should toggle password visibility', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    const passwordInput = screen.getAllByDisplayValue('')[1]
    const toggleButton = screen.getByLabelText('login.showPassword')

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click to show password
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click to hide password again
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should clear error when user types', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ user: null, error: 'Test error' })
    mockGetFirebaseErrorKey.mockReturnValue('auth.errors.unknown')

    renderLoginForm()

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getAllByDisplayValue('')[1]
    const submitButton = screen.getByRole('button', { name: /loginbutton/i })

    // Fill form and submit to trigger error
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('auth.errors.unknown')).toBeInTheDocument()
    })

    // Start typing again - error should disappear
    await user.type(emailInput, 'a')

    expect(screen.queryByText('auth.errors.unknown')).not.toBeInTheDocument()
  })

  it('should call onSwitchToRegister when sign up button is clicked', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    const signUpButton = screen.getByRole('button', { name: 'login.signUp' })
    await user.click(signUpButton)

    expect(mockOnSwitchToRegister).toHaveBeenCalled()
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()
    const mockUser = { uid: 'test-uid', email: 'test@example.com' }
    mockSignIn.mockResolvedValue({ user: mockUser, error: null })

    renderLoginForm()

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getAllByDisplayValue('')[1]
    const submitButton = screen.getByRole('button', { name: /loginbutton/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should handle login error', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ user: null, error: 'auth/invalid-credential' })
    mockGetFirebaseErrorKey.mockReturnValue('auth.errors.invalidCredential')

    renderLoginForm()

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getAllByDisplayValue('')[1]
    const submitButton = screen.getByRole('button', { name: /loginbutton/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('auth.errors.invalidCredential')).toBeInTheDocument()
      expect(mockGetFirebaseErrorKey).toHaveBeenCalledWith('auth/invalid-credential')
    })
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    // Mock a delayed response
    mockSignIn.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ user: null, error: null }), 100)
    ))

    renderLoginForm()

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getAllByDisplayValue('')[1]
    const submitButton = screen.getByRole('button', { name: /loginbutton/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Check loading state
    expect(screen.getByText('login.loadingButton')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('login.loginButton')).toBeInTheDocument()
    })
  })

  it('should prevent form submission when loading', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ user: null, error: null }), 100)
    ))

    renderLoginForm()

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getAllByDisplayValue('')[1]
    const submitButton = screen.getByRole('button', { name: /loginbutton/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Verify button is disabled during loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })

    // Verify only one call was made
    expect(mockSignIn).toHaveBeenCalledTimes(1)
  })
})
