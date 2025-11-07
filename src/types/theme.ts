export type ThemeMode = 'light' | 'dark'

export interface ThemeModeColors {
  bg: string
  surface: string
  text: string
  muted: string
  border: string
  accent: string
  accentContrast: string
}

export interface ThemeDefinition {
  name: string
  label: string
  emoji: string
  radius: string
  font: string
  base?: string
  modes: {
    light: ThemeModeColors
    dark: ThemeModeColors
  }
}

export const THEME_PRESETS = [
  'clinicaClean',
  'barbeariaClassic',
  'pilatesZen',
  'consultorioAzul',
  'neonPro',
  'custom',
] as const

export type ThemePreset = (typeof THEME_PRESETS)[number]
