import { Icon } from './Icon'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle(): void
}

/** Botón que alterna entre tema claro y oscuro; muestra el sol en dark y la luna en light. */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-lg p-2 text-navy-700 hover:bg-navy-100 dark:text-navy-200 dark:hover:bg-navy-800"
      aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {theme === 'dark' ? <Icon name="sun" className="h-5 w-5" /> : <Icon name="moon" className="h-5 w-5" />}
    </button>
  )
}
