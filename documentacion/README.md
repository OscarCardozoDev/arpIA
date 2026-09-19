# Documentación del frontend

Cómo funciona el frontend de USTACODE. Esta carpeta se mantiene al día con el
código (ver regla 3 de `../CLAUDE.md`).

## Índice

- **[Catálogo](CATALOGO.md)** — todo lo que existe en el código con una línea de descripción. Empezar aquí.
- [Páginas](paginas/)
  - [Chat](paginas/chat.md)
  - [Dashboard](paginas/dashboard.md)
  - [Login](paginas/login.md)
- [Servicios](servicios/README.md)

## Visión general

El frontend tiene dos páginas que se despliegan como sitios separados en Coolify
y hablan con el mismo backend:

| Página | Subdominio | Endpoint del backend | Estado |
|---|---|---|---|
| Chat | `frontagent.<equipo>…` | `POST /chat` | En desarrollo |
| Dashboard | `dashboard.<equipo>…` | `POST /dashboard/consultar` | Mock + datos reales del diagnóstico |
| Login | (sin subdominio propio) | `POST /auth/*` | Mock |

## Organización del código

`src/App.tsx` es la raíz: no usa router, navega por estado (`View = 'login' |
'dashboard' | 'chat'`) calculado a partir de la sesión (`useAuth`) y monta
`AppLayout` (sidebar + barra superior compartidos, ver Catálogo) con la
página activa como `children`.

Fuera de `src/pages/<Página>/` vive el código compartido entre páginas:

| Carpeta | Contenido |
|---|---|
| `src/services/` | Cliente HTTP único, autenticación y conversaciones/historial. |
| `src/interfaces/` | Tipos compartidos (`User`, `Conversation`, `View`, `IconName`, etc.). |
| `src/guards/` | Validación de formularios y respuestas de `/auth/*`. |
| `src/hooks/` | Hooks reutilizables (`useAuth`, `useConversations`, `useTheme`, `useSidebar`). |
| `src/pages/components/` | Componentes visuales compartidos (layout, sidebar, iconos, mascota). |
| `src/example/` | Datos y funciones mock que simulan la API cuando `VITE_USE_MOCKS` está activo. |

Cada página (`src/pages/<Página>/`) separa **diseño** de **lógica** en sus
propias subcarpetas:

| Carpeta | Responsabilidad |
|---|---|
| `modules/` | Diseño: componentes React y estilos. No hace llamadas HTTP. |
| `services/` | Lógica: comunicación con el backend y manejo de estado. |
| `interfaces/` | Tipos TypeScript propios de la página. |
| `guards/` | Validación de la entrada del usuario y de la respuesta del backend. |
| `hooks/` | Hooks propios de la página (si los tiene). |

No todas las páginas tienen las cinco subcarpetas: solo las que necesitan.

## Flujo general de una petición

```
Usuario escribe  →  modules/ (UI)
                 →  guards/ valida la entrada
                 →  services/ llama al backend (o al mock de src/example/ si VITE_USE_MOCKS está activo)
                 →  guards/ valida que la respuesta cumpla el contrato
                 →  modules/ renderiza la respuesta o el error
```

## Modo mock

Con `VITE_USE_MOCKS` activo, los servicios (`authService`, `conversationService`,
`chatService`) devuelven datos de `src/example/` en vez de llamar al backend
real, para poder probar la interfaz sin depender de él.
