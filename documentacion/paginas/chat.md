# Página: Chat

**Ubicación:** `src/pages/Chat/`
**Subdominio:** `frontagent.<equipo>…`
**Backend:** `POST /chat`

## Propósito

Interfaz de chat para que una persona le haga preguntas en lenguaje natural al
sistema multiagente sobre los tres fenómenos del corpus (IA militar, seguridad
espacial/LEO, dinámicas territoriales en LATAM).

## Contrato con el backend

La respuesta es un JSON único (sin streaming):

| Campo | Uso en el frontend |
|---|---|
| `respuesta` | Texto que se muestra al usuario |
| `evaluacion.retrieval_context` (opcional) | Líneas `- [chunk_id] fragmento` usadas como evidencia |
| `metadata.estado` | `"ok"` o código de error (`bloqueado_seguridad`, `error_input_vacio`, `error_interno_*`) — **un error llega con HTTP 200** |
| `metadata.latencia_ms`, `metadata.tokens` | Información de consumo (opcionales) |

## `ChatPage`

`src/pages/Chat/ChatPage.tsx` — página conectada por `App.tsx` (fuera del alcance de esta
página, ver props). Renderiza:

- `Welcome` si `activeConversation` es `null` o no tiene mensajes (pantalla de bienvenida
  con sugerencias de `getSuggestions()`).
- `MessageThread` si ya hay mensajes.
- Fila con `Mascot` (estado del hook `useChatSession`, `hopSignal` recibido por props; sobre la barra de
  entrada muestra el sprite "arpi esperando" (84 px) en reposo, "arpi leyendo" mientras
  `mascotState === 'thinking'`, o "arpi error" (sin loop, se queda en el último fotograma) cuando
  `mascotState === 'error'`; la fila se superpone `-mb-1.5` al `Composer` para que la mascota quede
  parada sobre la barra).
- Mensaje de error de validación (si lo hay) sobre el `Composer`.
- `Composer` (barra de entrada).

Props (`ChatPageProps`):

```ts
interface ChatPageProps {
  activeConversation: Conversation | null   // null = chat nuevo → pantalla de bienvenida
  startConversation(firstText: string): string   // crea la conversación, la activa, devuelve id
  addMessage(conversationId: string, message: ChatMessage): void
  updateMessage(conversationId: string, messageId: string, patch: Partial<ChatMessage>): void
  hopSignal: number   // al cambiar, la mascota salta
  autoFocus: boolean  // true en escritorio: enfoca el textarea al mostrar/cambiar de chat
}
```

El auto-scroll al fondo del contenedor de mensajes lo controla `ChatPage` (ref sobre el
`div` con `scroll-thin flex-1 overflow-y-auto`), reaccionando a la cantidad de mensajes y
al texto del último (cambia en cada palabra durante el streaming).

## Hook: `useChatSession`

`src/pages/Chat/hooks/useChatSession.ts` — orquesta el envío de una pregunta:

1. Valida con `validateQuestion`; si falla, expone el mensaje en `error` y no envía.
2. Si no hay conversación activa, la crea con `startConversation(text)`.
3. Agrega el mensaje del usuario (con el nombre del adjunto simulado antepuesto,
   `📎 nombre\n`, si lo hay) y un mensaje de IA con `pending: true` y texto vacío.
4. Pone la mascota en `thinking`, llama a `sendQuestion(text)` (solo el texto, sin el
   adjunto) y, con la respuesta, pasa a `talking` y decide qué mostrar según el contrato:
   - Si `isErrorResponse(res)` (`metadata.estado !== 'ok'`, HTTP 200): el texto que se
     escribe es `estadoMessage(res.metadata.estado)`, sin `sources`, `isError: true`.
   - Si `res.respuesta` viene vacía con `estado: 'ok'`: muestra un mensaje de estado
     vacío ("El asistente no devolvió contenido…"), también `isError: true`.
   - Si no, escribe `res.respuesta` y calcula `sources` con
     `parseSources(res.evaluacion?.retrieval_context)`.
   El texto elegido se escribe palabra por palabra (`updateMessage` cada 22 ms); al
   terminar marca `pending: false`, aplica `sources`/`isError`, y pone la mascota en
   `error` si `isError` fue `true`, o `idle` si no.
5. Si `sendQuestion` lanza (fallo de red/timeout/JSON inválido), el mensaje de IA se
   completa con `chatErrorMessage(err)` e `isError: true`, y la mascota pasa a `error`.
6. Los `setTimeout` del streaming se cancelan al desmontar.

```ts
function useChatSession(args: {
  activeConversation: Conversation | null
  startConversation(firstText: string): string
  addMessage(conversationId: string, message: ChatMessage): void
  updateMessage(conversationId: string, messageId: string, patch: Partial<ChatMessage>): void
}): {
  busy: boolean
  mascotState: MascotState
  error: string | null
  send(text: string, attachmentName?: string | null): Promise<void>
}
```

## Módulos (`src/pages/Chat/modules/`, puramente visuales)

| Componente | Descripción |
|---|---|
| `Welcome` | Saludo + sugerencias de `getSuggestions()` como botones; clic llama `onPick(text)` |
| `MessageThread` | Lista de mensajes (`UserMessage`/`AiMessage`), `aria-live="polite"` |
| `UserMessage` | Burbuja derecha con el texto del usuario |
| `AiMessage` | Icono `spark` + texto; `TypingDots` si está `pending` y vacío (con aviso "puede tardar hasta un par de minutos…" tras 8 s de espera); estilo de error si `isError`; botón copiar (con feedback de éxito/fallo) y desplegable "Ver evidencia (n)" con cada `source` como badge de `id` (si lo tiene) + `text`, si hay `sources` |
| `TypingDots` | Tres puntos `animate-bounce` (delays 0/150/300 ms) |
| `Composer` | Barra de entrada: adjuntar (simulado, `AttachmentChip`), textarea autoajustable (máx. 208 px, Enter envía/Shift+Enter salto), voz simulada (toggle visual), botón enviar; llama `onSend(text, attachmentName)` |
| `AttachmentChip` | Chip con el nombre del archivo adjunto simulado y botón para quitarlo |

## Servicios que usa

- `sendQuestion`, `isErrorResponse`, `estadoMessage`, `chatErrorMessage` de `src/pages/Chat/services/chatService.ts`.
- `getSuggestions` de `src/services/conversationService.ts`.

## Guards que usa

- `validateQuestion`, `parseSources` de `src/pages/Chat/guards/chatGuards.ts`.

## Cómo probar con mocks

Con `VITE_CHAT_MOCK=true`, `mockSendQuestion` (`src/example/chat.mock.ts`) responde según
palabras clave del corpus. **Si la pregunta contiene la palabra "error"**, fuerza
`metadata.estado: 'error_interno_modelo'` con una respuesta degradada — sirve para probar en la UI
el estilo de mensaje de error de `AiMessage` sin tocar el agente real. `VITE_USE_MOCKS` ya no
afecta al chat (solo al login).
