/**
 * Configuración global leída de las variables de entorno de Vite.
 * Todo `VITE_*` termina visible en el navegador: nunca poner aquí secretos.
 */

/** URL base del backend. Vacía en desarrollo local (mismo origen / proxy). */
export const API_URL: string = import.meta.env.VITE_API_URL ?? ''

/**
 * Si es `true`, los servicios usan los datos simulados de `src/example/`
 * en vez de llamar al backend real. Por defecto `true` para que el
 * proyecto funcione en localhost sin necesidad de `.env`.
 * Solo controla el login/autenticación (sin backend real todavía); el chat
 * usa `USE_CHAT_MOCK`.
 */
export const USE_MOCKS: boolean = import.meta.env.VITE_USE_MOCKS !== 'false'

/** Tiempo máximo de espera de una petición: cada pregunta puede tardar varios segundos. */
export const REQUEST_TIMEOUT_MS = 60000

/**
 * URL base del agente real que atiende `POST /chat`. Por defecto apunta a
 * producción; se puede sobreescribir en local con `VITE_AGENT_URL`. Se le
 * quita la barra final para poder concatenar rutas sin duplicarla.
 */
export const AGENT_URL: string = (
  import.meta.env.VITE_AGENT_URL || 'https://agent.ustacode.codefest2026.augusta.avaldigitallabs.com'
).replace(/\/$/, '')

/** Timeout de `POST /chat`: la primera pregunta puede tardar más de un minuto (carga de la base). */
export const CHAT_TIMEOUT_MS = 120000

/**
 * Si es `true`, el chat usa `mockSendQuestion` en vez del agente real. Por
 * defecto `false`: el chat consume el agente real aunque `USE_MOCKS` esté activo.
 */
export const USE_CHAT_MOCK: boolean = import.meta.env.VITE_CHAT_MOCK === 'true'

/** Clave pública de reCAPTCHA v2 (clave de pruebas de Google si no se define una propia). */
export const RECAPTCHA_SITE_KEY: string =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

/** Cantidad de dígitos del código de verificación por WhatsApp. */
export const OTP_LENGTH = 6

/** Segundos de espera antes de permitir reenviar el código de verificación. */
export const OTP_RESEND_SECONDS = 30

/**
 * Si es `false`, el Dashboard queda bloqueado: el botón del sidebar se deshabilita y
 * cualquier intento de abrirlo lleva al chat. Por defecto bloqueado; se activa con
 * `VITE_DASHBOARD_ENABLED=true`.
 */
export const DASHBOARD_ENABLED: boolean = import.meta.env.VITE_DASHBOARD_ENABLED === 'true'
