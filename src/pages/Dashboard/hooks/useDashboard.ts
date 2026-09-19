import { useCallback, useMemo, useState } from 'react'
import type {
  ChartTab,
  Corpus,
  DashboardFilters,
  DashboardPage,
  EvidenceResult,
  PhenomenonId,
  ResolvedSpec,
  SortState,
} from '../interfaces/dashboard'
import { getCorpus } from '../services/corpusService'
import { consult as consultService, dashboardErrorMessage } from '../services/dashboardService'
import { countExcludedUndated, defaultFilters, evidenceFor, filterDocs } from '../services/dashboardData'

interface UseDashboardArgs {
  onPageChange(page: DashboardPage): void
}

/**
 * Estado y lógica del Dashboard de tres fenómenos: filtros globales, orden de
 * la tabla de colecciones, pestaña de gráficas, instrucción en lenguaje
 * natural y panel de evidencia. Cualquier cambio manual de filtro o pestaña
 * borra la última especificación aplicada y cierra la evidencia.
 */
export function useDashboard({ onPageChange }: UseDashboardArgs) {
  const corpus: Corpus = useMemo(() => getCorpus(), [])

  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters)
  const [tab, setTabState] = useState<ChartTab>('composition')
  const [sort, setSort] = useState<SortState>({ key: 'docs', dir: -1 })
  const [spec, setSpec] = useState<ResolvedSpec | null>(null)
  const [unrecognized, setUnrecognized] = useState(false)
  const [consulting, setConsulting] = useState(false)
  const [consultError, setConsultError] = useState<string | null>(null)
  const [evidenceKey, setEvidenceKey] = useState<string | null>(null)

  const docs = useMemo(() => filterDocs(corpus, filters), [corpus, filters])
  const excludedUndated = useMemo(() => countExcludedUndated(corpus, filters), [corpus, filters])
  const evidence: EvidenceResult | null = useMemo(
    () => (evidenceKey ? evidenceFor(evidenceKey, docs, corpus) : null),
    [evidenceKey, docs, corpus],
  )

  /** Borra la especificación activa y cierra la evidencia: precede a cualquier cambio manual de filtro/pestaña. */
  const clearSpecAndEvidence = useCallback(() => {
    setSpec(null)
    setUnrecognized(false)
    setEvidenceKey(null)
  }, [])

  const setTab = useCallback(
    (next: ChartTab) => {
      setTabState(next)
      clearSpecAndEvidence()
    },
    [clearSpecAndEvidence],
  )

  /** Invierte la dirección si `key` ya es la clave activa; si es nueva, `name` empieza ascendente y el resto descendente. */
  const toggleSort = useCallback((key: SortState['key']) => {
    setSort((prev) => (prev.key === key ? { key, dir: (prev.dir * -1) as 1 | -1 } : { key, dir: key === 'name' ? 1 : -1 }))
  }, [])

  const togglePhenomenon = useCallback(
    (id: PhenomenonId) => {
      setFilters((prev) => {
        const has = prev.phenomena.includes(id)
        const phenomena = has ? prev.phenomena.filter((p) => p !== id) : [...prev.phenomena, id]
        return { ...prev, phenomena }
      })
      clearSpecAndEvidence()
    },
    [clearSpecAndEvidence],
  )

  /** Elegir una colección concreta deja activo solo el fenómeno al que pertenece. */
  const setCollection = useCallback(
    (index: number) => {
      setFilters((prev) => ({
        ...prev,
        collection: index,
        phenomena: index >= 0 ? [corpus.collections[index].phenomenon] : prev.phenomena,
      }))
      clearSpecAndEvidence()
    },
    [corpus, clearSpecAndEvidence],
  )

  const setYearFrom = useCallback(
    (year: number) => {
      setFilters((prev) => ({ ...prev, yearFrom: year }))
      clearSpecAndEvidence()
    },
    [clearSpecAndEvidence],
  )

  const setYearTo = useCallback(
    (year: number) => {
      setFilters((prev) => ({ ...prev, yearTo: year }))
      clearSpecAndEvidence()
    },
    [clearSpecAndEvidence],
  )

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters())
    clearSpecAndEvidence()
  }, [clearSpecAndEvidence])

  /**
   * Envía la instrucción al agente (o al enrutador de demostración), aplica
   * los filtros y la pestaña resultantes, y navega a la página que indique la
   * especificación. Ignora el texto vacío. Los errores de red van a
   * `consultError`, sin catch vacío.
   */
  const consult = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      setConsulting(true)
      setConsultError(null)
      try {
        const resolved = await consultService(trimmed)
        if (!resolved) {
          setUnrecognized(true)
          setSpec(null)
          return
        }
        setUnrecognized(false)
        setSpec(resolved)
        setFilters(resolved.filters)
        if (resolved.tab) setTabState(resolved.tab)
        setEvidenceKey(null)
        onPageChange(resolved.page)
      } catch (err) {
        setConsultError(dashboardErrorMessage(err))
      } finally {
        setConsulting(false)
      }
    },
    [onPageChange],
  )

  const openEvidence = useCallback((key: string) => setEvidenceKey(key), [])
  const closeEvidence = useCallback(() => setEvidenceKey(null), [])

  return {
    corpus,
    filters,
    docs,
    excludedUndated,
    tab,
    setTab,
    sort,
    toggleSort,
    spec,
    unrecognized,
    consulting,
    consultError,
    consult,
    togglePhenomenon,
    setCollection,
    setYearFrom,
    setYearTo,
    resetFilters,
    evidence,
    openEvidence,
    closeEvidence,
  }
}
