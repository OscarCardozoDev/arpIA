/** Tres puntos animados que indican "escribiendo…" mientras la IA prepara la respuesta. */
export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-2" aria-label="Escribiendo">
      {[0, 150, 300].map((delay) => (
        <i
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-navy-400"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}
