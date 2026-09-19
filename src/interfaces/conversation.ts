import type { IconName } from './icon'
import type { Source } from '../pages/Chat/interfaces/chat'

/** Quién escribió un mensaje del chat. */
export type MessageRole = 'user' | 'ai'

/** Mensaje individual de una conversación. */
export interface ChatMessage {
  id: string
  role: MessageRole
  text: string
  /** `true` si el mensaje representa un error mostrado al usuario. */
  isError?: boolean
  /** Citas/fragmentos ya parseados de `evaluacion.retrieval_context` que sustentan la respuesta. */
  sources?: Source[]
  /** `true` mientras se espera o se escribe la respuesta (mensaje aún incompleto). */
  pending?: boolean
}

/** Conversación completa del historial. */
export interface Conversation {
  id: string
  title: string
  createdAt: number
  messages: ChatMessage[]
}

/** Grupo de conversaciones para el historial ("Hoy", "Ayer", etc.). */
export interface ConversationGroup {
  label: string
  items: Conversation[]
}

/** Sugerencia de pregunta inicial mostrada en la pantalla de bienvenida. */
export interface Suggestion {
  icon: IconName
  text: string
}
