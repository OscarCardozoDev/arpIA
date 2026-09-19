import type { Corpus, DashboardPage, ResolvedSpec } from '../interfaces/dashboard'
import { INSTRUCTION_EXAMPLES, PHENOMENA } from '../services/phenomena'
import { USE_MOCKS } from '../../../services/config'

interface SpecNoticeProps {
  /** Página actualmente mostrada; el detalle de `spec` solo aparece si coincide con `spec.page`. */
  page: DashboardPage
  spec: ResolvedSpec | null
  unrecognized: boolean
  consultError: string | null
  corpus: Corpus
  onAsk(text: string): void
}

/** Resume los filtros de una especificación en el formato "F1 + F2, <colección>, años A–B" (o "ninguno"). */
function summarizeFilters(resolved: ResolvedSpec, corpus: Corpus): string {
  const { fenomeno, coleccion, anio_desde: from, anio_hasta: to } = resolved.spec.filtros
  const parts: string[] = []
  if (fenomeno.length) parts.push(fenomeno.map((id) => PHENOMENA[id].key).join(' + '))
  if (coleccion) {
    const found = corpus.collections.find((c) => c.dir === coleccion)
    if (found) parts.push(found.name)
  }
  if (from || to) parts.push(`años ${from || '…'}–${to || '…'}`)
  return parts.join(', ') || 'ninguno'
}

/**
 * Aviso de especificación tras una instrucción en lenguaje natural: componente
 * elegido, filtros y justificación (solo si `spec.page === page`), o los
 * ejemplos de instrucción si no se reconoció el texto, o el error de red.
 */
export function SpecNotice({ page, spec, unrecognized, consultError, corpus, onAsk }: SpecNoticeProps) {
  const showSpec = spec !== null && spec.page === page
  if (!showSpec && !unrecognized && !consultError) return null

  return (
    <div role="status" className="mb-8 rounded-xl bg-navy-50 px-4 py-3 text-sm dark:bg-navy-900">
      {showSpec && spec && (
        <>
          <p>
            <span className="text-navy-600 dark:text-navy-300">Componente:</span> {spec.spec.componente}{' '}
            <span className="text-navy-600 dark:text-navy-300">· Filtros:</span> {summarizeFilters(spec, corpus)}
          </p>
          <p className="mt-1 italic">{spec.spec.justificacion}</p>
          {spec.repaired && (
            <p className="mt-1 text-xs text-navy-600 dark:text-navy-300">
              El componente pedido no está en el catálogo: se usó el componente por defecto del fenómeno.
            </p>
          )}
          {spec.pending && (
            <p className="mt-1 text-xs text-navy-600 dark:text-navy-300">
              Los datos de este componente están pendientes de backend.
            </p>
          )}
          {USE_MOCKS && (
            <p className="mt-1 text-xs text-navy-600 dark:text-navy-300">
              Enrutador de demostración con reglas simples; el agente de visualización real llegará por POST
              /dashboard/consultar.
            </p>
          )}
        </>
      )}
      {unrecognized && (
        <div className={showSpec ? 'mt-3' : ''}>
          <p>No supe qué componente activar con esa instrucción. Prueba con:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {INSTRUCTION_EXAMPLES.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => onAsk(x)}
                className="rounded-full border border-navy-200 px-3 py-1 text-xs hover:bg-navy-100 dark:border-navy-700 dark:hover:bg-navy-800"
              >
                {x}
              </button>
            ))}
          </div>
        </div>
      )}
      {consultError && <p className="mt-2 text-red-600 dark:text-red-400">{consultError}</p>}
    </div>
  )
}
