import type {
  CollectionGroup,
  Corpus,
  CorpusDoc,
  DashboardFilters,
  DashboardSpec,
  EvidenceResult,
  HeatColumn,
  HeatMatrix,
  PhenomenonId,
  SortState,
  TimelineData,
  YearRow,
} from '../interfaces/dashboard'
import { EVIDENCE_MAX, HEAT_FROM, PHENOMENA, PHENOMENON_IDS } from './phenomena'

/** Filtros globales iniciales: los tres fenómenos activos, sin colección ni rango de años. */
export function defaultFilters(): DashboardFilters {
  return { phenomena: [1, 2, 3], collection: -1, yearFrom: 0, yearTo: 0 }
}

/**
 * Aplica los filtros globales al corpus. Un documento pasa si su fenómeno
 * está activo Y (si hay colección) coincide Y (si hay rango de años) tiene
 * año y cae en el rango. Los documentos sin año nunca se imputan: con rango
 * activo quedan excluidos.
 */
export function filterDocs(corpus: Corpus, filters: DashboardFilters): CorpusDoc[] {
  const { phenomena, collection, yearFrom, yearTo } = filters
  const ranged = yearFrom || yearTo
  return corpus.docs.filter(
    (d) =>
      phenomena.includes(d.phenomenon) &&
      (collection < 0 || d.collection === collection) &&
      (!ranged || (d.year !== null && (!yearFrom || d.year >= yearFrom) && (!yearTo || d.year <= yearTo))),
  )
}

/**
 * Cuenta los documentos sin año que un rango de años activo excluye (los
 * mismos fenómeno/colección que `filterDocs`, pero sin filtrar por año).
 * Devuelve 0 si no hay rango activo.
 */
export function countExcludedUndated(corpus: Corpus, filters: DashboardFilters): number {
  const { phenomena, collection, yearFrom, yearTo } = filters
  if (!yearFrom && !yearTo) return 0
  return corpus.docs.filter(
    (d) => phenomena.includes(d.phenomenon) && (collection < 0 || d.collection === collection) && d.year === null,
  ).length
}

/** Agrupa documentos por colección, acumulando páginas y cantidad con año. */
export function groupByCollection(docs: CorpusDoc[]): CollectionGroup[] {
  const groups = new Map<number, CollectionGroup>()
  for (const d of docs) {
    const g = groups.get(d.collection) ?? {
      collection: d.collection,
      phenomenon: d.phenomenon,
      docs: [],
      pages: 0,
      dated: 0,
    }
    g.docs.push(d)
    g.pages += d.pages
    if (d.year !== null) g.dated += 1
    groups.set(d.collection, g)
  }
  return [...groups.values()]
}

/** Ordena grupos de colección según `sort`, con desempate por índice de colección. */
export function sortCollectionGroups(groups: CollectionGroup[], sort: SortState, corpus: Corpus): CollectionGroup[] {
  const value: Record<'docs' | 'pages' | 'dated', (g: CollectionGroup) => number> = {
    docs: (g) => g.docs.length,
    pages: (g) => g.pages,
    dated: (g) => g.dated,
  }
  const nameOf = (index: number): string => corpus.collections[index]?.name ?? ''
  return [...groups].sort((a, b) => {
    if (sort.key === 'name') return sort.dir * nameOf(a.collection).localeCompare(nameOf(b.collection))
    const diff = sort.dir * (value[sort.key](a) - value[sort.key](b))
    return diff || a.collection - b.collection
  })
}

/** Documentos por año, ascendente, con "Sin año" (`year: null`) siempre al final. */
export function docsByYear(docs: CorpusDoc[]): YearRow[] {
  const byYear = new Map<number | null, Record<PhenomenonId, number>>()
  for (const d of docs) {
    const counts = byYear.get(d.year) ?? { 1: 0, 2: 0, 3: 0 }
    counts[d.phenomenon] += 1
    byYear.set(d.year, counts)
  }
  const rows = [...byYear.entries()].map(([year, counts]) => ({
    year,
    counts,
    total: counts[1] + counts[2] + counts[3],
  }))
  rows.sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity))
  return rows
}

