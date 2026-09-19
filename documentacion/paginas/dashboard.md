# Página: Dashboard

**Ubicación:** `src/pages/Dashboard/`

> **Bloqueado por defecto.** Mientras `VITE_DASHBOARD_ENABLED` no sea `true`
> (`DASHBOARD_ENABLED` en `src/services/config.ts`), el botón Dashboard del sidebar
> aparece deshabilitado con candado, `App.tsx` no monta la página y cualquier intento
> de abrir la vista lleva al chat. El código de la página sigue intacto.

## Propósito hoy

Tablero de los **tres fenómenos del reto** (F1 IA y capacidades estratégicas,
F2 seguridad espacial y órbita baja, F3 dinámicas territoriales en LATAM),
migrado del template (`chat-estilo-chatgpt.html`, `#viewDashboard` / sección
JS "11. DASHBOARD"). Tiene tres páginas — Inicio, Tablas y conteos, Gráficas y
mapas — cuya navegación vive en el sidebar (`Sidebar` recibe `dashboardPage` /
`onDashboardPageChange`, levantados en `App.tsx`).

## Barra global

Sobre las tres páginas, siempre visible:

- **Instrucción en lenguaje natural** (`AskBar`): el usuario escribe qué
  quiere ver; se envía a `useDashboard().consult()`, que llama a
  `dashboardService.consult()` (`POST /dashboard/consultar`, o el enrutador de
  demostración por palabras clave si `VITE_USE_MOCKS` está activo) y devuelve
  una **especificación de componente** contra el catálogo CERRADO de
  `phenomena.ts` (`COMPONENT_CATALOG`): `barras_comparacion`, `matriz_calor`,
  `linea_tiempo`, `tabla_conteos`, `mapa_coropletico`, `red_coocurrencia`. Si
  la especificación no calza con el catálogo, el guard `repairSpec` la
  sustituye por el componente por defecto del fenómeno (`DEFAULT_COMPONENT`);
  si el texto no se reconoce, se muestran ejemplos (`INSTRUCTION_EXAMPLES`).
  El agente solo produce la especificación: las cifras las calcula el código
  a partir del corpus, nunca el modelo.
- **Filtros globales** (`FilterBar`): chips de fenómeno (F1/F2/F3), colección
  (agrupada por fenómeno con `<optgroup>`), rango de años "Desde"/"Hasta" y
  "Limpiar". Regla de filtrado (`dashboardData.filterDocs`): un documento pasa
  si su fenómeno está activo Y (si hay colección) coincide Y (si hay rango de
  años) tiene año y cae en el rango. **Los documentos sin año nunca se
  imputan**: con un rango activo quedan excluidos y el contador lo dice
  ("N de M documentos · K sin año excluidos"). Elegir una colección deja
  activo solo su fenómeno. Cambiar un filtro a mano borra la especificación
  aplicada y cierra la evidencia (`useDashboard.clearSpecAndEvidence`). En
  móvil los filtros van dentro de un `<details>` plegable (abierto por
  defecto en escritorio).
- **Aviso de especificación** (`SpecNotice`, `role="status"`): componente
  elegido, filtros aplicados y justificación; solo se muestra si la
  especificación pertenece a la página actual (al cambiar de página desde el
  sidebar, desaparece). Incluye la nota de que el enrutador es de demostración
  cuando `USE_MOCKS` está activo.

## Páginas

- **Inicio** (`HomeView`): bento con una tarjeta "¿Qué quieres explorar?" con
  ejemplos de instrucción, una tarjeta de cobertura del corpus **completo**
  (documentos, con año en n y %; ubicación geográfica y chunk_id/texto
  marcados "Pendiente"), una tarjeta por fenómeno (conteo filtrado,
  colecciones, pregunta analítica y botón que lanza una instrucción; se
  atenúa si el fenómeno está desactivado en los filtros) y accesos a Tablas y
  a Gráficas.
- **Tablas y conteos** (`TablesView`): cuatro indicadores (documentos,
  colecciones, páginas, con año %), la tabla "Documentos por fenómeno y
  colección" (ordenable por colección/documentos/páginas/con año, con
  `aria-sort`) y "Documentos por año" (F1/F2/F3/Total + fila "Sin año"). Las
  filas son clicables y accesibles por teclado (Enter/Espacio) y abren el
  panel de evidencia.
- **Gráficas y mapas** (`src/pages/Dashboard/modules/charts/`, `ChartsView`):
  ver su propia documentación en el catálogo; no forma parte de este cambio.

## Panel de evidencia (`EvidencePanel`)

Cajón fijo a la derecha (ancho máximo `md`, pantalla completa en móvil) con
hasta 60 documentos ordenados por páginas (`EVIDENCE_MAX`): nombre de
archivo, punto de color del fenómeno, colección, año o "sin año", páginas y
ruta de origen (`evidencePath`). Se cierra con el botón o con **Esc**, y
mueve el foco al botón cerrar al abrirse. Pie fijo que aclara que `doc_id`,
`chunk_id` y el texto literal del fragmento llegarán del backend (herramienta
`obtener_evidencia`) — **todavía no están disponibles**. Claves de apertura:
`c:<colección>`, `y:<año|0>`, `h:<colección>:<old|nd|año>`,
`fy:<fenómeno>:<año>`, `f:<fenómeno>` (ver `dashboardData.evidenceFor`).

## Datos: qué es real y qué es mock/pendiente

- El corpus (`getCorpus()`) es una instantánea **REAL** de 759 PDF tomada de
  `backend/data/diagnostics/reporte_pdfs.csv`
  (`src/pages/Dashboard/data/corpusSnapshot.json`, regenerable con
  `bun run corpus:snapshot`). El año de cada documento es el primer número de
  cuatro dígitos del nombre del archivo; es temporal, la fuente final será el
  backend.
- El enrutador de instrucciones por palabras clave (`dashboardRouter.mock.ts`)
  es de **DEMOSTRACIÓN**, activo solo con `VITE_USE_MOCKS`; no es el agente de
  visualización real.
- **Pendiente de backend** (no simulado): `POST /dashboard/consultar` real,
  diccionario geográfico/geocodificación (mapa coroplético), tabla de
  co-ocurrencia de entidades (red de relaciones) y `doc_id`/`chunk_id`/texto
  literal de cada fragmento.

## Contrato con `App.tsx`

```ts
export interface DashboardPageProps {
  page: DashboardPage
  onPageChange(page: DashboardPage): void
}
```

`App.tsx` levanta `dashboardPage` (compartido con `Sidebar`/`TopBar`) y se lo
pasa como `page`; `onPageChange` es el mismo manejador que usa el sidebar
(cierra el sidebar en móvil). Toda la lógica de estado (filtros, orden,
instrucción, evidencia) vive en el hook `useDashboard`.
