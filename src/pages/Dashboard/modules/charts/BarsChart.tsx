import type { Corpus, CorpusDoc } from '../../interfaces/dashboard'
import { formatNumber, groupByCollection } from '../../services/dashboardData'
import { PHENOMENA } from '../../services/phenomena'
import { ChartCard } from './ChartCard'
import { PhenomenonLegend } from './PhenomenonLegend'

interface BarsChartProps {
  corpus: Corpus
  docs: CorpusDoc[]
  onOpenEvidence(key: string): void
}

/** Barras horizontales de documentos por colección, ordenadas de mayor a menor, color = fenómeno. */
export function BarsChart({ corpus, docs, onOpenEvidence }: BarsChartProps) {
  const groups = [...groupByCollection(docs)].sort((a, b) => b.docs.length - a.docs.length)
  const max = Math.max(1, ...groups.map((g) => g.docs.length))

  return (
    <ChartCard
      title="Documentos por colección"
      subtitle="Comparación · unidad: número de documentos (PDF). Color = fenómeno."
      corpus={corpus}
    >
      <PhenomenonLegend />
      <div className="mt-3 space-y-0.5">
        {groups.length === 0 ? (
          <p className="text-sm text-navy-600 dark:text-navy-300">Sin documentos con los filtros actuales.</p>
        ) : (
          groups.map((g) => {
            const name = corpus.collections[g.collection]?.name ?? ''
            return (
              <button
                key={g.collection}
                type="button"
                onClick={() => onOpenEvidence(`c:${g.collection}`)}
                className="flex w-full items-center gap-3 rounded-lg py-1 text-left hover:bg-navy-50 dark:hover:bg-navy-800"
              >
                <span className="w-28 shrink-0 truncate text-sm sm:w-40" title={name}>
                  {name}
                </span>
                <span className="h-5 flex-1 rounded bg-navy-100 dark:bg-navy-800">
                  <span
                    className="block h-full rounded"
                    style={{ width: `${(g.docs.length / max) * 100}%`, background: PHENOMENA[g.phenomenon].color }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right text-sm">{formatNumber(g.docs.length)}</span>
              </button>
            )
          })
        )}
      </div>
    </ChartCard>
  )
}
