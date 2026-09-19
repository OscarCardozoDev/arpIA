import type { User } from '../../interfaces/auth'
import type { Conversation } from '../../interfaces/conversation'
import { Icon } from '../components/Icon'
import { computeStats, firstName, recentConversations } from './services/dashboardStats'
import { StatCard } from './modules/StatCard'
import { RecentConversations } from './modules/RecentConversations'
import { SecurityCard } from './modules/SecurityCard'

export interface DashboardPageProps {
  user: User
  conversations: Conversation[]
  onOpenConversation(id: string): void
  onOpenChat(): void
}

/** Resumen de actividad de la sesión actual (datos locales, sin backend). */
export function DashboardPage({ user, conversations, onOpenConversation, onOpenChat }: DashboardPageProps) {
  const stats = computeStats(user, conversations)
  const recent = recentConversations(conversations)

  return (
    <div className="scroll-thin flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-navy-800 dark:text-navy-50">
              Hola, {firstName(user.name)}
            </h1>
            <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">
              Resumen de tu actividad con arpIA.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenChat}
            className="flex items-center gap-2 rounded-xl bg-navy-500 px-4 py-2 text-sm font-medium text-white hover:bg-navy-600 dark:bg-navy-400 dark:text-navy-950 dark:hover:bg-navy-300"
          >
            <Icon name="spark" className="h-4 w-4" /> Abrir arpIA
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="font-semibold">Conversaciones recientes</h2>
            <div className="mt-3">
              <RecentConversations conversations={recent} onOpenConversation={onOpenConversation} />
            </div>
          </div>
          <div>
            <h2 className="font-semibold">Seguridad</h2>
            <SecurityCard />
          </div>
        </div>

        <p className="mt-8 text-xs text-navy-600 dark:text-navy-300">
          Vista de ejemplo: muestra los datos de esta sesión y aún no está conectada al backend del
          Dashboard.
        </p>
      </div>
    </div>
  )
}
