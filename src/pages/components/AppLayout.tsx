import type { ReactNode } from 'react'

interface AppLayoutProps {
  sidebarOpen: boolean
  onCloseSidebar(): void
  sidebar: ReactNode
  topBar: ReactNode
  children: ReactNode
}

/**
 * Estructura compartida de la app: sidebar colapsable (con overlay en móvil),
 * barra superior y contenido principal. El estado de apertura lo controla
 * `useSidebar` desde fuera; este componente solo pinta el layout.
 */
export function AppLayout({ sidebarOpen, onCloseSidebar, sidebar, topBar, children }: AppLayoutProps) {
  return (
    <div className="app-shell flex h-dvh" data-sb={sidebarOpen ? 'open' : 'closed'}>
      {/* Fondo oscuro tras el sidebar en móvil (al tocarlo, se cierra) */}
      <div
        className="sidebar-overlay fixed inset-0 z-30 bg-black/60"
        onClick={onCloseSidebar}
        role="presentation"
      />

      <aside className="sidebar bg-navy-900 text-[#ececec]">{sidebar}</aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {topBar}
        {children}
      </main>
    </div>
  )
}
