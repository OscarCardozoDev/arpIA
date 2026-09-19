import type { Conversation, ConversationGroup, Suggestion } from '../interfaces/conversation'
import { buildMockConversations } from '../example/conversations.mock'
import { MOCK_SUGGESTIONS } from '../example/suggestions.mock'
import { USE_CHAT_MOCK } from './config'

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Carga el historial de conversaciones. En modo mock del chat devuelve datos
 * de ejemplo con un pequeño retardo; con el agente real devuelve siempre `[]`,
 * porque el contrato de `POST /chat` (§2.4) no tiene sesión ni endpoint de
 * historial: cada conversación vive solo en memoria del navegador durante la
 * sesión.
 */
export async function listConversations(): Promise<Conversation[]> {
  if (!USE_CHAT_MOCK) return []
  await wait(300)
  return buildMockConversations()
}

/** Sugerencias de preguntas iniciales mostradas en la pantalla de bienvenida. */
export function getSuggestions(): Suggestion[] {
  return MOCK_SUGGESTIONS
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Agrupa conversaciones por fecha relativa a `now`, sin grupos vacíos, más recientes primero en cada uno. */
export function groupConversations(list: Conversation[], now: number = Date.now()): ConversationGroup[] {
  const startOfDay = (t: number): number => new Date(t).setHours(0, 0, 0, 0)
  const today = startOfDay(now)
  const yesterday = today - DAY_MS
  const sevenDaysAgo = today - 7 * DAY_MS

  const buckets: Record<string, Conversation[]> = {
    Hoy: [],
    Ayer: [],
    'Últimos 7 días': [],
    'Más antiguos': [],
  }

  for (const conversation of list) {
    const day = startOfDay(conversation.createdAt)
    if (day === today) buckets['Hoy'].push(conversation)
    else if (day === yesterday) buckets['Ayer'].push(conversation)
    else if (day >= sevenDaysAgo) buckets['Últimos 7 días'].push(conversation)
    else buckets['Más antiguos'].push(conversation)
  }

  return (['Hoy', 'Ayer', 'Últimos 7 días', 'Más antiguos'] as const)
    .map((label) => ({ label, items: [...buckets[label]].sort((a, b) => b.createdAt - a.createdAt) }))
    .filter((group) => group.items.length > 0)
}

/** Deriva un título corto (máx. 60 caracteres, una sola línea) a partir del primer mensaje. */
export function titleFromText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, 60)
}
