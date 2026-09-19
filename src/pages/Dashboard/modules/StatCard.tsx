import type { DashboardStat } from '../interfaces/dashboard'

interface StatCardProps {
  stat: DashboardStat
}

/** Tarjeta visual de una estadística del Dashboard (valor grande + etiqueta). */
export function StatCard({ stat }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-navy-200 bg-navy-50/60 p-4 dark:border-navy-800 dark:bg-navy-900">
      <div className="text-2xl font-semibold text-navy-700 dark:text-navy-100">{stat.value}</div>
      <div className="mt-1 text-xs text-navy-600 dark:text-navy-300">{stat.label}</div>
    </div>
  )
}
