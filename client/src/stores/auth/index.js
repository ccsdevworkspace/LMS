import { create } from 'zustand'
import { me, logout } from '../../api/auth'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  checkSession: async () => {
    set({ loading: true, error: null })
    
    try {
      const user = await me()

      set({ 
        user, 
        loading: false
      })

    } catch (error) {
      set({ 
        user: null,
        error, 
        loading: false 
      })
    }
  },

  login: () => {
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL
    const baseUrl = (rawApiUrl && rawApiUrl !== 'undefined') ? rawApiUrl : 'http://localhost:3000'
    const returnTo = encodeURIComponent(window.location.origin)
    window.location.href = `${baseUrl}/auth/oauth?returnTo=${returnTo}`
  },

  logout: async () => {
    set({ loading: true, error: null, })

    try {
      await logout()

      set({
        user: null,
        loading: false,
      })
    } catch (error) {
      set({ 
        error,
        loading: false,
      })
    }
  },
  
}))
