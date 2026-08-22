import { BOARD_SIZE } from './board';
import { nextRandom } from './random';
import type { MatchState, Position, TerrainKind, TerrainTile } from './types';

/**
 * Terreno del campo de batalla.
 *
 * Reglas de reparto, pensadas para que el mapa condicione la partida sin
 * decidirla:
 *
 * 1. **Simétrico por rotación.** Cada casilla de terreno tiene su gemela en la
 *    posición opuesta del tablero. Si un jugador tiene unas ruinas delante de
 *    su Nexo, el otro las tiene igual: nadie hereda un mapa peor por sortearlo.
 * 2. **Nunca en las filas de despliegue.** Las filas 0 y 7 son donde entran las
 *    unidades; llenarlas de escombros bloquearía el juego.
 * 3. **Nunca en la columna del Nexo** (la del centro por la que se ataca de
 *    frente): el mapa no debe tapiar el objetivo de la partida.
 * 4. Las ruinas no se tocan entre sí, para no formar muros continuos que
 *    partan el tablero en dos.
 */

/** Cuántos pares de casillas de cada tipo se reparten. */
const RUBBLE_PAIRS = 2;
const COVER_PAIRS = 2;

/** Casilla opuesta por rotación de 180°: la gemela del reparto simétrico. */
export const mirrorPosition = (position: Position): Position => ({
  x: BOARD_SIZE - 1 - position.x,
  y: BOARD_SIZE - 1 - position.y,
});

const isDeployRow = (position: Position): boolean =>
  position.y === 0 || position.y === BOARD_SIZE - 1;

/** Columna central por la que se llega al Nexo (con 8 casillas, las dos del medio). */
const isNexusLane = (position: Position): boolean =>
  position.x === BOARD_SIZE / 2 - 1 || position.x === BOARD_SIZE / 2;

const adjacent = (a: Position, b: Position): boolean =>
  Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1;

/**
 * Reparte el terreno de una partida a partir de su semilla: la misma semilla
 * da siempre el mismo mapa, así que una revancha se juega en el mismo campo.
 */
export const generateTerrain = (seed: number): readonly TerrainTile[] => {
  const tiles: TerrainTile[] = [];
  // `nextRandom` devuelve `{ state, value }`: el estado se encadena para que
  // cada tirada dependa de la anterior, igual que hace el barajado del mazo.
  let random = nextRandom(seed >>> 0);

  const roll = (max: number): number => {
    random = nextRandom(random.state);
    return Math.floor(random.value * max);
  };

  const place = (kind: TerrainKind, pairs: number) => {
    for (let pair = 0; pair < pairs; pair += 1) {
      // Varios intentos y se abandona: más vale un mapa con menos terreno que
      // un bucle infinito buscando hueco en un tablero apretado.
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const position = { x: roll(BOARD_SIZE), y: roll(BOARD_SIZE) };
        const twin = mirrorPosition(position);
        if (isDeployRow(position) || isDeployRow(twin)) continue;
        if (isNexusLane(position)) continue;
        // Ni encima de otra casilla de terreno, ni pegada a ella si son ruinas.
        const choca = tiles.some((tile) => {
          if (tile.position.x === position.x && tile.position.y === position.y) return true;
          if (tile.position.x === twin.x && tile.position.y === twin.y) return true;
          return kind === 'rubble' && tile.kind === 'rubble'
            && (adjacent(tile.position, position) || adjacent(tile.position, twin));
        });
        if (choca) continue;
        // Una casilla no puede ser su propia gemela (centro exacto del tablero).
        if (position.x === twin.x && position.y === twin.y) continue;
        tiles.push({ kind, position }, { kind, position: twin });
        break;
      }
    }
  };

  place('rubble', RUBBLE_PAIRS);
  place('cover', COVER_PAIRS);
  return tiles;
};

/** Qué terreno hay en una casilla, si hay alguno. */
export const terrainAt = (state: MatchState, position: Position): TerrainKind | undefined =>
  state.terrain.find((tile) => tile.position.x === position.x && tile.position.y === position.y)?.kind;

/** Las ruinas no se pisan: ni para mover, ni para desplegar, ni para caer empujado. */
export const isBlocked = (state: MatchState, position: Position): boolean =>
  terrainAt(state, position) === 'rubble';

/** Cuánto daño a distancia ahorra la cobertura al que está encima. */
export const COVER_REDUCTION = 1;

/** ¿La casilla protege de los disparos? */
export const givesCover = (state: MatchState, position: Position): boolean =>
  terrainAt(state, position) === 'cover';
