import { describe, expect, it } from 'vitest';
import { returnPosition, returnSunkenUnits, runoAttackBonus, runoFromSpell, sinkUnit } from './kalevala';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, previewAttackPiece, validSpellTargets } from './engine';
import { CARD_BY_ID } from './cards';
import { isChallenge } from './fimbul';
import type { BoardPiece, MatchState } from './types';

const unit = (instanceId: string, owner: 'player' | 'ai', y: number): BoardPiece => ({
  instanceId, cardId: 'sabueso-brasa', owner, position: { x: 3, y }, currentHealth: 10,
  attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
});

describe('retorno de Canto', () => {
  it('el Cisne retrasa un turno propio el regreso sin retener indefinidamente a la unidad', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const victim = unit('hundida', 'ai', 3);
    const bird = { ...unit('cisne', 'player', 5), cardId: 'cisne-de-tuonela' };
    const sunk = sinkUnit({ ...base, terrain: [], board: [victim, bird] }, victim);
    const due = { ...sunk, turn: 2 };
    const delayed = returnSunkenUnits(due, 'ai');
    expect(delayed.sunkenUnits?.[0]).toMatchObject({ returnTurn: 4, cantoDelayApplied: true });
    expect(returnSunkenUnits({ ...delayed, turn: 4 }, 'ai').board.some((p) => p.instanceId === victim.instanceId)).toBe(true);
    expect(returnSunkenUnits({ ...due, board: [] }, 'ai').board.some((p) => p.instanceId === victim.instanceId)).toBe(true);
  });
  it('elige el origen libre y, si está ocupado, la casilla libre más cercana', () => {
    const base = { ...createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42), board: [], terrain: [] };
    const origin = { x: 3, y: 3 };
    expect(returnPosition(base, origin)).toEqual(origin);
    const occupied = { ...base, board: [unit('ocupante', 'ai', 3)], terrain: [{ kind: 'rubble' as const, position: { x: 3, y: 2 } }] };
    expect(returnPosition(occupied, origin)).toEqual({ x: 2, y: 3 });
  });

  it('mantiene la pieza pendiente si no hay ninguna casilla libre', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const board = Array.from({ length: 64 }, (_, i) => ({ ...unit(`pieza-${i}`, 'player', Math.floor(i / 8)), position: { x: i % 8, y: Math.floor(i / 8) } }));
    expect(returnPosition({ ...base, board }, { x: 3, y: 3 })).toBeUndefined();
  });

  it('hunde sin muerte ni descarte y devuelve al final del siguiente turno del dueño con estadísticas base', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const victim = { ...unit('hundida', 'ai', 3), attackModifier: 7, permanentAttackBonus: 7, renacerSpent: true, statuses: [{ kind: 'cursed' as const, amount: 1 }] };
    const state = { ...base, terrain: [], board: [victim] };
    const sunk = sinkUnit(state, victim);
    expect(sunk.board).toEqual([]);
    expect(sunk.players.ai.discard).toEqual(state.players.ai.discard);
    expect(sunk.animations.some((event) => event.type === 'destroy')).toBe(false);
    const afterCaster = applyAction(sunk, { type: 'end-turn', playerId: 'player' });
    expect(afterCaster.state.board).toEqual([]);
    const occupied = { ...afterCaster.state, board: [unit('ocupante', 'player', 3)] };
    const afterOwner = applyAction(occupied, { type: 'end-turn', playerId: 'ai' });
    const returned = afterOwner.state.board.find((piece) => piece.instanceId === 'hundida');
    expect(returned).toMatchObject({ position: { x: 3, y: 2 }, currentHealth: CARD_BY_ID['sabueso-brasa']!.health, attackModifier: 0, statuses: [] });
    expect(returned?.permanentAttackBonus).toBeUndefined();
    expect(returned?.renacerSpent).toBe(true);
    expect(afterOwner.state.sunkenUnits).toEqual([]);
  });

  it('Canto solo señala unidades enemigas y no estructuras', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const spell = { ...CARD_BY_ID['lluvia-ceniza']!, effects: [{ kind: 'sink' as const }] };
    const own = unit('propia', 'player', 5);
    const enemy = unit('enemiga', 'ai', 3);
    const building = { ...unit('edificio', 'ai', 2), cardId: 'torre-horizonte' };
    expect(validSpellTargets({ ...base, board: [own, enemy, building] }, 'player', spell).map((piece) => piece.instanceId)).toEqual(['enemiga']);
  });

  it('si se hunde durante su propio turno espera hasta el final del siguiente', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const victim = unit('propia', 'player', 3);
    const sunk = sinkUnit({ ...base, terrain: [], board: [victim] }, victim);
    const firstEnd = applyAction(sunk, { type: 'end-turn', playerId: 'player' }).state;
    const enemyEnd = applyAction(firstEnd, { type: 'end-turn', playerId: 'ai' }).state;
    expect(enemyEnd.board).toHaveLength(0);
    const nextEnd = applyAction(enemyEnd, { type: 'end-turn', playerId: 'player' }).state;
    expect(nextEnd.board.map((piece) => piece.instanceId)).toContain('propia');
  });
});

