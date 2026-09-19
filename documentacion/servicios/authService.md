# Servicio: authService

**Archivo:** `src/services/authService.ts`
**Endpoints:** `POST /auth/login`, `POST /auth/verify`, `POST /auth/resend`, `GET /auth/me`, `POST /auth/logout`

## Qué hace

Autenticación con usuario/contraseña + reCAPTCHA v2 y verificación por código
de WhatsApp (OTP). Con `USE_MOCKS` activo (por defecto) delega en
`src/example/auth.mock.ts`; con el backend real usa `httpClient.request()`
contra las rutas de `/auth/*` y valida cada respuesta con los guards de
`src/guards/authGuards.ts` antes de devolverla.

## Funciones exportadas

| Función | Entrada | Salida | Errores |
|---|---|---|---|
| `login(req)` | `LoginRequest` | `Promise<LoginChallenge>` | `HttpError('invalid_credentials' \| 'captcha_failed' \| 'invalid_json' \| ...)` |
| `verify(req)` | `VerifyRequest` | `Promise<User>` | `HttpError('invalid_code' \| 'too_many_attempts' \| 'expired' \| 'invalid_json' \| ...)` |
| `resend(challengeId)` | `string` | `Promise<{ phoneHint: string }>` | `HttpError('invalid_json' \| 'rate_limited' \| ...)` |
| `me()` | — | `Promise<User \| null>` (`null` si no hay sesión, incluye 401) | `HttpError` si falla la red o el JSON |
| `logout()` | — | `Promise<void>` | `HttpError` si falla la red (el llamador, `useAuth`, limpia igual el estado local) |
| `authErrorMessage(err)` | `unknown` | `string` en español | — |

## Constantes exportadas

- `isDemoMode: boolean` — alias de `USE_MOCKS`, para mostrar la pista de modo demo en el login.

## Dependencias (interfaces / guards)

- `src/interfaces/auth.ts` (tipos)
- `src/guards/authGuards.ts` (`isLoginChallenge`, `isVerifyResponse`, `isMeResponse`)
- `src/services/httpClient.ts`, `src/services/config.ts`
- `src/example/auth.mock.ts` (solo si `USE_MOCKS`)

## Estados de UI que genera (loading / error / empty)

No genera estados por sí mismo; expone `authErrorMessage()` para que el
formulario de login/OTP muestre el mensaje de error correspondiente. `me()`
devolviendo `null` es el estado "sin sesión" (no un error).
