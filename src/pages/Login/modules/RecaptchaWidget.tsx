import { useEffect, useRef, useState } from 'react'
import { RECAPTCHA_SITE_KEY } from '../../../services/config'
import { isDemoMode } from '../../../services/authService'
import { loadRecaptcha } from '../services/recaptchaLoader'
// `window.grecaptcha` está tipado globalmente por `../interfaces/recaptcha.d.ts` (parte de `include: ["src"]`).

interface RecaptchaWidgetProps {
  /** Se llama con el token cuando el usuario resuelve el reto, y con `''` si expira o falla. */
  onToken: (token: string) => void
  /** Cambia (se incrementa) cada vez que el padre quiere forzar `grecaptcha.reset()`. */
  resetSignal: number
}

type Status = 'loading' | 'ready' | 'error'

/**
 * Widget de reCAPTCHA v2 explícito. En modo demo sin conexión con Google,
 * entrega un token simulado (`'demo-sin-recaptcha'`) para no bloquear el login.
 */
export function RecaptchaWidget({ onToken, resetSignal }: RecaptchaWidgetProps) {
  const [status, setStatus] = useState<Status>('loading')
  const [widgetError, setWidgetError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    loadRecaptcha()
      .then(() => {
        if (!cancelled) setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
        if (isDemoMode) onToken('demo-sin-recaptcha')
      })
    return () => {
      cancelled = true
    }
  }, [onToken])

  useEffect(() => {
    if (status !== 'ready' || !containerRef.current || !window.grecaptcha) return
    containerRef.current.replaceChildren()
    const holder = document.createElement('div')
    containerRef.current.appendChild(holder)
    const isDark = document.documentElement.classList.contains('dark')
    widgetIdRef.current = window.grecaptcha.render(holder, {
      sitekey: RECAPTCHA_SITE_KEY,
      theme: isDark ? 'dark' : 'light',
      callback: (token) => {
        setWidgetError(null)
        onToken(token)
      },
      'expired-callback': () => onToken(''),
      'error-callback': () => {
        setWidgetError('No se pudo verificar el reCAPTCHA.')
        onToken('')
      },
    })
  }, [status, onToken])

  // Los tokens de reCAPTCHA son de un solo uso: el padre pide reiniciar el widget tras cada intento.
  useEffect(() => {
    if (resetSignal === 0) return
    if (window.grecaptcha && widgetIdRef.current !== null) {
      window.grecaptcha.reset(widgetIdRef.current)
    }
  }, [resetSignal])

  return (
    <div className="recaptcha-box flex min-h-[78px] items-center justify-center">
      {status === 'loading' && <p className="text-sm text-navy-600 dark:text-navy-300">Cargando reCAPTCHA…</p>}
      {status === 'ready' && <div ref={containerRef} />}
      {status === 'error' && isDemoMode && (
        <p className="text-center text-sm text-navy-600 dark:text-navy-300">
          Modo demostración: se omite reCAPTCHA (sin conexión con Google).
        </p>
      )}
      {status === 'error' && !isDemoMode && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          No se pudo cargar reCAPTCHA. Revisa tu conexión y recarga la página.
        </p>
      )}
      {widgetError && <p className="text-center text-sm text-red-600 dark:text-red-400">{widgetError}</p>}
    </div>
  )
}
