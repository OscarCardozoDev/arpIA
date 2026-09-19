# Servicio: conversationService

**Archivo:** `src/services/conversationService.ts`
**Endpoint:** ninguno propio en el backend real (ver nota abajo)

## Qué hace

Provee el historial de conversaciones y las sugerencias iniciales, más dos
funciones puras de apoyo (agrupar por fecha y derivar un título). El agente
real (contrato de `POST /chat`) **no tiene sesión ni historial**: por eso
`listConversations()` devuelve `[]` cuando `USE_CHAT_MOCK` es `false`; el
historial real vive en memoria del navegador vía `useConversations`.

## Funciones exportadas

| Función | Entrada | Salida | Errores |
|---|---|---|---|
| `listConversations()` | — | `Promise<Conversation[]>` (mock del chat: datos de ejemplo con delay; agente real: `[]`) | no lanza |
| `getSuggestions()` | — | `Suggestion[]` | no lanza |
| `groupConversations(list, now?)` | `Conversation[]`, timestamp opcional | `ConversationGroup[]` ("Hoy"/"Ayer"/"Últimos 7 días"/"Más antiguos", sin grupos vacíos, más recientes primero) | no lanza |
| `titleFromText(text)` | `string` | `string` (máx. 60 caracteres, una línea) | no lanza |

## Dependencias (interfaces / guards)

- `src/interfaces/conversation.ts`
- `src/example/conversations.mock.ts`, `src/example/suggestions.mock.ts`
- `src/services/config.ts`

## Estados de UI que genera (loading / error / empty)

No genera estados por sí mismo. `useConversations` usa esta función para
exponer `loading`/`error`/lista vacía al componente de historial.
