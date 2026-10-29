import { describe, expect, it, vi } from 'vitest';
import type { BoardPiece, PlayerId } from './types';
import type * as CardModule from './cards';

vi.mock('./cards', async (importOriginal) => {
  const original = await importOriginal<typeof CardModule>();
  const tower = original.CARD_BY_ID['torre-horizonte']!;
  return { ...original, CARD_BY_ID: { ...original.CARD_BY_ID,
    'torre-horizonte': { ...tower, effects: [...tower.effects, { kind: 'passive', id: 'petardazo', value: 4 }] },
  } };
});

import { STARTER_DECKS } from './decks';
import { applyAction, createMatch } from './engine';

const piece = (id: string, cardId: string, owner: PlayerId, x: number, y: number, currentHealth: number): BoardPiece => ({
  instanceId: id, cardId, owner, position: { x, y }, currentHealth, attackModifier: 0,
  movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
});

describe('Petardazo impreso en una estructura', () => {
  it('destruirla inflige la cantidad impresa a unidades adyacentes de ambos bandos', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const attacker = piece('atacante', 'ariete-volcanico', 'player', 3, 4, 10);
    const barrel = piece('barril', 'torre-horizonte', 'ai', 3, 3, 1);
    const ally = piece('aliada', 'oso-forestal', 'ai', 3, 2, 10);
    const adjacentBuilding = piece('muro', 'torre-horizonte', 'ai', 2, 3, 10);
    const result = applyAction({ ...base, board: [attacker, barrel, ally, adjacentBuilding], terrain: [] },
      { type: 'attack-piece', playerId: 'player', attackerId: 'atacante', defenderId: 'barril' });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((p) => p.instanceId === 'atacante')?.currentHealth).toBe(6);
    expect(result.state.board.find((p) => p.instanceId === 'aliada')?.currentHealth).toBe(6);
    expect(result.state.board.find((p) => p.instanceId === 'muro')?.currentHealth).toBe(10);
  });
});
