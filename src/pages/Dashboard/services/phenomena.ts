import type {
  ChartTab,
  ComponentId,
  DashboardPage,
  Phenomenon,
  PhenomenonId,
} from '../interfaces/dashboard'

/**
 * Metadatos fijos de los tres fenómenos del reto (colores Okabe-Ito, seguros
 * para daltonismo, y textos de la portada del Dashboard). Portado 1 a 1 de
 * `PHEN` en `chat-estilo-chatgpt.html`.
 */
export const PHENOMENA: Record<PhenomenonId, Phenomenon> = {
  1: {
    id: 1,
    key: 'F1',
    short: 'F1 · IA',
    name: 'IA y capacidades estratégicas',
    color: '#0072B2',
    question: '¿Qué conceptos domina cada institución y desde cuándo?',
    cta: 'Ver matriz de calor',
    ask: 'Matriz de calor de colecciones por año del F1',
  },
  2: {
    id: 2,
    key: 'F2',
    short: 'F2 · Espacio',
    name: 'Seguridad espacial y órbita baja',
    color: '#E69F00',
    question: '¿Qué actores y capacidades aparecen juntos?',
    cta: 'Comparar colecciones',
    ask: 'Compara los documentos por colección del F2',
  },
  3: {
    id: 3,
    key: 'F3',
    short: 'F3 · Territorio',
    name: 'Dinámicas territoriales en LATAM',
    color: '#CC79A7',
    question: '¿Qué territorios concentran la atención documental?',
    cta: 'Ver el mapa',
    ask: 'Mapa de territorios del F3',
  },
}

/** Los tres identificadores de fenómeno, en orden. */
export const PHENOMENON_IDS: PhenomenonId[] = [1, 2, 3]

/** Nombre visible de cada página del Dashboard (usado en el título y el sidebar). */
export const DASHBOARD_PAGE_NAMES: Record<DashboardPage, string> = {
  home: 'Inicio',
  tables: 'Tablas y conteos',
  charts: 'Gráficas y mapas',
}

/** Pestañas internas de "Gráficas y mapas", en orden de aparición. */
export const CHART_TABS: [ChartTab, string][] = [
  ['composition', 'Composición'],
  ['territory', 'Territorio'],
  ['relations', 'Relaciones'],
  ['time', 'Tiempo'],
]

/**
 * Catálogo CERRADO de componentes que puede elegir el agente de
 * visualización: dónde se muestra cada uno, si está pendiente de datos y su
 * justificación textual (mostrada en el aviso de especificación).
 */
export const COMPONENT_CATALOG: Record<
  ComponentId,
  { page: DashboardPage; tab: ChartTab | null; pending: boolean; justification: string }
> = {
  barras_comparacion: {
    page: 'charts',
    tab: 'composition',
    pending: false,
    justification: 'Compara una magnitud (número de documentos) entre pocas categorías: barras (§B.2.2).',
  },
  matriz_calor: {
    page: 'charts',
    tab: 'composition',
    pending: false,
    justification: 'Cruza dos variables categóricas (colección × año) con el conteo como color: matriz de calor (§B.2.3).',
  },
  linea_tiempo: {
    page: 'charts',
    tab: 'time',
    pending: false,
    justification: 'Pide una tendencia en el tiempo: línea de tiempo con un color por fenómeno (§B.5.1).',
  },
  tabla_conteos: {
    page: 'tables',
    tab: null,
    pending: false,
    justification: 'Pide el detalle exacto de los conteos: tabla, con cada fila enlazada a su evidencia.',
  },
  mapa_coropletico: {
    page: 'charts',
    tab: 'territory',
    pending: true,
    justification: 'Es una pregunta espacial: mapa coroplético por territorio (§B.4.1). Pendiente de datos geocodificados.',
  },
  red_coocurrencia: {
    page: 'charts',
    tab: 'relations',
    pending: true,
    justification: 'Pregunta por relaciones entre entidades: red de co-ocurrencia (§B.3.1). Pendiente de la tabla de co-ocurrencia.',
  },
}

/** Componente por defecto cuando la especificación es inválida pero se conoce el fenómeno. */
export const DEFAULT_COMPONENT: Record<PhenomenonId, ComponentId> = {
  1: 'matriz_calor',
  2: 'barras_comparacion',
  3: 'mapa_coropletico',
}

/** Instrucciones de ejemplo mostradas en la portada y cuando no se reconoce una instrucción. */
export const INSTRUCTION_EXAMPLES: string[] = [
  'Muéstrame la evolución de documentos del F2 desde 2020',
  'Compara los documentos por colección del F3',
  'Matriz de calor de colecciones por año',
  'Mapa de menciones por país en Colombia',
  'Red de actores y capacidades del F2',
  'Tabla de conteos del F1',
]

/** Año a partir del cual la matriz de calor muestra columnas individuales (antes se agrupa en "≤2013"). */
export const HEAT_FROM = 2014

/** Máximo de documentos que muestra el panel de evidencia. */
export const EVIDENCE_MAX = 60
