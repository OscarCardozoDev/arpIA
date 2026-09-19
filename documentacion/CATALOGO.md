# Catálogo del frontend

**Punto de entrada para buscar código.** Lista todo lo que existe en
`src/pages/` con una descripción de una línea. Antes de abrir archivos o
crear algo nuevo, se consulta este catálogo (regla 1 de `../CLAUDE.md`).

Se actualiza en el mismo cambio en que se crea, renombra o elimina algo.
Formato de cada fila: nombre exportado · ruta · qué hace · doc detallada (si existe).

## App

| Componente | Ruta | Descripción |
|---|---|---|
| `App` | `src/App.tsx` | Raíz de la app: hooks compartidos, navegación por estado (`View`) sin router, y monta `AppLayout` con `Sidebar`/`TopBar` y la página activa; `ChatPage` queda siempre montada (oculta con `hidden`) mientras hay sesión |

## Páginas

| Página | Ruta | Descripción | Doc |
|---|---|---|---|
| Chat | `src/pages/Chat/` | Chat en lenguaje natural contra `POST /chat` | [chat.md](paginas/chat.md) |
| Dashboard | `src/pages/Dashboard/` | Resumen de actividad de la sesión (vista del template); el tablero NL `POST /dashboard/consultar` sigue pendiente | [dashboard.md](paginas/dashboard.md) |
| Login | `src/pages/Login/` | Login en dos pasos: credenciales + reCAPTCHA, luego OTP por WhatsApp | [login.md](paginas/login.md) |

## Componentes compartidos (`src/pages/components/`)

| Componente | Ruta | Descripción |
|---|---|---|
| Icon | `src/pages/components/Icon.tsx` | Icono SVG inline (24x24) según `IconName`; usa el mapa de `iconPaths.tsx` |
| iconPaths | `src/pages/components/iconPaths.tsx` | Mapa `IconName → JSX` con el contenido de cada icono (helper de `Icon`) |
| MascotLogo | `src/pages/components/MascotLogo.tsx` | Logo circular de la mascota (cara fija, sin animar), para login y la pantalla de carga (el sidebar usa `public/arpi_logo.png`) |
| Mascot | `src/pages/components/Mascot.tsx` | Mascota sobre la barra de entrada del chat (`idle`/`thinking`/`talking`/`error`): sprite "arpi esperando" en reposo, "arpi leyendo" mientras el agente responde, "arpi error" (sin loop) si el chat terminó en error; vía `SpriteAnimation`; salta al interactuar o al cambiar `hopSignal` |
| mascotSprite | `src/pages/components/mascotSprite.ts` | Sprite en mapa de caracteres, paleta y conversión a rectángulos (helper de `MascotLogo`) |
| AppLayout | `src/pages/components/AppLayout.tsx` | Estructura compartida: sidebar colapsable + overlay móvil, barra superior y contenido principal |
| Sidebar | `src/pages/components/Sidebar.tsx` | Contenido del sidebar: logo, navegación, herramientas de chat o aviso de login, y perfil |
| SidebarHistory | `src/pages/components/SidebarHistory.tsx` | Historial de conversaciones agrupado por fecha (`groupConversations`) y filtrado por título |
| UserProfile | `src/pages/components/UserProfile.tsx` | Pie del sidebar: avatar con iniciales, nombre/subtítulo y botón de cerrar sesión |
| TopBar | `src/pages/components/TopBar.tsx` | Barra superior: botón para abrir el sidebar, título de la vista y control de tema |
| ThemeToggle | `src/pages/components/ThemeToggle.tsx` | Botón sol/luna para alternar el tema claro/oscuro |
| SplashScreen | `src/pages/components/SplashScreen.tsx` | Pantalla de carga a pantalla completa mientras se verifica la sesión |
| SpriteAnimation | `src/pages/components/SpriteAnimation.tsx` | Anima una hoja de sprites (`SpriteSheet`) genérica escalada a `size` px; props `sheet`/`size`/`animate`/`className`/`label`; si `sheet.loop === false` reproduce una vez y se detiene en el último fotograma (usada por `Mascot`) |

