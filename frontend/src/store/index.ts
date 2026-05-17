import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isLoggedIn: boolean
  username: string | null
  avatarUrl: string | null
  sessionToken: string | null
  login: (params: { username: string; avatarUrl?: string; token: string }) => void
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      username: null,
      avatarUrl: null,
      sessionToken: null,
      login: ({ username, avatarUrl, token }) =>
        set({ isLoggedIn: true, username, avatarUrl: avatarUrl ?? null, sessionToken: token }),
      logout: () =>
        set({ isLoggedIn: false, username: null, avatarUrl: null, sessionToken: null }),
    }),
    { name: 'rh-auth' },
  ),
)

interface SettingsState {
  theme: 'dark' | 'light'
  readerMode: 'single' | 'double' | 'scroll'
  imageQuality: 'data' | 'data-saver'
  toggleTheme: () => void
  setReaderMode: (mode: 'single' | 'double' | 'scroll') => void
  setImageQuality: (quality: 'data' | 'data-saver') => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      readerMode: 'scroll',
      imageQuality: 'data-saver',
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setReaderMode: (mode) => set({ readerMode: mode }),
      setImageQuality: (quality) => set({ imageQuality: quality }),
    }),
    { name: 'rh-settings' },
  ),
)
