import type { ReactNode } from 'react'

interface PendingCardProps {
  title: string
  what: string
  /** Cada elemento puede incluir nodos (por ejemplo `<code>`) en vez de solo texto. */
  needs: ReactNode[]
}

/** Tarjeta punteada "Pendiente" para las vistas del Dashboard sin datos reales todavía. */
export function PendingCard({ title, what, needs }: PendingCardProps) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-navy-300 p-6 dark:border-navy-700 md:p-8">
      <h2>
        {title}{' '}
        <span className="ml-2 rounded-full bg-navy-100 px-2 py-0.5 text-xs dark:bg-navy-800">Pendiente</span>
      </h2>
      <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">{what}</p>
      <p className="mt-3 text-sm">Necesita:</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-navy-600 dark:text-navy-300">
        {needs.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-navy-600 dark:text-navy-300">
        No se dibuja con datos de ejemplo: la versión final solo puede usar datos reales.
      </p>
    </div>
  )
}