**Estilos globales**: `src/index.css` — Tailwind v4 (`@theme`), tema de color `navy`, fuente
`Special Elite`, y las clases `.sidebar`/`.sidebar-overlay`/`.open-sidebar-btn`/`.app-shell[data-sb]`
(layout del sidebar) y `.pixelart`/`.px-*`/`.mascot[data-state]` (animación de la mascota).

## Compartido: services / interfaces / guards / hooks

Código de lógica reutilizable entre páginas (fuera de `src/pages/<Página>/`).

### Servicios (`src/services/`)

| Servicio | Ruta | Descripción | Doc |
|---|---|---|---|
| `request`, `HttpError` | `src/services/httpClient.ts` | Cliente HTTP único (fetch + timeout + errores tipados), con overrides opcionales de `baseUrl`/`timeoutMs`/`credentials`; ningún servicio llama a `fetch` por su cuenta | [httpClient.md](servicios/httpClient.md) |
| `login`, `verify`, `resend`, `me`, `logout`, `authErrorMessage`, `isDemoMode` | `src/services/authService.ts` | Autenticación (usuario/contraseña + reCAPTCHA + OTP por WhatsApp); usa mocks o backend real según `USE_MOCKS` | [authService.md](servicios/authService.md) |
| `listConversations`, `getSuggestions`, `groupConversations`, `titleFromText` | `src/services/conversationService.ts` | Historial de conversaciones y sugerencias iniciales; agrupación por fecha; `listConversations` usa mock solo si `USE_CHAT_MOCK` | [conversationService.md](servicios/conversationService.md) |
| `API_URL`, `USE_MOCKS`, `REQUEST_TIMEOUT_MS`, `AGENT_URL`, `CHAT_TIMEOUT_MS`, `USE_CHAT_MOCK`, `RECAPTCHA_SITE_KEY`, `OTP_LENGTH`, `OTP_RESEND_SECONDS` | `src/services/config.ts` | Configuración global leída de `import.meta.env`; `AGENT_URL`/`CHAT_TIMEOUT_MS`/`USE_CHAT_MOCK` controlan el chat real, `USE_MOCKS` solo el login | |

### Interfaces (`src/interfaces/`)

| Tipo | Ruta | Descripción |
|---|---|---|
| `IconName` | `src/interfaces/icon.ts` | Nombres de iconos disponibles en `<Icon />` |
| `User`, `LoginRequest`, `LoginChallenge`, `VerifyRequest`, `AuthErrorCode` | `src/interfaces/auth.ts` | Contrato de autenticación (`/auth/*`) |
| `MessageRole`, `ChatMessage`, `Conversation`, `ConversationGroup`, `Suggestion` | `src/interfaces/conversation.ts` | Modelos de conversación e historial del chat; `ChatMessage.sources` es `Source[]` (de `Chat/interfaces/chat.ts`) |

### Guards (`src/guards/`)

| Guard | Ruta | Descripción |
|---|---|---|
| `validateCredentials`, `validateOtp`, `isUser`, `isLoginChallenge`, `isVerifyResponse`, `isMeResponse` | `src/guards/authGuards.ts` | Validación de formularios de login/OTP y de las respuestas de `/auth/*` |

### Utils (`src/pages/utils/`)

| Utilidad | Ruta | Descripción |
|---|---|---|
| `SpriteSheet`, `gridFrames`, `getFrameStyle`, `publicAssetUrl` | `src/pages/utils/spriteSheet.ts` | Lógica genérica de hojas de sprites: orígenes de cuadrícula, estilo CSS de un fotograma escalado, URL pública de un asset; `SpriteSheet.loop` (opcional, `true` por defecto) marca si la animación se repite |
| `ARPI_READING`, `ARPI_WAITING`, `ARPI_ERROR` | `src/pages/utils/arpiSprites.ts` | `SpriteSheet` concretos de la mascota arpIA: "leyendo" (12 fotogramas, 8 fps), "esperando" (25 fotogramas, 6 fps) y "error" (16 fotogramas, 8 fps, `loop: false`) |

### Hooks (`src/hooks/`)

