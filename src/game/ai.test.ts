import { describe, expect, it } from 'vitest';
import { chooseNextAiAction, runAiTurn } from './ai';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch } from './engine';
import type { BoardPiece, MatchState } from './types';

const match = (seed = 123): MatchState => createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, seed);

const aiPiece = (instanceId: string, cardId: string, x: number, y: number): BoardPiece => ({
  instanceId,
  cardId,
  owner: 'ai',
  position: { x, y },
  currentHealth: CARD_BY_ID[cardId]?.health ?? 1,
  attackModifier: 0,
  movedThisTurn: false,
  attackedThisTurn: false,
  enteredOnTurn: 0,
  statuses: [],
});

describe('IA básica determinista', () => {
  it('finaliza el turno incluso cuando no dispone de ninguna acción', () => {
    const aiTurn = applyAction(match(), { type: 'end-turn', playerId: 'player' });
    expect(aiTurn.ok).toBe(true);
    const state: MatchState = {
      ...aiTurn.state,
      players: {
        ...aiTurn.state.players,
        ai: { ...aiTurn.state.players.ai, hand: [], deck: [], resources: [] },
      },
    };
    const result = runAiTurn(state);
    expect(result.activePlayer).toBe('player');
    expect(result.turn).toBe(3);
    expect(result.phase).toBe('main');
  });

  it('juega una fuente y una unidad pagable antes de ceder el turno', () => {
    const base = match();
    const state: MatchState = {
      ...base,
      activePlayer: 'ai',
      turn: 2,
      players: {
        ...base.players,
        ai: {
          ...base.players.ai,
          hand: [
            { instanceId: 'ai-source', cardId: 'fuente-arcana' },
            { instanceId: 'ai-duelist', cardId: 'duelista-prisma' },
          ],
          deck: [],
          resources: [],
          resourcePlayedThisTurn: false,
        },
      },
      board: [],
      animations: [],
    };
    const result = runAiTurn(state);
    expect(result.activePlayer).toBe('player');
    expect(result.players.ai.resources).toHaveLength(1);
    expect(result.board).toContainEqual(expect.objectContaining({ cardId: 'duelista-prisma', owner: 'ai', position: expect.objectContaining({ y: 0 }) }));
    expect(result.players.ai.stats.cardsPlayed).toBe(2);
  });

  it('prioriza un ataque letal al Nexo y termina la partida', () => {
    const base = match();
    const state: MatchState = {
      ...base,
      activePlayer: 'ai',
      turn: 8,
      players: {
        ...base.players,
        player: { ...base.players.player, nexusHealth: 2 },
        ai: { ...base.players.ai, hand: [], deck: [] },
      },
      board: [aiPiece('hound', 'sabueso-brasa', 2, 7)],
      animations: [],
    };
    const result = runAiTurn(state);
    expect(result.phase).toBe('finished');
    expect(result.winner).toBe('ai');
    expect(result.players.player.nexusHealth).toBe(0);
  });

  it('no gasta un hechizo de congelación cuando el rival solo tiene estructuras', () => {
    const base = match();
    const state: MatchState = {
      ...base,
      activePlayer: 'ai',
      turn: 4,
      players: {
        ...base.players,
        ai: {
          ...base.players.ai,
          hand: [{ instanceId: 'ai-freeze', cardId: 'congelacion-rapida' }],
          deck: [],
          resources: [
            { instanceId: 'r1', cardId: 'fuente-arcana', faction: 'arcane', exhausted: false },
            { instanceId: 'r2', cardId: 'fuente-arcana', faction: 'arcane', exhausted: false },
          ],
          resourcePlayedThisTurn: true,
        },
      },
      board: [{
        instanceId: 'player-tower', cardId: 'torre-horizonte', owner: 'player',
        position: { x: 3, y: 7 }, currentHealth: 5, attackModifier: 0,
        movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
      }],
      animations: [],
    };
    // Antes se proponía congelar la estructura: el motor rechazaba la acción y se perdía el paso.
    const action = chooseNextAiAction(state);
    expect(action.type).not.toBe('play-card');
    expect(runAiTurn(state).players.ai.hand.map((card) => card.instanceId)).toContain('ai-freeze');
  });

  it('produce exactamente las mismas decisiones a partir del mismo estado y semilla', () => {
    const base = match(9981);
    const state: MatchState = {
      ...base,
      activePlayer: 'ai',
      turn: 2,
      players: {
        ...base.players,
        ai: {
          ...base.players.ai,
          hand: [{ instanceId: 'source', cardId: 'fuente-arcana' }],
          deck: [],
          resources: [],
        },
      },
      animations: [],
    };
    expect(runAiTurn(state)).toEqual(runAiTurn(state));
  });
});
