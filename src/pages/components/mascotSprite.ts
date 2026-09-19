/** Mapa de caracteres del sprite de la mascota (16x15 px). B cuerpo · D contorno · L brillo · Y punta de la antena. */
export const SPRITE: readonly string[] = [
  '................',
  '.......YY.......',
  '.......DD.......',
  '...DDDDDDDDDD...',
  '..DBBBBBBBBBBD..',
  '..DBLLBBBBBBBD..',
  '..DBBBBBBBBBBD..',
  '..DBBBBBBBBBBD..',
  '.DDBBBBBBBBBBDD.',
  '.DBBBBBBBBBBBBD.',
  '.DBBBBBBBBBBBBD.',
  '..DDBBBBBBBBDD..',
  '...DDDDDDDDDD...',
  '...DBBD..DBBD...',
  '...DDDD..DDDD...',
]

/** Colores de cada carácter del sprite. */
export const PALETTE: Record<string, string> = {
  B: '#7b96c9',
  D: '#2b3d61',
  L: '#c5d2e8',
  Y: '#f5c842',
}

/** Color de tinta (ojos/boca) y blanco de los brillos de los ojos. */
export const INK = '#16203a'
export const WHITE = '#ffffff'

export interface SpriteRect {
  x: number
  y: number
  w: number
  h: number
  fill: string
  /** `true` si el rectángulo pertenece a la punta de la antena (parpadea con `.px-tip`). */
  isTip: boolean
}

/**
 * Convierte el mapa de caracteres `SPRITE` en una lista de rectángulos,
 * uniendo píxeles contiguos del mismo color en cada fila (equivalente a
 * `spriteBody` del template). Los caracteres sin color en `PALETTE` se ignoran.
 */
export function spriteToRects(): SpriteRect[] {
  const rects: SpriteRect[] = []
  SPRITE.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      const c = row[x]
      let n = 1
      while (row[x + n] === c) n++
      const fill = PALETTE[c]
      if (fill) rects.push({ x, y, w: n, h: 1, fill, isTip: c === 'Y' })
      x += n
    }
  })
  return rects
}