| Hook | Ruta | Descripción |
|---|---|---|
| `useAuth` | `src/hooks/useAuth.ts` | Sesión del usuario: consulta `authService.me()` al montar, `signIn`, `logout` |
| `useConversations` | `src/hooks/useConversations.ts` | Historial en memoria: carga, selección, creación y edición de mensajes |
| `useTheme` | `src/hooks/useTheme.ts` | Tema claro/oscuro (`dark` por defecto), aplica clase en `<html>` y persiste en `localStorage` |
| `useSidebar` | `src/hooks/useSidebar.ts` | Estado abierto/cerrado del sidebar; abierto en escritorio y cerrado en móvil, se ajusta al cruzar el breakpoint |

## Datos de ejemplo (`src/example/`)

Simulan la API REST cuando el mock correspondiente está activo (`VITE_USE_MOCKS`
para login, `VITE_CHAT_MOCK` para el chat; ver [README](../src/example/README.md)).

| Archivo | Descripción |
|---|---|
| `auth.mock.ts` | Login/OTP simulados (usuario `demo`/`demo1234`, código `123456`), sesión en `sessionStorage` |
| `chat.mock.ts` | `mockSendQuestion`: sigue el contrato real de `/chat` con respuestas simuladas sobre IA militar, LEO y LATAM; `evaluacion.retrieval_context` con líneas `- [DOC-...]` ficticias (ausente si no hay tema); "error" en la pregunta fuerza `metadata.estado: 'error_interno_modelo'` |
| `conversations.mock.ts` | `buildMockConversations`: 4 conversaciones de ejemplo sobre los 3 fenómenos del corpus |
| `suggestions.mock.ts` | `MOCK_SUGGESTIONS`: 4 sugerencias iniciales orientadas al corpus |

## Chat

### Módulos (diseño)

| Componente | Ruta | Descripción |
|---|---|---|
| `ChatPage` | `src/pages/Chat/ChatPage.tsx` | Página del chat: bienvenida/hilo, mascota y composer (ver `chat.md` para props) |
| `Welcome` | `src/pages/Chat/modules/Welcome.tsx` | Saludo + botones de sugerencias iniciales (`getSuggestions()`) |
| `MessageThread` | `src/pages/Chat/modules/MessageThread.tsx` | Lista de mensajes de la conversación activa |
| `UserMessage` | `src/pages/Chat/modules/UserMessage.tsx` | Burbuja derecha del mensaje del usuario |
| `AiMessage` | `src/pages/Chat/modules/AiMessage.tsx` | Mensaje de la IA: typing (con aviso de carga lenta tras 8 s), texto, copiar y evidencia (`sources`, cada una con badge de `id` + `text`) |
| `TypingDots` | `src/pages/Chat/modules/TypingDots.tsx` | Tres puntos animados "escribiendo…" |
| `Composer` | `src/pages/Chat/modules/Composer.tsx` | Barra de entrada: adjunto simulado, textarea autoajustable, voz simulada, envío |
| `AttachmentChip` | `src/pages/Chat/modules/AttachmentChip.tsx` | Chip del archivo adjunto simulado |

### Hooks

| Hook | Ruta | Descripción |
|---|---|---|
| `useChatSession` | `src/pages/Chat/hooks/useChatSession.ts` | Envía preguntas, gestiona mensajes `pending`, streaming de texto y `mascotState` (`thinking` al enviar, `talking` al recibir, `error` si la respuesta o la llamada fallan, `idle` en éxito); usa `estadoMessage`/`parseSources` para traducir errores del contrato y citas |

### Servicios

| Servicio | Ruta | Descripción | Doc |
|---|---|---|---|
| `sendQuestion`, `isErrorResponse`, `estadoMessage`, `chatErrorMessage` | `src/pages/Chat/services/chatService.ts` | Envía la pregunta a `POST {AGENT_URL}/chat` (o mock) y expone el estado de error del contrato real | [chatService.md](servicios/chatService.md) |

### Interfaces

