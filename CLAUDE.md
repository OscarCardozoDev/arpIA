# CLAUDE.md — Frontend USTACODE (CodeFest Ad Astra 2026)

Instrucciones para trabajar dentro de `frontend/`. Complementa el `CLAUDE.md`
de la raíz (contexto del equipo y del reto), no lo reemplaza.

## Contexto rápido

- Dos interfaces sobre el mismo backend (FastAPI + agentes):
  - **Chat** → `frontagent.<equipo>…` → consume `POST /chat`.
  - **Dashboard** → `dashboard.<equipo>…` → consume `POST /dashboard/consultar`.
- Por ahora **solo se trabaja el Chat**. No tocar `Dashboard/` salvo instrucción explícita.
- Arquitectura completa del sistema: `../ARQUITECTURA_SOLUCION.md` y `../arquitectura.excalidraw`.
- El contrato de respuesta de `POST /chat` es **duro** (§2.4): JSON único con
  `respuesta`, `evaluacion` y `metadata`, sin streaming. Un error del backend
  llega como HTTP 200 con `metadata.estado !== "ok"` — hay que manejarlo así.

## Stack y comandos

React 19 · Vite 8 · TypeScript 6 · gestor de paquetes **bun** (`bun.lock`).

```bash
bun install        # dependencias
bun run dev        # servidor de desarrollo
bun run build      # tsc -b + vite build (debe pasar antes de cerrar cualquier cambio)
bun run lint       # eslint
```

## Estructura

```
frontend/
├── CLAUDE.md               # este archivo
├── documentacion/          # cómo funciona el frontend (ver regla 3)
│   └── CATALOGO.md         # índice de todo el código — leer antes de buscar (regla 1)
└── src/pages/
    ├── components/         # componentes visuales compartidos entre páginas
    ├── Dashboard/          # (en pausa)
    └── Chat/
        ├── modules/        # DISEÑO: componentes React, estilos, layout
        ├── services/       # LÓGICA: llamadas HTTP, manejo de estado
        ├── interfaces/     # TIPOS: contratos del backend y modelos del front
        └── guards/         # VALIDACIÓN: entrada del usuario y respuesta del backend
```

### Dirección de dependencias (separación lógica / diseño)

- `modules/` puede importar de `services/`, `interfaces/`, `guards/` y `components/`.
- `services/` y `guards/` importan solo de `interfaces/`. **Nunca** de `modules/` ni de React/JSX.
- `interfaces/` no importa de nadie (solo tipos).
- Un componente de `modules/` **nunca** hace `fetch` directamente: llama a un servicio.

## Reglas principales

### 1. Buscar antes de escribir (reutilizar código existente)

Antes de crear una función, componente, tipo o servicio nuevo:

1. **Leer primero `documentacion/CATALOGO.md`.** Lista todo lo que existe en
   `src/pages/` con una línea de descripción. Es la forma de saber qué hay sin
   abrir archivo por archivo.
2. Solo si el catálogo sugiere algo relevante, abrir ese archivo concreto.
3. Revisar `package.json`: si una dependencia ya instalada lo resuelve, usarla
   en vez de reimplementarlo.
4. Solo si nada de lo anterior sirve, crear código nuevo. Si se encontró algo
   parecido pero no igual, **extenderlo** en vez de duplicarlo.

Al proponer código nuevo, decir brevemente qué se buscó y por qué no se reutilizó.
Si el catálogo y el código no coinciden, corregir el catálogo.

### 2. Comentario conciso en toda función de lógica importante

Toda función de `services/`, `guards/`, hooks personalizados y cualquier
función con lógica no trivial lleva un comentario JSDoc **corto** (1-3 líneas)
en español que diga **qué hace y qué devuelve / cuándo falla**. No describir
línea por línea ni repetir lo que el nombre ya dice.

```ts
/**
 * Envía la pregunta a POST /chat y devuelve la respuesta tipada.
 * Lanza ChatError si la red falla o el JSON no cumple el contrato §2.4.
 */
export async function sendQuestion(question: string): Promise<ChatResponse> { … }
```

Componentes puramente visuales en `modules/` no necesitan comentario salvo
que tengan lógica no obvia.

### 3. La documentación se actualiza en el mismo cambio

Si se crea, renombra, modifica o elimina algo en `src/pages/`, se actualiza
`documentacion/` **en el mismo cambio**, no después:

- **Siempre** → la fila correspondiente en `documentacion/CATALOGO.md`
  (componente, módulo, servicio, interface o guard, con descripción de una línea).
- Página nueva o modificada → `documentacion/paginas/<pagina>.md`
- Servicio nuevo o modificado → `documentacion/servicios/<servicio>.md`
  (usar la plantilla de `documentacion/servicios/README.md`)
