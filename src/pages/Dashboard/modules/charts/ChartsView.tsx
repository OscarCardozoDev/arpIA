import type { KeyboardEvent } from 'react'
import type { ChartTab, Corpus, CorpusDoc, DashboardFilters } from '../../interfaces/dashboard'
import { CHART_TABS } from '../../services/phenomena'
import { BarsChart } from './BarsChart'
import { Heatmap } from './Heatmap'
import { PendingCard } from './PendingCard'
import { Timeline } from './Timeline'

export interface ChartsViewProps {
  corpus: Corpus
  docs: CorpusDoc[]
  filters: DashboardFilters
  tab: ChartTab
  onTabChange(tab: ChartTab): void
  onOpenEvidence(key: string): void
}

/** Mueve el foco entre pestañas con las flechas izquierda/derecha (cíclico). */
function handleTabsKeyDown(e: KeyboardEvent<HTMLDivElement>, current: ChartTab, onTabChange: (tab: ChartTab) => void) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  e.preventDefault()
  const index = CHART_TABS.findIndex(([id]) => id === current)
  const delta = e.key === 'ArrowRight' ? 1 : -1
  const next = CHART_TABS[(index + delta + CHART_TABS.length) % CHART_TABS.length][0]
  onTabChange(next)
}

/** Página "Gráficas y mapas": pestañas Composición | Territorio | Relaciones | Tiempo. */
export function ChartsView({ corpus, docs, filters, tab, onTabChange, onOpenEvidence }: ChartsViewProps) {
  return (
    <div>
      <div
        className="flex gap-1 overflow-x-auto border-b border-navy-200 dark:border-navy-800"
        role="tablist"
        onKeyDown={(e) => handleTabsKeyDown(e, tab, onTabChange)}
      >
        {CHART_TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => onTabChange(id)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${
              tab === id
                ? 'border-navy-500 text-navy-800 dark:border-navy-300 dark:text-navy-50'
                : 'border-transparent text-navy-600 dark:text-navy-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'composition' && (
          <>
            <BarsChart corpus={corpus} docs={docs} onOpenEvidence={onOpenEvidence} />
            <Heatmap corpus={corpus} docs={docs} filters={filters} onOpenEvidence={onOpenEvidence} />
          </>
        )}
        {tab === 'time' && <Timeline corpus={corpus} docs={docs} onOpenEvidence={onOpenEvidence} />}
        {tab === 'territory' && (
          <PendingCard
            title="Mapa coroplético"
            what="Mostrará cuántos documentos mencionan cada país y, al acercar, cada departamento (§B.4). Es la vista que justifica la georreferenciación del Fenómeno 3."
            needs={[
              'Diccionario cerrado de países y departamentos casado contra el texto de los fragmentos.',
              'Coordenadas o polígonos de cada territorio.',
              <>
                Los <code>chunk_id</code> de cada mención, para que cada polígono abra su evidencia.
              </>,
            ]}
          />
        )}
        {tab === 'relations' && (
          <PendingCard
            title="Red de co-ocurrencia"
            what="Mostrará qué actores y capacidades aparecen juntos: dos entidades se conectan si comparten al menos n documentos (§B.3.1)."
            needs={[
              'Diccionario de entidades (países, organizaciones, tecnologías).',
              'Tabla de co-ocurrencia con el peso = documentos compartidos.',
              <>
                Los <code>doc_id</code>/<code>chunk_id</code> que sustentan cada arista.
              </>,
            ]}
          />
        )}
      </div>
    </div>
  )
}
