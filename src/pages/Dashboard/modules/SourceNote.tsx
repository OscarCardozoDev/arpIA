import type { Corpus } from '../interfaces/dashboard'
import { formatNumber } from '../services/dashboardData'

interface SourceNoteProps {
  corpus: Corpus
}

/** Nota de procedencia de los datos del corpus, repetida al pie de cada página del Dashboard. */
export function SourceNote({ corpus }: SourceNoteProps) {
  return (
    <p className="mt-10 text-xs text-navy-600 dark:text-navy-300">
      Fuente: {corpus.source} ({formatNumber(corpus.docs.length)} PDF). Los otros formatos del corpus no están en
      esta muestra.
    </p>
  )
}
