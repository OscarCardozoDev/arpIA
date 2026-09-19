import { HttpError } from '../services/httpClient'
import type { LoginChallenge, LoginRequest, User, VerifyRequest } from '../interfaces/auth'

/** Credenciales de la cuenta demo, para mostrar la pista en el login. */
export const DEMO_CREDENTIALS = {
  username: 'demo',
  password: 'demo1234',
  code: '123456',
  name: 'Usuario Demo',
  phone: '+57 ••• ••• 4567',
}

const demoState = { attempts: 0 }
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** Persistencia de la sesión demo en `sessionStorage` (se pierde al cerrar la pestaña). */
const demoSession = {
  load(): User | null {
    try {
      const raw = sessionStorage.getItem('arpia_demo_user')
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      // sessionStorage puede no estar disponible (modo privado, iframes restringidos): sin sesión.
      return null
    }
  },
  save(user: User): void {
    try {
      sessionStorage.setItem('arpia_demo_user', JSON.stringify(user))
    } catch {
      console.warn('No se pudo persistir la sesión demo en sessionStorage.')
    }
  },
  clear(): void {
    try {
      sessionStorage.removeItem('arpia_demo_user')
    } catch {
      console.warn('No se pudo limpiar la sesión demo de sessionStorage.')
    }
  },
}

/** Simula `POST /auth/login`: valida credenciales y reCAPTCHA, devuelve el reto de OTP. */
export async function mockLogin({ username, password, recaptchaToken }: LoginRequest): Promise<LoginChallenge> {
  await wait(700)
  if (!recaptchaToken) throw new HttpError('captcha_failed')
  if (username.toLowerCase() !== DEMO_CREDENTIALS.username || password !== DEMO_CREDENTIALS.password) {
    throw new HttpError('invalid_credentials')
  }
  demoState.attempts = 0
  return { challengeId: 'demo-challenge', phoneHint: DEMO_CREDENTIALS.phone }
}

/** Simula `POST /auth/verify`: valida el código OTP (5 intentos fallidos bloquean el reto). */
export async function mockVerify({ code }: VerifyRequest): Promise<User> {
  await wait(600)
  if (code !== DEMO_CREDENTIALS.code) {
    demoState.attempts += 1
    throw new HttpError(demoState.attempts >= 5 ? 'too_many_attempts' : 'invalid_code')
  }
  const user: User = { name: DEMO_CREDENTIALS.name, username: DEMO_CREDENTIALS.username, since: Date.now() }
  demoSession.save(user)
  return user
}

/** Simula `POST /auth/resend`: reenvía el mismo teléfono de contacto. */
export async function mockResend(): Promise<{ phoneHint: string }> {
  await wait(500)
  return { phoneHint: DEMO_CREDENTIALS.phone }
}

/** Simula `GET /auth/me`: devuelve el usuario si hay sesión demo activa. */
export async function mockMe(): Promise<User | null> {
  return demoSession.load()
}

/** Simula `POST /auth/logout`: borra la sesión demo. */
export async function mockLogout(): Promise<void> {
  demoSession.clear()
}
