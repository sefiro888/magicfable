import { describe, expect, it } from 'vitest';
import { chooseNextAiAction } from './ai';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch } from './engine';

describe.each(['goblins', 'tercios', 'kalevala'])('%s en partidas completas', (faction) => {
  it.each([11, 42, 2026, 731])('completa ambos asientos sin acciones inválidas, semilla %i', (seed) => {
    const goblins = STARTER_DECKS.find((deck) => deck.faction === faction)!;
    for (const goblinsFirst of [true, false]) {
      const rival = STARTER_DECKS[seed % 2]!;
      let state = createMatch(goblinsFirst ? goblins : rival, goblinsFirst ? rival : goblins, seed);
      for (let step = 0; step < 3500 && !state.winner; step += 1) {
        const action = chooseNextAiAction(state, new Set(), 'normal', state.activePlayer);
        const result = applyAction(state, action);
        expect(result.ok, `${JSON.stringify(action)}: ${result.error?.message}`).toBe(true);
        state = { ...result.state, animations: [] };
        expect(new Set(state.board.map((piece) => `${piece.position.x},${piece.position.y}`)).size).toBe(state.board.length);
      }
      expect(state.winner).toBeDefined();
      expect(state.pendingSpark).toBeUndefined();
    }
  }, 30000);
});
