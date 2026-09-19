import { useEffect, useState } from 'react'
import { getFrameStyle, type SpriteSheet } from '../utils/spriteSheet'

interface SpriteAnimationProps {
  sheet: SpriteSheet
  size?: number
  className?: string
  /** Si es `false`, la animación se detiene y se muestra el primer fotograma (el último si `sheet.loop === false`). Por defecto `true`. */
  animate?: boolean
  /** Si se pasa, agrega `role="status"` + `aria-label` mientras la animación corre. */
  label?: string
}

/**
 * Muestra y anima una hoja de sprites (`SpriteSheet`) genérica, escalada a `size` px de alto.
 * Si `sheet.loop` es `false`, reproduce una sola vez y se detiene en el último fotograma
 * (limpia el intervalo al llegar, no queda corriendo indefinidamente).
 */
export function SpriteAnimation({ sheet, size = 56, className = '', animate = true, label }: SpriteAnimationProps) {
  const [frameIndex, setFrameIndex] = useState(0)
  const scale = size / sheet.frameHeight
  const isAnimating = animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const loop = sheet.loop !== false
  const lastFrameIndex = sheet.frames.length - 1

  useEffect(() => {
    if (!isAnimating) return

    const intervalId = setInterval(() => {
      setFrameIndex((i) => {
        const next = i + 1
        if (!loop && next >= sheet.frames.length) {
          clearInterval(intervalId)
          return lastFrameIndex
        }
        return next
      })
    }, 1000 / sheet.fps)

    return () => clearInterval(intervalId)
  }, [isAnimating, sheet.fps, sheet.frames.length, loop, lastFrameIndex])

  // Fotograma mostrado cuando no anima: el último si es una secuencia sin loop
  // (estado final significativo), el primero en cualquier otro caso. Derivado,
  // sin setState en el efecto.
  const displayFrameIndex = isAnimating ? frameIndex : loop ? 0 : lastFrameIndex

  return (
    <span
      className={className}
      style={{
        display: 'block',
        width: sheet.frameWidth * scale,
        height: sheet.frameHeight * scale,
        backgroundImage: `url(${sheet.src})`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        ...getFrameStyle(sheet, displayFrameIndex, scale),
      }}
      {...(isAnimating && label ? { role: 'status', 'aria-label': label } : {})}
    />
  )
}
