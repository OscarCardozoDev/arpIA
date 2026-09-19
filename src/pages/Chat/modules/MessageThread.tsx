import type { ChatMessage } from '../../../interfaces/conversation'
import { AiMessage } from './AiMessage'
import { UserMessage } from './UserMessage'

interface MessageThreadProps {
  messages: ChatMessage[]
}

/** Lista de mensajes de la conversación activa. El auto-scroll lo controla `ChatPage`. */
export function MessageThread({ messages }: MessageThreadProps) {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6" aria-live="polite">
      {messages.map((m) => (m.role === 'user' ? <UserMessage key={m.id} text={m.text} /> : <AiMessage key={m.id} message={m} />))}
    </section>
  )
}
