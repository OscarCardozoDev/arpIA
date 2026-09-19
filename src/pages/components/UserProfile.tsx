import type { User } from '../../interfaces/auth'
import { Icon } from './Icon'

interface UserProfileProps {
  user: User | null
  onLogout(): void
}

/** Deriva las iniciales del nombre (máx. 2, mayúsculas) o "?" si no hay usuario. */
function initialsOf(user: User | null): string {
  if (!user) return '?'
  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return initials || '?'
}

/** Pie del sidebar: avatar con iniciales, nombre/subtítulo y botón de cerrar sesión (solo con sesión activa). */
export function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div className="border-t border-white/10 p-2.5">
      <div className="flex items-center gap-2.5 rounded-lg p-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-500 text-xs font-semibold">
          {initialsOf(user)}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm">{user ? user.name : 'Invitado'}</span>
          <span className="block truncate text-xs text-navy-200">
            {user ? user.username || 'Sesión iniciada' : 'Sin sesión iniciada'}
          </span>
        </span>
        {user ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg p-2 text-navy-200 hover:bg-navy-800"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <Icon name="logout" className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
