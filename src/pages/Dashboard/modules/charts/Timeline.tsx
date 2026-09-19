import type { Corpus, CorpusDoc } from '../../interfaces/dashboard'
import { formatNumber, timelineData } from '../../services/dashboardData'
import { PHENOMENA } from '../../services/phenomena'
import { ChartCard } from './ChartCard'
import { PhenomenonLegend } from './PhenomenonLegend'
import { sourceNoteText } from './sourceNote'

interface TimelineProps {
  corpus: Corpus
  docs: CorpusDoc[]
  onOpenEvidence(key: string): void
}

const WIDTH = 640
const HEIGHT = 260
const LEFT = 40
const RIGHT = 14
const TOP = 12
const BOTTOM = 32

/** Línea de tiempo SVG de documentos por año y fenómeno, con puntos clicables. */
export function Timeline({ corpus, docs, onOpenEvidence }: TimelineProps) {
  const data = timelineData(docs)

  if (!data) {
    return (
      <ChartCard
        title="Documentos por año y fenómeno"
        subtitle="Tendencia · unidad: número de documentos (PDF)."
        corpus={corpus}
      >
        <p className="mt-3 text-sm text-navy-600 dark:text-navy-300">
          Ningún documento con año con los filtros actuales.
        </p>
      </ChartCard>
    )
  }

  const { yearFrom, yearTo, top, series, skipped } = data
  const span = Math.max(1, yearTo - yearFrom)
  const x = (year: number) => LEFT + ((year - yearFrom) / span) * (WIDTH - LEFT - RIGHT)
  // Marcas del eje Y en múltiplos de 5 (a lo sumo ~5); la escala sube al siguiente múltiplo del paso
  const tickStep = 5 * Math.ceil(top / 20)
  const scaleTop = Math.ceil(top / tickStep) * tickStep
  const y = (count: number) => TOP + (1 - count / scaleTop) * (HEIGHT - TOP - BOTTOM)
  const step = Math.ceil((span + 1) / 10)

  const gridValues: number[] = []
  for (let v = 0; v <= scaleTop; v += tickStep) gridValues.push(v)
  const yearLabels: number[] = []
  for (let year = yearFrom; year <= yearTo; year += step) yearLabels.push(year)

  const foot = `${skipped ? `${formatNumber(skipped)} documentos sin año no aparecen en esta línea (no se les imputa fecha). ` : ''}${sourceNoteText(corpus)}`

  return (
    <ChartCard
      title="Documentos por año y fenómeno"
      subtitle="Tendencia · unidad: número de documentos (PDF) por año del nombre del archivo. Haz clic en un punto para ver los documentos."
      foot={foot}
    >
      <PhenomenonLegend />
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full text-navy-800 dark:text-navy-100"
        role="img"
        aria-label="Línea de tiempo de documentos por año y fenómeno"
      >
        {gridValues.map((v) => (
          <g key={v}>
            <line x1={LEFT} x2={WIDTH - RIGHT} y1={y(v)} y2={y(v)} stroke="currentColor" opacity={0.12} />
            <text x={LEFT - 6} y={y(v) + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.7}>
              {Math.round(v)}
            </text>
          </g>
        ))}
        {yearLabels.map((year) => (
          <text key={year} x={x(year)} y={HEIGHT - 10} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
            {year}
          </text>
        ))}
        {series.map((s) => (
          <g key={s.phenomenon}>
            <polyline
              fill="none"
              stroke={PHENOMENA[s.phenomenon].color}
              strokeWidth={2.5}
              points={s.points.map((p) => `${x(p.year)},${y(p.count)}`).join(' ')}
            />
            {s.points
              .filter((p) => p.count > 0)
              .map((p) => (
                <circle
                  key={p.year}
                  cx={x(p.year)}
                  cy={y(p.count)}
                  r={4.5}
                  fill={PHENOMENA[s.phenomenon].color}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`${PHENOMENA[s.phenomenon].key} · ${p.year}: ${p.count} documentos`}
                  onClick={() => onOpenEvidence(`fy:${s.phenomenon}:${p.year}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onOpenEvidence(`fy:${s.phenomenon}:${p.year}`)
                    }
                  }}
                >
                  <title>{`${PHENOMENA[s.phenomenon].key} · ${p.year}: ${p.count} documentos`}</title>
                </circle>
              ))}
          </g>
        ))}
      </svg>
    </ChartCard>
  )
}
