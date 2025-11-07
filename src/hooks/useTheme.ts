import { useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

/**
 * Hook para inicializar e usar o sistema de temas
 */
export function useTheme() {
  const { theme, mode, themes, setTheme, setMode, initializeFromURL, applyTheme } =
    useThemeStore()

  useEffect(() => {
    // Inicializar tema na montagem
    initializeFromURL()
  }, [initializeFromURL])

  useEffect(() => {
    // Aplicar tema sempre que mudar
    applyTheme()
  }, [theme, mode, applyTheme])

  const currentTheme = themes[theme]

  return {
    theme,
    mode,
    currentTheme,
    setTheme,
    setMode,
  }
}
