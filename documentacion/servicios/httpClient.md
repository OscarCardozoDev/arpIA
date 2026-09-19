# Servicio: httpClient

**Archivo:** `src/services/httpClient.ts`
**Endpoint:** cualquiera (cliente HTTP base, sin endpoint propio)

## Qué hace

Cliente HTTP único del frontend (regla 9 de `CLAUDE.md`). Ningún otro archivo
llama a `fetch` directamente: todos los servicios pasan por `request()`.
Por defecto usa `API_URL`, `REQUEST_TIMEOUT_MS` y `credentials: 'include'`
(cookies de sesión); un 4º parámetro opcional (`options`) permite
sobreescribir `baseUrl`, `timeoutMs` y `credentials` para una llamada puntual
(p. ej. `chatService` apunta a `AGENT_URL` con timeout de 120 s y sin
cookies porque el agente tiene CORS abierto `*`). Convierte cualquier fallo
en un `HttpError` con código estable, para que cada servicio decida el
mensaje al usuario. El header `Content-Type` siempre va como
`application/json; charset=utf-8`.

## Funciones exportadas

| Función | Entrada | Salida | Errores |
|---|---|---|---|
| `request(method, path, body?, options?)` | `'GET' \| 'POST'`, ruta relativa a la base, cuerpo opcional, `{ baseUrl?, timeoutMs?, credentials? }` opcional | `Promise<unknown>` (quien llama valida con un guard) | `HttpError` con código `network`, `timeout`, `invalid_json`, `unauthorized`, `server`, o el `error` que envíe el backend |

## Clases exportadas

- `HttpError extends Error` — `code: string`, `status?: number`.

## Dependencias (interfaces / guards)

Ninguna. Solo lee `API_URL` y `REQUEST_TIMEOUT_MS` de `src/services/config.ts`.

## Estados de UI que genera (loading / error / empty)

No genera estados de UI por sí mismo: cada servicio que lo usa (`authService`,
`chatService`, etc.) traduce el `HttpError` a un estado de error visible.
