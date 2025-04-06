export { useAuthStore } from './slices/authSlice'
export { useWhatsAppSessionsStore } from './slices/whatsappSessionsSlice'
export { useSurveysStore } from './slices/surveysSlice'

// Re-export types
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  roles: string[]
  permissions: string[]
  twoFactorEnabled: boolean
}

export interface AuthState {
  isInitialized: boolean
  isAuthenticated: boolean
  user: User | null
}

export type { WhatsAppSession } from './slices/whatsappSessionsSlice'
export type { Survey, Question } from './slices/surveysSlice' 