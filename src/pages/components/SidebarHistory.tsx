import type { Conversation } from '../../interfaces/conversation'
import { groupConversations } from '../../services/conversationService'

interface SidebarHistoryProps {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  activeId: string | null
  query: string
  onSelect(id: string): void
}

/** Historial de conversaciones agrupado por fecha, filtrado por título según `query`. */
export function SidebarHistory({ conversations, loading, error, activeId, query, onSelect }: SidebarHistoryProps) {
  if (loading) {
    return <p className="px-2.5 py-2 text-sm text-navy-300">Cargando historial…</p>
  }

  if (error) {
    return <p className="px-2.5 py-2 text-sm text-red-300">{error}</p>
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = normalizedQuery
    ? conversations.filter((c) => c.title.toLowerCase().includes(normalizedQuery))
    : conversations
  const groups = groupConversations(filtered)

  if (groups.length === 0) {
    return (
      <p className="px-2.5 py-2 text-sm text-navy-300">
        {normalizedQuery ? `Sin resultados para «${query.trim()}»` : 'Sin conversaciones'}
      </p>
    )
  }

  return (
    <nav className="scroll-thin mt-3 flex-1 overflow-y-auto px-2.5 pb-2" aria-label="Historial de chats">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="px-2.5 pb-1 pt-3 text-xs font-medium text-navy-300">{group.label}</div>
          {group.items.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelect(conversation.id)}
              aria-current={conversation.id === activeId ? 'page' : undefined}
              className={`block w-full truncate rounded-lg px-2.5 py-2 text-left text-sm hover:bg-navy-800 ${
                conversation.id === activeId ? 'bg-navy-800' : ''
              }`}
            >
              {conversation.title}
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}
