import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemePreset, ThemeMode, ThemeDefinition } from '../types/theme'

interface ThemeState {
  theme: ThemePreset
  mode: ThemeMode
  themes: Record<ThemePreset, ThemeDefinition | null>
  customAccent: string | null

  setTheme: (theme: ThemePreset) => void
  setMode: (mode: ThemeMode) => void
  setCustomAccent: (accent: string) => void
  loadTheme: (preset: ThemePreset) => Promise<void>
  initializeFromURL: () => void
  applyTheme: () => void
}

const DEFAULT_THEME: ThemePreset = 'clinicaClean'
const DEFAULT_MODE: ThemeMode = 'light'

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME,
      mode: DEFAULT_MODE,
      themes: {} as Record<ThemePreset, ThemeDefinition | null>,
      customAccent: null,

      setTheme: (theme: ThemePreset) => {
        set({ theme })
        get()
          .loadTheme(theme)
          .then(() => get().applyTheme())
      },

      setMode: (mode: ThemeMode) => {
        set({ mode })
        get().applyTheme()
      },

      setCustomAccent: (accent: string) => {
        set({ customAccent: accent })
        if (get().theme === 'custom') {
          get().applyTheme()
        }
      },

      loadTheme: async (preset: ThemePreset) => {
        const { themes } = get()

        // Se já carregado, não recarregar
        if (themes[preset]) {
          return
        }

        try {
          const response = await fetch(`/themes/${preset}.json`)
          if (!response.ok) {
            throw new Error(`Failed to load theme: ${preset}`)
          }

          const themeData: ThemeDefinition = await response.json()

          set((state) => ({
            themes: {
              ...state.themes,
              [preset]: themeData,
            },
          }))
        } catch (error) {
          console.error(`Error loading theme ${preset}:`, error)
          // Fallback para clinicaClean
          if (preset !== 'clinicaClean') {
            await get().loadTheme('clinicaClean')
          }
        }
      },

      initializeFromURL: () => {
        const params = new URLSearchParams(window.location.search)
        const themeParam = params.get('theme') as ThemePreset | null
        const modeParam = params.get('mode') as ThemeMode | null

        if (
          themeParam &&
          [
            'clinicaClean',
            'barbeariaClassic',
            'pilatesZen',
            'consultorioAzul',
            'neonPro',
            'custom',
          ].includes(themeParam)
        ) {
          get().setTheme(themeParam)
        }

        if (modeParam && (modeParam === 'light' || modeParam === 'dark')) {
          set({ mode: modeParam })
        }

        // Carregar tema inicial
        get()
          .loadTheme(get().theme)
          .then(() => get().applyTheme())
      },

      applyTheme: () => {
        const { theme, mode, themes, customAccent } = get()
        const themeData = themes[theme]

        if (!themeData) {
          // Se tema não carregado, tentar carregar
          get()
            .loadTheme(theme)
            .then(() => get().applyTheme())
          return
        }

        const colors = themeData.modes[mode]

        // Aplicar atributos no HTML
        document.documentElement.setAttribute('data-theme', theme)
        document.documentElement.setAttribute('data-mode', mode)

        // Aplicar CSS variables
        document.documentElement.style.setProperty('--bg', colors.bg)
        document.documentElement.style.setProperty('--surface', colors.surface)
        document.documentElement.style.setProperty('--text', colors.text)
        document.documentElement.style.setProperty('--muted', colors.muted)
        document.documentElement.style.setProperty('--border', colors.border)

        // Se for custom e tiver accent customizado, usar ele
        const accent = theme === 'custom' && customAccent ? customAccent : colors.accent
        document.documentElement.style.setProperty('--accent', accent)
        document.documentElement.style.setProperty(
          '--accent-contrast',
          colors.accentContrast
        )

        // Aplicar outras propriedades
        document.documentElement.style.setProperty('--radius', themeData.radius)
        document.documentElement.style.setProperty('--font', themeData.font)
      },
    }),
    {
      name: 'ampliaro.theme',
      partialize: (state) => ({
        theme: state.theme,
        mode: state.mode,
        customAccent: state.customAccent,
      }),
    }
  )
)
