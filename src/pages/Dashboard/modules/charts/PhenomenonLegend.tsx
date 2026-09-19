import { PHENOMENA, PHENOMENON_IDS } from '../../services/phenomena'

/** Leyenda de los tres fenómenos: punto de color + nombre (el color nunca es el único portador). */
export function PhenomenonLegend() {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {PHENOMENON_IDS.map((f) => (
        <span key={f} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PHENOMENA[f].color }} />
          {PHENOMENA[f].name}
        </span>
      ))}
    </div>
  )
}
