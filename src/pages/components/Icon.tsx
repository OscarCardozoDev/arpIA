import type { IconName } from '../../interfaces/icon'
import { iconPaths } from './iconPaths'

interface IconProps {
  name: IconName
  className?: string
}

/** Icono SVG inline (24x24, trazo actual) tomado del sprite del template arpIA. */
export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className ?? ''}`}
    >
      {iconPaths[name]}
    </svg>
  )
}
