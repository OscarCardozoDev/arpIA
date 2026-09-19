import { useEffect, useState } from 'react'

/** Cuenta regresiva en segundos con reinicio manual (usada para el reenvío del OTP). */
export interface Countdown {
  secondsLeft: number
  restart: () => void
}

/**
 * Cuenta regresiva desde `initialSeconds` hasta 0. `restart()` la vuelve a poner
 * en `initialSeconds`. Limpia su temporizador al desmontar o al llegar a 0.
 */
export function useCountdown(initialSeconds: number): Countdown {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  return { secondsLeft, restart: () => setSecondsLeft(initialSeconds) }
}
