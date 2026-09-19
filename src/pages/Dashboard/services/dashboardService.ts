import { mockRouteInstruction } from '../../../example/dashboardRouter.mock'
import { HttpError, request } from '../../../services/httpClient'
import { USE_MOCKS } from '../../../services/config'
import { repairSpec } from '../guards/dashboardGuards'
import type { ResolvedSpec } from '../interfaces/dashboard'
import { getCorpus } from './corpusService'
import { COMPONENT_CATALOG } from './phenomena'
import { specToFilters } from './dashboardData'

/**
 * Envía la instrucción en lenguaje natural al agente de visualización
 * (`POST /dashboard/consultar`, o el enrutador de demostración si
 * `USE_MOCKS` está activo) y resuelve la especificación devuelta contra el
 * corpus actual. Devuelve `null` si el texto no se reconoce (mock) o si la
 * especificación es irreparable (guard). Los errores de red se propagan.
 */
export async function consult(text: string): Promise<ResolvedSpec | null> {
  const corpus = getCorpus()
  const raw = USE_MOCKS
    ? mockRouteInstruction(text, corpus.collections)
    : await request('POST', '/dashboard/consultar', { instruccion: text })

  if (raw === null) return null

  const result = repairSpec(raw)
  if (!result) return null

  const { spec, repaired } = result
  const catalogEntry = COMPONENT_CATALOG[spec.componente]
  return {
    spec,
    page: catalogEntry.page,
    tab: catalogEntry.tab,
    pending: catalogEntry.pending,
    filters: specToFilters(spec, corpus),
    repaired,
  }
}

/** Traduce un error de `consult` a un mensaje legible para el usuario. */
export function dashboardErrorMessage(err: unknown): string {
  if (err instanceof HttpError) {
    switch (err.code) {
      case 'timeout':
        return 'La consulta tardó demasiado. Inténtalo de nuevo.'
      case 'network':
        return 'No se pudo conectar con el servidor. Revisa tu conexión.'
      case 'invalid_json':
      case 'server':
        return 'El servidor respondió con un error inesperado.'
      default:
        return 'Ocurrió un error al procesar la instrucción.'
    }
  }
  return 'Ocurrió un error inesperado al procesar la instrucción.'
}
