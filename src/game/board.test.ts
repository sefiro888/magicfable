import { describe, expect, it } from 'vitest';
import { chooseNextAiAction, runAiTurn } from './ai';
import {
  BOARD_CELL_COUNT,
  BOARD_CENTER,
  BOARD_MAX,
  BOARD_MIN,
  BOARD_SIZE,
  deploymentRow,
  distanceToCenter,
  distanceToEnemyNexusRow,
  isInsideBoard,
  nexusRow,
} from './board';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, endTurn, getValidDeploymentPositions } from './engine';
import type { MatchState } from './types';

const freshMatch = (seed = 42): MatchState => createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, seed);

describe('configuración lógica del tablero 8×8', () => {
  it('define exactamente 64 casillas en una rejilla de 8×8', () => {
    expect(BOARD_SIZE).toBe(8);
    expect(BOARD_MIN).toBe(0);
    expect(BOARD_MAX).toBe(7);
    expect(BOARD_CELL_COUNT).toBe(64);
  });

  it('acepta todas las coordenadas de 0 a 7 y rechaza las exteriores', () => {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      for (let y = 0; y < BOARD_SIZE; y += 1) {
        expect(isInsideBoard({ x, y })).toBe(true);
      }
    }
    expect(isInsideBoard({ x: -1, y: 0 })).toBe(false);
    expect(isInsideBoard({ x: 8, y: 0 })).toBe(false);
    expect(isInsideBoard({ x: 0, y: -1 })).toBe(false);
    expect(isInsideBoard({ x: 0, y: 8 })).toBe(false);
    expect(isInsideBoard({ x: 2.5, y: 2 })).toBe(false);
  });

  it('sitúa el despliegue rival en y=0, el del jugador en y=7 y los Nexos detrás', () => {
    expect(deploymentRow('ai')).toBe(0);
    expect(deploymentRow('player')).toBe(7);
    expect(nexusRow('ai')).toBe(-1);
    expect(nexusRow('player')).toBe(8);
  });

  it('calcula el centro determinista de un tablero par entre las columnas 3 y 4', () => {
    expect(BOARD_CENTER).toBe(3.5);
    expect(distanceToCenter(3)).toBe(distanceToCenter(4));
    expect(distanceToCenter(0)).toBeGreaterThan(distanceToCenter(3));
    expect(distanceToCenter(7)).toBe(distanceToCenter(0));
  });

  it('mide el avance hacia el Nexo rival sin valores codificados', () => {
    // La IA avanza hacia la fila 8 (Nexo del jugador).
    expect(distanceToEnemyNexusRow('ai', 0)).toBe(8);
    expect(distanceToEnemyNexusRow('ai', 7)).toBe(1);
    // El jugador avanza hacia la fila -1 (Nexo de la IA).
    expect(distanceToEnemyNexusRow('player', 7)).toBe(8);
    expect(distanceToEnemyNexusRow('player', 0)).toBe(1);
  });
});

