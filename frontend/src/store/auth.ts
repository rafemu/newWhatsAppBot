import { create } from 'zustand'
import { User } from '@/types/user'
import { authService } from '@/services/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  initialize: () => Promise<void>
  login: (user: User) => void
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true })
      
      // בדיקה אם יש טוקן תקף
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        set({ isInitialized: true, isLoading: false })
        return
      }

      // אם הטוקן פג תוקף, ננסה לרענן אותו
      if (authService.isTokenExpired(accessToken)) {
        try {
          await authService.refreshAccessToken()
        } catch (error) {
          // אם נכשל רענון הטוקן, ננקה את המצב
          await get().logout()
          set({ isInitialized: true, isLoading: false })
          return
        }
      }

      // שליפת פרטי המשתמש
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const user = await response.json()
        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        })
      } else {
        // אם נכשלה שליפת פרטי המשתמש, ננקה את המצב
        await get().logout()
        set({ isInitialized: true, isLoading: false })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({
        error: 'שגיאה באתחול המערכת',
        isInitialized: true,
        isLoading: false,
      })
    }
  },

  login: (user: User) => {
    set({
      user,
      isAuthenticated: true,
      error: null,
    })
  },

  logout: async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
    
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    })
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },
})) 