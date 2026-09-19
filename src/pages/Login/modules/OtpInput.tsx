import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { OTP_LENGTH } from '../../../services/config'

interface OtpInputProps {
  /** Código actual, de longitud variable (casillas vacías no aportan caracteres). */
  value: string
  onChange: (value: string) => void
  /** Se llama con el código completo apenas se llenan las `OTP_LENGTH` casillas. */
  onComplete: (code: string) => void
  autoFocus?: boolean
}

/** Casillas individuales para el código OTP, con reparto de dígitos escritos o pegados. */
export function OtpInput({ value, onChange, onComplete, autoFocus }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus()
  }, [autoFocus])

  /** Reparte los dígitos de `raw` desde la casilla `from` y avanza el foco; envía al completarse. */
  function applyDigits(from: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    const chars = value.split('')
    if (!digits) {
      chars[from] = ''
      onChange(Array.from({ length: OTP_LENGTH }, (_, i) => chars[i] ?? '').join(''))
      return
    }
    const distributed = [...digits].slice(0, OTP_LENGTH - from)
    distributed.forEach((d, k) => {
      chars[from + k] = d
    })
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => chars[i] ?? '').join('')
    onChange(next)
    const nextIndex = Math.min(from + digits.length, OTP_LENGTH - 1)
    inputsRef.current[nextIndex]?.focus()
    if (next.length === OTP_LENGTH) onComplete(next)
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      const chars = value.split('')
      chars[i - 1] = ''
      onChange(Array.from({ length: OTP_LENGTH }, (_, k) => chars[k] ?? '').join(''))
      inputsRef.current[i - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputsRef.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus()
    }
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="Código de verificación">
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Dígito ${i + 1} de ${OTP_LENGTH}`}
          value={value[i] ?? ''}
          onChange={(e) => applyDigits(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => {
            e.preventDefault()
            applyDigits(i, e.clipboardData.getData('text'))
          }}
          className="h-12 w-full min-w-0 rounded-xl border border-navy-200 bg-navy-50 text-center text-xl font-semibold outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-300/60 dark:border-navy-700 dark:bg-navy-950 dark:focus:ring-navy-600"
        />
      ))}
    </div>
  )
}
