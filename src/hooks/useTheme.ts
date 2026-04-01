import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'svg-sprite-theme'

export type Theme = 'light' | 'dark'

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* private mode, etc. */
  }
  return null
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getInitialTheme(): Theme {
  return readStored() ?? (systemPrefersDark() ? 'dark' : 'light')
}

function applyToDocument(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyToDocument(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
