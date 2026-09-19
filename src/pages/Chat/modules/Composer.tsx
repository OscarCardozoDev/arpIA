import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { Icon } from '../../components/Icon'
import { MAX_QUESTION_LENGTH } from '../guards/chatGuards'
import { AttachmentChip } from './AttachmentChip'

const MAX_TEXTAREA_HEIGHT_PX = 208

interface ComposerProps {
  busy: boolean
  autoFocus: boolean
  /** Cambia cada vez que se muestra o se cambia de chat, para reenfocar el textarea si `autoFocus`. */
  focusKey: string | number
  onSend(text: string, attachmentName: string | null): void
}

/** Barra de entrada del chat: adjunto simulado, textarea autoajustable, voz simulada y envío. */
export function Composer({ busy, autoFocus, focusKey, onSend }: ComposerProps) {
  const [text, setText] = useState('')
  const [attachmentName, setAttachmentName] = useState<string | null>(null)
  const [voiceOn, setVoiceOn] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function autosize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`
  }

  function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    onSend(trimmed, attachmentName)
    setText('')
    setAttachmentName(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    requestAnimationFrame(autosize)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setAttachmentName(file ? file.name : null)
  }

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus, focusKey])

  const sendDisabled = busy || !text.trim()

  return (
    <div className="px-3 pb-2 pt-1 md:px-4" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      <form
        className="mx-auto max-w-3xl"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <div className="rounded-[26px] bg-navy-50 px-2.5 py-2 transition-shadow focus-within:ring-2 focus-within:ring-navy-300/70 dark:bg-navy-900 dark:focus-within:ring-navy-600">
          {attachmentName && (
            <AttachmentChip name={attachmentName} onRemove={() => setAttachmentName(null)} />
          )}

          <div className="flex items-end gap-1">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Adjuntar archivo"
            >
              <Icon name="plus" className="h-5 w-5" />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              maxLength={MAX_QUESTION_LENGTH}
              value={text}
              placeholder={voiceOn ? 'Escuchando…' : 'Pregunta lo que quieras'}
              onChange={(e) => {
                setText(e.target.value)
                autosize()
              }}
              onKeyDown={handleKeyDown}
              className="scroll-thin max-h-52 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-base leading-6 outline-none placeholder:text-navy-500 dark:placeholder:text-navy-300"
            />

            <button
              type="button"
              onClick={() => setVoiceOn((v) => !v)}
              aria-pressed={voiceOn}
              aria-label="Modo voz"
              className={`mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${
                voiceOn ? 'animate-pulse bg-red-500/20 text-red-500' : ''
              }`}
            >
              <Icon name="mic" className="h-5 w-5" />
            </button>

            <button
              type="submit"
              disabled={sendDisabled}
              aria-label="Enviar mensaje"
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-500 text-white transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-navy-400 dark:text-navy-950 dark:hover:bg-navy-300"
            >
              <Icon name="send" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-navy-600 dark:text-navy-300">
        arpIA puede cometer errores. Verifica la información importante.
      </p>
    </div>
  )
}
