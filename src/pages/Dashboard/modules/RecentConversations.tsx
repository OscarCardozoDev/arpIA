import type { Conversation } from '../../../interfaces/conversation'

interface RecentConversationsProps {
  conversations: Conversation[]
  onOpenConversation(id: string): void
}

/** Lista de conversaciones recientes; muestra un estado vacío si no hay ninguna. */
export function RecentConversations({ conversations, onOpenConversation }: RecentConversationsProps) {
  if (conversations.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-navy-200 p-4 text-sm text-navy-600 dark:border-navy-700 dark:text-navy-300">
        Aún no tienes conversaciones. Abre arpIA para empezar una.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          type="button"
          onClick={() => onOpenConversation(conversation.id)}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-navy-200 px-4 py-3 text-left text-sm hover:bg-navy-50 dark:border-navy-800 dark:hover:bg-navy-900"
        >
          <span className="truncate">{conversation.title}</span>
          <span className="shrink-0 text-xs text-navy-600 dark:text-navy-300">
            {conversation.messages.length} mensajes
          </span>
        </button>
      ))}
    </div>
  )
}
