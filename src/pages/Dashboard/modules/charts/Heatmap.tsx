import { Fragment } from 'react'
import type { Corpus, CorpusDoc, DashboardFilters, HeatColumn } from '../../interfaces/dashboard'
import { heatmapMatrix } from '../../services/dashboardData'
import { PHENOMENA } from '../../services/phenomena'
import { ChartCard } from './ChartCard'

interface HeatmapProps {
  corpus: Corpus
  docs: CorpusDoc[]
  filters: DashboardFilters
  onOpenEvidence(key: string): void
}

/** Etiqueta legible de una columna de la matriz: "≤2013", "Sin año" o el año. */
function columnLabel(column: HeatColumn): string {
  if (column === 'old') return '≤2013'
  if (column === 'nd') return 'Sin año'
  return String(column)
}

/** Color de fondo de una celda: escala azul para años, gris para "Sin año", transparente si n=0. */
function cellColor(column: HeatColumn, count: number, max: number): string {
  if (count === 0) return 'transparent'
  if (column === 'nd') return `rgba(128,128,128,${0.15 + Math.min(1, count / 60) * 0.5})`
  return `rgba(95,127,184,${0.15 + 0.85 * (count / max)})`
}

/** Matriz de calor colección × año, con escalas separadas para años y "Sin año". */
export function Heatmap({ corpus, docs, filters, onOpenEvidence }: HeatmapProps) {
  const matrix = heatmapMatrix(docs, filters, corpus)
  const ranged = Boolean(filters.yearFrom || filters.yearTo)

  return (
    <ChartCard
      title="Matriz de calor: colección × año"
      subtitle={`Cruce de dos categorías · color = número de documentos (de 1 a ${matrix.max}). ${
        ranged ? '' : 'La columna gris «Sin año» usa otra escala y no se compara con las demás.'
      }`}
      corpus={corpus}
    >
      {matrix.rows.length === 0 ? (
        <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">Sin documentos con los filtros actuales.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <div
            className="grid min-w-[560px] items-center gap-1"
            style={{ gridTemplateColumns: `minmax(120px,170px) repeat(${matrix.columns.length},minmax(34px,1fr))` }}
          >
            <div />
            {matrix.columns.map((c) => (
              <div key={String(c)} className="pb-1 text-center text-[10px] text-navy-600 dark:text-navy-300">
                {columnLabel(c)}
              </div>
            ))}
            {matrix.rows.map((row) => {
              const name = corpus.collections[row.collection]?.name ?? ''
              return (
                <Fragment key={row.collection}>
                  <div
                    className="flex items-center gap-1.5 truncate pr-2 text-xs"
                    title={name}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: PHENOMENA[row.phenomenon].color }}
                    />
                    <span className="truncate">{name}</span>
                  </div>
                  {row.cells.map((cell) => {
                    const label = columnLabel(cell.column)
                    if (cell.count === 0) {
                      return (
                        <button
                          key={`${row.collection}-${String(cell.column)}`}
                          type="button"
                          disabled
                          className="h-7 rounded border border-navy-100 text-[11px] dark:border-navy-800"
                          style={{ background: 'transparent' }}
                        />
                      )
                    }
                    const light = cell.column !== 'nd' && cell.count / matrix.max > 0.55
                    return (
                      <button
                        key={`${row.collection}-${String(cell.column)}`}
                        type="button"
                        onClick={() => onOpenEvidence(`h:${row.collection}:${cell.column}`)}
                        className={`h-7 rounded text-[11px] ${light ? 'text-white' : ''}`}
                        style={{ background: cellColor(cell.column, cell.count, matrix.max) }}
                        title={`${name} · ${label === '≤2013' ? '≤2013' : label === 'Sin año' ? 'sin año' : label}: ${cell.count} documentos`}
                        aria-label={`${name} · ${label}: ${cell.count} documentos`}
                      >
                        {cell.count}
                      </button>
                    )
                  })}
                </Fragment>
              )
            })}
          </div>
        </div>
      )}
    </ChartCard>
  )
}