/** Clasifica un documento en su columna de la matriz de calor. */
function heatBucket(doc: CorpusDoc): HeatColumn {
  if (doc.year === null) return 'nd'
  if (doc.year < HEAT_FROM) return 'old'
  return doc.year
}

/**
 * Construye la matriz colección × año. Sin rango de años activo incluye las
 * columnas "≤2013" ('old') y "Sin año" ('nd'); con rango activo, solo los
 * años del rango. Filas ordenadas por fenómeno y nombre de colección.
 */
export function heatmapMatrix(docs: CorpusDoc[], filters: DashboardFilters, corpus: Corpus): HeatMatrix {
  const { yearFrom, yearTo } = filters
  const ranged = yearFrom || yearTo
  const yMax = Math.max(HEAT_FROM, ...corpus.years)
  const years: number[] = []
  for (let y = HEAT_FROM; y <= yMax; y++) {
    if ((!yearFrom || y >= yearFrom) && (!yearTo || y <= yearTo)) years.push(y)
  }
  const columns: HeatColumn[] = [...(!ranged ? (['old'] as HeatColumn[]) : []), ...years, ...(!ranged ? (['nd'] as HeatColumn[]) : [])]

  const nameOf = (index: number): string => corpus.collections[index]?.name ?? ''
  const groups = groupByCollection(docs).sort(
    (a, b) => a.phenomenon - b.phenomenon || nameOf(a.collection).localeCompare(nameOf(b.collection)),
  )

  const cellCounts = new Map<string, number>()
  let max = 1
  for (const d of docs) {
    const bucket = heatBucket(d)
    const key = `${d.collection}:${bucket}`
    const n = (cellCounts.get(key) ?? 0) + 1
    cellCounts.set(key, n)
    if (bucket !== 'nd') max = Math.max(max, n)
  }

  const rows = groups.map((g) => ({
    collection: g.collection,
    phenomenon: g.phenomenon,
    cells: columns.map((column) => ({ column, count: cellCounts.get(`${g.collection}:${column}`) ?? 0 })),
  }))

  return { columns, rows, max }
}

/** Datos de la línea de tiempo (uno o varios fenómenos); `null` si ningún documento tiene año. */
export function timelineData(docs: CorpusDoc[]): TimelineData | null {
  const dated = docs.filter((d): d is CorpusDoc & { year: number } => d.year !== null)
  if (!dated.length) return null

  const yearFrom = Math.min(...dated.map((d) => d.year))
  const yearTo = Math.max(...dated.map((d) => d.year))
  const counts: Record<PhenomenonId, Record<number, number>> = { 1: {}, 2: {}, 3: {} }
  for (const d of dated) counts[d.phenomenon][d.year] = (counts[d.phenomenon][d.year] ?? 0) + 1

  const max = Math.max(1, ...PHENOMENON_IDS.flatMap((f) => Object.values(counts[f])))
  const top = Math.ceil(max / 5) * 5 || 5

  const series = PHENOMENON_IDS.filter((f) => Object.keys(counts[f]).length > 0).map((phenomenon) => {
    const points: { year: number; count: number }[] = []
    for (let y = yearFrom; y <= yearTo; y++) points.push({ year: y, count: counts[phenomenon][y] ?? 0 })
    return { phenomenon, points }
  })

  return { yearFrom, yearTo, top, series, skipped: docs.length - dated.length }
}

/** Formatea un número con separador de miles en español. */
export function formatNumber(n: number): string {
  return n.toLocaleString('es')
}

