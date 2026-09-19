import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { LoginChallenge } from '../../../interfaces/auth'
import { validateCredentials } from '../../../guards/authGuards'
import { login, authErrorMessage, isDemoMode } from '../../../services/authService'
import { DEMO_CREDENTIALS } from '../../../example/auth.mock'
import { Icon } from '../../components/Icon'
import { RecaptchaWidget } from './RecaptchaWidget'

interface CredentialsStepProps {
  onSuccess: (challenge: LoginChallenge) => void
  autoFocus: boolean
}

/** Paso 1 del login: usuario, contraseña y reCAPTCHA. Al validar, entrega el reto de OTP al padre. */
export function CredentialsStep({ onSuccess, autoFocus }: CredentialsStepProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [resetSignal, setResetSignal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const usernameRef = useRef<HTMLInputElement | null>(null)

  const handleToken = useCallback((token: string) => setRecaptchaToken(token), [])

  useEffect(() => {
    if (autoFocus) usernameRef.current?.focus()
  }, [autoFocus])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const validationError = validateCredentials(username, password)
    if (validationError) {
      setError(validationError)
      return
    }
    if (!recaptchaToken) {
      setError('Confirma que no eres un robot.')
      return
    }

    setLoading(true)
    try {
      const challenge = await login({ username, password, recaptchaToken })
      setPassword('')
      onSuccess(challenge)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
      setRecaptchaToken('')
      setResetSignal((s) => s + 1)
    }
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit}>
      <h2 className="text-center text-lg">Iniciar sesión</h2>
      <label className="block text-sm font-medium">
        Usuario o correo
        <input
          ref={usernameRef}
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-navy-200 bg-navy-50 px-3.5 py-2.5 text-base font-normal outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-300/60 dark:border-navy-700 dark:bg-navy-950 dark:focus:ring-navy-600"
        />
      </label>
      <label className="block text-sm font-medium">
        Contraseña
        <span className="relative mt-1.5 block">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-navy-200 bg-navy-50 px-3.5 py-2.5 text-base font-normal outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-300/60 dark:border-navy-700 dark:bg-navy-950 dark:focus:ring-navy-600 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-1 my-auto flex h-9 w-9 items-center justify-center rounded-lg text-navy-500 hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-navy-800"
          >
            <Icon name={showPassword ? 'eyeoff' : 'eye'} className="h-5 w-5" />
          </button>
        </span>
      </label>

      <RecaptchaWidget onToken={handleToken} resetSignal={resetSignal} />

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-navy-500 py-2.5 font-medium text-white transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-navy-400 dark:text-navy-950 dark:hover:bg-navy-300"
      >
        {loading ? 'Verificando…' : 'Continuar'}
      </button>

      {isDemoMode && (
        <p className="rounded-lg bg-navy-50 p-2.5 text-xs text-navy-700 dark:bg-navy-950 dark:text-navy-200">
          Modo demostración: usuario &quot;{DEMO_CREDENTIALS.username}&quot; y contraseña &quot;
          {DEMO_CREDENTIALS.password}&quot;. No es seguro para producción.
        </p>
      )}
    </form>
  )
}
