import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface TopBarProps {
  title: string
  onOpenSidebar(): void
  themeToggle: ReactNode
}

/** Barra superior: botón para abrir el sidebar (visible solo cuando está cerrado), título de la vista y control de tema. */
export function TopBar({ title, onOpenSidebar, themeToggle }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-2 py-2 md:px-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="open-sidebar-btn items-center rounded-lg p-2 text-navy-700 hover:bg-navy-100 dark:text-navy-200 dark:hover:bg-navy-800"
          aria-label="Abrir barra lateral"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <h2 className="px-3 py-2 text-lg font-medium">{title}</h2>
      </div>
      {themeToggle}
    </header>
  )
}
