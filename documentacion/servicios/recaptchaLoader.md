# Servicio: recaptchaLoader

**Archivo:** `src/pages/Login/services/recaptchaLoader.ts`
**Endpoint:** ninguno propio — carga el script externo `https://www.google.com/recaptcha/api.js`

## Qué hace

Inserta dinámicamente el script de reCAPTCHA v2 (`render=explicit`) una sola
vez por sesión de página, usando una promesa compartida entre llamadas: si
`RecaptchaWidget` se monta varias veces, no se vuelve a insertar el script.
Resuelve cuando Google invoca el callback de `onload`; rechaza a los 10s si el
script no carga (sin conexión, bloqueado por el navegador, etc.).

## Funciones exportadas

| Función | Entrada | Salida | Errores |
|---|---|---|---|
| `loadRecaptcha()` | ninguna | `Promise<void>` (resuelve cuando `window.grecaptcha` está listo) | rechaza con `Error('recaptcha_timeout')` a los 10s o `Error('recaptcha_script_error')` si el `<script>` falla |

## Dependencias (interfaces / guards)

- `src/pages/Login/interfaces/recaptcha.d.ts` — tipos de `window.grecaptcha` (sin `any`).

## Estados de UI que genera (loading / error / empty)

No genera UI directamente: `RecaptchaWidget` (en `modules/`) consume la
promesa y muestra "Cargando reCAPTCHA…" mientras está pendiente, el widget
real si resuelve, y el mensaje de error (con salida de modo demo sin
conexión) si rechaza.