/** Ruta de origen legible de un documento, para mostrarla en el panel de evidencia. */
export function evidencePath(doc: CorpusDoc, corpus: Corpus): string {
  const folder = corpus.folders[doc.phenomenon]
  const collection = corpus.collections[doc.collection]
  return `data/raw_muestra/${folder}/${collection?.dir ?? ''}/${doc.relPath}`
}

/**
 * Resuelve la evidencia (título, subtítulo y hasta `EVIDENCE_MAX` documentos
 * ordenados por páginas descendente) para una clave del panel de evidencia.
 * `docs` debe venir YA filtrado por los filtros globales activos. Claves
 * soportadas: `c:<colección>`, `y:<año|0>`, `h:<colección>:<old|nd|año>`,
 * `fy:<fenómeno>:<año>`, `f:<fenómeno>`.
 */
export function evidenceFor(key: string, docs: CorpusDoc[], corpus: Corpus): EvidenceResult {
  const [kind, a, b] = key.split(':')
  const numA = Number(a)
  let title: string
  let subtitle: string
  let matched: CorpusDoc[]

  switch (kind) {
    case 'c': {
      const collection = corpus.collections[numA]
      title = collection?.name ?? ''
      subtitle = collection ? collectionPhenomenonFullName(collection.phenomenon) : ''
      matched = docs.filter((d) => d.collection === numA)
      break
    }
    case 'y': {
      title = numA ? `Año ${a}` : 'Sin año en el nombre del archivo'
      subtitle = 'Documentos del periodo'
      matched = docs.filter((d) => (d.year ?? 0) === numA)
      break
    }
    case 'h': {
      const collectionIndex = numA
      const collection = corpus.collections[collectionIndex]
      const label = b === 'old' ? '≤2013' : b === 'nd' ? 'sin año' : b
      title = `${collection?.name ?? ''} · ${label}`
      subtitle = 'Celda de la matriz de calor'
      matched = docs.filter((d) => d.collection === collectionIndex && heatBucket(d) === (b === 'old' || b === 'nd' ? b : Number(b)))
      break
    }
    case 'fy': {
      const phenomenon = numA as PhenomenonId
      title = `${PHENOMENA[phenomenon].key} · ${b}`
      subtitle = collectionPhenomenonFullName(phenomenon)
      matched = docs.filter((d) => d.phenomenon === phenomenon && d.year === Number(b))
      break
    }
    case 'f':
    default: {
      const phenomenon = numA as PhenomenonId
      title = collectionPhenomenonFullName(phenomenon)
      subtitle = 'Documentos del fenómeno'
      matched = docs.filter((d) => d.phenomenon === phenomenon)
      break
    }
  }

  const sorted = [...matched].sort((x, y) => y.pages - x.pages).slice(0, EVIDENCE_MAX)
  return { title, subtitle, total: matched.length, docs: sorted }
}

/** Nombre completo del fenómeno dado su id, tomado de `PHENOMENA` para no duplicar los textos. */
function collectionPhenomenonFullName(phenomenon: PhenomenonId): string {
  return PHENOMENA[phenomenon].name
}

/**
 * Convierte una especificación de componente en filtros globales del
 * Dashboard: sin fenómenos especificados se activan los tres; con colección,
 * solo el fenómeno de esa colección; `null` en años se traduce a `0`.
 */
export function specToFilters(spec: DashboardSpec, corpus: Corpus): DashboardFilters {
  const collectionIndex = spec.filtros.coleccion
    ? corpus.collections.findIndex((c) => c.dir === spec.filtros.coleccion)
    : -1
  const phenomena =
    collectionIndex >= 0
      ? [corpus.collections[collectionIndex].phenomenon]
      : spec.filtros.fenomeno.length
        ? spec.filtros.fenomeno
        : ([1, 2, 3] as PhenomenonId[])
  return {
    phenomena,
    collection: collectionIndex,
    yearFrom: spec.filtros.anio_desde ?? 0,
    yearTo: spec.filtros.anio_hasta ?? 0,
  }
}
