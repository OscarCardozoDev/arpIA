# Servicio: dashboardService

**Archivo:** `src/pages/Dashboard/services/dashboardService.ts`
**Endpoint:** `POST /dashboard/consultar` (PROVISIONAL: el backend/agente de
visualización aún no existe; contrato definido por el equipo, no confirmado
por el backend real).

## Qué hace

Envía la instrucción en lenguaje natural del usuario y resuelve la
especificación de componente devuelta contra el corpus actual:

- Con `USE_MOCKS` (`src/services/config.ts`) usa el enrutador de
  demostración `mockRouteInstruction` (`src/example/dashboardRouter.mock.ts`)
  en vez de llamar al backend.
- Sin mocks, llama a `POST /dashboard/consultar` por el cliente HTTP único
  (`src/services/httpClient.ts`) con `{ instruccion: text }`.
- El resultado crudo pasa siempre por `repairSpec` (guard): si es una
  `DashboardSpec` válida se usa tal cual; si el componente no está en el
  catálogo cerrado pero trae al menos un fenómeno reconocible, se repara con
  el componente por defecto de ese fenómeno (`DEFAULT_COMPONENT`); si no hay
  forma de repararla, `consult` devuelve `null`.
- El agente (real o simulado) **solo elige el componente y los filtros**; las
  cifras que se muestran las calcula siempre el código (`dashboardData.ts`),
  nunca el modelo.

## Funciones exportadas

| Función | Entrada | Salida | Errores |
|---|---|---|---|
| `consult` | `text: string` | `Promise<ResolvedSpec \| null>` (`null` si no se reconoce la instrucción o es irreparable) | Propaga `HttpError` de `httpClient` (red/timeout/servidor) sin mocks |
| `dashboardErrorMessage` | `err: unknown` | Mensaje legible en español para mostrar al usuario | — |

## Dependencias (interfaces / guards)

- `interfaces/dashboard.ts`: `ResolvedSpec`, `DashboardSpec`.
- `guards/dashboardGuards.ts`: `repairSpec`.
- `services/corpusService.ts`: `getCorpus` (para resolver `coleccion` → índice y fenómeno).
- `services/phenomena.ts`: `COMPONENT_CATALOG` (página/pestaña/pendiente de cada componente).
- `example/dashboardRouter.mock.ts`: `mockRouteInstruction`, solo si `USE_MOCKS`.
- `services/httpClient.ts`, `services/config.ts`.

## Estados de UI que genera (loading / error / empty)

No los genera directamente: `useDashboard` (hook) traduce el resultado en
`consulting` (mientras la promesa está pendiente), `consultError` (mensaje de
`dashboardErrorMessage`) y `unrecognized` (cuando `consult` devuelve `null`).
