import { describe, expect, it } from 'vitest';
import { BOARD_SIZE } from './board';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, getValidDeploymentPositions, getValidMoves } from './engine';
import { generateTerrain, mirrorPosition, terrainAt } from './terrain';
import type { BoardPiece, MatchState, PlayerId, Position, TerrainTile } from './types';

const pieza = (instanceId: string, cardId: string, owner: PlayerId, position: Position): BoardPiece => {
  const card = CARD_BY_ID[cardId]!;
  return {
    instanceId, cardId, owner, position,
    currentHealth: card.health ?? card.resistance ?? 1,
    attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
    enteredOnTurn: 0, statuses: [],
  };
};

/** Partida en fase principal con el terreno que se le indique. */
const conTerreno = (terrain: readonly TerrainTile[], board: readonly BoardPiece[] = []): MatchState => ({
  ...createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 11),
  phase: 'main',
  activePlayer: 'player',
  terrain,
  board,
});

describe('reparto del terreno', () => {
  it('la misma semilla da siempre el mismo mapa', () => {
    expect(generateTerrain(1234)).toEqual(generateTerrain(1234));
  });

  it('es simétrico: cada casilla tiene su gemela opuesta', () => {
    for (const seed of [1, 7, 42, 999, 31337]) {
      const tiles = generateTerrain(seed);
      for (const tile of tiles) {
        const gemela = mirrorPosition(tile.position);
        const encontrada = tiles.find(
          (candidate) => candidate.position.x === gemela.x && candidate.position.y === gemela.y,
        );
        expect(encontrada, `semilla ${seed}: falta la gemela de (${tile.position.x},${tile.position.y})`).toBeDefined();
        expect(encontrada?.kind).toBe(tile.kind);
      }
    }
  });

  it('nunca ocupa las filas de despliegue ni la columna del Nexo', () => {
    for (let seed = 1; seed <= 60; seed += 1) {
      for (const tile of generateTerrain(seed)) {
        expect(tile.position.y, `semilla ${seed}`).not.toBe(0);
        expect(tile.position.y, `semilla ${seed}`).not.toBe(BOARD_SIZE - 1);
        expect([BOARD_SIZE / 2 - 1, BOARD_SIZE / 2], `semilla ${seed}`).not.toContain(tile.position.x);
      }
    }
  });

  it('nunca pone dos casillas de terreno encima de la misma', () => {
    for (let seed = 1; seed <= 60; seed += 1) {
      const claves = generateTerrain(seed).map((tile) => `${tile.position.x},${tile.position.y}`);
      expect(new Set(claves).size, `semilla ${seed}`).toBe(claves.length);
    }
  });

  it('cada partida nace con su mapa repartido', () => {
    const match = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 4242);
    expect(match.terrain.length).toBeGreaterThan(0);
    expect(match.terrain).toEqual(generateTerrain(4242));
  });
});

describe('ruinas', () => {
  const ruinas = [{ kind: 'rubble' as const, position: { x: 3, y: 4 } }];

  it('no se puede terminar el movimiento encima', () => {
    const state = conTerreno(ruinas, [pieza('u1', 'sabueso-brasa', 'player', { x: 3, y: 5 })]);
    const destinos = getValidMoves(state, 'u1');
    expect(destinos.some((cell) => cell.x === 3 && cell.y === 4)).toBe(false);
  });

  it('tampoco volando: los escombros no son un obstáculo que se sobrevuele', () => {
    const state = conTerreno(ruinas, [pieza('v1', 'fenix-pavesa', 'player', { x: 3, y: 5 })]);
    expect(getValidMoves(state, 'v1').some((cell) => cell.x === 3 && cell.y === 4)).toBe(false);
  });

  it('cortan el paso: no se puede cruzar por encima', () => {
    const state = conTerreno(ruinas, [pieza('u1', 'ariete-volcanico', 'player', { x: 3, y: 6 })]);
    // La casilla de más allá de las ruinas queda inalcanzable en línea recta.
    expect(getValidMoves(state, 'u1').some((cell) => cell.x === 3 && cell.y === 3)).toBe(false);
  });

  it('no se puede desplegar sobre ellas', () => {
    const enFilaPropia = [{ kind: 'rubble' as const, position: { x: 2, y: 7 } }];
    const state = conTerreno(enFilaPropia);
    const casillas = getValidDeploymentPositions(state, 'player');
    expect(casillas.some((cell) => cell.x === 2 && cell.y === 7)).toBe(false);
    // El resto de la fila sigue disponible.
    expect(casillas.some((cell) => cell.x === 3 && cell.y === 7)).toBe(true);
  });

  it('cortan la línea de tiro de los ataques a distancia', () => {
    const state = conTerreno(ruinas, [
      pieza('tirador', 'elemental-tormenta', 'player', { x: 3, y: 5 }),
      pieza('blanco', 'centinela-cristal', 'ai', { x: 3, y: 3 }),
    ]);
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'tirador', defenderId: 'blanco' });
    expect(result.ok).toBe(false);
  });
});

describe('cobertura', () => {
  const cobertura = [{ kind: 'cover' as const, position: { x: 3, y: 3 } }];

  it('resta 1 de daño a los disparos recibidos', () => {
    const board = [
      pieza('tirador', 'elemental-tormenta', 'player', { x: 3, y: 5 }),
      pieza('blanco', 'golem-azur', 'ai', { x: 3, y: 3 }),
    ];
    const conCobertura = applyAction(conTerreno(cobertura, board), {
      type: 'attack-piece', playerId: 'player', attackerId: 'tirador', defenderId: 'blanco',
    });
    const sinCobertura = applyAction(conTerreno([], board), {
      type: 'attack-piece', playerId: 'player', attackerId: 'tirador', defenderId: 'blanco',
    });
    expect(conCobertura.ok && sinCobertura.ok).toBe(true);
    const vidaCon = conCobertura.state.board.find((p) => p.instanceId === 'blanco')?.currentHealth ?? 0;
    const vidaSin = sinCobertura.state.board.find((p) => p.instanceId === 'blanco')?.currentHealth ?? 0;
    expect(vidaCon).toBe(vidaSin + 1);
  });

  it('no protege del cuerpo a cuerpo: ahí ya estás encima', () => {
    const board = [
      pieza('bruto', 'sabueso-brasa', 'player', { x: 3, y: 4 }),
      pieza('blanco', 'golem-azur', 'ai', { x: 3, y: 3 }),
    ];
    const conCobertura = applyAction(conTerreno(cobertura, board), {
      type: 'attack-piece', playerId: 'player', attackerId: 'bruto', defenderId: 'blanco',
    });
    const sinCobertura = applyAction(conTerreno([], board), {
      type: 'attack-piece', playerId: 'player', attackerId: 'bruto', defenderId: 'blanco',
    });
    const vidaCon = conCobertura.state.board.find((p) => p.instanceId === 'blanco')?.currentHealth;
    const vidaSin = sinCobertura.state.board.find((p) => p.instanceId === 'blanco')?.currentHealth;
    expect(vidaCon).toBe(vidaSin);
  });

  it('sí se puede pisar y desplegar en ella', () => {
    const state = conTerreno([{ kind: 'cover', position: { x: 2, y: 7 } }], [
      pieza('u1', 'sabueso-brasa', 'player', { x: 2, y: 6 }),
    ]);
    expect(getValidDeploymentPositions(state, 'player').some((c) => c.x === 2 && c.y === 7)).toBe(true);
    expect(terrainAt(state, { x: 2, y: 7 })).toBe('cover');
  });
});
