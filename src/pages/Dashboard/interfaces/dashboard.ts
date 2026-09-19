/** Páginas del Dashboard; el estado vive en App.tsx (lo comparten Sidebar, TopBar y DashboardPage). */
export type DashboardPage = 'home' | 'tables' | 'charts'

/** Identificador de cada uno de los tres fenómenos del reto. */
export type PhenomenonId = 1 | 2 | 3

/** Metadatos fijos de un fenómeno: color, textos y la pregunta/CTA que lo representan. */
export interface Phenomenon {
  id: PhenomenonId
  key: 'F1' | 'F2' | 'F3'
  short: string
  name: string
  color: string
  question: string
  cta: string
  ask: string
}

/** Colección de documentos dentro de un fenómeno (una carpeta del corpus). */
export interface Collection {
  index: number
  phenomenon: PhenomenonId
  dir: string
  name: string
}

/** Documento individual del corpus (instantánea de `reporte_pdfs.csv`). */
export interface CorpusDoc {
  phenomenon: PhenomenonId
  collection: number
  relPath: string
  fileName: string
  year: number | null
  pages: number
}

/** Instantánea completa del corpus usada por el Dashboard. */
export interface Corpus {
  source: string
  folders: Record<PhenomenonId, string>
  collections: Collection[]
  docs: CorpusDoc[]
  /** Años presentes en el corpus, ascendente. */
  years: number[]
}

/** Filtros globales que se propagan a todas las páginas del Dashboard. */
export interface DashboardFilters {
  phenomena: PhenomenonId[]
  /** -1 = todas las colecciones. */
  collection: number
  /** 0 = sin límite inferior. */
  yearFrom: number
  yearTo: number
}

/** Catálogo cerrado de componentes que puede elegir el agente de visualización. */
export type ComponentId =
  | 'barras_comparacion'
  | 'matriz_calor'
  | 'linea_tiempo'
  | 'tabla_conteos'
  | 'mapa_coropletico'
  | 'red_coocurrencia'

/** Pestañas internas de la página "Gráficas y mapas". */
export type ChartTab = 'composition' | 'territory' | 'relations' | 'time'

/**
 * Especificación de componente: contrato de `POST /dashboard/consultar`
 * (PROVISIONAL, el backend aún no existe).
 */
export interface DashboardSpec {
  componente: ComponentId
  filtros: {
    fenomeno: PhenomenonId[]
    /** `dir` de la colección, o `null` si no aplica. */
    coleccion: string | null
    anio_desde: number | null
    anio_hasta: number | null
  }
  justificacion: string
}

/** Especificación ya aplicada al tablero (página, pestaña y filtros resueltos). */
export interface ResolvedSpec {
  spec: DashboardSpec
  page: DashboardPage
  tab: ChartTab | null
  pending: boolean
  filters: DashboardFilters
  /** `true` si el guard corrigió la especificación al componente por defecto. */
  repaired: boolean
}

/** Documentos de una colección agrupados, con sus totales. */
export interface CollectionGroup {
  collection: number
  phenomenon: PhenomenonId
  docs: CorpusDoc[]
  pages: number
  dated: number
}

/** Clave de orden de la tabla de colecciones. */
export type SortKey = 'name' | 'docs' | 'pages' | 'dated'

/** Estado de orden de una tabla: clave activa y dirección. */
export interface SortState {
  key: SortKey
  dir: 1 | -1
}

/** Fila de la tabla "Documentos por año". */
export interface YearRow {
  /** `null` = sin año. */
  year: number | null
  counts: Record<PhenomenonId, number>
  total: number
}

/** Columna de la matriz de calor: `'old'` (≤2013), `'nd'` (sin año) o un año concreto. */
export type HeatColumn = 'old' | 'nd' | number

/** Fila de la matriz de calor (una colección) con el conteo de cada columna. */
export interface HeatRow {
  collection: number
  phenomenon: PhenomenonId
  cells: { column: HeatColumn; count: number }[]
}

/** Matriz de calor completa: colecciones (filas) × años (columnas). */
export interface HeatMatrix {
  columns: HeatColumn[]
  rows: HeatRow[]
  /** Máximo de la escala, sin contar la columna `'nd'`. */
  max: number
}

/** Serie temporal de documentos por año, con un punto por fenómeno y año. */
export interface TimelineData {
  yearFrom: number
  yearTo: number
  /** Tope del eje Y, múltiplo de 5. */
  top: number
  series: { phenomenon: PhenomenonId; points: { year: number; count: number }[] }[]
  /** Documentos sin año, excluidos de la línea de tiempo. */
  skipped: number
}

/** Resultado del panel de evidencia: título, subtítulo y hasta 60 documentos. */
export interface EvidenceResult {
  title: string
  subtitle: string
  total: number
  /** Ordenados por páginas descendente, máximo 60. */
  docs: CorpusDoc[]
}
