import type { ReactNode } from 'react'
import type { Corpus } from '../../interfaces/dashboard'
import { sourceNoteText } from './sourceNote'

interface ChartCardProps {
  title: string
  subtitle: string
  children: ReactNode
  /** Corpus completo, para la nota de fuente por defecto. Omitir si se pasa `foot`. */
  corpus?: Corpus
  /** Pie propio; si se omite se usa la nota de fuente estándar a partir de `corpus`. */
  foot?: ReactNode
}

/** Tarjeta de gráfica: título, subtítulo con métrica/unidad, contenido y pie de fuente. */
export function ChartCard({ title, subtitle, children, corpus, foot }: ChartCardProps) {
  return (
    <div className="mt-8 rounded-2xl border border-navy-200 bg-white p-5 dark:border-navy-800 dark:bg-navy-900 md:p-6">
      <h2>{title}</h2>
      <p className="mt-1 text-xs text-navy-600 dark:text-navy-300">{subtitle}</p>
      {children}
      <p className="mt-3 text-xs text-navy-600 dark:text-navy-300">{foot ?? (corpus ? sourceNoteText(corpus) : '')}</p>
    </div>
  )
}
