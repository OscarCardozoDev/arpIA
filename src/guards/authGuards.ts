import type { LoginChallenge, User } from '../interfaces/auth'

/** Valida usuario y contraseña no vacíos. Devuelve el mensaje de error en español, o `null` si son válidos. */
export function validateCredentials(username: string, password: string): string | null {
  if (!username.trim() || !password) return 'Ingresa tu usuario y tu contraseña.'
  return null
}

/** Valida que el código OTP tenga exactamente `length` dígitos numéricos. */
export function validateOtp(code: string, length: number): string | null {
  if (code.length < length) return `Ingresa los ${length} dígitos.`
  if (!/^\d+$/.test(code)) return 'El código solo puede contener números.'
  return null
}

/** Comprueba en tiempo de ejecución que `value` cumple la forma de `User`. */
export function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.name === 'string' && typeof v.username === 'string' && typeof v.since === 'number'
}

/** Comprueba en tiempo de ejecución que `value` cumple la forma de `LoginChallenge`. */
export function isLoginChallenge(value: unknown): value is LoginChallenge {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.challengeId === 'string' && typeof v.phoneHint === 'string'
}

/** Comprueba que `value` sea `{ user: User }` (respuesta de `POST /auth/verify`). */
export function isVerifyResponse(value: unknown): value is { user: User } {
  if (typeof value !== 'object' || value === null) return false
  return isUser((value as Record<string, unknown>).user)
}

/** Comprueba que `value` sea `{ user: User | null }` (respuesta de `GET /auth/me`). */
export function isMeResponse(value: unknown): value is { user: User | null } {
  if (typeof value !== 'object' || value === null) return false
  const user = (value as Record<string, unknown>).user
  return user === null || isUser(user)
}
