import { Icon } from '../../components/Icon'

/** Tarjeta con los mecanismos de seguridad activos en la sesión (informativa, sin lógica). */
export function SecurityCard() {
  return (
    <ul className="mt-3 space-y-3 rounded-2xl border border-navy-200 bg-navy-50/60 p-4 text-sm dark:border-navy-800 dark:bg-navy-900">
      <li className="flex items-start gap-2">
        <Icon name="shield" className="mt-0.5 h-4 w-4 text-navy-500 dark:text-navy-300" />
        Verificación en dos pasos por WhatsApp
      </li>
      <li className="flex items-start gap-2">
        <Icon name="shield" className="mt-0.5 h-4 w-4 text-navy-500 dark:text-navy-300" />
        reCAPTCHA en el inicio de sesión
      </li>
    </ul>
  )
}
