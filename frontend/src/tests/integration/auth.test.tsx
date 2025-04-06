import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { useAuthStore } from '@/store/auth'
import { authService } from '@/services/auth'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import Profile from '@/pages/profile/Profile'

// Mock the auth service
vi.mock('@/services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    refreshAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    clearTokens: vi.fn(),
  },
}))

// Mock notification hook
vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    showNotification: vi.fn(),
  }),
}))

describe('Authentication Flow Integration Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    
    // Reset all mocks
    vi.clearAllMocks()
    
    // Reset auth store
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
      error: null,
    })
  })

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={component} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('Login Flow', () => {
    it('מאפשר למשתמש להתחבר בהצלחה', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['USER'],
      }

      ;(authService.login as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })

      renderWithProviders(<Login />)

      // מילוי טופס ההתחברות
      fireEvent.change(screen.getByLabelText(/דואר אלקטרוני/), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/סיסמה/), {
        target: { value: 'password123' },
      })

      // שליחת הטופס
      fireEvent.click(screen.getByRole('button', { name: /התחבר/ }))

      // וידוא שהמשתמש מחובר
      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(true)
        expect(useAuthStore.getState().user).toEqual(mockUser)
      })
    })

    it('מציג שגיאה כאשר פרטי ההתחברות שגויים', async () => {
      const errorMessage = 'פרטי התחברות שגויים'
      ;(authService.login as jest.Mock).mockRejectedValueOnce(new Error(errorMessage))

      renderWithProviders(<Login />)

      // מילוי טופס ההתחברות
      fireEvent.change(screen.getByLabelText(/דואר אלקטרוני/), {
        target: { value: 'wrong@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/סיסמה/), {
        target: { value: 'wrongpassword' },
      })

      // שליחת הטופס
      fireEvent.click(screen.getByRole('button', { name: /התחבר/ }))

      // וידוא שמוצגת הודעת שגיאה
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })
  })

  describe('Registration Flow', () => {
    it('מאפשר למשתמש להירשם בהצלחה', async () => {
      ;(authService.register as jest.Mock).mockResolvedValueOnce({})

      renderWithProviders(<Register />)

      // מילוי טופס ההרשמה
      fireEvent.change(screen.getByLabelText(/שם/), {
        target: { value: 'Test User' },
      })
      fireEvent.change(screen.getByLabelText(/דואר אלקטרוני/), {
        target: { value: 'newuser@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/סיסמה/), {
        target: { value: 'password123' },
      })

      // שליחת הטופס
      fireEvent.click(screen.getByRole('button', { name: /הירשם/ }))

      // וידוא שנקראה פונקציית ההרשמה
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'newuser@example.com',
          password: 'password123',
        })
      })
    })
  })

  describe('Password Reset Flow', () => {
    it('מאפשר למשתמש לבקש איפוס סיסמה', async () => {
      ;(authService.forgotPassword as jest.Mock).mockResolvedValueOnce({})

      renderWithProviders(<ForgotPassword />)

      // מילוי טופס שכחתי סיסמה
      fireEvent.change(screen.getByLabelText(/דואר אלקטרוני/), {
        target: { value: 'test@example.com' },
      })

      // שליחת הטופס
      fireEvent.click(screen.getByRole('button', { name: /שלח/ }))

      // וידוא שנקראה פונקציית שכחתי סיסמה
      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
        })
      })
    })

    it('מאפשר למשתמש לאפס סיסמה', async () => {
      ;(authService.resetPassword as jest.Mock).mockResolvedValueOnce({})

      renderWithProviders(<ResetPassword />)

      // מילוי טופס איפוס סיסמה
      fireEvent.change(screen.getByLabelText(/סיסמה חדשה/), {
        target: { value: 'newpassword123' },
      })
      fireEvent.change(screen.getByLabelText(/אימות סיסמה/), {
        target: { value: 'newpassword123' },
      })

      // שליחת הטופס
      fireEvent.click(screen.getByRole('button', { name: /אפס סיסמה/ }))

      // וידוא שנקראה פונקציית איפוס סיסמה
      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledWith({
          token: expect.any(String),
          password: 'newpassword123',
        })
      })
    })
  })

  describe('Token Refresh Flow', () => {
    it('מרענן טוקן אוטומטית כאשר הוא פג תוקף', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['USER'],
      }

      // דימוי טוקן פג תוקף
      ;(authService.isTokenExpired as jest.Mock).mockReturnValueOnce(true)
      
      // דימוי רענון טוקן מוצלח
      ;(authService.refreshAccessToken as jest.Mock).mockResolvedValueOnce('new-access-token')
      
      // דימוי קבלת פרטי משתמש מוצלחת
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })

      // אתחול המצב עם טוקן
      ;(authService.getAccessToken as jest.Mock).mockReturnValue('expired-token')
      ;(authService.getRefreshToken as jest.Mock).mockReturnValue('refresh-token')

      // רינדור הפרופיל שדורש אימות
      renderWithProviders(<Profile />)

      // וידוא שנקרא רענון הטוקן
      await waitFor(() => {
        expect(authService.refreshAccessToken).toHaveBeenCalled()
      })

      // וידוא שהמשתמש נשאר מחובר
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('מנתק את המשתמש כאשר רענון הטוקן נכשל', async () => {
      // דימוי טוקן פג תוקף
      ;(authService.isTokenExpired as jest.Mock).mockReturnValueOnce(true)
      
      // דימוי כישלון ברענון טוקן
      ;(authService.refreshAccessToken as jest.Mock).mockRejectedValueOnce(
        new Error('Token refresh failed')
      )

      // אתחול המצב עם טוקן
      ;(authService.getAccessToken as jest.Mock).mockReturnValue('expired-token')
      ;(authService.getRefreshToken as jest.Mock).mockReturnValue('refresh-token')

      // רינדור הפרופיל שדורש אימות
      renderWithProviders(<Profile />)

      // וידוא שהמשתמש מנותק
      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(false)
        expect(useAuthStore.getState().user).toBeNull()
      })
    })
  })
}) 