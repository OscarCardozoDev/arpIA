# Datos de ejemplo (`src/example/`)

Simulan las respuestas de la API REST del backend para poder desarrollar y
probar la interfaz sin necesidad de tenerlo corriendo.

## Cómo se activan/desactivan

Hay dos interruptores independientes (ver `../services/config.ts`):

- `VITE_USE_MOCKS` (por defecto `true`): controla **solo el login** (`auth.mock.ts`).
  `false` llama al backend real de autenticación vía `httpClient`.
- `VITE_CHAT_MOCK` (por defecto `false`): controla **solo el chat** (`chat.mock.ts` y
  el historial de `conversationService`). `true` usa el mock; por defecto el chat
  consume el agente real (`AGENT_URL`) aunque `VITE_USE_MOCKS` esté activo.

## Credenciales demo

- Usuario: `demo`
- Contraseña: `demo1234`
- Código de verificación (WhatsApp simulado): `123456`
- 5 códigos incorrectos seguidos bloquean el reto (`too_many_attempts`).

## Probar el estado de error del chat

Con `VITE_CHAT_MOCK=true`, si la pregunta enviada al chat contiene la palabra
**"error"**, `chat.mock.ts` devuelve una respuesta simulada con
`metadata.estado: 'error_interno_modelo'`, para probar cómo se muestra ese
estado en la interfaz (HTTP 200 con error, según el contrato real).

Los `chunk_id` citados en las respuestas simuladas (`[DOC-xxxxxxxxxx-NN]`) son
ficticios y no corresponden a documentos reales del corpus.
