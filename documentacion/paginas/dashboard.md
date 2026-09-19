# Página: Dashboard

**Ubicación:** `src/pages/Dashboard/`

## Propósito hoy

Vista de resumen de actividad de **la sesión actual**, migrada del template
(`chat-estilo-chatgpt.html`, `#viewDashboard` / `renderDashboard()`). No
consume ningún backend: toma el `User` y las `Conversation[]` que ya están en
memoria del navegador (mismos datos que usa el Chat) y calcula estadísticas
localmente.

Muestra:

- Saludo con el primer nombre del usuario y botón "Abrir arpIA" (`onOpenChat`).
- Tarjetas de estadísticas (`computeStats`): conversaciones, mensajes, preguntas
  propias y hora de inicio de sesión.
- Hasta 5 conversaciones recientes (`recentConversations`), con estado vacío si
  no hay ninguna.
- Tarjeta de seguridad informativa (verificación en dos pasos por WhatsApp,
  reCAPTCHA).

## Contrato con `App.tsx`

```ts
export interface DashboardPageProps {
  user: User
  conversations: Conversation[]
  onOpenConversation(id: string): void
  onOpenChat(): void
}
```

`App.tsx` decide de dónde vienen `user` y `conversations` (por ejemplo de
`useAuth`/`useConversations`) y qué hacer al navegar (`onOpenConversation`,
`onOpenChat`).

## Componentes (`modules/`)

| Componente | Descripción |
|---|---|
| `StatCard` | Tarjeta visual de una estadística |
| `RecentConversations` | Lista de conversaciones recientes o estado vacío |
| `SecurityCard` | Tarjeta con los mecanismos de seguridad de la sesión |

## Servicios (`services/`)

`dashboardStats.ts` — funciones puras, sin `fetch`: `computeStats`,
`recentConversations`, `firstName`.

## Pendiente

Esta vista **no es** el tablero controlado por lenguaje natural del reto
(`POST /dashboard/consultar`). Ese tablero sigue sin implementar; su diseño
está en `../../../ARQUITECTURA_SOLUCION.md` §5: arranca vacío con una caja de
instrucción en lenguaje natural, el agente de visualización decide qué
componente mostrar y con qué filtros, y un panel de evidencia muestra los
`doc_id`/`chunk_id` que sustentan cada dato.
