# Servicio: corpusService

**Archivo:** `src/pages/Dashboard/services/corpusService.ts`
**Endpoint:** ninguno (lee un JSON estático empaquetado)

## Qué hace

Expone `getCorpus()`, que lee `src/pages/Dashboard/data/corpusSnapshot.json`
(import estático, `resolveJsonModule`), lo normaliza a los tipos de
`interfaces/dashboard.ts` (`Corpus`, `Collection`, `CorpusDoc`) y memoiza el
resultado para no repetir el trabajo en cada render.

Es una fuente **temporal**: `corpusSnapshot.json` es una instantánea real de
759 PDF tomada de `backend/data/diagnostics/reporte_pdfs.csv`, generada por
`scripts/buildCorpusSnapshot.ts`. La fuente final de estos datos será el
backend (`POST /dashboard/consultar`); cuando exista, este servicio deja de
usarse.

### Regenerar el JSON

```bash
bun run corpus:snapshot
```

## Funciones exportadas

| Función | Entrada | Salida | Errores |
|---|---|---|---|
| `getCorpus` | — | `Corpus` (memoizado) | No lanza; el JSON se empaqueta en el build |

## Dependencias (interfaces / guards)

- `interfaces/dashboard.ts`: `Corpus`, `Collection`, `CorpusDoc`, `PhenomenonId`.
- `data/corpusSnapshot.json`: generado por `scripts/buildCorpusSnapshot.ts` a
  partir de `backend/data/diagnostics/reporte_pdfs.csv`.

## Estados de UI que genera (loading / error / empty)

Ninguno: la lectura es síncrona y local, no hay estado de carga ni de error.
Un corpus vacío (`docs: []`) se refleja en los conteos de `dashboardData.ts`
(0 documentos), que sí manejan el caso vacío en la UI.

## Nota sobre la cifra de "con año"

Con el método de extracción de año usado aquí (primer número de cuatro
dígitos `19[89]x`/`20[0-2]x` del **nombre del archivo**, sin dígitos pegados a
los lados), 227 de 759 documentos (30 %) tienen año. `ARQUITECTURA_SOLUCION.md`
menciona una cifra distinta, cercana al 51 %, obtenida con otro método
(probablemente inspeccionando el contenido del documento, no solo el nombre
del archivo). Ambas cifras están documentadas para no confundirlas: esta es
la que usa el Dashboard hoy.