| Tipo | Ruta | Descripción |
|---|---|---|
| `ChatRequest`, `TokenUsage`, `ChatResponse`, `Source` | `src/pages/Chat/interfaces/chat.ts` | Contrato real de `POST /chat` (siempre HTTP 200; `evaluacion` y sus campos son opcionales) y `Source` (fragmento citado ya parseado) |

### Guards

| Guard | Ruta | Descripción |
|---|---|---|
| `validateQuestion`, `isChatResponse`, `parseSources`, `MAX_QUESTION_LENGTH` | `src/pages/Chat/guards/chatGuards.ts` | Valida la pregunta del usuario (`MAX_QUESTION_LENGTH` = 4000, reutilizado como `maxLength` del textarea), la forma mínima tolerante de `ChatResponse` y `parseSources` extrae `{id, text}` de cada línea `- [chunk_id] fragmento` |

## Dashboard

### Página

| Componente | Ruta | Descripción | Doc |
|---|---|---|---|
| `DashboardPage` | `src/pages/Dashboard/DashboardPage.tsx` | Resumen de actividad de la sesión (saludo, stats, recientes, seguridad) | [dashboard.md](paginas/dashboard.md) |

### Módulos (diseño)

| Componente | Ruta | Descripción |
|---|---|---|
| `StatCard` | `src/pages/Dashboard/modules/StatCard.tsx` | Tarjeta visual de una estadística (`DashboardStat`) |
| `RecentConversations` | `src/pages/Dashboard/modules/RecentConversations.tsx` | Lista de conversaciones recientes con estado vacío |
| `SecurityCard` | `src/pages/Dashboard/modules/SecurityCard.tsx` | Tarjeta informativa con los mecanismos de seguridad de la sesión |

### Servicios

| Servicio | Ruta | Descripción |
|---|---|---|
| `computeStats`, `recentConversations`, `firstName` | `src/pages/Dashboard/services/dashboardStats.ts` | Cálculo puro de estadísticas y conversaciones recientes a partir de datos en memoria |

### Interfaces

| Tipo | Ruta | Descripción |
|---|---|---|
| `DashboardStat` | `src/pages/Dashboard/interfaces/dashboard.ts` | Estadística individual mostrada en una `StatCard` |

## Login

### Página

| Componente | Ruta | Descripción | Doc |
|---|---|---|---|
| `LoginPage` | `src/pages/Login/LoginPage.tsx` | Orquesta el paso de credenciales y el de OTP (ver `login.md` para props) | [login.md](paginas/login.md) |

### Módulos (diseño)

| Componente | Ruta | Descripción |
|---|---|---|
| `CredentialsStep` | `src/pages/Login/modules/CredentialsStep.tsx` | Paso 1: usuario, contraseña (mostrar/ocultar) y reCAPTCHA |
| `OtpStep` | `src/pages/Login/modules/OtpStep.tsx` | Paso 2: código OTP, mensaje de estado, reenvío con contador y volver |
| `OtpInput` | `src/pages/Login/modules/OtpInput.tsx` | `OTP_LENGTH` casillas controladas; reparte dígitos escritos o pegados y navega con flechas/Backspace |
| `RecaptchaWidget` | `src/pages/Login/modules/RecaptchaWidget.tsx` | Carga y renderiza reCAPTCHA v2 (`grecaptcha.render`), reinicio por `resetSignal` y modo demo sin conexión |

### Servicios

| Servicio | Ruta | Descripción | Doc |
|---|---|---|---|
| `loadRecaptcha` | `src/pages/Login/services/recaptchaLoader.ts` | Inserta el script de reCAPTCHA una sola vez (promesa compartida); rechaza a los 10s si no carga | [recaptchaLoader.md](servicios/recaptchaLoader.md) |

### Hooks

| Hook | Ruta | Descripción |
|---|---|---|
| `useCountdown` | `src/pages/Login/hooks/useCountdown.ts` | Cuenta regresiva en segundos con `restart()`, usada para el reenvío del OTP |

### Interfaces

| Tipo | Ruta | Descripción |
|---|---|---|
| `Grecaptcha`, `RecaptchaRenderOptions` | `src/pages/Login/interfaces/recaptcha.d.ts` | Tipos del API global `window.grecaptcha` usada por `RecaptchaWidget` |
