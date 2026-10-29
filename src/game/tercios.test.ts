import { describe, expect, it } from 'vitest';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, getValidAttacks, getValidMoves, previewAttackPiece } from './engine';
import { dischargeLine, formationActive, formationAttackBonus, formationHealthBonus } from './tercios';
import type { BoardPiece, MatchState, PlayerId } from './types';

const base = (): MatchState => ({ ...createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42), board: [], terrain: [] });
const piece = (id: string, cardId: string, x: number, y: number, owner: PlayerId = 'player'): BoardPiece => ({
  instanceId: id, cardId, owner, position: { x, y }, currentHealth: 3, attackModifier: 0,
  movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
});

describe('primitivas de los Tercios', () => {
  it('recalcula Formación con unidades amigas ortogonales, no con estructuras ni enemigos', () => {
    const center = piece('centro', 'sabueso-brasa', 3, 3);
    const first = piece('primera', 'oso-forestal', 3, 2);
    const second = piece('segunda', 'sabueso-brasa', 4, 3);
    const building = piece('edificio', 'torre-horizonte', 2, 3);
    const rival = piece('rival', 'sabueso-brasa', 3, 4, 'ai');
    const initial = { ...base(), board: [center, first, building, rival] };
    expect(formationActive(initial, center)).toBe(false);
    expect(formationActive(initial, center, 1)).toBe(true);
    expect(formationActive({ ...initial, board: [...initial.board, second] }, center)).toBe(true);
    expect(formationActive(initial, building, 1)).toBe(false);
  });

  it('Descarga atraviesa una unidad aliada sin atravesar enemigos, estructuras ni ruinas', () => {
    const shooter = piece('tirador', 'sabueso-brasa', 2, 1);
    const ally = piece('aliada', 'oso-forestal', 2, 2);
    const state = { ...base(), board: [shooter, ally] };
    expect(dischargeLine(state, shooter, { x: 2, y: 3 })).toEqual({ clear: true, throughAlly: true });
    expect(dischargeLine(state, shooter, { x: 3, y: 3 }).clear).toBe(false);
    expect(dischargeLine({ ...state, board: [shooter, { ...ally, owner: 'ai' }] }, shooter, { x: 2, y: 3 }).clear).toBe(false);
    expect(dischargeLine({ ...state, board: [shooter, { ...ally, cardId: 'torre-horizonte' }] }, shooter, { x: 2, y: 3 }).clear).toBe(false);
    expect(dischargeLine({ ...state, terrain: [{ kind: 'rubble', position: { x: 2, y: 2 } }] }, shooter, { x: 2, y: 3 }).clear).toBe(false);
    expect(dischargeLine({ ...state, board: [shooter] }, shooter, { x: 2, y: 3 })).toEqual({ clear: true, throughAlly: false });
  });

  it('Farnesio y la trinchera reducen el apoyo necesario sin contar enemigos', () => {
    const center = piece('centro', 'sabueso-brasa', 3, 3);
    const ally = piece('aliada', 'oso-forestal', 3, 2);
    const trench = piece('trinchera', 'trinchera', 4, 3);
    const state = { ...base(), board: [center, ally, trench] };
    expect(formationActive(state, center)).toBe(true);
    expect(formationActive({ ...state, board: [center, ally, { ...trench, owner: 'ai' }] }, center)).toBe(false);
    const farnesio = { ...state, board: [center, ally], players: { ...state.players, player: { ...state.players.player, commanderId: 'farnesio-duque-de-parma' } } };
    expect(formationActive(farnesio, center)).toBe(true);
    expect(formationActive({ ...farnesio, board: [center] }, center)).toBe(false);
  });

  it('Descarga atraviesa aliados solo al atacar y suma daño en la vista previa y en combate', () => {
    const shooter = { ...piece('tirador', 'tejedora-escarcha', 2, 1), grantedDischarge: true };
    const ally = piece('aliada', 'oso-forestal', 2, 2);
    const enemy = { ...piece('enemiga', 'centinela-cristal', 2, 3, 'ai'), currentHealth: 8 };
    const state = { ...base(), board: [shooter, ally, enemy] };
    expect(getValidAttacks(state, shooter.instanceId).pieceIds).toContain(enemy.instanceId);
    expect(getValidMoves(state, shooter.instanceId)).not.toContainEqual({ x: 2, y: 3 });
    const preview = previewAttackPiece(state, shooter.instanceId, enemy.instanceId);
    expect(preview?.damageToDefender).toBe(4);
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: shooter.instanceId, defenderId: enemy.instanceId });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((candidate) => candidate.instanceId === enemy.instanceId)?.currentHealth).toBe(preview?.defenderHealthAfter);
    expect(getValidAttacks({ ...state, board: [shooter, { ...ally, cardId: 'torre-horizonte' }, enemy] }, shooter.instanceId).pieceIds).not.toContain(enemy.instanceId);
    expect(getValidAttacks({ ...state, terrain: [{ kind: 'rubble', position: ally.position }] }, shooter.instanceId).pieceIds).not.toContain(enemy.instanceId);
  });

  it('el ataque de Formación desaparece inmediatamente al perder una aliada', () => {
    const fighter = { ...piece('formada', 'sabueso-brasa', 3, 3), grantedFormation: true };
    const allyA = piece('aliada-a', 'oso-forestal', 3, 2);
    const allyB = piece('aliada-b', 'oso-forestal', 4, 3);
    const enemy = { ...piece('enemiga', 'centinela-cristal', 3, 4, 'ai'), currentHealth: 8 };
    const state = { ...base(), board: [fighter, allyA, allyB, enemy] };
    expect(formationAttackBonus(state, fighter)).toBe(1);
    expect(formationHealthBonus(state, fighter)).toBe(2);
    expect(previewAttackPiece(state, fighter.instanceId, enemy.instanceId)?.damageToDefender).toBe(3);
    const moved = applyAction(state, { type: 'move', playerId: 'player', pieceId: allyB.instanceId, to: { x: 5, y: 3 } });
    expect(moved.ok).toBe(true);
    expect(formationAttackBonus(moved.state, fighter)).toBe(0);
    expect(formationHealthBonus(moved.state, fighter)).toBe(0);
    expect(previewAttackPiece(moved.state, fighter.instanceId, enemy.instanceId)?.damageToDefender).toBe(2);
    expect(formationAttackBonus({ ...state, board: [{ ...fighter, grantedFormation: false }, allyA, allyB, enemy] }, { ...fighter, grantedFormation: false })).toBe(0);
  });

  it('el alférez y el capitán aumentan la vida solo mientras la Formación está activa', () => {
    const fighter = { ...piece('formada', 'sabueso-brasa', 3, 3), grantedFormation: true };
    const allyA = piece('aliada-a', 'oso-forestal', 3, 2);
    const allyB = piece('aliada-b', 'oso-forestal', 4, 3);
    const officer = piece('oficial', 'alferez-de-la-cruz', 7, 7);
    const captain = piece('capitan', 'capitan-de-infanteria', 6, 7);
    const state = { ...base(), board: [fighter, allyA, allyB, officer, captain] };
    expect(formationHealthBonus(state, fighter)).toBe(4);
    expect(formationHealthBonus({ ...state, board: [fighter, allyA, officer, captain] }, fighter)).toBe(0);
  });

  it('aplica la Vida al formar y destruye si la unidad ya no cabe en su máximo al perder apoyo', () => {
    const fighter = { ...piece('formada', 'sabueso-brasa', 3, 3), grantedFormation: true, currentHealth: 1 };
    const allyA = piece('aliada-a', 'oso-forestal', 3, 2);
    const allyB = piece('aliada-b', 'oso-forestal', 5, 3);
    const before = { ...base(), board: [fighter, allyA, allyB] };
    const joined = applyAction(before, { type: 'move', playerId: 'player', pieceId: allyB.instanceId, to: { x: 4, y: 3 } });
    expect(joined.ok).toBe(true);
    expect(joined.state.board.find((p) => p.instanceId === fighter.instanceId)).toMatchObject({ currentHealth: 3, formationHealthApplied: 2 });
    const wounded = { ...joined.state, board: joined.state.board.map((p) => p.instanceId === fighter.instanceId
      ? { ...p, currentHealth: 2, statuses: [{ kind: 'shielded' as const, amount: 5 }] }
      : p.instanceId === allyB.instanceId ? { ...p, movedThisTurn: false } : p) };
    const left = applyAction(wounded, { type: 'move', playerId: 'player', pieceId: allyB.instanceId, to: { x: 5, y: 3 } });
    expect(left.ok).toBe(true);
    expect(left.state.board.find((p) => p.instanceId === fighter.instanceId)).toBeUndefined();
    expect(left.state.players.player.discard.some((card) => card.instanceId === fighter.instanceId)).toBe(true);
  });

  it('resuelve todas las caídas cuando una sola aliada sostenía dos cuadros', () => {
    const first = { ...piece('primera', 'sabueso-brasa', 3, 3), grantedFormation: true, formationHealthApplied: 2, currentHealth: 2 };
    const second = { ...piece('segunda', 'sabueso-brasa', 4, 2), grantedFormation: true, formationHealthApplied: 2, currentHealth: 2 };
    const support = piece('apoyo', 'oso-forestal', 3, 2);
    const firstNeighbor = piece('primera-vecina', 'oso-forestal', 2, 3);
    const secondNeighbor = piece('segunda-vecina', 'oso-forestal', 5, 2);
    const state = { ...base(), board: [first, second, support, firstNeighbor, secondNeighbor] };
    const moved = applyAction(state, { type: 'move', playerId: 'player', pieceId: support.instanceId, to: { x: 3, y: 1 } });
    expect(moved.ok).toBe(true);
    expect(moved.state.board.map((p) => p.instanceId)).not.toContain('primera');
    expect(moved.state.board.map((p) => p.instanceId)).not.toContain('segunda');
    expect(moved.state.animations.filter((event) => event.type === 'destroy')).toHaveLength(2);
  });

  it('una expulsión enemiga también rompe Formación y resuelve la caída', () => {
    const fighter = { ...piece('formada', 'sabueso-brasa', 3, 3, 'ai'), grantedFormation: true, formationHealthApplied: 2, currentHealth: 2 };
    const support = piece('apoyo', 'oso-forestal', 3, 2, 'ai');
    const other = piece('otra', 'oso-forestal', 4, 3, 'ai');
    const fresh = base();
    const state = { ...fresh, board: [fighter, support, other], players: { ...fresh.players, player: {
      ...fresh.players.player, hand: [{ instanceId: 'empuje', cardId: 'resaca-subita' }],
      resources: [{ instanceId: 'fuente', cardId: 'fuente-marea', faction: 'marea' as const, exhausted: false }],
    } } };
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'empuje', target: { kind: 'piece', pieceId: support.instanceId } });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((p) => p.instanceId === fighter.instanceId)).toBeUndefined();
    expect(result.state.board.find((p) => p.instanceId === support.instanceId)?.position).toEqual({ x: 3, y: 0 });
  });
});
