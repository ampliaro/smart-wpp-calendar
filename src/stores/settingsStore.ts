import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile, getProfile, PROFILES } from '../config/profiles'

interface CustomProfile {
  name: string
  description: string
  icon: string
  logoUrl?: string
}

interface SettingsState {
  profile: Profile
  customProfile: CustomProfile | null
  isCustomProfile: boolean

  setProfile: (profileId: string) => void
  setCustomProfile: (custom: CustomProfile) => void
  resetDemo: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: PROFILES.odonto,
      customProfile: null,
      isCustomProfile: false,

      setProfile: (profileId: string) => {
        if (profileId === 'custom') {
          set({ isCustomProfile: true })
        } else {
          const profile = getProfile(profileId)
          set({ profile, isCustomProfile: false })
        }
      },

      setCustomProfile: (custom: CustomProfile) => {
        // Cria um perfil baseado em odonto mas com info customizada
        const baseProfile = PROFILES.odonto
        const customizedProfile: Profile = {
          ...baseProfile,
          id: 'custom',
          name: custom.name,
          description: custom.description,
          icon: custom.icon,
        }

        set({
          profile: customizedProfile,
          customProfile: custom,
          isCustomProfile: true,
        })
      },

      resetDemo: () => {
        // Clear all localStorage first
        localStorage.clear()

        // Then set defaults
        set({
          profile: PROFILES.odonto,
          customProfile: null,
          isCustomProfile: false,
        })

        // Force reload to regenerate everything
        window.location.reload()
      },
    }),
    {
      name: 'ampliaro.settings',
    }
  )
)
