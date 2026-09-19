import { useEffect, useRef, useState } from 'react'
import type { DashboardPage as DashboardPageId } from './interfaces/dashboard'
import { useDashboard } from './hooks/useDashboard'
import { AskBar } from './modules/AskBar'
import { FilterBar } from './modules/FilterBar'
import { SpecNotice } from './modules/SpecNotice'
import { EvidencePanel } from './modules/EvidencePanel'
import { HomeView } from './modules/HomeView'
import { TablesView } from './modules/TablesView'
import { ChartsView } from './modules/charts/ChartsView'

export interface DashboardPageProps {
  page: DashboardPageId
  onPageChange(page: DashboardPageId): void
}

/**
 * Tablero de los tres fenómenos del reto: barra global (instrucción en
 * lenguaje natural + filtros), la página activa (Inicio / Tablas / Gráficas)
 * y el panel de evidencia. Toda la lógica vive en `useDashboard`.
 */
export function DashboardPage({ page, onPageChange }: DashboardPageProps) {
  const dashboard = useDashboard({ onPageChange })
  const [askValue, setAskValue] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)

  // Vuelve al tope del contenido al cambiar de página o al aplicar una especificación.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [page, dashboard.spec])

  function handleAsk(text: string) {
    setAskValue(text)
    void dashboard.consult(text)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-navy-200 px-3 py-3 dark:border-navy-800 md:px-4">
        <div className="mx-auto w-full max-w-6xl space-y-3">
          <AskBar value={askValue} onChange={setAskValue} onSubmit={() => handleAsk(askValue)} consulting={dashboard.consulting} />
          <FilterBar
            corpus={dashboard.corpus}
            filters={dashboard.filters}
            docs={dashboard.docs}
            excludedUndated={dashboard.excludedUndated}
            onTogglePhenomenon={dashboard.togglePhenomenon}
            onCollectionChange={dashboard.setCollection}
            onYearFromChange={dashboard.setYearFrom}
            onYearToChange={dashboard.setYearTo}
            onReset={dashboard.resetFilters}
          />
        </div>
      </div>

      <div ref={bodyRef} className="scroll-thin flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-3 py-8 md:px-6 md:py-10">
          <SpecNotice
            page={page}
            spec={dashboard.spec}
            unrecognized={dashboard.unrecognized}
            consultError={dashboard.consultError}
            corpus={dashboard.corpus}
            onAsk={handleAsk}
          />
          {page === 'home' && (
            <HomeView
              corpus={dashboard.corpus}
              docs={dashboard.docs}
              filters={dashboard.filters}
              onAsk={handleAsk}
              onPageChange={onPageChange}
            />
          )}
          {page === 'tables' && (
            <TablesView
              corpus={dashboard.corpus}
              docs={dashboard.docs}
              sort={dashboard.sort}
              onToggleSort={dashboard.toggleSort}
              onOpenEvidence={dashboard.openEvidence}
            />
          )}
          {page === 'charts' && (
            <ChartsView
              corpus={dashboard.corpus}
              docs={dashboard.docs}
              filters={dashboard.filters}
              tab={dashboard.tab}
              onTabChange={dashboard.setTab}
              onOpenEvidence={dashboard.openEvidence}
            />
          )}
        </div>
      </div>

      <EvidencePanel evidence={dashboard.evidence} corpus={dashboard.corpus} onClose={dashboard.closeEvidence} />
    </div>
  )
}
