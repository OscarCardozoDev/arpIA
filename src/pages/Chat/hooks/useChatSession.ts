import { useEffect, useRef, useState } from 'react'
import type { MascotState } from '../../components/Mascot'
import type { ChatMessage, Conversation } from '../../../interfaces/conversation'
import { chatErrorMessage, estadoMessage, isErrorResponse, sendQuestion } from '../services/chatService'
import { parseSources, validateQuestion } from '../guards/chatGuards'

const EMPTY_RESPONSE_MESSAGE = 'El asistente no devolvió contenido. Intenta reformular la pregunta.'

const STREAM_INTERVAL_MS = 22

interface UseChatSessionArgs {
  activeConversation: Conversation | null
  startConversation(firstText: string): string
  addMessage(conversationId: string, message: ChatMessage): void
  updateMessage(conversationId: string, messageId: string, patch: Partial<ChatMessage>): void
}

interface UseChatSessionResult {
  busy: boolean
  mascotState: MascotState
  error: string | null
  send(text: string, attachmentName?: string | null): Promise<void>
}

/**
 * Maneja el envío de preguntas del chat: valida, crea la conversación si hace
 * falta, agrega el mensaje del usuario y uno de IA en estado `pending`, llama
 * a `sendQuestion` y escribe la respuesta palabra por palabra. Devuelve el
 * estado de ocupado/mascota/error para que `ChatPage` los muestre.
 */
export function useChatSession({
  activeConversation,
  startConversation,
  addMessage,
  updateMessage,
}: UseChatSessionArgs): UseChatSessionResult {
  const [busy, setBusy] = useState(false)
  const [mascotState, setMascotState] = useState<MascotState>('idle')
  const [error, setError] = useState<string | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [])

  /** Escribe `text` en el mensaje `messageId` palabra por palabra, cada 22 ms, y ejecuta `done` al terminar. */
  function streamText(conversationId: string, messageId: string, text: string, done: () => void): void {
    const parts = text.split(/(\s+)/)
    let i = 0
    let shown = ''
    const tick = () => {
      if (i >= parts.length) {
        done()
        return
      }
      shown += parts[i++]
      updateMessage(conversationId, messageId, { text: shown })
      timers.current.push(setTimeout(tick, STREAM_INTERVAL_MS))
    }
    tick()
  }

  async function send(text: string, attachmentName?: string | null): Promise<void> {
    if (busy) return
    const validationError = validateQuestion(text)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)

    const conversationId = activeConversation?.id ?? startConversation(text)
    const shownText = [attachmentName && `📎 ${attachmentName}`, text].filter(Boolean).join('\n')
    addMessage(conversationId, { id: crypto.randomUUID(), role: 'user', text: shownText })

    const aiMessageId = crypto.randomUUID()
    addMessage(conversationId, { id: aiMessageId, role: 'ai', text: '', pending: true })

    setBusy(true)
    setMascotState('thinking')
    try {
      const res = await sendQuestion(text)
      setMascotState('talking')

      // Determina qué mostrar según el contrato §2.4: un error de agente llega
      // con HTTP 200 (`isErrorResponse`), y una respuesta ok puede venir vacía.
      const hasError = isErrorResponse(res)
      const displayText = hasError
        ? estadoMessage(res.metadata.estado)
        : res.respuesta.trim()
          ? res.respuesta
          : EMPTY_RESPONSE_MESSAGE
      const isError = hasError || !res.respuesta.trim()
      const sources = hasError ? [] : parseSources(res.evaluacion?.retrieval_context)

      streamText(conversationId, aiMessageId, displayText, () => {
        updateMessage(conversationId, aiMessageId, { pending: false, sources, isError })
        setMascotState(isError ? 'error' : 'idle')
        setBusy(false)
      })
    } catch (err) {
      updateMessage(conversationId, aiMessageId, {
        text: chatErrorMessage(err),
        isError: true,
        pending: false,
      })
      setMascotState('error')
      setBusy(false)
    }
  }

  return { busy, mascotState, error, send }
}
