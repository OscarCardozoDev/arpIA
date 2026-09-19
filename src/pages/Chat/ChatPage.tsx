import { useEffect, useRef } from 'react'
import { Mascot } from '../components/Mascot'
import type { ChatMessage, Conversation } from '../../interfaces/conversation'
import { useChatSession } from './hooks/useChatSession'
import { Welcome } from './modules/Welcome'
import { MessageThread } from './modules/MessageThread'
import { Composer } from './modules/Composer'

export interface ChatPageProps {
  activeConversation: Conversation | null
  startConversation(firstText: string): string
  addMessage(conversationId: string, message: ChatMessage): void
  updateMessage(conversationId: string, messageId: string, patch: Partial<ChatMessage>): void
  hopSignal: number
  autoFocus: boolean
}

/** Página del chat: bienvenida o hilo de mensajes, mascota y barra de entrada. */
export function ChatPage({
  activeConversation,
  startConversation,
  addMessage,
  updateMessage,
  hopSignal,
  autoFocus,
}: ChatPageProps) {
  const { busy, mascotState, error, send } = useChatSession({
    activeConversation,
    startConversation,
    addMessage,
    updateMessage,
  })
  const scrollerRef = useRef<HTMLDivElement>(null)

  const messages = activeConversation?.messages ?? []
  const lastMessage = messages[messages.length - 1]

  // Auto-scroll al fondo cuando cambia la cantidad de mensajes o el texto en streaming del último.
  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, lastMessage?.text])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollerRef} className="scroll-thin flex-1 overflow-y-auto">
        {messages.length === 0 ? <Welcome onPick={(text) => void send(text)} /> : <MessageThread messages={messages} />}
      </div>

      {/* -mb-1.5 cancela el pt-1 del Composer y hunde 2px los pies en la barra: la mascota queda "parada" sobre ella. */}
      <div className="relative z-10 -mb-1.5 px-3 md:px-4">
        <div className="mx-auto flex max-w-3xl items-end">
          <Mascot state={mascotState} hopSignal={hopSignal} />
        </div>
      </div>

      {error && (
        <p className="mx-auto mt-1 max-w-3xl px-4 text-center text-xs text-red-500" role="alert">
          {error}
        </p>
      )}

      <Composer
        busy={busy}
        autoFocus={autoFocus}
        focusKey={activeConversation?.id ?? 'new'}
        onSend={(text, attachmentName) => void send(text, attachmentName)}
      />
    </div>
  )
}
