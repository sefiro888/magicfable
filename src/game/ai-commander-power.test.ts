import { describe, expect, it } from 'vitest';
import { chooseNextAiAction } from './ai';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { createMatch } from './engine';
import type { BoardPiece, FactionId, MatchState, PlayerId, Position, ResourceState } from './types';

/**
 * La IA no usaba NUNCA el poder de su comandante: el jugador tenía una jugada
 * grande, una vez por partida, que su rival jamás respondía.
 */
const matchFor = (faction: FactionId): MatchState => {
  const mine = STARTER_DECKS.find((deck) => deck.faction === faction)!;
  const other = STARTER_DECKS.find((deck) => deck.faction !== faction)!;
  // El bando 'ai' es el que decide, así que su mazo va como segundo.
  return { ...createMatch(other, mine, 7), terrain: [], activePlayer: 'ai' };
};

const resources = (faction: FactionId, count: number): readonly ResourceState[] =>
  Array.from({ length: count }, (_, index) => ({
    instanceId: `${faction}-e${index}`, cardId: 'fuente-furia', faction, exhausted: false,
  }));

const withPlayer = (
  state: MatchState,
  playerId: PlayerId,
  values: Partial<MatchState['players'][PlayerId]>,
): MatchState => ({
  ...state,
  players: { ...state.players, [playerId]: { ...state.players[playerId], ...values } },
});

const makePiece = (
  instanceId: string, cardId: string, owner: PlayerId, position: Position,
  options: Partial<BoardPiece> = {},
): BoardPiece => {
  const card = CARD_BY_ID[cardId]!;
  return {
    instanceId, cardId, owner, position,
    currentHealth: card.health ?? card.resistance ?? 1,
    attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
    enteredOnTurn: 0, statuses: [], ...options,
  };
};

/** Sin cartas en la mano, para que la decisión no compita con un despliegue. */
const listo = (state: MatchState, faction: FactionId): MatchState =>
  withPlayer(state, 'ai', { hand: [], resources: resources(faction, 8), resourcePlayedThisTurn: true });

describe('la IA y el poder de su comandante', () => {
  it('lo lanza cuando el barrido pilla a varias unidades', () => {
    let state = listo(matchFor('fury'), 'fury'); // Kaela: 2 de daño a todas.
    state = {
      ...state,
      board: [
        makePiece('a', 'sabueso-brasa', 'player', { x: 2, y: 4 }),
        makePiece('b', 'sabueso-brasa', 'player', { x: 4, y: 4 }),
      ],
    };
    expect(chooseNextAiAction(state, new Set(), 'normal', 'ai')).toEqual({
      type: 'commander-power', playerId: 'ai',
    });
  });

  it('con una sola unidad enemiga que sobrevive al barrido, se lo guarda', () => {
    let state = listo(matchFor('fury'), 'fury');
    state = { ...state, board: [makePiece('duro', 'gigante-magma', 'player', { x: 3, y: 4 })] };
    expect(chooseNextAiAction(state, new Set(), 'normal', 'ai').type).not.toBe('commander-power');
  });

  it('el golpe dirigido va a la unidad que mata, no a la primera que encuentra', () => {
    // Nyxaris: 4 de daño a una unidad enemiga.
    let state = listo(matchFor('void'), 'void');
    state = {
      ...state,
      board: [
        makePiece('gorda', 'gigante-magma', 'player', { x: 2, y: 4 }),
        makePiece('rematable', 'berserker-ignivoro', 'player', { x: 4, y: 4 }, { currentHealth: 3 }),
      ],
    };
    const action = chooseNextAiAction(state, new Set(), 'normal', 'ai');
    expect(action).toEqual({
      type: 'commander-power', playerId: 'ai', target: { kind: 'piece', pieceId: 'rematable' },
    });
  });

  it('no lo repite: una vez gastado deja de ofrecerlo', () => {
    let state = listo(matchFor('fury'), 'fury');
    state = withPlayer(state, 'ai', { ...state.players.ai, commanderPowerUsed: true });
    state = {
      ...state,
      board: [
        makePiece('a', 'sabueso-brasa', 'player', { x: 2, y: 4 }),
        makePiece('b', 'sabueso-brasa', 'player', { x: 4, y: 4 }),
      ],
    };
    expect(chooseNextAiAction(state, new Set(), 'normal', 'ai').type).not.toBe('commander-power');
  });

  it('sin Esencia para pagarlo, ni se lo plantea', () => {
    let state = matchFor('fury');
    state = withPlayer(state, 'ai', { hand: [], resources: [], resourcePlayedThisTurn: true });
    state = {
      ...state,
      board: [
        makePiece('a', 'sabueso-brasa', 'player', { x: 2, y: 4 }),
        makePiece('b', 'sabueso-brasa', 'player', { x: 4, y: 4 }),
      ],
    };
    expect(chooseNextAiAction(state, new Set(), 'normal', 'ai').type).not.toBe('commander-power');
  });
});
