/**
 * Genera `src/pages/Dashboard/data/corpusSnapshot.json` a partir de
 * `../backend/data/diagnostics/reporte_pdfs.csv`. Reproduce exactamente el
 * mismo formato que la constante `CORPUS` del template
 * `chat-estilo-chatgpt.html` (línea ~608): es una instantánea REAL y
 * temporal, la fuente final de estos datos es el backend.
 *
 * Uso: `bun run corpus:snapshot` (o `bun scripts/buildCorpusSnapshot.ts`)
 * desde `frontend/`.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** Fila cruda de una colección detectada en el CSV. */
interface RawCollection {
  folder: number
  dir: string
  name: string
}

/** Fila cruda de un documento detectado en el CSV. */
type RawDoc = [folder: number, collection: number, relPath: string, year: number, pages: number]

const CSV_PATH = resolve(import.meta.dirname, '../../backend/data/diagnostics/reporte_pdfs.csv')
const OUTPUT_PATH = resolve(import.meta.dirname, '../src/pages/Dashboard/data/corpusSnapshot.json')
const SOURCE = 'backend/data/diagnostics/reporte_pdfs.csv'

/** Regex del año: primer número de cuatro dígitos 19[89]x/20[0-2]x sin dígitos pegados a los lados. */
const YEAR_REGEX = /(?<![0-9])(19[89]\d|20[0-2]\d)(?![0-9])/

/**
 * Parser CSV correcto (RFC 4180 básico): soporta campos entre comillas dobles
 * con comas y comillas escapadas (`""`) dentro, como puede traer `metadata`.
 * Devuelve una fila por línea, cada una como arreglo de campos en crudo.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += c
      i += 1
      continue
    }
    if (c === '"') {
      inQuotes = true
      i += 1
      continue
    }
    if (c === ',') {
      row.push(field)
      field = ''
      i += 1
      continue
    }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i += 1
      continue
    }
    field += c
    i += 1
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.length > 1 || r[0] !== '')
}

/** Extrae el fenómeno (1|2|3) del prefijo `F1`/`F2`/`F3` del nombre de carpeta. */
function phenomenonFromFolder(folder: string): number {
  const m = /^F([123])_/.exec(folder)
  if (!m) throw new Error(`No se pudo determinar el fenómeno de la carpeta: ${folder}`)
  return Number(m[1])
}

/** Extrae el primer año plausible (§CLAUDE) del nombre de archivo, o 0 si no hay. */
function yearFromFileName(fileName: string): number {
  const m = YEAR_REGEX.exec(fileName)
  return m ? Number(m[1]) : 0
}

function main(): void {
  const csv = readFileSync(CSV_PATH, 'utf-8')
  const rows = parseCsv(csv)
  const header = rows[0]
  const pathIndex = header.indexOf('path')
  const pagesIndex = header.indexOf('pages')
  if (pathIndex < 0 || pagesIndex < 0) {
    throw new Error('El CSV no tiene las columnas esperadas (path, pages)')
  }

  const folders: Record<number, string> = {}
  const collectionsByKey = new Map<string, RawCollection>()
  const docs: RawDoc[] = []

  for (const row of rows.slice(1)) {
    const path = row[pathIndex]
    if (!path) continue
    // data/raw_muestra/<carpeta F>/<colección>/<ruta relativa...>
    const parts = path.split('/')
    const folderDir = parts[2]
    const collectionDir = parts[3]
    const relPath = parts.slice(4).join('/')
    const phenomenon = phenomenonFromFolder(folderDir)
    folders[phenomenon] = folderDir

    const key = `${phenomenon}|${collectionDir}`
    if (!collectionsByKey.has(key)) {
      collectionsByKey.set(key, {
        folder: phenomenon,
        dir: collectionDir,
        name: collectionDir.replace(/_/g, ' '),
      })
    }

    const fileName = relPath.split('/').pop() ?? relPath
    const year = yearFromFileName(fileName)
    const pages = Number(row[pagesIndex]) || 0

    docs.push([phenomenon, 0, relPath, year, pages]) // el índice de colección se resuelve abajo
  }

  const collections = [...collectionsByKey.values()].sort(
    (a, b) => a.folder - b.folder || a.name.localeCompare(b.name),
  )
  const indexByKey = new Map(collections.map((c, i) => [`${c.folder}|${c.dir}`, i]))

  // Segunda pasada: resolver el índice real de colección de cada documento.
  // (No se puede hacer en la primera porque el orden de colecciones se
  // conoce solo después de verlas todas.)
  let docIndex = 0
  for (const row of rows.slice(1)) {
    const path = row[pathIndex]
    if (!path) continue
    const parts = path.split('/')
    const folderDir = parts[2]
    const collectionDir = parts[3]
    const phenomenon = phenomenonFromFolder(folderDir)
    const key = `${phenomenon}|${collectionDir}`
    const collectionIndex = indexByKey.get(key)
    if (collectionIndex === undefined) throw new Error(`Colección no encontrada: ${key}`)
    docs[docIndex][1] = collectionIndex
    docIndex += 1
  }

  const snapshot = {
    source: SOURCE,
    folders,
    collections: collections.map((c) => ({ f: c.folder, dir: c.dir, name: c.name })),
    docs,
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot))

  const withYear = docs.filter((d) => d[3] !== 0).length
  console.log(
    `Escrito ${OUTPUT_PATH}: ${docs.length} documentos, ${collections.length} colecciones, ` +
      `${withYear} con año (${Math.round((withYear / docs.length) * 100)} %).`,
  )
}

main()
