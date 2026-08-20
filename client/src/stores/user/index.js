import { create } from 'zustand'
import { getProfile } from '../../api/user'

export const useUserStore = create((set) => ({
  profile: null,

  fetchProfile: async () => {
    const profile = await getProfile()
    set({ profile })
  },
}))
