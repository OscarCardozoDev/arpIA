import { useEffect, useRef } from 'react'
import { SpriteAnimation } from './SpriteAnimation'
import { ARPI_ERROR, ARPI_READING, ARPI_WAITING } from '../utils/arpiSprites'

export type MascotState = 'idle' | 'thinking' | 'talking' | 'error'

interface MascotProps {
  state: MascotState
  /** Cambiar este valor (ej. incrementar un contador) hace saltar a la mascota. */
  hopSignal?: number
  className?: string
}

/**
 * Mascota sobre la barra de entrada: sprite "arpi leyendo" mientras el agente
 * responde (`state === 'thinking'`), "arpi error" cuando el chat terminó en
 * error (`state === 'error'`), o "arpi esperando" en reposo el resto del
 * tiempo. Salta al hacer clic, al presionar Enter/Espacio, o cuando cambia
 * `hopSignal` (reinicia `.px-hop` forzando un reflow).
 */
export function Mascot({ state, hopSignal, className }: MascotProps) {
  const hopRef = useRef<HTMLSpanElement>(null)
  const sheet = state === 'thinking' ? ARPI_READING : state === 'error' ? ARPI_ERROR : ARPI_WAITING
  const spriteKey = state === 'thinking' ? 'reading' : state === 'error' ? 'error' : 'waiting'
  const label = state === 'thinking' ? 'arpIA está leyendo…' : state === 'error' ? 'arpIA tuvo un error' : undefined

  const hop = () => {
    const el = hopRef.current
    if (!el) return
    el.style.animation = 'none'
    // Forzar reflow para que el navegador reinicie la animación aunque ya esté corriendo
    void el.getBoundingClientRect()
    el.style.animation = ''
  }

  useEffect(() => {
    if (hopSignal === undefined) return
    hop()
  }, [hopSignal])

  return (
    <span
      className={`mascot ml-6 shrink-0 cursor-pointer ${className ?? ''}`}
      data-state={state}
      role="img"
      tabIndex={0}
      aria-label="arpIA, la mascota. Haz clic para saludar."
      onClick={hop}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          hop()
        }
      }}
    >
      <span className="px-hop flex" ref={hopRef}>
        <SpriteAnimation key={spriteKey} sheet={sheet} size={84} label={label} />
      </span>
    </span>
  )
}