- Cambio de estructura o de flujo general → `documentacion/README.md`

Documentar lo que **hace** el código hoy, no planes futuros.

### 4. Tipado y manejo de errores

- Sin `any`. La respuesta del backend se tipa con las interfaces de `interfaces/`
  y se valida con un guard antes de usarla.
- Nada de `catch` vacíos: todo error se muestra al usuario o se propaga.
- Secretos y URLs del backend vía variables de entorno de Vite (`import.meta.env.VITE_*`),
  nunca escritos en el código. Recordar que todo `VITE_*` **termina visible en el
  navegador**: nunca poner ahí claves de API.

### 5. Seguridad del contenido

La respuesta del agente puede contener texto proveniente del corpus
(scrapeado, no confiable). Renderizarla como texto; **nunca** con
`dangerouslySetInnerHTML` sin sanitizar.

### 6. Definición de "terminado"

Un cambio no está terminado hasta que `bun run build` y `bun run lint` pasan
sin errores. Si alguno falla, se reporta con la salida, no se da por cerrado.

### 7. Estados de UI obligatorios

Todo componente que llama a un servicio muestra explícitamente los estados
**cargando**, **error** y **vacío**. Cada pregunta al chat implica hasta dos
llamadas a modelo y puede tardar varios segundos: el usuario siempre debe
saber que algo está pasando. Recordar que `metadata.estado !== "ok"` es un
error aunque llegue con HTTP 200.

### 8. Nombres en inglés

Funciones, variables, tipos, componentes y archivos de código se nombran en
**inglés** (`sendQuestion`, `ChatResponse`, `MessageList.tsx`). Los campos
del contrato del backend se mantienen tal cual los envía el backend
(`respuesta`, `evaluacion`, `metadata`) — no se traducen.
Comentarios y documentación siguen en español.

- Componentes y tipos: `PascalCase`. Funciones y variables: `camelCase`.
- Archivos de componentes: `PascalCase.tsx`; el resto: `camelCase.ts`.

### 9. Un solo cliente HTTP

Todas las llamadas al backend pasan por un único cliente base (en
`src/pages/components/` o una carpeta compartida equivalente, registrado en el
catálogo) que:

- lee la URL del backend de `import.meta.env.VITE_API_URL`,
- aplica un timeout,
- convierte fallos de red y respuestas no-JSON en un error tipado.

Los servicios de cada página usan ese cliente; **ningún servicio llama a
`fetch` por su cuenta**. Así el Dashboard lo reutiliza sin duplicarlo.

### 10. Desarrollo por subagentes (main = Opus, implementadores = Sonnet)

El agente principal (**Opus**) **no escribe el código de implementación**:
planifica, reparte y verifica. La implementación la hacen subagentes
`frontend-implementer` (definido en `.claude/agents/frontend-implementer.md`
en la raíz del repo,
con `model: sonnet` fijo).

**Al delegar**, el main le pasa a cada implementador un encargo autocontenido
(el subagente no ve esta conversación):

- Objetivo concreto y criterio de aceptación verificable.
- Archivos exactos a crear o modificar, y lo que **no** debe tocar.
- Nombres de funciones/tipos/componentes esperados y sus firmas.
- Qué del catálogo debe reutilizar.
- Contexto del contrato del backend que aplique.

Tareas independientes pueden lanzarse en paralelo; tareas que tocan los mismos
archivos, en secuencia.

**Al recibir la entrega**, el main verifica que sea **exactamente** lo pedido,
leyendo el código real (no solo el reporte del subagente):

1. Cada punto del criterio de aceptación se cumple.
2. No se tocaron archivos fuera del encargo ni se agregó alcance no pedido.
3. Se respetan las reglas de este archivo (nombres, comentarios, separación
   lógica/diseño, cliente HTTP único, estados de UI, sin dependencias nuevas).
4. `CATALOGO.md` y la documentación quedaron actualizados.
5. `bun run build` y `bun run lint` pasan (el main los ejecuta él mismo).

Si algo no cumple, el main devuelve la tarea al **mismo** implementador
(SendMessage, conserva su contexto) con la corrección concreta. Solo cuando
todo pasa se reporta al usuario como terminado, indicando qué se verificó.

Excepción: correcciones triviales (una línea, un typo, un import) las puede
hacer el main directamente.

### 11. No agregar dependencias sin preguntar

No instalar librerías nuevas (UI kits, manejo de estado, HTTP, estilos, etc.)
sin confirmación explícita del equipo. Antes de proponer una, verificar que
no se pueda resolver con React + lo ya instalado. Cada dependencia nueva es un
riesgo para el build de Docker/Coolify con el tiempo del evento.
