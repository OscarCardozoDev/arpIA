import type { Collection, Corpus, CorpusDoc, PhenomenonId } from '../interfaces/dashboard'
import corpusSnapshot from '../data/corpusSnapshot.json'

/** Forma cruda del JSON generado por `scripts/buildCorpusSnapshot.ts`. */
interface RawCorpus {
  source: string
  folders: Record<string, string>
  collections: { f: number; dir: string; name: string }[]
  docs: [number, number, string, number, number][]
}

let cached: Corpus | null = null

/**
 * Devuelve la instantánea del corpus (memoizada), normalizada a los tipos del
 * Dashboard. Es una fuente TEMPORAL: los datos vienen de
 * `src/pages/Dashboard/data/corpusSnapshot.json`, generado a partir de
 * `backend/data/diagnostics/reporte_pdfs.csv` con
 * `bun run corpus:snapshot`. La fuente final será el backend
 * (`POST /dashboard/consultar`).
 */
export function getCorpus(): Corpus {
  if (cached) return cached

  const raw = corpusSnapshot as unknown as RawCorpus
  const collections: Collection[] = raw.collections.map((c, index) => ({
    index,
    phenomenon: c.f as PhenomenonId,
    dir: c.dir,
    name: c.name,
  }))
  const docs: CorpusDoc[] = raw.docs.map(([phenomenon, collection, relPath, year, pages]) => ({
    phenomenon: phenomenon as PhenomenonId,
    collection,
    relPath,
    fileName: relPath.split('/').pop() ?? relPath,
    year: year || null,
    pages,
  }))
  const years = [...new Set(docs.map((d) => d.year).filter((y): y is number => y !== null))].sort(
    (a, b) => a - b,
  )
  const folders = Object.fromEntries(
    Object.entries(raw.folders).map(([k, v]) => [Number(k), v]),
  ) as Record<PhenomenonId, string>

  cached = { source: raw.source, folders, collections, docs, years }
  return cached
}
