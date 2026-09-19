import { useCallback, useEffect, useState } from 'react'
import type { User } from '../interfaces/auth'
import * as authService from '../services/authService'

interface UseAuthResult {
  user: User | null
  checking: boolean
  signIn(user: User): void
  logout(): Promise<void>
}

/**
 * Maneja la sesión del usuario: al montar consulta `GET /auth/me` (o su mock)
 * para saber si ya hay sesión activa. `logout` siempre limpia el usuario
 * local aunque el backend falle.
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false
    authService
      .me()
      .then((current) => {
        if (!cancelled) setUser(current)
      })
      .catch((err: unknown) => {
        // Sin backend alcanzable se trata como "sin sesión": el login mostrará el error real al intentar entrar.
        console.warn('No se pudo verificar la sesión activa.', err)
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback((newUser: User) => {
    setUser(newUser)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (err) {
      // El backend puede fallar (red caída, sesión ya expirada): igual se cierra localmente.
      console.warn('Fallo al cerrar sesión en el backend, se limpia localmente.', err)
    } finally {
      setUser(null)
    }
  }, [])

  return { user, checking, signIn, logout }
}
