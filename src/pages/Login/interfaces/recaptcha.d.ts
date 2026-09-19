/**
 * Tipos del API global de reCAPTCHA v2 (script de Google cargado en tiempo de
 * ejecución por `services/recaptchaLoader.ts`). Sin `any`: se declara la forma
 * mínima usada por `RecaptchaWidget`.
 */

/** Opciones aceptadas por `grecaptcha.render`. */
export interface RecaptchaRenderOptions {
  sitekey: string
  theme?: 'light' | 'dark'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

/** Subconjunto de la API `window.grecaptcha` que usa `RecaptchaWidget`. */
export interface Grecaptcha {
  render(container: HTMLElement, options: RecaptchaRenderOptions): number
  reset(widgetId?: number): void
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}
