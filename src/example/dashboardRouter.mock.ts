import type { Collection, ComponentId, DashboardSpec, PhenomenonId } from '../pages/Dashboard/interfaces/dashboard'
import { COMPONENT_CATALOG } from '../pages/Dashboard/services/phenomena'

/** Quita tildes y pasa a minúsculas, igual que `norm` del template. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/**
 * Enrutador de DEMOSTRACIÓN por palabras clave, puerto fiel de
 * `routeInstruction()` de `chat-estilo-chatgpt.html`. Sustituye al agente de
 * visualización real (`POST /dashboard/consultar`) solo cuando `USE_MOCKS`
 * está activo. Devuelve `null` si no reconoce ningún componente en el texto.
 */
export function mockRouteInstruction(text: string, collections: Collection[]): DashboardSpec | null {
  const t = norm(text)
  const phen = new Set<PhenomenonId>()
  if (/\bia\b|inteligencia artificial|militar|estrateg|\bf1\b|fenomeno 1/.test(t)) phen.add(1)
  if (/espacial|orbita|satelit|basura|\bleo\b|\bf2\b|fenomeno 2/.test(t)) phen.add(2)
  if (/territori|latam|latinoam|colombia|amazon|\bpaz\b|conflicto|departament|\bf3\b|fenomeno 3/.test(t)) phen.add(3)

  let coll = -1
  collections.forEach((c, i) => {
    // Se reconoce por su sigla (la primera palabra), salvo "AI Index Stanford".
    const key = c.name === 'AI Index Stanford' ? 'stanford' : norm(c.name.split(' ')[0])
    if (coll < 0 && new RegExp('\\b' + key + '\\b').test(t)) coll = i
  })
  if (coll >= 0) {
    phen.clear()
    phen.add(collections[coll].phenomenon)
  }

  let from = 0
  let to = 0
  let m: RegExpMatchArray | null
  if ((m = t.match(/entre (\d{4}) y (\d{4})/))) {
    from = Number(m[1])
    to = Number(m[2])
  } else {
    if ((m = t.match(/desde (?:el )?(\d{4})/))) from = Number(m[1])
    if ((m = t.match(/hasta (?:el )?(\d{4})/))) to = Number(m[1])
    if (!from && !to && (m = t.match(/\ben (\d{4})\b/))) from = to = Number(m[1])
  }

  let comp: ComponentId | null = null
  if (/territori|mapa|geograf|departament|por pais/.test(t)) comp = 'mapa_coropletico'
  else if (/\bred\b|relacion|co-?ocurrencia|conectad|juntos|vecinos/.test(t)) comp = 'red_coocurrencia'
  else if (/calor|matriz|heatmap/.test(t)) comp = 'matriz_calor'
  else if (/tiempo|evoluci|tendencia|linea|cambia|desde|historic|entre \d{4}/.test(t)) comp = 'linea_tiempo'
  else if (/tabla|listado|lista|conteo|detalle/.test(t)) comp = 'tabla_conteos'
  else if (/reparte|composicion|proporcion|compar|colecci|barras|cuantos|distribucion/.test(t)) comp = 'barras_comparacion'
  else if (phen.size === 1) {
    // Componente por defecto del fenómeno.
    const defaults: Record<PhenomenonId, ComponentId> = { 1: 'matriz_calor', 2: 'barras_comparacion', 3: 'mapa_coropletico' }
    comp = defaults[[...phen][0]]
  }
  if (!comp) return null

  return {
    componente: comp,
    justificacion: COMPONENT_CATALOG[comp].justification,
    filtros: {
      fenomeno: [...phen],
      coleccion: coll >= 0 ? collections[coll].dir : null,
      anio_desde: from || null,
      anio_hasta: to || null,
    },
  }
}
