import { useEffect, useRef } from 'react'
import type { Corpus, EvidenceResult } from '../interfaces/dashboard'
import { EVIDENCE_MAX, PHENOMENA } from '../services/phenomena'
import { evidencePath, formatNumber } from '../services/dashboardData'
import { Icon } from '../../components/Icon'

interface EvidencePanelProps {
  evidence: EvidenceResult | null
  corpus: Corpus
  onClose(): void
}

/**
 * Cajón fijo a la derecha con los documentos que sustentan un dato del
 * tablero. Se cierra con el botón o con Esc, y mueve el foco al botón cerrar
 * al abrirse. `doc_id`/`chunk_id`/texto llegarán del backend (nota fija al pie).
 */
export function EvidencePanel({ evidence, corpus, onClose }: EvidencePanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const isOpen = evidence !== null

  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!evidence) return null

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-navy-200 bg-white shadow-2xl dark:border-navy-800 dark:bg-navy-950"
      aria-label="Panel de evidencia"
    >
      <div className="flex items-start justify-between gap-3 border-b border-navy-200 p-4 dark:border-navy-800">
        <div className="min-w-0">
          <h2 className="text-lg leading-snug">{evidence.title}</h2>
          <p className="mt-1 text-xs text-navy-600 dark:text-navy-300">
            {evidence.subtitle} · {formatNumber(evidence.total)} documentos
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar evidencia"
          className="rounded-lg p-2 text-navy-600 hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-navy-800"
        >
          <Icon name="x" className="h-5 w-5" />
        </button>
      </div>
      <div className="scroll-thin flex-1 space-y-2 overflow-y-auto p-4">
        {evidence.docs.length === 0 && (
          <p className="text-sm text-navy-600 dark:text-navy-300">No hay documentos con los filtros actuales.</p>
        )}
        {evidence.docs.map((d) => (
          <div key={`${d.collection}/${d.relPath}`} className="rounded-xl border border-navy-200 p-3 dark:border-navy-800">
            <p className="break-all text-sm">{d.fileName}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-navy-600 dark:text-navy-300">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: PHENOMENA[d.phenomenon].color }}
              />
              {PHENOMENA[d.phenomenon].key} · {corpus.collections[d.collection]?.name} · {d.year ?? 'sin año'} ·{' '}
              {formatNumber(d.pages)} págs.
            </p>
            <p className="mt-1 break-all text-[11px] text-navy-600 dark:text-navy-300">{evidencePath(d, corpus)}</p>
          </div>
        ))}
        {evidence.total > EVIDENCE_MAX && (
          <p className="text-xs text-navy-600 dark:text-navy-300">
            Se muestran los {EVIDENCE_MAX} documentos con más páginas.
          </p>
        )}
      </div>
      <p className="border-t border-navy-200 p-4 text-xs text-navy-600 dark:border-navy-800 dark:text-navy-300">
        Trazabilidad: aquí se muestra el archivo fuente de cada dato. El <code>doc_id</code>, el{' '}
        <code>chunk_id</code> y el texto literal del fragmento llegarán del backend (herramienta{' '}
        <code>obtener_evidencia</code>); todavía no están disponibles en esta plantilla.
      </p>
    </aside>
  )
}