describe('Runo', () => {
  it('aumenta el ataque por escalones de tres sin gastar contadores', () => {
    expect([0, 1, 2, 3, 5, 6, 9].map(runoAttackBonus)).toEqual([0, 0, 0, 1, 1, 2, 3]);
    expect(runoAttackBonus(-1)).toBe(0);
  });

  it('solo el primer hechizo del turno activa la pasiva del comandante', () => {
    expect(runoFromSpell(0, true)).toBe(2);
    expect(runoFromSpell(1, true)).toBe(1);
    expect(runoFromSpell(0, false)).toBe(1);
  });

  it('acumula Runo al resolver hechizos pagados y conserva el contador entre turnos', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const state: MatchState = { ...base, terrain: [], board: [unit('objetivo', 'ai', 3)], players: {
      ...base.players, player: { ...base.players.player, commanderId: 'vainamoinen-el-cantor-eterno', runo: 0,
        hand: [{ instanceId: 'hechizo', cardId: 'lluvia-ceniza' }],
        resources: Array.from({ length: 3 }, (_, i) => ({ instanceId: `fuente-${i}`, cardId: 'fuente-furia', faction: 'fury' as const, exhausted: false })),
      },
    } };
    const played = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'hechizo', target: { kind: 'piece', pieceId: 'objetivo' } });
    expect(played.ok).toBe(true);
    expect(played.state.players.player.runo).toBe(2);
    const ended = applyAction(played.state, { type: 'end-turn', playerId: 'player' });
    expect(ended.ok).toBe(true);
    expect(ended.state.players.player.runo).toBe(2);
    const failed = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'ausente' });
    expect(failed.ok).toBe(false);
    expect(failed.state.players.player.runo).toBe(0);
  });

  it('aplica el bono a ataques y represalias, también en la vista previa', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const state: MatchState = { ...base, terrain: [], board: [unit('atacante', 'player', 4), unit('defensora', 'ai', 3)], players: {
      player: { ...base.players.player, runo: 6 }, ai: { ...base.players.ai, runo: 3 },
    } };
    const preview = previewAttackPiece(state, 'atacante', 'defensora');
    const combat = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'atacante', defenderId: 'defensora' });
    expect(combat.ok).toBe(true);
    expect(preview?.damageToDefender).toBe(4);
    expect(preview?.retaliationToAttacker).toBe(3);
    expect(combat.state.board.find((p) => p.instanceId === 'defensora')?.currentHealth).toBe(preview?.defenderHealthAfter);
    expect(combat.state.board.find((p) => p.instanceId === 'atacante')?.currentHealth).toBe(preview?.attackerHealthAfter);
    expect(isChallenge(state.board[0]!, CARD_BY_ID['sabueso-brasa']!, state.board[1]!, CARD_BY_ID['sabueso-brasa']!, state)).toBe(false);
  });
});
