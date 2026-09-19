import type { KeyboardEvent, ReactNode } from 'react'
import type { Corpus, CorpusDoc, SortKey, SortState } from '../interfaces/dashboard'
import { PHENOMENA, PHENOMENON_IDS } from '../services/phenomena'
import { docsByYear, formatNumber, groupByCollection, sortCollectionGroups } from '../services/dashboardData'
import { SourceNote } from './SourceNote'

interface TablesViewProps {
  corpus: Corpus
  /** Documentos ya filtrados por los filtros globales activos. */
  docs: CorpusDoc[]
  sort: SortState
  onToggleSort(key: SortKey): void
  onOpenEvidence(key: string): void
}

const TILE = 'rounded-2xl border border-navy-200 bg-white p-5 dark:border-navy-800 dark:bg-navy-900 md:p-6'
const MUTED = 'text-navy-600 dark:text-navy-300'

/** Activa `onOpenEvidence(key)` con Enter o Espacio, para filas clicables accesibles por teclado. */
function handleRowKeyDown(e: KeyboardEvent<HTMLTableRowElement>, key: string, onOpenEvidence: (key: string) => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onOpenEvidence(key)
  }
}

/** Página "Tablas y conteos": indicadores, tabla por colección (ordenable) y tabla por año. */
export function TablesView({ corpus, docs, sort, onToggleSort, onOpenEvidence }: TablesViewProps) {
  const groups = sortCollectionGroups(groupByCollection(docs), sort, corpus)
  const totalPages = docs.reduce((n, d) => n + d.pages, 0)
  const dated = docs.filter((d) => d.year !== null).length
  const years = docsByYear(docs)

  function kpi(label: string, value: string, sub = ''): ReactNode {
    return (
      <div className={TILE}>
        <p className="text-2xl text-navy-700 dark:text-navy-100">{value}</p>
        <p className={`mt-1 text-xs ${MUTED}`}>
          {label}
          {sub}
        </p>
      </div>
    )
  }

  function sortHeader(key: SortKey, label: string, align: 'left' | 'right' = 'right'): ReactNode {
    const active = sort.key === key
    const ariaSort: 'ascending' | 'descending' | 'none' = active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'
    return (
      <th className={`px-3 py-2 font-normal ${align === 'right' ? 'text-right' : 'text-left'}`} aria-sort={ariaSort}>
        <button type="button" onClick={() => onToggleSort(key)} className="hover:underline">
          {label}
          {active ? (sort.dir < 0 ? ' ↓' : ' ↑') : ''}
        </button>
      </th>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
        {kpi('Documentos', formatNumber(docs.length))}
        {kpi('Colecciones', formatNumber(groups.length))}
        {kpi('Páginas', formatNumber(totalPages))}
        {kpi('Con año', formatNumber(dated), docs.length ? ` (${Math.round((dated / docs.length) * 100)} %)` : '')}
      </div>

      <h2 className="mt-12 text-lg">Documentos por fenómeno y colección</h2>
      <p className={`mt-1 text-xs ${MUTED}`}>
        Unidad: número de documentos y de páginas. Haz clic en una fila para ver los documentos.
      </p>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-navy-200 dark:border-navy-800">
        <table className="w-full min-w-[560px] text-sm">
          <thead className={MUTED}>
            <tr>
              <th className="px-3 py-2 text-left font-normal">Fenómeno</th>
              {sortHeader('name', 'Colección', 'left')}
              {sortHeader('docs', 'Documentos')}
              {sortHeader('pages', 'Páginas')}
              {sortHeader('dated', 'Con año')}
              <th className="px-3 py-2 text-right font-normal">% con año</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && (
              <tr>
                <td colSpan={6} className={`px-3 py-6 text-center ${MUTED}`}>
                  Sin documentos con los filtros actuales.
                </td>
              </tr>
            )}
            {groups.map((g) => {
              const key = `c:${g.collection}`
              const pct = g.docs.length ? Math.round((g.dated / g.docs.length) * 100) : 0
              return (
                <tr
                  key={g.collection}
                  className="cursor-pointer border-t border-navy-100 hover:bg-navy-50 dark:border-navy-800 dark:hover:bg-navy-800"
                  tabIndex={0}
                  onClick={() => onOpenEvidence(key)}
                  onKeyDown={(e) => handleRowKeyDown(e, key, onOpenEvidence)}
                >
                  <td className="px-3 py-2">
                    <span
                      className="mr-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full align-middle"
                      style={{ background: PHENOMENA[g.phenomenon].color }}
                    />
                    {PHENOMENA[g.phenomenon].key}
                  </td>
                  <td className="px-3 py-2">{corpus.collections[g.collection]?.name}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(g.docs.length)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(g.pages)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(g.dated)}</td>
                  <td className="px-3 py-2 text-right">{pct} %</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 text-lg">Documentos por año</h2>
      <p className={`mt-1 text-xs ${MUTED}`}>
        El año se toma del nombre del archivo (cuatro dígitos). Los documentos sin año no se imputan: se cuentan
        aparte.
      </p>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-navy-200 dark:border-navy-800">
        <table className="w-full min-w-[420px] text-sm">
          <thead className={MUTED}>
            <tr>
              <th className="px-3 py-2 text-left font-normal">Año</th>
              {PHENOMENON_IDS.map((f) => (
                <th key={f} className="px-3 py-2 text-right font-normal">
                  {PHENOMENA[f].key}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody>
            {years.length === 0 && (
              <tr>
                <td colSpan={5} className={`px-3 py-6 text-center ${MUTED}`}>
                  Sin documentos con los filtros actuales.
                </td>
              </tr>
            )}
            {years.map((row) => {
              const key = `y:${row.year ?? 0}`
              return (
                <tr
                  key={row.year ?? 'nd'}
                  className="cursor-pointer border-t border-navy-100 hover:bg-navy-50 dark:border-navy-800 dark:hover:bg-navy-800"
                  tabIndex={0}
                  onClick={() => onOpenEvidence(key)}
                  onKeyDown={(e) => handleRowKeyDown(e, key, onOpenEvidence)}
                >
                  <td className="px-3 py-2">{row.year ?? 'Sin año'}</td>
                  {PHENOMENON_IDS.map((f) => (
                    <td key={f} className="px-3 py-2 text-right">
                      {formatNumber(row.counts[f])}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">{formatNumber(row.total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <SourceNote corpus={corpus} />
    </>
  )
}
