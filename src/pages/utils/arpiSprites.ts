/** Hojas de sprites concretas de la mascota arpIA, usadas por `Mascot`/`SpriteAnimation`. */
import { gridFrames, publicAssetUrl, type SpriteSheet } from './spriteSheet'

/** Sprite "arpi leyendo": 12 fotogramas (4x3), mostrado mientras el agente responde. */
export const ARPI_READING: SpriteSheet = {
  src: publicAssetUrl('arpi leyendo.png'),
  sheetWidth: 723,
  sheetHeight: 482,
  frameWidth: 127,
  frameHeight: 136,
  frames: gridFrames([109, 239, 364, 490], [26, 176, 325]),
  fps: 8,
}

/** Sprite "arpi esperando": 25 fotogramas (5x5), mostrado en reposo sobre la barra de entrada. */
export const ARPI_WAITING: SpriteSheet = {
  src: publicAssetUrl('arpi esperando.png'),
  sheetWidth: 452,
  sheetHeight: 553,
  frameWidth: 86,
  frameHeight: 102,
  frames: gridFrames([1, 91, 182, 273, 363], [30, 137, 239, 344, 450]),
  fps: 6,
}

/**
 * Sprite "arpi error": 16 fotogramas (4x4), secuencia narrativa (vuela, choca, cae)
 * mostrada cuando el chat termina en error. No hace loop: se detiene en el último fotograma.
 */
export const ARPI_ERROR: SpriteSheet = {
  src: publicAssetUrl('arpi error.png'),
  sheetWidth: 350,
  sheetHeight: 298,
  frameWidth: 88,
  frameHeight: 66,
  frames: gridFrames([0, 88, 178, 266], [7, 76, 147, 224]),
  fps: 8,
  loop: false,
}
