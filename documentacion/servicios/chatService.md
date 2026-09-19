# Servicio: chatService

**Archivo:** `src/pages/Chat/services/chatService.ts`
**Endpoint:** `POST {AGENT_URL}/chat` (contrato real, agente en producción)

## Qué hace

Envía la pregunta del usuario al agente real (o al mock, si `USE_CHAT_MOCK`)
y devuelve la respuesta tipada según el contrato real de `/chat`. Usa el
cliente HTTP único con `baseUrl: AGENT_URL`, `timeoutMs: CHAT_TIMEOUT_MS`
(120 s, porque la primera pregunta puede tardar por la carga de la base) y
`credentials: 'omit'` (el agente tiene CORS abierto `*`, que el navegador
bloquea con cookies). **No lanza** cuando `metadata.estado !== 'ok'`: el
backend responde siempre HTTP 200 con la mejor respuesta disponible aunque
haya fallado un agente o se haya bloqueado la pregunta, así que ese caso se
comunica con `isErrorResponse()` + `estadoMessage()`, no con una excepción.

## Funciones exportadas

| Función | Entrada | Salida | Errores |
|---|---|---|---|
| `sendQuestion(pregunta)` | `string` | `Promise<ChatResponse>` | `HttpError('network' \| 'timeout' \| 'invalid_json' \| ...)` ante fallo de transporte o respuesta que no cumple el contrato |
| `isErrorResponse(res)` | `ChatResponse` | `boolean` (`true` si `metadata.estado !== 'ok'`) | no lanza |
| `estadoMessage(estado)` | `string` (`metadata.estado`) | `string` amable en español según el prefijo/valor del estado (`bloqueado_seguridad`, `error_input_vacio`, `error_interno*`, genérico) | no lanza |
| `chatErrorMessage(err)` | `unknown` | `string` en español (red, timeout ≥2 min, respuesta inválida o genérico) | no lanza |

## Dependencias (interfaces / guards)

- `src/pages/Chat/interfaces/chat.ts`
- `src/pages/Chat/guards/chatGuards.ts` (`isChatResponse`)
- `src/services/httpClient.ts`, `src/services/config.ts` (`AGENT_URL`, `CHAT_TIMEOUT_MS`, `USE_CHAT_MOCK`)
- `src/example/chat.mock.ts` (solo si `USE_CHAT_MOCK`)

## Estados de UI que genera (loading / error / empty)

- **Error de transporte** → `chatErrorMessage()` tras capturar la excepción.
- **Error del modelo con HTTP 200** → `isErrorResponse()` + `estadoMessage(res.metadata.estado)` sobre la respuesta ya recibida; el texto degradado va en `respuesta`.
- No hay estado "vacío" propio: lo maneja la página con el historial de mensajes.
