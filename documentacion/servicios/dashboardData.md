# Servicio: dashboardData

**Archivo:** `src/pages/Dashboard/services/dashboardData.ts`
**Endpoint:** ninguno (funciones puras sobre el `Corpus` en memoria)

## Qué hace

Reúne toda la lógica de filtrado y agregación del tablero de tres fenómenos,
portada 1 a 1 de la sección JS "11. DASHBOARD" de
`chat-estilo-chatgpt.html`: filtrado por fenómeno/colección/rango de años,
agrupación por colección, conteos por año, matriz de calor colección × año,
serie de línea de tiempo y resolución del panel de evidencia. Ninguna función
hace `fetch`; todas reciben datos ya cargados (`Corpus`, `CorpusDoc[]`) y
devuelven datos, nunca JSX.

## Funciones exportadas

| Función | Entrada | Salida | Errores |
|---|---|---|---|
| `defaultFilters` | — | `DashboardFilters` (3 fenómenos, sin colección ni rango) | — |
| `filterDocs` | `corpus`, `filters` | `CorpusDoc[]` que cumplen fenómeno + colección + rango de años (sin año nunca se imputa) | — |
| `countExcludedUndated` | `corpus`, `filters` | Nº de documentos sin año excluidos por un rango activo (0 si no hay rango) | — |
| `groupByCollection` | `docs` | `CollectionGroup[]` con páginas y cantidad con año por colección | — |
| `sortCollectionGroups` | `groups`, `sort`, `corpus` | Grupos ordenados por `sort.key`/`sort.dir`, desempate por índice | — |
| `docsByYear` | `docs` | `YearRow[]` ascendente, con `year: null` ("Sin año") al final | — |
| `heatmapMatrix` | `docs`, `filters`, `corpus` | `HeatMatrix`: columnas `'old'`/años/`'nd'` según el rango activo, filas por colección | — |
| `timelineData` | `docs` | `TimelineData` o `null` si ningún documento tiene año | — |
| `evidenceFor` | `key`, `docs` (ya filtrados), `corpus` | `EvidenceResult` (máx. `EVIDENCE_MAX`, ordenado por páginas desc.) | — |
| `evidencePath` | `doc`, `corpus` | Ruta `data/raw_muestra/<carpeta>/<colección>/<relPath>` | — |
| `formatNumber` | `n` | `n.toLocaleString('es')` | — |
| `specToFilters` | `spec`, `corpus` | `DashboardFilters` resueltos desde una `DashboardSpec` | — |

### Claves del panel de evidencia (`evidenceFor`)

`c:<colección>` · `y:<año|0>` · `h:<colección>:<old|nd|año>` ·
`fy:<fenómeno>:<año>` · `f:<fenómeno>`.

## Dependencias (interfaces / guards)

- `interfaces/dashboard.ts`: todos los tipos del tablero.
- `services/phenomena.ts`: `PHENOMENA`, `PHENOMENON_IDS`, `HEAT_FROM`, `EVIDENCE_MAX`.

## Estados de UI que genera (loading / error / empty)

Ninguno directamente: son funciones puras. El caso "sin documentos con los
filtros actuales" se refleja en arreglos vacíos (`docs: []`, `rows: []`), que
los componentes de UI deben mostrar como estado vacío explícito (regla 7 de
`CLAUDE.md`).
