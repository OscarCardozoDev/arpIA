import { useState } from 'react'
import type { Corpus, CorpusDoc, DashboardFilters, PhenomenonId } from '../interfaces/dashboard'
import { PHENOMENA, PHENOMENON_IDS } from '../services/phenomena'
import { formatNumber } from '../services/dashboardData'

interface FilterBarProps {
  corpus: Corpus
  filters: DashboardFilters
  /** Documentos ya filtrados (de `useDashboard`), solo para el contador. */
  docs: CorpusDoc[]
  excludedUndated: number
  onTogglePhenomenon(id: PhenomenonId): void
  onCollectionChange(index: number): void
  onYearFromChange(year: number): void
  onYearToChange(year: number): void
  onReset(): void
}

/**
 * Filtros globales del Dashboard: chips de fenómeno, colección y rango de
 * años, con el contador de documentos filtrados. En móvil vive dentro de un
 * `<details>` plegable, abierto por defecto en escritorio.
 */
export function FilterBar({
  corpus,
  filters,
  docs,
  excludedUndated,
  onTogglePhenomenon,
  onCollectionChange,
  onYearFromChange,
  onYearToChange,
  onReset,
}: FilterBarProps) {
  const [initiallyOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  const countText = `${formatNumber(docs.length)} de ${formatNumber(corpus.docs.length)} documentos${
    excludedUndated ? ` · ${formatNumber(excludedUndated)} sin año excluidos` : ''
  }`

  return (
    <details open={initiallyOpen}>
      <summary className="cursor-pointer text-sm text-navy-600 dark:text-navy-300 md:hidden">
        Filtros · {countText}
      </summary>
      <div className="flex flex-wrap items-center gap-2 pt-2 text-sm md:pt-0">
        <span className="hidden text-navy-600 dark:text-navy-300 md:inline">Filtros:</span>
        <div className="flex flex-wrap gap-1.5">
          {PHENOMENON_IDS.map((id) => {
            const phenomenon = PHENOMENA[id]
            const active = filters.phenomena.includes(id)
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => onTogglePhenomenon(id)}
                className={`rounded-full border px-3 py-1 ${active ? '' : 'border-navy-200 opacity-60 dark:border-navy-700'}`}
                style={{
                  background: active ? `${phenomenon.color}26` : 'transparent',
                  borderColor: active ? phenomenon.color : undefined,
                }}
              >
                <span
                  className="mr-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full align-middle"
                  style={{ background: phenomenon.color }}
                />
                {phenomenon.short}
              </button>
            )
          })}
        </div>
        <select
          aria-label="Colección"
          value={filters.collection}
          onChange={(e) => onCollectionChange(Number(e.target.value))}
          className="max-w-[11rem] rounded-lg border border-navy-200 bg-transparent px-2 py-1.5 dark:border-navy-700 dark:bg-navy-950"
        >
          <option value={-1}>Todas las colecciones</option>
          {PHENOMENON_IDS.map((f) => (
            <optgroup key={f} label={`${PHENOMENA[f].key} · ${PHENOMENA[f].name}`}>
              {corpus.collections
                .filter((c) => c.phenomenon === f)
                .map((c) => (
                  <option key={c.index} value={c.index}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <label className="flex items-center gap-1.5">
          Desde
          <select
            value={filters.yearFrom}
            onChange={(e) => onYearFromChange(Number(e.target.value))}
            className="rounded-lg border border-navy-200 bg-transparent px-2 py-1.5 dark:border-navy-700 dark:bg-navy-950"
          >
            <option value={0}>—</option>
            {corpus.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          Hasta
          <select
            value={filters.yearTo}
            onChange={(e) => onYearToChange(Number(e.target.value))}
            className="rounded-lg border border-navy-200 bg-transparent px-2 py-1.5 dark:border-navy-700 dark:bg-navy-950"
          >
            <option value={0}>—</option>
            {corpus.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-2 py-1.5 text-navy-600 hover:underline dark:text-navy-300"
        >
          Limpiar
        </button>
        <span className="hidden text-xs text-navy-600 dark:text-navy-300 md:ml-auto md:inline">{countText}</span>
      </div>
    </details>
  )
}
