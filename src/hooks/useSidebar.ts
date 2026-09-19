import { useCallback, useEffect, useState } from 'react'

const DESKTOP_QUERY = '(min-width: 768px)'

interface UseSidebarResult {
  open: boolean
  setOpen(v: boolean): void
  toggle(): void
  /** Cierra el sidebar solo si la pantalla es móvil (en escritorio se queda abierto). */
  closeOnMobile(): void
  isDesktop: boolean
}

/**
 * Controla el estado abierto/cerrado del sidebar: abierto por defecto en
 * escritorio (≥768px) y cerrado en móvil. Al cruzar el breakpoint se ajusta
 * automáticamente, igual que en el template (`matchMedia` + listener).
 */
export function useSidebar(): UseSidebarResult {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  const [open, setOpen] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const handleChange = (e: MediaQueryListEvent): void => {
      setIsDesktop(e.matches)
      setOpen(e.matches)
    }
    mq.addEventListener('change', handleChange)
    return () => {
      mq.removeEventListener('change', handleChange)
    }
  }, [])

  const toggle = useCallback(() => {
    setOpen((current) => !current)
  }, [])

  const closeOnMobile = useCallback(() => {
    setOpen((current) => (isDesktop ? current : false))
  }, [isDesktop])

  return { open, setOpen, toggle, closeOnMobile, isDesktop }
}
