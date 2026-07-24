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
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/oauth`
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
