import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setToken: (token) => set({ token }),
        setError: (error) => set({ error }),
        setLoading: (isLoading) => set({ isLoading }),
        logout: () => set({ user: null, token: null, isAuthenticated: false }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user, token: state.token }),
      }
    )
  )
) 