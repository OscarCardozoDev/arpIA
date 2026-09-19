import type { ComponentId, DashboardSpec, PhenomenonId } from '../interfaces/dashboard'
import { COMPONENT_CATALOG, DEFAULT_COMPONENT } from '../services/phenomena'

const VALID_COMPONENTS: ComponentId[] = Object.keys(COMPONENT_CATALOG) as ComponentId[]
const VALID_PHENOMENA: PhenomenonId[] = [1, 2, 3]

function isPhenomenonArray(value: unknown): value is PhenomenonId[] {
  return Array.isArray(value) && value.every((v) => VALID_PHENOMENA.includes(v as PhenomenonId))
}

/**
 * Valida que `data` cumpla exactamente el contrato `DashboardSpec`, incluido
 * el catálogo CERRADO de componentes. No usa `any`: si algo no calza, devuelve
 * `false` sin lanzar.
 */
export function isDashboardSpec(data: unknown): data is DashboardSpec {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  if (typeof d.componente !== 'string' || !VALID_COMPONENTS.includes(d.componente as ComponentId)) return false
  if (typeof d.justificacion !== 'string') return false
  if (typeof d.filtros !== 'object' || d.filtros === null) return false
  const f = d.filtros as Record<string, unknown>
  if (!isPhenomenonArray(f.fenomeno)) return false
  if (f.coleccion !== null && typeof f.coleccion !== 'string') return false
  if (f.anio_desde !== null && typeof f.anio_desde !== 'number') return false
  if (f.anio_hasta !== null && typeof f.anio_hasta !== 'number') return false
  return true
}

/**
 * Repara una especificación inválida: si `componente` no está en el catálogo
 * pero `filtros.fenomeno` trae al menos un fenómeno válido, la sustituye por
 * el componente por defecto del primero de esos fenómenos, con su
 * justificación del catálogo y filtros saneados. Devuelve `null` si no hay
 * forma de reparar (datos irreconocibles o sin fenómeno).
 */
export function repairSpec(data: unknown): { spec: DashboardSpec; repaired: boolean } | null {
  if (isDashboardSpec(data)) return { spec: data, repaired: false }

  if (typeof data !== 'object' || data === null) return null
  const d = data as Record<string, unknown>
  const rawFiltros = typeof d.filtros === 'object' && d.filtros !== null ? (d.filtros as Record<string, unknown>) : {}
  const fenomeno = isPhenomenonArray(rawFiltros.fenomeno) ? rawFiltros.fenomeno : []
  if (!fenomeno.length) return null

  const componente = DEFAULT_COMPONENT[fenomeno[0]]
  const coleccion = typeof rawFiltros.coleccion === 'string' ? rawFiltros.coleccion : null
  const anioDesde = typeof rawFiltros.anio_desde === 'number' ? rawFiltros.anio_desde : null
  const anioHasta = typeof rawFiltros.anio_hasta === 'number' ? rawFiltros.anio_hasta : null

  const spec: DashboardSpec = {
    componente,
    justificacion: COMPONENT_CATALOG[componente].justification,
    filtros: { fenomeno, coleccion, anio_desde: anioDesde, anio_hasta: anioHasta },
  }
  return { spec, repaired: true }
}
