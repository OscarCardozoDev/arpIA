import type { User } from '../../../interfaces/auth'
import type { Conversation } from '../../../interfaces/conversation'
import type { DashboardStat } from '../interfaces/dashboard'

/**
 * Calcula las estadísticas de la sesión actual a partir del usuario y sus
 * conversaciones en memoria: total de conversaciones, mensajes, preguntas
 * propias y hora de inicio de sesión (o "—" si no hay fecha).
 */
export function computeStats(user: User, conversations: Conversation[]): DashboardStat[] {
  const totalMessages = conversations.reduce((n, c) => n + c.messages.length, 0)
  const ownQuestions = conversations.reduce(
    (n, c) => n + c.messages.filter((m) => m.role === 'user').length,
    0,
  )
  const since = user.since
    ? new Date(user.since).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    : '—'

  return [
    { label: 'Conversaciones', value: conversations.length },
    { label: 'Mensajes', value: totalMessages },
    { label: 'Tus preguntas', value: ownQuestions },
    { label: 'Sesión desde', value: since },
  ]
}

/** Devuelve hasta `limit` conversaciones, de la más reciente a la más antigua según `createdAt`. */
export function recentConversations(conversations: Conversation[], limit = 5): Conversation[] {
  return [...conversations].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit)
}

/** Extrae el primer nombre de un nombre completo (p. ej. "Ana María" → "Ana"). */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}
