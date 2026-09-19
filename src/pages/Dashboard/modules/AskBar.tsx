import { Icon } from '../../components/Icon'

interface AskBarProps {
  value: string
  onChange(value: string): void
  onSubmit(): void
  consulting: boolean
}

/** Caja de instrucción en lenguaje natural que decide el componente y los filtros del Dashboard. */
export function AskBar({ value, onChange, onSubmit, consulting }: AskBarProps) {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <input
        type="text"
        autoComplete="off"
        aria-label="Instrucción en lenguaje natural"
        placeholder="Pídele algo al tablero: «evolución del F2 desde 2020»"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded-xl border border-navy-200 bg-navy-50 px-3.5 py-2.5 text-base outline-none placeholder:text-navy-500 focus:border-navy-400 focus:ring-2 focus:ring-navy-300/60 dark:border-navy-700 dark:bg-navy-900 dark:placeholder:text-navy-300 dark:focus:ring-navy-600"
      />
      <button
        type="submit"
        disabled={consulting}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-navy-500 px-4 text-white transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-navy-400 dark:text-navy-950 dark:hover:bg-navy-300"
      >
        <Icon name="send" className="h-4 w-4" />
        <span className="hidden sm:inline">{consulting ? 'Consultando…' : 'Consultar'}</span>
      </button>
    </form>
  )
}
