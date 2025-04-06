import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface WhatsAppSession {
  id: string
  name: string
  phone: string
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  qrCode?: string
  lastActive?: Date
  settings: {
    autoReply: boolean
    autoReplyMessage?: string
    workingHours: {
      enabled: boolean
      start: string
      end: string
      timezone: string
    }
  }
}

interface WhatsAppSessionsState {
  sessions: WhatsAppSession[]
  currentSession: WhatsAppSession | null
  isLoading: boolean
  error: string | null
  setSessions: (sessions: WhatsAppSession[]) => void
  setCurrentSession: (session: WhatsAppSession | null) => void
  updateSession: (sessionId: string, updates: Partial<WhatsAppSession>) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
}

export const useWhatsAppSessionsStore = create<WhatsAppSessionsState>()(
  devtools((set) => ({
    sessions: [],
    currentSession: null,
    isLoading: false,
    error: null,
    setSessions: (sessions) => set({ sessions }),
    setCurrentSession: (currentSession) => set({ currentSession }),
    updateSession: (sessionId, updates) =>
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === sessionId ? { ...session, ...updates } : session
        ),
        currentSession:
          state.currentSession?.id === sessionId
            ? { ...state.currentSession, ...updates }
            : state.currentSession,
      })),
    setError: (error) => set({ error }),
    setLoading: (isLoading) => set({ isLoading }),
  }))
) 