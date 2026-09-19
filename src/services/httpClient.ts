import { API_URL, REQUEST_TIMEOUT_MS } from './config'

/** Error tipado de red/HTTP. `code` identifica la causa; `status` es el HTTP status si lo hubo. */
export class HttpError extends Error {
  code: string
  status?: number

  constructor(code: string, status?: number) {
    super(code)
    this.code = code
    this.status = status
  }
}

/** Opciones para sobreescribir el destino/timeout/credenciales de una llamada puntual. */
interface RequestOptions {
  /** Base a anteponer a `path` en vez de `API_URL` (p. ej. para llamar a otro backend). */
  baseUrl?: string
  /** Timeout en ms en vez de `REQUEST_TIMEOUT_MS`. */
  timeoutMs?: number
  /** Modo de credenciales del `fetch` en vez de `'include'` (p. ej. `'omit'` con CORS abierto `*`). */
  credentials?: RequestCredentials
}

/**
 * Cliente HTTP único del frontend (regla 9): ningún servicio llama a `fetch`
 * directamente. Aplica timeout, cookies de sesión y convierte cualquier
 * fallo en un `HttpError` con código estable. `options` permite apuntar a
 * otra base (p. ej. el agente real), otro timeout u otro modo de credenciales
 * sin crear un segundo cliente; por defecto usa `API_URL`, `REQUEST_TIMEOUT_MS`
 * e `'include'`, igual que antes.
 *
 * Códigos posibles: `network`, `timeout`, `invalid_json`, `unauthorized`,
 * `server`, o el valor de `data.error` si el backend lo envía como string.
 */
export async function request(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<unknown> {
  const baseUrl = options?.baseUrl ?? API_URL
  const timeoutMs = options?.timeoutMs ?? REQUEST_TIMEOUT_MS
  const credentials = options?.credentials ?? 'include'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(baseUrl + path, {
      method,
      credentials,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new HttpError('timeout')
    }
    throw new HttpError('network')
  } finally {
    clearTimeout(timer)
  }

  if (res.status === 204) return {}

  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new HttpError('invalid_json', res.status)
  }

  if (!res.ok) {
    const errorField = typeof data === 'object' && data !== null ? (data as Record<string, unknown>).error : undefined
    const code = typeof errorField === 'string' ? errorField : res.status === 401 ? 'unauthorized' : 'server'
    throw new HttpError(code, res.status)
  }

  return data
}
