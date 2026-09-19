# Página: Login

**Ubicación:** `src/pages/Login/`
**Backend:** `POST /auth/login`, `POST /auth/verify`, `POST /auth/resend` (vía `src/services/authService.ts`)

## Propósito

Autenticación en dos pasos, migrada del template (`chat-estilo-chatgpt.html`,
`#viewLogin` y su JS de autenticación líneas ~886-1075):

1. **Credenciales** (`modules/CredentialsStep.tsx`): usuario/contraseña +
   reCAPTCHA v2.
2. **OTP por WhatsApp** (`modules/OtpStep.tsx`): código de `OTP_LENGTH`
   dígitos, con reenvío tras un contador (`hooks/useCountdown.ts`).

## Contrato con `App.tsx`

```ts
export interface LoginPageProps {
  showNotice: boolean              // "Inicia sesión para acceder a esa sección."
  onLoggedIn(user: User): void
  autoFocus: boolean                // enfoca usuario (paso 1) o primera casilla OTP (paso 2)
}
```

`App.tsx` decide cuándo mostrar `showNotice` (llegada redirigida desde una
ruta protegida) y qué hacer con el `User` en `onLoggedIn` (por ejemplo,
guardarlo con `useAuth`).

## Flujo de los dos pasos

- `LoginPage` guarda el paso actual (`'credentials' | 'otp'`) y el
  `LoginChallenge` devuelto por `login()`.
- `CredentialsStep` valida con `validateCredentials`, exige un token de
  reCAPTCHA no vacío, llama a `authService.login()` y, si tiene éxito, limpia
  la contraseña y entrega el `LoginChallenge` a `LoginPage`. Tras cada intento
  (éxito o error) reinicia el widget de reCAPTCHA porque sus tokens son de un
  solo uso.
- `OtpStep` valida con `validateOtp`, llama a `authService.verify()` al
  completar las casillas o al pulsar "Verificar y entrar". Un código
  incorrecto limpia las casillas y enfoca la primera. Si el backend responde
  `too_many_attempts`, `LoginPage` vuelve al paso 1 mostrando ese mensaje
  (`onTooManyAttempts`).
- "Reenviar código" llama a `authService.resend()` y reinicia el contador de
  `useCountdown` (`OTP_RESEND_SECONDS`).

## Modo demo (`isDemoMode` / `VITE_USE_MOCKS`)

Cuando el frontend usa los mocks de `src/example/auth.mock.ts`:

- Usuario `demo`, contraseña `demo1234`, código `123456` (`DEMO_CREDENTIALS`).
- `CredentialsStep` muestra la pista de usuario/contraseña; `OtpStep` muestra
  la pista del código.
- `RecaptchaWidget` no depende de tener internet: si el script de Google no
  carga (sin conexión), entrega automáticamente el token simulado
  `'demo-sin-recaptcha'` para que el login funcione igual (`mockLogin` solo
  exige que el token no esté vacío).

## Componentes (`modules/`)

| Componente | Descripción |
|---|---|
| `CredentialsStep` | Paso 1: usuario, contraseña (mostrar/ocultar), reCAPTCHA |
| `OtpStep` | Paso 2: código OTP, reenvío con contador, volver al paso 1 |
| `OtpInput` | `OTP_LENGTH` casillas controladas, reparte dígitos escritos/pegados |
| `RecaptchaWidget` | Carga y renderiza el widget de reCAPTCHA v2, con reinicio y modo demo sin conexión |

## Servicios y hooks

- `services/recaptchaLoader.ts` — ver [recaptchaLoader.md](../servicios/recaptchaLoader.md).
- `hooks/useCountdown.ts` — cuenta regresiva en segundos con `restart()`, usada para el reenvío del OTP.

## Sin conexión / fallos del backend

Todos los mensajes de error vienen de `authErrorMessage()` (`src/services/authService.ts`),
que traduce cualquier `HttpError` a un texto en español. `CredentialsStep` y
`OtpStep` los muestran con `role="alert"`.
