/**
 * Lógica genérica para animar hojas de sprites (sprite sheets) en cuadrícula,
 * reutilizable por cualquier sprite del proyecto (sin React/JSX).
 */

/** Datos completos de una hoja de sprites: imagen, dimensiones y fotogramas. */
export interface SpriteSheet {
  src: string
  sheetWidth: number
  sheetHeight: number
  frameWidth: number
  frameHeight: number
  frames: readonly { x: number; y: number }[]
  fps: number
  /** Si es `false`, la animación se reproduce una sola vez y se detiene en el último fotograma. Por defecto `true`. */
  loop?: boolean
}

/**
 * Genera los orígenes de una cuadrícula de fotogramas en orden de lectura
 * (fila 0 col 0..n, fila 1 col 0..n, …) a partir de los orígenes X e Y de cada
 * columna/fila (no necesariamente equiespaciados).
 */
export function gridFrames(
  columnOrigins: readonly number[],
  rowOrigins: readonly number[],
): readonly { x: number; y: number }[] {
  return rowOrigins.flatMap((y) => columnOrigins.map((x) => ({ x, y })))
}

/**
 * Calcula el estilo CSS de fondo para mostrar un fotograma escalado de `sheet`.
 * `frameIndex` se toma módulo la cantidad total de fotogramas (índice siempre válido).
 */
export function getFrameStyle(
  sheet: SpriteSheet,
  frameIndex: number,
  scale: number,
): { backgroundPosition: string; backgroundSize: string } {
  const total = sheet.frames.length
  const frame = sheet.frames[((frameIndex % total) + total) % total]
  return {
    backgroundPosition: `-${frame.x * scale}px -${frame.y * scale}px`,
    backgroundSize: `${sheet.sheetWidth * scale}px ${sheet.sheetHeight * scale}px`,
  }
}

/** Construye la URL pública de un asset estático, codificando espacios u otros caracteres. */
export function publicAssetUrl(fileName: string): string {
  return encodeURI(`${import.meta.env.BASE_URL}${fileName}`)
}
