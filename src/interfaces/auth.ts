/** Usuario con sesión iniciada. */
export interface User {
  name: string
  username: string
  since: number
}

/** Cuerpo de `POST /auth/login`. */
export interface LoginRequest {
  username: string
  password: string
  recaptchaToken: string
}

/** Respuesta de `POST /auth/login`: reto de verificación por WhatsApp. */
export interface LoginChallenge {
  challengeId: string
  phoneHint: string
}

/** Cuerpo de `POST /auth/verify`. */
export interface VerifyRequest {
  challengeId: string
  code: string
}

/** Códigos de error de autenticación que puede devolver el backend o el cliente HTTP. */
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'captcha_failed'
  | 'invalid_code'
  | 'expired'
  | 'too_many_attempts'
  | 'rate_limited'
  | 'network'
  | 'unauthorized'
  | 'server'
  | 'timeout'
  | 'invalid_json'
