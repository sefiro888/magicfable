import { describe, expect, it } from 'vitest';
import { chooseNextAiAction } from './ai';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, endTurn } from './engine';
import type { BoardPiece, MatchState } from './types';

const aiTurnState = (seed: number): MatchState => {
  const match = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, seed);
  const result = endTurn(match, 'player');
  if (!result.ok) throw new Error('No se pudo ceder el turno inicial.');
  return result.state;
};

describe('IA paso a paso (chooseNextAiAction)', () => {
  it('completa su turno con acciones legales y termina en un número acotado de pasos', () => {
    for (const seed of [1, 77, 90210]) {
      let state = aiTurnState(seed);
      const skipped = new Set<string>();
      let steps = 0;
      while (state.activePlayer === 'ai' && state.phase !== 'finished' && steps < 90) {
        const action = chooseNextAiAction(state, skipped);
        const result = applyAction(state, action);
        if (!result.ok) {
          // Toda acción fallida debe poder omitirse sin bloquear el turno.
          expect(action.type === 'play-card' || action.type === 'play-resource').toBe(true);
          if (action.type === 'play-card' || action.type === 'play-resource') {
            skipped.add(action.cardInstanceId);
          }
        } else {
          state = result.state;
        }
        steps += 1;
      }
      expect(steps).toBeLessThan(90);
      expect(state.activePlayer === 'player' || state.phase === 'finished').toBe(true);
    }
  });

  it('es determinista: la misma semilla produce la misma secuencia', () => {
    const play = (seed: number): string[] => {
      let state = aiTurnState(seed);
      const skipped = new Set<string>();
      const trace: string[] = [];
      let steps = 0;
      while (state.activePlayer === 'ai' && state.phase !== 'finished' && steps < 90) {
        const action = chooseNextAiAction(state, skipped);
        trace.push(JSON.stringify(action));
        const result = applyAction(state, action);
        if (result.ok) state = result.state;
        else if (action.type === 'play-card' || action.type === 'play-resource') skipped.add(action.cardInstanceId);
        steps += 1;
      }
      return trace;
    };
    expect(play(4242)).toEqual(play(4242));
  });

  it('en fácil no remata el Nexo aunque pueda; en normal sí', () => {
    const base = aiTurnState(5);
    // Una unidad de la IA pegada al Nexo del jugador (fila 7, Nexo en la 8).
    const striker: BoardPiece = {
      instanceId: 'striker', cardId: 'sabueso-brasa', owner: 'ai', position: { x: 4, y: 7 },
      currentHealth: 1, attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
      enteredOnTurn: 0, statuses: [],
    };
    // Mano vacía y fuente ya jugada: la IA pasa directa a la fase de ataque.
    const state: MatchState = {
      ...base,
      board: [striker],
      players: { ...base.players, ai: { ...base.players.ai, hand: [], resourcePlayedThisTurn: true } },
    };
    expect(chooseNextAiAction(state, new Set(), 'normal')).toEqual({
      type: 'attack-nexus', playerId: 'ai', attackerId: 'striker',
    });
    expect(chooseNextAiAction(state, new Set(), 'easy').type).not.toBe('attack-nexus');
  });
});
