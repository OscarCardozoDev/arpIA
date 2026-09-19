import { useState } from 'react'
import type { LoginChallenge, User } from '../../interfaces/auth'
import { CredentialsStep } from './modules/CredentialsStep'
import { OtpStep } from './modules/OtpStep'

export interface LoginPageProps {
  /** Muestra el aviso "Inicia sesión para acceder a esa sección." (llegó redirigido desde una ruta protegida). */
  showNotice: boolean
  onLoggedIn(user: User): void
  /** `true` en escritorio: enfoca el campo de usuario (paso 1) o la primera casilla del OTP (paso 2). */
  autoFocus: boolean
}

type Step = 'credentials' | 'otp'

/** Página de login: paso de credenciales + reCAPTCHA y paso de verificación por WhatsApp (OTP). */
export function LoginPage({ showNotice, onLoggedIn, autoFocus }: LoginPageProps) {
  const [step, setStep] = useState<Step>('credentials')
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null)
  const [blockedNotice, setBlockedNotice] = useState<string | null>(null)

  function handleCredentialsSuccess(newChallenge: LoginChallenge) {
    setBlockedNotice(null)
    setChallenge(newChallenge)
    setStep('otp')
  }

  function handleBack() {
    setChallenge(null)
    setStep('credentials')
  }

  function handleTooManyAttempts(message: string) {
    setChallenge(null)
    setBlockedNotice(message)
    setStep('credentials')
  }

  return (
    <section className="scroll-thin flex flex-1 overflow-y-auto px-4 py-8">
      <div className="m-auto w-full max-w-sm">
        <div className="mb-6 text-center">
          <img src="/arpi_logo.png" alt="Logo de arpIA" className="mx-auto mb-3 h-24 w-24 object-contain" />
          <h1 className="text-3xl text-navy-800 dark:text-navy-50">arpIA</h1>
          <p className="mt-2 text-sm italic text-navy-600 dark:text-navy-300">
            Del aire al espacio, tu copiloto inteligente.
          </p>
        </div>

        {showNotice && (
          <p
            role="status"
            className="mb-4 rounded-xl bg-navy-100 px-3.5 py-2.5 text-sm text-navy-800 dark:bg-navy-800 dark:text-navy-100"
          >
            Inicia sesión para acceder a esa sección.
          </p>
        )}

        {blockedNotice && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-navy-100 px-3.5 py-2.5 text-sm text-navy-800 dark:bg-navy-800 dark:text-navy-100"
          >
            {blockedNotice}
          </p>
        )}

        {step === 'credentials' && <CredentialsStep onSuccess={handleCredentialsSuccess} autoFocus={autoFocus} />}
        {step === 'otp' && challenge && (
          <OtpStep
            challenge={challenge}
            autoFocus={autoFocus}
            onLoggedIn={onLoggedIn}
            onBack={handleBack}
            onTooManyAttempts={handleTooManyAttempts}
          />
        )}
      </div>
    </section>
  )
}
