import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage, Conversation } from '../interfaces/conversation'
import { listConversations, titleFromText } from '../services/conversationService'

interface UseConversationsResult {
  conversations: Conversation[]
  activeId: string | null
  activeConversation: Conversation | null
  loading: boolean
  error: string | null
  /** Cambia la conversación activa. `null` significa "chat nuevo" (sin mensajes aún). */
  select(id: string | null): void
  /** Crea una conversación nueva a partir del primer mensaje, la activa y devuelve su id. */
  startConversation(firstText: string): string
  addMessage(conversationId: string, message: ChatMessage): void
  updateMessage(conversationId: string, messageId: string, patch: Partial<ChatMessage>): void
  /** Borra las conversaciones creadas en esta sesión (conserva las de ejemplo) y limpia la selección. */
  resetSession(): void
}

const genId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `c${Date.now()}-${Math.random().toString(36).slice(2)}`

/**
 * Administra el historial de conversaciones del chat: carga inicial, selección,
 * creación y edición de mensajes en memoria. No persiste nada por sí mismo.
 */
export function useConversations(): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const sampleIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    listConversations()
      .then((list) => {
        if (cancelled) return
        sampleIds.current = new Set(list.map((c) => c.id))
        setConversations(list)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar el historial de conversaciones.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const select = useCallback((id: string | null) => {
    setActiveId(id)
  }, [])

  const startConversation = useCallback((firstText: string): string => {
    const id = genId()
    const newConversation: Conversation = {
      id,
      title: titleFromText(firstText),
      createdAt: Date.now(),
      messages: [],
    }
    setConversations((prev) => [newConversation, ...prev])
    setActiveId(id)
    return id
  }, [])

  const addMessage = useCallback((conversationId: string, message: ChatMessage) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c)),
    )
  }, [])

  const updateMessage = useCallback((conversationId: string, messageId: string, patch: Partial<ChatMessage>) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)) }
          : c,
      ),
    )
  }, [])

  const resetSession = useCallback(() => {
    setConversations((prev) => prev.filter((c) => sampleIds.current.has(c.id)))
    setActiveId(null)
  }, [])

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  return {
    conversations,
    activeId,
    activeConversation,
    loading,
    error,
    select,
    startConversation,
    addMessage,
    updateMessage,
    resetSession,
  }
}
