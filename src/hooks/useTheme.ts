import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'arpia_theme'

function loadStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    // localStorage puede no estar disponible (modo privado): se sigue sin persistir.
    return null
  }
}

interface UseThemeResult {
  theme: Theme
  toggleTheme(): void
}

/** Controla el tema claro/oscuro, lo aplica en `<html>` y lo persiste en `localStorage`. Por defecto `dark`. */
export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<Theme>(() => loadStoredTheme() ?? 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Sin persistencia disponible: el tema sigue funcionando solo en memoria.
      console.warn('No se pudo guardar el tema en localStorage.')
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
