import { INK, WHITE, spriteToRects } from './mascotSprite'

interface MascotLogoProps {
  className?: string
}

const bodyRects = spriteToRects()

/** Logo circular de la mascota (cara fija, sin antena animada), usado en el login y el sidebar. */
export function MascotLogo({ className }: MascotLogoProps) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <circle cx={10} cy={10} r={9.75} fill="#e1e8f4" stroke="#7b96c9" strokeWidth={0.5} />
      <g shapeRendering="crispEdges" transform="translate(2 2.5)">
        {bodyRects.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />
        ))}
        <rect x={5} y={6} width={2} height={2} fill={INK} />
        <rect x={9} y={6} width={2} height={2} fill={INK} />
        <rect x={5} y={6} width={1} height={1} fill={WHITE} />
        <rect x={9} y={6} width={1} height={1} fill={WHITE} />
        <rect x={7} y={9} width={2} height={1} fill={INK} />
      </g>
    </svg>
  )
}
