import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { LoginChallenge, User } from '../../../interfaces/auth'
import { validateOtp } from '../../../guards/authGuards'
import { verify, resend, authErrorMessage, isDemoMode } from '../../../services/authService'
import { HttpError } from '../../../services/httpClient'
import { OTP_LENGTH, OTP_RESEND_SECONDS } from '../../../services/config'
import { DEMO_CREDENTIALS } from '../../../example/auth.mock'
import { Icon } from '../../components/Icon'
import { useCountdown } from '../hooks/useCountdown'
import { OtpInput } from './OtpInput'

interface OtpStepProps {
  challenge: LoginChallenge
  autoFocus: boolean
  onLoggedIn: (user: User) => void
  onBack: () => void
  /** El backend bloqueó el reto (demasiados intentos): hay que volver al paso 1 con este mensaje. */
  onTooManyAttempts: (message: string) => void
}

interface StepMessage {
  text: string
  kind: 'error' | 'info'
}

/** Paso 2 del login: código OTP enviado por WhatsApp, con reenvío y contador. */
export function OtpStep({ challenge, autoFocus, onLoggedIn, onBack, onTooManyAttempts }: OtpStepProps) {
  const [code, setCode] = useState('')
  const [phoneHint, setPhoneHint] = useState(challenge.phoneHint)
  const [message, setMessage] = useState<StepMessage | null>(null)
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)
  const { secondsLeft, restart } = useCountdown(OTP_RESEND_SECONDS)

  /** Valida y envía el código a `POST /auth/verify`. Ignora envíos concurrentes. */
  async function submit(fullCode: string) {
    if (submittingRef.current) return
    const validationError = validateOtp(fullCode, OTP_LENGTH)
    if (validationError) {
      setMessage({ text: validationError, kind: 'error' })
      return
    }

    submittingRef.current = true
    setLoading(true)
    setMessage(null)
    try {
      const user = await verify({ challengeId: challenge.challengeId, code: fullCode })
      onLoggedIn(user)
    } catch (err) {
      if (err instanceof HttpError && err.code === 'too_many_attempts') {
        onTooManyAttempts(authErrorMessage(err))
      } else {
        setMessage({ text: authErrorMessage(err), kind: 'error' })
        setCode('')
      }
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await submit(code)
  }

  async function handleResend() {
    try {
      const r = await resend(challenge.challengeId)
      setPhoneHint(r.phoneHint)
      setMessage({ text: 'Enviamos un nuevo código a tu WhatsApp.', kind: 'info' })
      setCode('')
      restart()
    } catch (err) {
      setMessage({ text: authErrorMessage(err), kind: 'error' })
    }
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleFormSubmit}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-200">
          <Icon name="chat" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-semibold">Verificación en dos pasos</h2>
          <p className="mt-0.5 text-sm text-navy-600 dark:text-navy-300">
            Enviamos un código de 6 dígitos por WhatsApp al <strong className="whitespace-nowrap">{phoneHint}</strong>.
          </p>
        </div>
      </div>

      <OtpInput value={code} onChange={setCode} onComplete={submit} autoFocus={autoFocus} />

      {message && (
        <p
          role="alert"
          className={`text-sm ${message.kind === 'error' ? 'text-red-600 dark:text-red-400' : 'text-navy-600 dark:text-navy-300'}`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-navy-500 py-2.5 font-medium text-white transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-navy-400 dark:text-navy-950 dark:hover:bg-navy-300"
      >
        {loading ? 'Verificando…' : 'Verificar y entrar'}
      </button>

      {isDemoMode && (
        <p className="rounded-lg bg-navy-50 p-2.5 text-xs text-navy-700 dark:bg-navy-950 dark:text-navy-200">
          Modo demostración: el código es {DEMO_CREDENTIALS.code}. No se envía ningún WhatsApp real.
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-navy-600 hover:underline dark:text-navy-300">
          ← Volver
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={secondsLeft > 0}
          className="font-medium text-navy-600 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60 dark:text-navy-300"
        >
          {secondsLeft > 0 ? `Reenviar código (${secondsLeft}s)` : 'Reenviar código'}
        </button>
      </div>
    </form>
  )
}
