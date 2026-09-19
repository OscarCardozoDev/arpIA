import { Icon } from '../../components/Icon'
import { getSuggestions } from '../../../services/conversationService'

interface WelcomeProps {
  onPick(text: string): void
}

/** Pantalla de bienvenida del chat vacío: saludo y botones de sugerencias iniciales. */
export function Welcome({ onPick }: WelcomeProps) {
  const suggestions = getSuggestions()

  return (
    <section className="flex min-h-full flex-col items-center justify-center px-4 pb-8 text-center">
      <h1 className="text-2xl font-semibold text-navy-800 dark:text-navy-50 sm:text-3xl">¿En qué puedo ayudarte hoy?</h1>
      <div className="mt-8 flex max-w-2xl flex-wrap justify-center gap-2.5">
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(s.text)}
            className="flex items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-sm hover:bg-navy-50 dark:border-navy-700 dark:hover:bg-navy-800"
          >
            <Icon name={s.icon} className="h-4 w-4 text-navy-500 dark:text-navy-300" />
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
