import { useState } from 'react'
import type { View } from '../../interfaces/navigation'
import type { User } from '../../interfaces/auth'
import type { Conversation } from '../../interfaces/conversation'
import { Icon } from './Icon'
import { SidebarHistory } from './SidebarHistory'
import { UserProfile } from './UserProfile'

interface SidebarProps {
  user: User | null
  view: View
  onNavigate(view: View): void
  onSignIn(): void
  onClose(): void
  onNewChat(): void
  conversations: Conversation[]
  conversationsLoading: boolean
  conversationsError: string | null
  activeConversationId: string | null
  onSelectConversation(id: string): void
  onLogout(): void
}

/** Contenido del sidebar: logo, navegación principal, herramientas de chat (o aviso de inicio de sesión) y perfil. */
export function Sidebar({
  user,
  view,
  onNavigate,
  onSignIn,
  onClose,
  onNewChat,
  conversations,
  conversationsLoading,
  conversationsError,
  activeConversationId,
  onSelectConversation,
  onLogout,
}: SidebarProps) {
  const [query, setQuery] = useState('')

  return (
    <div className="flex h-full w-[260px] flex-col">
      <div className="flex items-center justify-between p-2.5">
        <img src="/arpi_logo.png" alt="Logo de arpIA" className="h-11 w-11 object-contain" />
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-navy-200 hover:bg-navy-800"
          aria-label="Cerrar barra lateral"
        >
          <Icon name="sidebar" className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-0.5 px-2.5" aria-label="Navegación principal">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          aria-current={view === 'dashboard' ? 'page' : undefined}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-navy-800 ${
            view === 'dashboard' ? 'bg-navy-800' : ''
          }`}
        >
          <Icon name="dashboard" className="h-[18px] w-[18px]" /> Dashboard
          {!user && <Icon name="lock" className="ml-auto h-4 w-4 text-navy-300" />}
        </button>
        <button
          type="button"
          onClick={() => onNavigate('chat')}
          aria-current={view === 'chat' ? 'page' : undefined}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-navy-800 ${
            view === 'chat' ? 'bg-navy-800' : ''
          }`}
        >
          <Icon name="spark" className="h-[18px] w-[18px]" /> arpIA
          {!user && <Icon name="lock" className="ml-auto h-4 w-4 text-navy-300" />}
        </button>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col">
        {!user && (
          <div className="mx-2.5 mt-4 rounded-xl border border-navy-700 bg-navy-800/60 p-3 text-sm">
            <p className="flex items-start gap-2 text-navy-100">
              <Icon name="lock" className="mt-0.5 h-4 w-4 text-navy-300" />
              <span>Inicia sesión para usar arpIA y ver tu Dashboard.</span>
            </p>
            <button
              type="button"
              onClick={onSignIn}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-navy-500 py-2 font-medium text-white hover:bg-navy-400"
            >
              <Icon name="login" className="h-4 w-4" /> Iniciar sesión
            </button>
          </div>
        )}

        {user && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mt-3 space-y-0.5 px-2.5">
              <button
                type="button"
                onClick={onNewChat}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-navy-800"
              >
                <Icon name="edit" className="h-[18px] w-[18px]" /> Nuevo chat
              </button>
              <label className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-navy-200 focus-within:bg-navy-800 hover:bg-navy-800">
                <Icon name="search" className="h-[18px] w-[18px]" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar chats"
                  className="w-full bg-transparent text-[#ececec] outline-none placeholder:text-navy-200"
                />
              </label>
            </div>

            <SidebarHistory
              conversations={conversations}
              loading={conversationsLoading}
              error={conversationsError}
              activeId={activeConversationId}
              query={query}
              onSelect={onSelectConversation}
            />
          </div>
        )}
      </div>

      <UserProfile user={user} onLogout={onLogout} />
    </div>
  )
}
