import { create } from 'zustand'
import { getProfile } from '../../api/user'

export const useUserStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ 
      loading: true, 
      error: null 
    })
    
    try {
      const profile = await getProfile()
      set({ profile })
    } catch(error) {
      set({ error })
    } finally {
      set({ loading: false })
    }
  }
}))
