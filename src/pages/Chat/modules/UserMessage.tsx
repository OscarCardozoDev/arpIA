interface UserMessageProps {
  text: string
}

/** Burbuja del mensaje del usuario, alineada a la derecha. */
export function UserMessage({ text }: UserMessageProps) {
  return (
    <div className="rise flex justify-end">
      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl bg-navy-100 px-5 py-2.5 dark:bg-navy-800 md:max-w-[75%]">
        {text}
      </div>
    </div>
  )
}
