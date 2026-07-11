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

/** Posición visual del Nexo: media casilla más allá de su fila lógica. */
export const nexusWorldZ = (playerId: PlayerId): number =>
  gridToWorldZ(nexusRow(playerId)) - (playerId === 'player' ? -0.18 : 0.18) * CELL_SIZE

export const NEXUS_WORLD: Readonly<Record<string, readonly [number, number]>> = {
  'player-nexus': [0, nexusWorldZ('player')],
  'ai-nexus': [0, nexusWorldZ('ai')],
}

/**
 * Factor de escala para escenografía diseñada originalmente para la huella
 * del tablero 5×5 (5 × 1.18 = 5.9 unidades). Permite reutilizar Sanctuary
 * sin remodelarlo.
 */
export const LEGACY_FOOTPRINT = 5.9
export const SCENERY_SCALE = BOARD_WORLD_SIZE / LEGACY_FOOTPRINT

/** Encuadre de cámara recomendado para la huella actual. */
export const CAMERA_POSITION: readonly [number, number, number] = [0, 9.6, 9.3]
export const CAMERA_FOV = 44
export const CAMERA_MIN_DISTANCE = 9.6
export const CAMERA_MAX_DISTANCE = 13.4
