import type { PlayerId, Position } from './types';

/**
 * Configuración lógica del tablero: fuente única de verdad.
 * El motor, la IA y las pruebas dependen SOLO de este módulo; la capa visual
 * tiene su propia configuración de mundo en src/battle/grid/gridCoordinates.ts.
 */
export const BOARD_SIZE = 8;
export const BOARD_MIN = 0;
export const BOARD_MAX = BOARD_SIZE - 1;
export const BOARD_CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

/**
 * Centro geométrico de un tablero par (entre las columnas/filas 3 y 4).
 * Se usa solo para ordenar por cercanía; nunca como casilla real.
 */
export const BOARD_CENTER = (BOARD_SIZE - 1) / 2;

/** Fila de despliegue: la IA en la fila 0, el jugador en la última. */
export const deploymentRow = (playerId: PlayerId): number =>
  playerId === 'player' ? BOARD_MAX : BOARD_MIN;

/** Fila lógica del Nexo, justo detrás de la fila de despliegue de su dueño. */
export const nexusRow = (playerId: PlayerId): number =>
  playerId === 'player' ? BOARD_SIZE : -1;

export const isInsideBoard = (position: Position): boolean =>
  Number.isInteger(position.x) &&
  Number.isInteger(position.y) &&
  position.x >= BOARD_MIN &&
  position.x <= BOARD_MAX &&
  position.y >= BOARD_MIN &&
  position.y <= BOARD_MAX;

/** Distancia de una columna/fila al centro del tablero (determinista en tablero par). */
export const distanceToCenter = (coordinate: number): number =>
  Math.abs(coordinate - BOARD_CENTER);

/** Distancia restante hasta la fila del Nexo rival, para heurísticas de avance. */
export const distanceToEnemyNexusRow = (playerId: PlayerId, y: number): number =>
  Math.abs(nexusRow(playerId === 'player' ? 'ai' : 'player') - y);
