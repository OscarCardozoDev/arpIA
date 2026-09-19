import type { Corpus } from '../../interfaces/dashboard'
import { formatNumber } from '../../services/dashboardData'

/** Nota de fuente estándar de las tarjetas de gráfica, igual a `SOURCE_NOTE` del template. */
export function sourceNoteText(corpus: Corpus): string {
  return `Fuente: ${corpus.source} (${formatNumber(corpus.docs.length)} PDF). Los otros formatos del corpus no están en esta muestra.`
}
