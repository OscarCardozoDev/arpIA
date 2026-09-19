import type { AuthErrorCode, LoginChallenge, LoginRequest, User, VerifyRequest } from '../interfaces/auth'
import { isLoginChallenge, isMeResponse, isVerifyResponse } from '../guards/authGuards'
import { mockLogin, mockLogout, mockMe, mockResend, mockVerify } from '../example/auth.mock'
import { HttpError, request } from './httpClient'
import { USE_MOCKS } from './config'

/** `true` cuando el frontend está usando datos simulados en vez del backend real. */
export const isDemoMode = USE_MOCKS

const AUTH_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: 'Usuario o contraseña incorrectos.',
  captcha_failed: 'No pudimos verificar el reCAPTCHA. Inténtalo de nuevo.',
  invalid_code: 'El código no es correcto.',
  expired: 'El código expiró. Solicita uno nuevo.',
  too_many_attempts: 'Demasiados intentos. Vuelve a iniciar sesión.',
  rate_limited: 'Demasiados intentos. Espera unos minutos.',
  network: 'No pudimos conectar con el servidor.',
  unauthorized: 'Tu sesión expiró. Inicia sesión de nuevo.',
  server: 'Ocurrió un error. Inténtalo de nuevo.',
  timeout: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
  invalid_json: 'Recibimos una respuesta inesperada del servidor.',
}

/** Traduce un error de autenticación (`HttpError` u otro) a un mensaje en español para el usuario. */
export function authErrorMessage(err: unknown): string {
  const code = err instanceof HttpError ? err.code : undefined
  return AUTH_MESSAGES[code as AuthErrorCode] ?? AUTH_MESSAGES.server
}

/**
 * Envía usuario/contraseña/reCAPTCHA a `POST /auth/login` y devuelve el reto de OTP.
 * Lanza `HttpError('invalid_json')` si la respuesta no cumple el contrato.
 */
export async function login(req: LoginRequest): Promise<LoginChallenge> {
  if (USE_MOCKS) return mockLogin(req)
  const data = await request('POST', '/auth/login', req)
  if (!isLoginChallenge(data)) throw new HttpError('invalid_json')
  return data
}

/**
 * Envía el código OTP a `POST /auth/verify` y devuelve el usuario autenticado.
 * Lanza `HttpError('invalid_json')` si la respuesta no cumple el contrato.
 */
export async function verify(req: VerifyRequest): Promise<User> {
  if (USE_MOCKS) return mockVerify(req)
  const data = await request('POST', '/auth/verify', req)
  if (!isVerifyResponse(data)) throw new HttpError('invalid_json')
  return data.user
}

/** Pide un nuevo código OTP para el reto indicado. Devuelve el teléfono de contacto actualizado. */
export async function resend(challengeId: string): Promise<{ phoneHint: string }> {
  if (USE_MOCKS) return mockResend()
  const data = await request('POST', '/auth/resend', { challengeId })
  if (typeof data !== 'object' || data === null || typeof (data as Record<string, unknown>).phoneHint !== 'string') {
    throw new HttpError('invalid_json')
  }
  return data as { phoneHint: string }
}

/**
 * Consulta la sesión activa en `GET /auth/me`. Devuelve `null` si no hay sesión (401)
 * o si el backend responde que no hay usuario.
 */
export async function me(): Promise<User | null> {
  if (USE_MOCKS) return mockMe()
  try {
    const data = await request('GET', '/auth/me')
    if (!isMeResponse(data)) throw new HttpError('invalid_json')
    return data.user
  } catch (err) {
    if (err instanceof HttpError && err.code === 'unauthorized') return null
    throw err
  }
}

/** Cierra la sesión en el backend (`POST /auth/logout`). No lanza si el usuario ya estaba deslogueado. */
export async function logout(): Promise<void> {
  if (USE_MOCKS) return mockLogout()
  await request('POST', '/auth/logout')
}
