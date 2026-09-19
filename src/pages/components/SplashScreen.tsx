import { MascotLogo } from './MascotLogo'

/** Pantalla completa centrada mostrada mientras se verifica la sesión (`useAuth().checking`). */
export function SplashScreen() {
  return (
    <div className="flex h-dvh items-center justify-center bg-white dark:bg-navy-950">
      <div className="flex flex-col items-center gap-3">
        <MascotLogo className="h-16 w-16" />
        <p role="status" className="text-sm text-navy-600 dark:text-navy-300">
          Cargando…
        </p>
      </div>
    </div>
  )
}
