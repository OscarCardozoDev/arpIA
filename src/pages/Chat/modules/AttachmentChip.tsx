import { Icon } from '../../components/Icon'

interface AttachmentChipProps {
  name: string
  onRemove(): void
}

/** Chip que muestra el nombre del archivo adjunto simulado, con botón para quitarlo. */
export function AttachmentChip({ name, onRemove }: AttachmentChipProps) {
  return (
    <div className="mb-1 px-1">
      <span className="inline-flex max-w-full items-center gap-2 rounded-xl bg-black/5 py-1.5 pl-3 pr-2 text-sm dark:bg-white/10">
        <Icon name="file" className="h-4 w-4 shrink-0" />
        <span className="truncate">{name}</span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Quitar archivo"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      </span>
    </div>
  )
}
