/** Nombre del callback global que Google invoca cuando el script de reCAPTCHA termina de cargar. */
const CALLBACK_NAME = '__onRecaptchaApiLoad'

const SCRIPT_URL = `https://www.google.com/recaptcha/api.js?onload=${CALLBACK_NAME}&render=explicit`

const LOAD_TIMEOUT_MS = 10000

let sharedPromise: Promise<void> | null = null

/**
 * Inserta el script de reCAPTCHA de Google una sola vez (promesa compartida
 * entre llamadas) y resuelve cuando `window.grecaptcha` queda disponible.
 * Rechaza a los 10s si el script no carga (sin conexión, bloqueado, etc.).
 */
export function loadRecaptcha(): Promise<void> {
  if (sharedPromise) return sharedPromise

  sharedPromise = new Promise<void>((resolve, reject) => {
    const win = window as unknown as Record<string, (() => void) | undefined>

    const timer = setTimeout(() => {
      reject(new Error('recaptcha_timeout'))
    }, LOAD_TIMEOUT_MS)

    win[CALLBACK_NAME] = () => {
      clearTimeout(timer)
      resolve()
    }

    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.defer = true
    script.onerror = () => {
      clearTimeout(timer)
      reject(new Error('recaptcha_script_error'))
    }
    document.head.appendChild(script)
  })

  return sharedPromise
}
