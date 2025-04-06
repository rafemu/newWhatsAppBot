import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/utils/axios'
import { User } from '@/store'
import { LoginRequest, LoginResponse, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/types/auth'
import { OAuthUser } from './oauth'

interface LoginResponse {
  user: User
  token: string
}

interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
}

interface ForgotPasswordData {
  email: string
}

interface ResetPasswordData {
  token: string
  password: string
}

interface TwoFactorResponse {
  qrCode: string
  backupCodes: string[]
}

interface TwoFactorVerifyData {
  code: string
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken'
  private readonly REFRESH_TOKEN_KEY = 'refreshToken'
  private refreshPromise: Promise<string> | null = null

  // שמירת טוקנים
  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  // קבלת טוקנים
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  // מחיקת טוקנים
  clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  // התחברות
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>('/api/auth/login', data)
    const { accessToken, refreshToken } = response.data
    this.setTokens(accessToken, refreshToken)
    return response.data
  }

  // רישום
  async register(data: RegisterRequest): Promise<void> {
    await axios.post('/auth/register', data)
  }

  // שכחתי סיסמה
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await axios.post('/api/auth/forgot-password', data)
  }

  // איפוס סיסמה
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await axios.post('/api/auth/reset-password', data)
  }

  // התנתקות
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken()
    if (refreshToken) {
      try {
        await axios.post('/api/auth/logout', { refreshToken })
      } catch (error) {
        console.error('Error during logout:', error)
      }
    }
    this.clearTokens()
  }

  // רענון טוקן
  async refreshAccessToken(): Promise<string> {
    // אם כבר יש תהליך רענון פעיל, נחזיר אותו
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    // יצירת הבטחה חדשה לרענון הטוקן
    this.refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post<{ accessToken: string, refreshToken: string }>(
          '/api/auth/refresh-token',
          { refreshToken }
        )
        const { accessToken, refreshToken: newRefreshToken } = response.data
        this.setTokens(accessToken, newRefreshToken)
        resolve(accessToken)
      } catch (error) {
        this.clearTokens()
        reject(error)
      } finally {
        this.refreshPromise = null
      }
    })

    return this.refreshPromise
  }

  // בדיקת תוקף הטוקן
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiryTime = payload.exp * 1000 // המרה למילישניות
      return Date.now() >= expiryTime
    } catch {
      return true
    }
  }

  async loginWithOAuth(oauthUser: OAuthUser): Promise<void> {
    try {
      const response = await axios.post('/auth/oauth', oauthUser)
      const { accessToken, refreshToken } = response.data

      // שמירת הטוקנים
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      // עדכון מצב המשתמש
      await this.fetchUserDetails()
    } catch (error) {
      console.error('OAuth login error:', error)
      throw error
    }
  }
}

export const authService = new AuthService()

export const useLoginMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const response = await axios.post('/api/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user)
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
}

export const useRegisterMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await axios.post('/api/auth/register', data)
      return response.data
    },
    onSuccess: () => {
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
}

export const useForgotPasswordMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axios.post('/api/auth/forgot-password', data)
      return response.data
    },
    onSuccess: () => {
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
}

export const useResetPasswordMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await axios.post('/api/auth/reset-password', data)
      return response.data
    },
    onSuccess: () => {
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
}

export const useEnable2FAMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TwoFactorResponse) => void
  onError?: (error: any) => void
} = {}) => {
  return useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/auth/2fa/enable')
      return response.data
    },
    onSuccess: (data) => {
      onSuccess?.(data)
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
}

export const useVerify2FAMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TwoFactorVerifyData) => {
      const response = await axios.post('/api/auth/2fa/verify', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], (oldData: any) => ({
        ...oldData,
        twoFactorEnabled: true,
      }))
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
}

export const useDisable2FAMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/auth/2fa/disable')
      return response.data
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], (oldData: any) => ({
        ...oldData,
        twoFactorEnabled: false,
      }))
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
}

export const useLogin2FAMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TwoFactorVerifyData) => {
      const response = await axios.post('/api/auth/2fa/login', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user)
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
} 