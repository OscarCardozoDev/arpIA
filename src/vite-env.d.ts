/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend (FastAPI). Vacía en desarrollo local. */
  readonly VITE_API_URL?: string
  /** `'false'` para desactivar los mocks y usar el backend real. */
  readonly VITE_USE_MOCKS?: string
  /** Clave pública de reCAPTCHA v2 (siteKey). */
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  /** URL base del agente real (`POST /chat`). Vacía = usar el default de producción. */
  readonly VITE_AGENT_URL?: string
  /** `'true'` para que el chat use el mock en vez del agente real. */
  readonly VITE_CHAT_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
