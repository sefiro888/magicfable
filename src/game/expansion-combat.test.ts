import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, previewAttackPiece } from './engine';
import { chooseNextAiAction } from './ai';
import { continuousHealthBonus, formationAttackBonus } from './tercios';
import { attackPiecePreviewLines } from '../battle/ui/battleHints';
import type { BoardPiece, MatchState, PlayerId } from './types';

const piece = (id: string, cardId: string, owner: PlayerId, x: number, y: number, overrides: Partial<BoardPiece> = {}): BoardPiece => ({
  instanceId: id, cardId, owner, position: { x, y }, currentHealth: CARD_BY_ID[cardId]!.health ?? CARD_BY_ID[cardId]!.resistance ?? 1,
  attackModifier: 0, enteredOnTurn: 0, movedThisTurn: false, attackedThisTurn: false, statuses: [], ...overrides,
});
const scenario = (board: readonly BoardPiece[], owner: PlayerId = 'player', runo = 9): MatchState => {
  const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
  return { ...base, board, terrain: [], animations: [], turn: 4, activePlayer: owner, players: { ...base.players,
    [owner]: { ...base.players[owner], runo, hand: [], commanderPowerUsed: true },
  } };
};

describe('Canto de ataque y previsiones compartidas', () => {
  it('el Pino no da bonos de volador a una unidad silenciada', () => {
    const bird = piece('aguila', 'aguila-de-pohjola', 'player', 3, 3);
    const pine = piece('pino', 'el-pino-que-llega-al-cielo', 'player', 0, 7);
    const state = scenario([bird, pine]);
    expect(formationAttackBonus(state, bird)).toBe(1);
    expect(continuousHealthBonus(state, bird)).toBe(1);
    const silenced = { ...bird, statuses: [{ kind: 'silenced' as const, expiresOnTurn: 5 }] };
    const quiet = { ...state, board: [silenced, pine] };
    expect(formationAttackBonus(quiet, silenced)).toBe(0);
    expect(continuousHealthBonus(quiet, silenced)).toBe(0);
  });
  it.each(['penalizacion', 'mejora'] as const)('la curación de mantenimiento respeta el máximo con %s permanente', (kind) => {
    const printed = CARD_BY_ID.rodelero!.health!;
    const target = piece('herida', 'rodelero', 'player', 3, 5, kind === 'penalizacion'
      ? { currentHealth: printed - 1, permanentHealthPenalty: 1 }
      : { currentHealth: printed + 1, permanentHealthBonus: 3 });
    const healer = piece('taller', 'taller-de-remiendos', 'player', 0, 7);
    const initial = scenario([target, healer], 'ai', 0);
    const result = applyAction(initial, { type: 'end-turn', playerId: 'ai' });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((unit) => unit.instanceId === target.instanceId)?.currentHealth)
      .toBe(kind === 'penalizacion' ? printed - 1 : printed + 2);
  });

  it.each(['player', 'ai'] as const)('el Águila hunde sin muerte ni contragolpe en el asiento %s', (owner) => {
    const enemy = owner === 'player' ? 'ai' : 'player';
    const bird = piece('aguila', 'aguila-de-pohjola', owner, 3, 3, { currentHealth: 1 });
    const victim = piece('petardo', 'el-gran-petardo', enemy, 3, 4);
    const state = scenario([bird, victim], owner);
    const preview = previewAttackPiece(state, bird.instanceId, victim.instanceId)!;
    expect(preview).toMatchObject({ sinksDefender: true, damageToDefender: 0, defenderDies: false,
      retaliationToAttacker: 0, attackerHealthAfter: 1, attackerDies: false, pierceOverkill: 0 });
    expect(attackPiecePreviewLines(preview)).toEqual(['Canto: hunde la unidad temporalmente', 'Sin daño ni contragolpe']);
    const result = applyAction(state, { type: 'attack-piece', playerId: owner, attackerId: 'aguila', defenderId: 'petardo' });
    expect(result.ok).toBe(true);
    expect(result.state.sunkenUnits).toHaveLength(1);
    expect(result.state.board).toHaveLength(1);
    expect(result.state.board[0]).toMatchObject({ instanceId: 'aguila', currentHealth: 1, attackedThisTurn: true });
    expect(result.state.players[owner].nexusHealth).toBe(state.players[owner].nexusHealth);
    expect(result.state.animations.some((event) => event.type === 'destroy')).toBe(false);
  });

  it.each(['runos insuficientes', 'silencio', 'estructura'])('no anuncia Canto con %s', (reason) => {
    const bird = piece('aguila', 'aguila-de-pohjola', 'player', 3, 3,
      reason === 'silencio' ? { statuses: [{ kind: 'silenced', expiresOnTurn: 5 }] } : {});
    const target = piece('objetivo', reason === 'estructura' ? 'barril-de-polvora' : 'el-gran-petardo', 'ai', 3, 4);
    const state = scenario([bird, target], 'player', reason === 'runos insuficientes' ? 8 : 9);
    const preview = previewAttackPiece(state, 'aguila', 'objetivo')!;
    expect(preview.sinksDefender).not.toBe(true);
    expect(preview.damageToDefender).toBeGreaterThan(0);
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'aguila', defenderId: 'objetivo' });
    expect(result.ok).toBe(true);
    expect(result.state.sunkenUnits ?? []).toHaveLength(0);
  });

  it('la IA valora retirar una amenaza que no puede matar con daño normal', () => {
    const bird = piece('aguila', 'aguila-de-pohjola', 'ai', 3, 3, { currentHealth: 1 });
    const strong = piece('amenaza', 'oso-otso', 'player', 3, 4, { currentHealth: 100, attackModifier: 20 });
    const small = piece('pequena', 'rodelero', 'player', 4, 3, { currentHealth: 1 });
    const state = scenario([bird, strong, small], 'ai');
    expect(chooseNextAiAction(state, new Set(), 'hard')).toMatchObject({ type: 'attack-piece', attackerId: 'aguila', defenderId: 'amenaza' });
  });

  it('la IA no cuenta el daño adicional de Chispa mientras el artillero está silenciado', () => {
    const shooter = piece('tirador', 'artillero-chapucero', 'ai', 3, 6,
      { sparkFace: 'cara', statuses: [{ kind: 'silenced', expiresOnTurn: 5 }] });
    const victim = piece('amenaza', 'oso-otso', 'player', 4, 6, { currentHealth: 2 });
    const base = scenario([shooter, victim], 'ai', 0);
    const state = { ...base, players: { ...base.players, player: { ...base.players.player, nexusHealth: 3 } } };
    expect(chooseNextAiAction(state, new Set(), 'hard')).toMatchObject({ type: 'attack-piece', attackerId: 'tirador', defenderId: 'amenaza' });
  });
});
