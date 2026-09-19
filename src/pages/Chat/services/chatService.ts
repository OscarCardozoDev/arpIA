import type { ChatResponse } from '../interfaces/chat'
import { isChatResponse } from '../guards/chatGuards'
import { mockSendQuestion } from '../../../example/chat.mock'
import { HttpError, request } from '../../../services/httpClient'
import { AGENT_URL, CHAT_TIMEOUT_MS, USE_CHAT_MOCK } from '../../../services/config'

/**
 * Envía la pregunta a `POST {AGENT_URL}/chat` y devuelve la respuesta tipada.
 * No lanza cuando `metadata.estado !== 'ok'`: el backend responde 200 con la
 * mejor respuesta disponible y el estado de error (contrato §2.4). Lanza
 * `HttpError` ante fallo de red/timeout o si la respuesta no cumple el
 * contrato. El CORS del agente es abierto (`*`), por eso la llamada va sin
 * cookies (`credentials: 'omit'`).
 */
export async function sendQuestion(pregunta: string): Promise<ChatResponse> {
  if (USE_CHAT_MOCK) return mockSendQuestion(pregunta)
  const data = await request(
    'POST',
    '/chat',
    { pregunta },
    { baseUrl: AGENT_URL, timeoutMs: CHAT_TIMEOUT_MS, credentials: 'omit' },
  )
  if (!isChatResponse(data)) throw new HttpError('invalid_json')
  return data
}

/** Indica si la respuesta representa un estado de error del backend (HTTP 200 con `estado !== 'ok'`). */
export function isErrorResponse(res: ChatResponse): boolean {
  return res.metadata.estado !== 'ok'
}

/** Traduce `metadata.estado` (cuando no es `'ok'`) a un mensaje amable en español para el usuario. */
export function estadoMessage(estado: string): string {
  if (estado === 'bloqueado_seguridad') {
    return 'No puedo responder esa solicitud porque infringe las políticas de seguridad del asistente. Intenta reformular la pregunta.'
  }
  if (estado === 'error_input_vacio') {
    return 'La pregunta llegó vacía. Escribe tu pregunta e inténtalo de nuevo.'
  }
  if (estado.startsWith('error_interno')) {
    return 'El asistente tuvo un problema interno al procesar tu pregunta. Inténtalo de nuevo en unos segundos.'
  }
  return 'El asistente no pudo procesar tu pregunta correctamente. Inténtalo de nuevo.'
}

/** Traduce un error de la llamada al chat (red, timeout, respuesta inválida) a un mensaje en español. */
export function chatErrorMessage(err: unknown): string {
  if (err instanceof HttpError) {
    switch (err.code) {
      case 'network':
        return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
      case 'timeout':
        return 'El asistente tardó más de 2 minutos en responder (la primera consulta puede tardar porque carga la base). Inténtalo de nuevo.'
      case 'invalid_json':
        return 'Recibimos una respuesta inesperada del servidor.'
      case 'unauthorized':
        return 'Tu sesión expiró. Inicia sesión de nuevo.'
      default:
        return 'Ocurrió un error al consultar al asistente. Inténtalo de nuevo.'
    }
  }
  return 'Ocurrió un error al consultar al asistente. Inténtalo de nuevo.'
}
