import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'
import { useAuth } from './index'

export interface ReadingHistoryEntry {
  mangaId: string
  mangaTitle: string
  coverFile: string
  chapterId: string
  chapterNumber: string | null
  page: number
  readAt: string
}

interface ReadingHistoryState {
  history: ReadingHistoryEntry[]
  addEntry: (entry: ReadingHistoryEntry) => Promise<void>
  getRecent: (limit?: number) => ReadingHistoryEntry[]
  fetchHistory: () => Promise<void>
  clearHistory: () => void
}

export const useReadingHistory = create<ReadingHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addEntry: async (entry) => {
        // Optimistically update local state
        set((state) => ({
          history: [
            entry,
            ...state.history.filter((h) => h.chapterId !== entry.chapterId),
          ].slice(0, 50),
        }))

        // Sync with backend D1 Database if logged in
        if (useAuth.getState().isLoggedIn) {
          try {
            await api.post('/history', entry)
          } catch (e) {
            console.error('Failed to sync reading history to DB:', e)
          }
        }
      },
      getRecent: (limit = 10) => get().history.slice(0, limit),
      fetchHistory: async () => {
        if (!useAuth.getState().isLoggedIn) return
        try {
          const res = await api.get<{ data: ReadingHistoryEntry[] }>('/history')
          if (res && res.data) {
            set({ history: res.data })
          }
        } catch (e) {
          console.error('Failed to fetch reading history from D1:', e)
        }
      },
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'rh-history' }
  )
)

interface FollowEntry {
  mangaId: string
  status: string
  addedAt: string
}

interface FollowsState {
  follows: Record<string, FollowEntry>
  follow: (mangaId: string, status: string) => Promise<void>
  unfollow: (mangaId: string) => Promise<void>
  getStatus: (mangaId: string) => string | null
  fetchFollows: () => Promise<void>
  clearFollows: () => void
}

export const useFollows = create<FollowsState>()(
  persist(
    (set, get) => ({
      follows: {},
      follow: async (mangaId, status) => {
        const entry = { mangaId, status, addedAt: new Date().toISOString() }
        
        // Optimistically update local state
        set((state) => ({
          follows: {
            ...state.follows,
            [mangaId]: entry,
          },
        }))

        // Sync with backend D1 Database if logged in
        if (useAuth.getState().isLoggedIn) {
          try {
            await api.post('/follows', { mangaId, status })
          } catch (e) {
            console.error('Failed to sync follow to DB:', e)
          }
        }
      },
      unfollow: async (mangaId) => {
        // Optimistically update local state
        set((state) => {
          const { [mangaId]: _, ...rest } = state.follows
          return { follows: rest }
        })

        // Sync with backend D1 Database if logged in
        if (useAuth.getState().isLoggedIn) {
          try {
            await api.delete(`/follows/${mangaId}`)
          } catch (e) {
            console.error('Failed to sync unfollow to DB:', e)
          }
        }
      },
      getStatus: (mangaId) => get().follows[mangaId]?.status ?? null,
      fetchFollows: async () => {
        if (!useAuth.getState().isLoggedIn) return
        try {
          const res = await api.get<{ data: Record<string, FollowEntry> }>('/follows')
          if (res && res.data) {
            set({ follows: res.data })
          }
        } catch (e) {
          console.error('Failed to fetch follows from D1:', e)
        }
      },
      clearFollows: () => set({ follows: {} }),
    }),
    { name: 'rh-follows' }
  )
)
