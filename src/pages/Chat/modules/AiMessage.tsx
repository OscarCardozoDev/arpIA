import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'
import type { ChatMessage } from '../../../interfaces/conversation'
import { TypingDots } from './TypingDots'

const COPY_FEEDBACK_MS = 1200
const COPY_ERROR_MS = 1200
/** A partir de cuánto tiempo esperando se avisa que la primera consulta puede tardar (carga de la base). */
const SLOW_LOADING_HINT_MS = 8000

interface AiMessageProps {
  message: ChatMessage
}

/** Mensaje de la IA: icono a la izquierda, texto plano, acciones de copiar y evidencia. */
export function AiMessage({ message }: AiMessageProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [showSources, setShowSources] = useState(false)
  const [showSlowHint, setShowSlowHint] = useState(false)

  const isTyping = message.pending && message.text === ''
  const showActions = !message.pending

  // Si la respuesta tarda (p. ej. la primera pregunta, que carga la base), avisa tras 8 s.
  useEffect(() => {
    if (!isTyping) return undefined
    const timer = setTimeout(() => setShowSlowHint(true), SLOW_LOADING_HINT_MS)
    return () => {
      clearTimeout(timer)
      setShowSlowHint(false)
    }
  }, [isTyping])

  async function handleCopy() {
    let feedbackMs = COPY_FEEDBACK_MS
    try {
      await navigator.clipboard.writeText(message.text)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
      feedbackMs = COPY_ERROR_MS
    }
    setTimeout(() => setCopyState('idle'), feedbackMs)
  }

  return (
    <div className="rise flex gap-3">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-navy-500 dark:text-navy-300 ${
          message.isError ? 'border-red-300 text-red-500 dark:border-red-700 dark:text-red-400' : 'border-navy-200 dark:border-navy-700'
        }`}
      >
        <Icon name="spark" className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        {isTyping ? (
          <div>
            <TypingDots />
            {showSlowHint && (
              <p className="mt-1 text-xs text-navy-400 dark:text-navy-500">
                La primera consulta puede tardar hasta un par de minutos mientras se carga la base de
                conocimiento…
              </p>
            )}
          </div>
        ) : (
          <div
            className={`whitespace-pre-wrap break-words leading-7 ${
              message.isError ? 'text-red-600 dark:text-red-400' : ''
            }`}
          >
            {message.isError && <span className="mr-1 font-semibold">⚠ Error:</span>}
            {message.text}
          </div>
        )}

        {showActions && (
          <div className="mt-1 flex gap-1 text-navy-500 dark:text-navy-300">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg p-1.5 hover:bg-navy-100 dark:hover:bg-navy-800"
              aria-label="Copiar"
            >
              <Icon name={copyState === 'copied' ? 'check' : 'copy'} className="h-4 w-4" />
            </button>
            {copyState === 'failed' && <span className="self-center text-xs text-red-500">No se pudo copiar</span>}

            {message.sources && message.sources.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSources((v) => !v)}
                className="rounded-lg px-2 py-1 text-xs hover:bg-navy-100 dark:hover:bg-navy-800"
              >
                Ver evidencia ({message.sources.length})
              </button>
            )}
          </div>
        )}

        {showActions && showSources && message.sources && (
          <div className="mt-2 space-y-2">
            {message.sources.map((source, i) => (
              <div
                key={`${source.id}-${i}`}
                className="whitespace-pre-wrap break-words rounded-lg bg-navy-50 p-2 text-xs text-navy-700 dark:bg-navy-900 dark:text-navy-300"
              >
                {source.id && (
                  <span className="mb-1 mr-2 inline-block rounded bg-navy-200 px-1.5 py-0.5 font-mono text-[0.65rem] text-navy-700 dark:bg-navy-700 dark:text-navy-200">
                    {source.id}
                  </span>
                )}
                {source.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
