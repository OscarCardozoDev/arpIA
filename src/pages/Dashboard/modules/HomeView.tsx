import type { Corpus, CorpusDoc, DashboardFilters, DashboardPage } from '../interfaces/dashboard'
import { INSTRUCTION_EXAMPLES, PHENOMENA, PHENOMENON_IDS } from '../services/phenomena'
import { formatNumber } from '../services/dashboardData'
import { SourceNote } from './SourceNote'

interface HomeViewProps {
  corpus: Corpus
  /** Documentos ya filtrados por los filtros globales activos. */
  docs: CorpusDoc[]
  filters: DashboardFilters
  onAsk(text: string): void
  onPageChange(page: DashboardPage): void
}

const TILE = 'rounded-2xl border border-navy-200 bg-white p-5 dark:border-navy-800 dark:bg-navy-900 md:p-6'
const MUTED = 'text-navy-600 dark:text-navy-300'

/** Página "Inicio" del Dashboard: bento con exploración por instrucción, cobertura y una tarjeta por fenómeno. */
export function HomeView({ corpus, docs, filters, onAsk, onPageChange }: HomeViewProps) {
  const dated = corpus.docs.filter((d) => d.year !== null).length
  const datedPct = corpus.docs.length ? Math.round((dated / corpus.docs.length) * 100) : 0

  return (
    <>
      <div className="grid gap-5 md:grid-cols-6 md:gap-8">
        <div className={`${TILE} md:col-span-4`}>
          <h2 className="text-2xl text-navy-800 dark:text-navy-50">¿Qué quieres explorar?</h2>
          <p className={`mt-2 text-sm ${MUTED}`}>
            Escribe una instrucción arriba y el tablero elige el componente y los filtros, o parte de un ejemplo:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {INSTRUCTION_EXAMPLES.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => onAsk(x)}
                className="rounded-full border border-navy-200 px-3 py-1.5 text-sm hover:bg-navy-50 dark:border-navy-700 dark:hover:bg-navy-800"
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        <div className={`${TILE} md:col-span-2`}>
          <h3>Cobertura de los datos</h3>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between gap-2">
              <dt className={MUTED}>Documentos (PDF)</dt>
              <dd>{formatNumber(corpus.docs.length)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className={MUTED}>Con año en el nombre</dt>
              <dd>
                {formatNumber(dated)} ({datedPct} %)
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className={MUTED}>Con ubicación geográfica</dt>
              <dd>Pendiente</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className={MUTED}>Con chunk_id y texto</dt>
              <dd>Pendiente</dd>
            </div>
          </dl>
        </div>

        {PHENOMENON_IDS.map((f) => {
          const phenomenon = PHENOMENA[f]
          const phenomenonDocs = docs.filter((d) => d.phenomenon === f)
          const off = !filters.phenomena.includes(f)
          const collectionsCount = new Set(phenomenonDocs.map((d) => d.collection)).size
          return (
            <div
              key={f}
              className={`${TILE} md:col-span-2 ${off ? 'opacity-50' : ''}`}
              style={{ borderTop: `4px solid ${phenomenon.color}` }}
            >
              <p className={`text-xs ${MUTED}`}>{phenomenon.key}</p>
              <h3 className="mt-1 leading-snug">{phenomenon.name}</h3>
              <p className="mt-3 text-3xl text-navy-700 dark:text-navy-100">{formatNumber(phenomenonDocs.length)}</p>
              <p className={`text-xs ${MUTED}`}>documentos en {collectionsCount} colecciones</p>
              <p className={`mt-3 text-sm italic ${MUTED}`}>{phenomenon.question}</p>
              <button
                type="button"
                onClick={() => onAsk(phenomenon.ask)}
                className="mt-3 text-sm text-navy-700 hover:underline dark:text-navy-200"
              >
                {phenomenon.cta} →
              </button>
            </div>
          )
        })}

        <button
          type="button"
          onClick={() => onPageChange('tables')}
          className={`${TILE} text-left transition hover:border-navy-400 md:col-span-3`}
        >
          <h3>Tablas y conteos</h3>
          <p className={`mt-1 text-sm ${MUTED}`}>
            Conteos exactos por fenómeno, colección y año. Cada fila abre su evidencia.
          </p>
          <p className="mt-3 text-sm text-navy-700 dark:text-navy-200">
            {formatNumber(docs.length)} documentos con los filtros actuales →
          </p>
        </button>

        <button
          type="button"
          onClick={() => onPageChange('charts')}
          className={`${TILE} text-left transition hover:border-navy-400 md:col-span-3`}
        >
          <h3>Gráficas y mapas</h3>
          <p className={`mt-1 text-sm ${MUTED}`}>
            Comparación, matriz de calor, línea de tiempo, territorio y relaciones.
          </p>
          <p className="mt-3 text-sm text-navy-700 dark:text-navy-200">
            4 vistas: composición, territorio, relaciones y tiempo →
          </p>
        </button>
      </div>
      <SourceNote corpus={corpus} />
    </>
  )
}
