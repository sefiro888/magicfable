import { BOARD_SIZE, nexusRow } from '../../game/board'
import type { PlayerId, Position } from '../../game'

/**
 * Configuración visual del tablero: traduce la cuadrícula lógica (0..BOARD_MAX)
 * a coordenadas de mundo 3D. Es la única fuente de verdad para Board3D,
 * EventEffects y los escenarios; la lógica de reglas vive en src/game/board.ts.
 */

/** Paso entre centros de casilla, en unidades de mundo. */
export const CELL_SIZE = 0.92

/** Lado visible de la baldosa (deja una junta entre casillas). */
export const TILE_SIZE = CELL_SIZE * 0.915

/** Huella total del tablero en el mundo. */
export const BOARD_WORLD_SIZE = BOARD_SIZE * CELL_SIZE

/** Media huella: distancia del centro al borde exterior del tablero. */
export const BOARD_WORLD_HALF = BOARD_WORLD_SIZE / 2

/** Desplazamiento del centro de la casilla 0 respecto al centro del mundo. */
const ORIGIN_OFFSET = ((BOARD_SIZE - 1) / 2) * CELL_SIZE

export const gridToWorldX = (x: number): number => x * CELL_SIZE - ORIGIN_OFFSET
export const gridToWorldZ = (y: number): number => y * CELL_SIZE - ORIGIN_OFFSET

export const gridToWorld = (position: Position): readonly [number, number] => [
  gridToWorldX(position.x),
  gridToWorldZ(position.y),
]

/**
 * Inversa de `gridToWorld`: de un punto del suelo a la casilla que lo contiene.
 * Devuelve `undefined` si cae fuera del tablero. La usa el arrastre de cartas
 * para saber sobre qué casilla se está soltando.
 */
export const worldToGrid = (worldX: number, worldZ: number): Position | undefined => {
  const x = Math.round((worldX + ORIGIN_OFFSET) / CELL_SIZE)
  const y = Math.round((worldZ + ORIGIN_OFFSET) / CELL_SIZE)
  if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) return undefined
  return { x, y }
}

/** Posición visual del Nexo: media casilla más allá de su fila lógica. */
export const nexusWorldZ = (playerId: PlayerId): number =>
  gridToWorldZ(nexusRow(playerId)) - (playerId === 'player' ? -0.18 : 0.18) * CELL_SIZE

export const NEXUS_WORLD: Readonly<Record<string, readonly [number, number]>> = {
  'player-nexus': [0, nexusWorldZ('player')],
  'ai-nexus': [0, nexusWorldZ('ai')],
}


/**
 * Encuadre de cámara recomendado para la huella actual.
 * La posición inicial mantiene el ángulo picado clásico pero arranca más cerca
 * (~11.5 de distancia frente a los ~15.6 anteriores) para que el tablero llene
 * más la pantalla. La distancia mínima baja a 8.5 para permitir un zoom mayor;
 * la máxima conserva el encuadre amplio previo por si se quiere alejar.
 *
 * El picado se suavizó de ~44,6° a ~35,6° bajo la horizontal (mismos ~11,5 de
 * distancia): con el ángulo anterior, del cielo solo asomaba una rendija
 * rasante por encima del tablero que ninguna textura llegaba a lucir. Sigue
 * dentro del rango que ya permitía OrbitControls (maxPolarAngle 1.03 rad ≈
 * 59° desde la vertical), así que el usuario ya podía llegar aquí orbitando;
 * ahora es el encuadre de partida.
 */
export const CAMERA_POSITION: readonly [number, number, number] = [0, 6.7, 8.8]
export const CAMERA_FOV = 44
/**
 * Centro exacto del tablero. Antes estaba desplazado a -0.6 hacia el campo
 * rival, un sesgo que en la práctica cortaba el Nexo propio por el borde
 * inferior. Con el encuadre calculado (ResponsiveCamera) ya no hace falta
 * compensar nada a mano: centrado deja los dos Nexos a la misma distancia.
 */
export const CAMERA_TARGET: readonly [number, number, number] = [0, 0, 0]
/**
 * El mínimo baja de 8.5 a 7 para dejar sitio a la distancia por defecto en
 * móvil vertical (Board3D.tsx, MOBILE_DISTANCE=7.4, ResponsiveCamera) — si
 * quedara por encima, OrbitControls empujaría la cámara de vuelta a 8.5 en
 * cuanto actualizara, deshaciendo el acercamiento pensado para que el tablero
 * llene la pantalla en vertical.
 */
export const CAMERA_MIN_DISTANCE = 7
export const CAMERA_MAX_DISTANCE = 16.2
