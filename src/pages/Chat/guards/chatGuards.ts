import type { ChatResponse, Source, TokenUsage } from '../interfaces/chat'

export const MAX_QUESTION_LENGTH = 4000

/** Valida la pregunta del usuario antes de enviarla. Devuelve el mensaje de error, o `null` si es válida. */
export function validateQuestion(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return 'Escribe una pregunta antes de enviar.'
  if (trimmed.length > MAX_QUESTION_LENGTH) return `La pregunta no puede superar los ${MAX_QUESTION_LENGTH} caracteres.`
  return null
}

function isTokenUsage(value: unknown): value is TokenUsage {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.input === 'number' && typeof v.output === 'number' && typeof v.total === 'number'
}

/**
 * Comprueba en tiempo de ejecución que `data` cumple el contrato mínimo de
 * `ChatResponse`: exige `respuesta` y `metadata.estado`; el resto de campos
 * (opcionales en el contrato) se valida solo si están presentes.
 */
export function isChatResponse(data: unknown): data is ChatResponse {
  if (typeof data !== 'object' || data === null) return false
  const v = data as Record<string, unknown>
  if (typeof v.respuesta !== 'string') return false

  if (v.evaluacion !== undefined) {
    if (typeof v.evaluacion !== 'object' || v.evaluacion === null) return false
    const e = v.evaluacion as Record<string, unknown>
    if (e.input !== undefined && typeof e.input !== 'string') return false
    if (e.actual_output !== undefined && typeof e.actual_output !== 'string') return false
    if (e.retrieval_context !== undefined) {
      if (!Array.isArray(e.retrieval_context) || !e.retrieval_context.every((x) => typeof x === 'string')) return false
    }
    if (e.tools_called !== undefined && !Array.isArray(e.tools_called)) return false
  }

  const metadata = v.metadata
  if (typeof metadata !== 'object' || metadata === null) return false
  const m = metadata as Record<string, unknown>
  if (typeof m.estado !== 'string') return false
  if (m.num_interacciones !== undefined && typeof m.num_interacciones !== 'number') return false
  if (m.agentes_invocados !== undefined) {
    if (!Array.isArray(m.agentes_invocados) || !m.agentes_invocados.every((x) => typeof x === 'string')) return false
  }
  if (m.tokens !== undefined && !isTokenUsage(m.tokens)) return false
  if (m.latencia_ms !== undefined && typeof m.latencia_ms !== 'number') return false

  return true
}

const SOURCE_LINE = /^-?\s*\[([^\]]*)\]\s*(.*)$/

/**
 * Extrae `{ id, text }` de cada línea `- [chunk_id] fragmento` de
 * `retrieval_context`. Si una línea no cumple el formato, `id` queda vacío y
 * `text` es la línea recortada. Devuelve `[]` si `lines` es `undefined`.
 */
export function parseSources(lines: string[] | undefined): Source[] {
  if (!lines) return []
  return lines.map((line) => {
    const match = SOURCE_LINE.exec(line.trim())
    if (!match) return { id: '', text: line.trim() }
    return { id: match[1].trim(), text: match[2].trim() }
  })
}