describe('el motor sobre el tablero 8×8', () => {
  it('ofrece ocho posiciones de despliegue por jugador en su fila', () => {
    const state = freshMatch();
    const player = getValidDeploymentPositions(state, 'player');
    const ai = getValidDeploymentPositions(state, 'ai');
    expect(player).toHaveLength(8);
    expect(ai).toHaveLength(8);
    expect(player.every((cell) => cell.y === 7)).toBe(true);
    expect(ai.every((cell) => cell.y === 0)).toBe(true);
  });

  it('rechaza desplegar fuera de la fila propia o fuera del tablero', () => {
    let state = freshMatch();
    state = {
      ...state,
      players: {
        ...state.players,
        player: {
          ...state.players.player,
          hand: [{ instanceId: 'mano-sabueso', cardId: 'sabueso-brasa' }],
          resources: [{ instanceId: 'r1', cardId: 'fuente-furia', faction: 'fury', exhausted: false }],
        },
      },
    };
    const wrongRow = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'mano-sabueso', position: { x: 3, y: 4 },
    });
    expect(wrongRow.ok).toBe(false);
    const outside = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'mano-sabueso', position: { x: 8, y: 7 },
    });
    expect(outside.ok).toBe(false);
    const valid = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'mano-sabueso', position: { x: 3, y: 7 },
    });
    expect(valid.ok).toBe(true);
  });

  it('los efectos adyacentes en esquinas y bordes no salen del tablero', () => {
    // Dragón de la Caldera: 2 de daño a todas las cartas adyacentes al entrar.
    let state = freshMatch();
    state = {
      ...state,
      board: [
        {
          instanceId: 'victima', cardId: 'sabueso-brasa', owner: 'ai', position: { x: 1, y: 7 },
          currentHealth: 1, attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
          enteredOnTurn: 0, statuses: [],
        },
      ],
      players: {
        ...state.players,
        player: {
          ...state.players.player,
          hand: [{ instanceId: 'mano-dragon', cardId: 'dragon-caldera' }],
          resources: Array.from({ length: 7 }, (_, index) => ({
            instanceId: `r-${index}`, cardId: 'fuente-furia', faction: 'fury' as const, exhausted: false,
          })),
        },
      },
    };
    // Despliegue en la esquina (0,7): solo tiene 2 vecinos dentro del tablero.
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'mano-dragon', position: { x: 0, y: 7 },
    });
    expect(result.ok).toBe(true);
    // La víctima adyacente (1,7) recibió el daño y murió; nada explotó fuera de límites.
    expect(result.state.board.some((piece) => piece.instanceId === 'victima')).toBe(false);
  });

  it('una unidad en la fila 7 puede atacar el Nexo del jugador y viceversa', () => {
    let state = freshMatch();
    state = {
      ...state,
      activePlayer: 'ai',
      board: [
        {
          instanceId: 'asaltante', cardId: 'sabueso-brasa', owner: 'ai', position: { x: 4, y: 7 },
          currentHealth: 1, attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
          enteredOnTurn: 0, statuses: [],
        },
      ],
    };
    const hit = applyAction(state, { type: 'attack-nexus', playerId: 'ai', attackerId: 'asaltante' });
    expect(hit.ok).toBe(true);
    expect(hit.state.players.player.nexusHealth).toBe(23);
  });
});

describe('la IA sobre el tablero 8×8', () => {
  it('despliega centrándose entre las columnas 3 y 4 cuando no hay enemigos', () => {
    const base = freshMatch();
    const aiTurn = endTurn(base, 'player');
    if (!aiTurn.ok) throw new Error('no se pudo ceder el turno');
    const state: MatchState = {
      ...aiTurn.state,
      players: {
        ...aiTurn.state.players,
        ai: {
          ...aiTurn.state.players.ai,
          hand: [{ instanceId: 'ia-centinela', cardId: 'centinela-cristal' }],
          resources: Array.from({ length: 3 }, (_, index) => ({
            instanceId: `ia-r-${index}`, cardId: 'fuente-arcana', faction: 'arcane' as const, exhausted: false,
          })),
          resourcePlayedThisTurn: true,
        },
      },
    };
    const action = chooseNextAiAction(state);
    expect(action.type).toBe('play-card');
    if (action.type === 'play-card' && action.position) {
      expect([3, 4]).toContain(action.position.x);
      expect(action.position.y).toBe(0);
    }
  });

  it('completa un turno entero y una simulación corta sin bucles en 8×8', () => {
    const base = freshMatch(777);
    const result = endTurn(base, 'player');
    if (!result.ok) throw new Error('no se pudo ceder el turno');
    const after = runAiTurn(result.state);
    expect(after.activePlayer === 'player' || after.phase === 'finished').toBe(true);
    expect(after.turn).toBeGreaterThanOrEqual(result.state.turn);
  });
});
