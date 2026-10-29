import { describe, expect, it, vi } from 'vitest';
import type { BoardPiece } from './types';
import type * as CardModule from './cards';

vi.mock('./cards', async (importOriginal) => {
  const original = await importOriginal<typeof CardModule>();
  const spell = original.CARD_BY_ID['lluvia-ceniza']!;
  return { ...original, CARD_BY_ID: { ...original.CARD_BY_ID,
    'lluvia-ceniza': { ...spell, effects: [{ kind: 'sink' }] },
    'pacto-ascuas': { ...original.CARD_BY_ID['pacto-ascuas']!, effects: [{ kind: 'gain-runo', amount: 2 }, { kind: 'draw', amount: 1 }] },
    'temblor-rojo': { ...original.CARD_BY_ID['temblor-rojo']!, effects: [{ kind: 'sink-low-health', maximumHealth: 4 }, { kind: 'gain-runo', amount: 3 }] },
    'centinela-cristal': { ...original.CARD_BY_ID['centinela-cristal']!, effects: [{ kind: 'passive', id: 'enemy-spell-immune' }] },
  } };
});

import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, validSpellTargets } from './engine';
import { CARD_BY_ID } from './cards';

describe('Canto como hechizo dirigido', () => {
  it('la inmunidad impide señalar una unidad pero permite que la afecten hechizos de área', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const immune: BoardPiece = { instanceId: 'inmune', cardId: 'centinela-cristal', owner: 'ai', position: { x: 3, y: 3 }, currentHealth: 3,
      attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [] };
    const state = { ...base, terrain: [], board: [immune], players: { ...base.players, player: { ...base.players.player,
      hand: [{ instanceId: 'area', cardId: 'temblor-rojo' }],
      resources: Array.from({ length: 4 }, (_, i) => ({ instanceId: `r-${i}`, cardId: 'fuente-furia', faction: 'fury' as const, exhausted: false })),
    } } };
    expect(validSpellTargets(state, 'player', CARD_BY_ID['lluvia-ceniza']!)).toEqual([]);
    const area = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'area' });
    expect(area.ok).toBe(true);
    expect(area.state.sunkenUnits?.[0]?.instanceId).toBe('inmune');
  });
  it('el hundimiento múltiple retira todas las elegidas antes de resolver pérdida de Formación', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const victim: BoardPiece = { instanceId: 'primera', cardId: 'sabueso-brasa', owner: 'ai', position: { x: 2, y: 3 }, currentHealth: 2,
      attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [], grantedFormation: true, formationHealthApplied: 2 };
    const second = { ...victim, instanceId: 'segunda', position: { x: 3, y: 3 } };
    const healthy = { ...victim, instanceId: 'sana', currentHealth: 8, grantedFormation: false, formationHealthApplied: 0, position: { x: 4, y: 3 } };
    const state = { ...base, board: [victim, second, healthy], terrain: [], players: { ...base.players, player: { ...base.players.player,
      hand: [{ instanceId: 'hechizo', cardId: 'temblor-rojo' }], runo: 0,
      resources: Array.from({ length: 4 }, (_, i) => ({ instanceId: `r-${i}`, cardId: 'fuente-furia', faction: 'fury' as const, exhausted: false })),
    } } };
    const played = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'hechizo' });
    expect(played.ok).toBe(true);
    expect(played.state.sunkenUnits).toHaveLength(2);
    expect(played.state.board.map((p) => p.instanceId)).toEqual(['sana']);
    expect(played.state.animations.some((event) => event.type === 'destroy')).toBe(false);
    expect(played.state.players.player.runo).toBe(4);
  });
  it('rechaza un objetivo inválido y hunde sin destruir al objetivo válido', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const victim: BoardPiece = { instanceId: 'victima', cardId: 'sabueso-brasa', owner: 'ai', position: { x: 2, y: 3 },
      currentHealth: 1, attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0,
      statuses: [], grantedPetardazo: 'permanent' };
    const friend = { ...victim, instanceId: 'amiga', owner: 'player' as const, position: { x: 2, y: 4 } };
    const state = { ...base, terrain: [], board: [victim, friend], players: { ...base.players, player: {
      ...base.players.player, hand: [{ instanceId: 'canto', cardId: 'lluvia-ceniza' }],
      resources: Array.from({ length: 3 }, (_, i) => ({ instanceId: `fuente-${i}`, cardId: 'fuente-furia', faction: 'fury' as const, exhausted: false })),
    } } };
    const invalid = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'canto', target: { kind: 'piece', pieceId: 'amiga' } });
    expect(invalid.ok).toBe(false);
    expect(invalid.state).toEqual(state);
    const played = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'canto', target: { kind: 'piece', pieceId: 'victima' } });
    expect(played.ok).toBe(true);
    expect(played.state.board.map((p) => p.instanceId)).toEqual(['amiga']);
    expect(played.state.sunkenUnits?.[0]?.instanceId).toBe('victima');
    expect(played.state.animations.some((event) => event.type === 'destroy')).toBe(false);
    expect(played.state.players.ai.discard).toEqual(state.players.ai.discard);
    const next = applyAction(played.state, { type: 'end-turn', playerId: 'player' });
    const returned = applyAction(next.state, { type: 'end-turn', playerId: 'ai' });
    expect(returned.state.board.find((p) => p.instanceId === 'victima')?.grantedPetardazo).toBeUndefined();
  });
});
