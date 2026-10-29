import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, getValidAttacks } from './engine';
import { pushOne } from './marea';
import type { BoardPiece, FactionId, MatchState, PlayerId, SpellTarget } from './types';

const unit = (id: string, cardId: string, owner: PlayerId, x: number, y: number, values: Partial<BoardPiece> = {}): BoardPiece => ({
  instanceId: id, cardId, owner, position: { x, y }, currentHealth: CARD_BY_ID[cardId]!.health ?? CARD_BY_ID[cardId]!.resistance ?? 1,
  attackModifier: 0, enteredOnTurn: 0, movedThisTurn: false, attackedThisTurn: false, statuses: [], ...values,
});
const start = (faction: FactionId, board: readonly BoardPiece[], activePlayer: PlayerId = 'player'): MatchState => {
  const deck = STARTER_DECKS.find((candidate) => candidate.faction === faction)!;
  const base = createMatch(deck, STARTER_DECKS[0]!, 42);
  return { ...base, board, terrain: [], animations: [], activePlayer, turn: 4, players: { ...base.players,
    player: { ...base.players.player, hand: [], runo: faction === 'kalevala' ? 0 : undefined },
  } };
};
const withMana = (state: MatchState, owner: PlayerId, faction: FactionId): MatchState => ({ ...state, players: { ...state.players,
  [owner]: { ...state.players[owner], resources: Array.from({ length: 10 }, (_, index) => ({
    instanceId: `${owner}-r${index}`, cardId: `fuente-${faction}`, faction, exhausted: false,
  })) },
} });
const cast = (state: MatchState, cardId: string, target?: SpellTarget): MatchState => {
  const owner = state.activePlayer;
  const mana = withMana(state, owner, CARD_BY_ID[cardId]!.faction);
  const ready = { ...mana, players: { ...mana.players, [owner]: { ...mana.players[owner], hand: [{ instanceId: 'hechizo', cardId }] } } };
  const result = applyAction(ready, { type: 'play-card', playerId: owner, cardInstanceId: 'hechizo', target });
  expect(result.ok, result.error?.message).toBe(true);
  return result.state;
};
const end = (state: MatchState): MatchState => {
  const result = applyAction(state, { type: 'end-turn', playerId: state.activePlayer });
  expect(result.ok, result.error?.message).toBe(true);
  return result.state;
};

describe('interacciones de la expansión con turnos y destrucción', () => {
  it('Farnesio protege únicamente la Formación y resiste empujes hasta finalizar el turno rival', () => {
    const base = start('tercios', [unit('pica', 'piquero-de-flandes', 'player', 3, 5),
      unit('apoyo', 'rodelero', 'player', 4, 5), unit('aislada', 'piquero-de-flandes', 'player', 0, 7)]);
    const powered = applyAction(withMana(base, 'player', 'tercios'), { type: 'commander-power', playerId: 'player' });
    expect(powered.ok).toBe(true);
    expect(powered.state.board.find((piece) => piece.instanceId === 'pica')?.statuses).toEqual(expect.arrayContaining([
      { kind: 'shielded', amount: 3 }, { kind: 'anchored', expiresOnTurn: 6 },
    ]));
    expect(powered.state.board.find((piece) => piece.instanceId === 'aislada')?.statuses).toEqual([]);
    const enemyTurn = end(powered.state);
    expect(pushOne(enemyTurn, 'ai', 'pica', 1).board.find((piece) => piece.instanceId === 'pica')?.position).toEqual({ x: 3, y: 5 });
    const following = end(enemyTurn);
    expect(pushOne(following, 'ai', 'pica', 1).board.find((piece) => piece.instanceId === 'pica')?.position).not.toEqual({ x: 3, y: 5 });
    expect(applyAction(following, { type: 'commander-power', playerId: 'player' }).ok).toBe(false);
  });

  it.each([1, 2])('Último Cuadro necesita dos aliadas reales para sobrevivir, no el umbral de Farnesio: %i', (supports) => {
    const last = unit('cuadro', 'el-ultimo-cuadro', 'player', 3, 3, { currentHealth: 1, formationHealthApplied: 2 });
    const allies = [unit('uno', 'rodelero', 'player', 2, 3, { currentHealth: 10 }),
      unit('dos', 'rodelero', 'player', 4, 3, { currentHealth: 10 })].slice(0, supports);
    const result = cast(start('tercios', [last, ...allies], 'ai'), 'lluvia-ceniza', { kind: 'piece', pieceId: 'cuadro' });
    expect(result.board.some((piece) => piece.instanceId === last.instanceId)).toBe(supports === 2);
  });

  it('Canto retira al Último Cuadro protegido sin destruirlo ni disparar sus muertes', () => {
    const last = unit('cuadro', 'el-ultimo-cuadro', 'player', 3, 3, { currentHealth: 1, formationHealthApplied: 2 });
    const board = [last, unit('uno', 'rodelero', 'player', 2, 3), unit('dos', 'rodelero', 'player', 4, 3)];
    const state = cast(start('tercios', board, 'ai'), 'hundirlo-en-la-cienaga', { kind: 'piece', pieceId: 'cuadro' });
    expect(state.board.some((piece) => piece.instanceId === 'cuadro')).toBe(false);
    expect(state.sunkenUnits).toHaveLength(1);
    expect(state.players.player.discard).toHaveLength(0);
  });

  it('Rocroi protege durante el turno y su golpe final no se duplica por cada aliada adyacente', () => {
    const board = [unit('pica', 'piquero-de-flandes', 'player', 3, 3, { currentHealth: 1, formationHealthApplied: 2 }),
      unit('apoyo', 'rodelero', 'player', 4, 3, { currentHealth: 10 }),
      unit('enemiga', 'oso-otso', 'ai', 3, 4, { currentHealth: 10 }),
      unit('otra', 'rodelero', 'player', 4, 4, { currentHealth: 10 })];
    let state = cast(start('tercios', board), 'rocroi');
    state = cast(state, 'fiesta-de-la-polvora');
    expect(state.board.find((piece) => piece.instanceId === 'pica')?.currentHealth).toBe(1);
    const before = state.board.find((piece) => piece.instanceId === 'enemiga')!.currentHealth;
    const after = end(state);
    expect(after.board.find((piece) => piece.instanceId === 'enemiga')?.currentHealth).toBe(before - 2);
    expect(after.players.player.formationInvulnerableTurn).toBeUndefined();
    expect(after.players.player.rocroiEndDamage).toBe(0);
  });

  it('Motín bloquea también a las unidades que entran después y caduca al finalizar el turno', () => {
    const board = [unit('veterana', 'rodelero', 'player', 4, 6), unit('enemiga', 'oso-otso', 'ai', 3, 6)];
    let state = cast(start('tercios', board), 'motin-de-impagados');
    expect(getValidAttacks(state, 'veterana').pieceIds).toEqual([]);
    const mana = withMana(state, 'player', 'tercios');
    const ready = { ...mana, players: { ...mana.players, player: { ...mana.players.player, hand: [{ instanceId: 'nueva', cardId: 'rodelero' }] } } };
    const deployed = applyAction(ready, { type: 'play-card', playerId: 'player', cardInstanceId: 'nueva', position: { x: 3, y: 7 } });
    expect(deployed.ok).toBe(true);
    expect(getValidAttacks(deployed.state, 'nueva').pieceIds).toEqual([]);
    state = end(end(deployed.state));
    expect(state.players.player.attacksForbiddenThisTurn).toBe(false);
    expect(getValidAttacks(state, 'veterana').pieceIds).toContain('enemiga');
    expect(getValidAttacks(state, 'nueva').pieceIds).toContain('enemiga');
  });

  it('el Sampo produce recurso temporal y su destrucción bajo escudo roba tres cartas y concede tres Runo', () => {
    const sampo = unit('sampo', 'el-sampo', 'player', 3, 6, { statuses: [{ kind: 'shielded', amount: 5 }] });
    let state = end(start('kalevala', [sampo], 'ai'));
    expect(state.players.player.resources.filter((resource) => resource.temporary)).toHaveLength(1);
    expect(state.players.player.runo).toBe(1);
    state = end(state);
    expect(state.players.player.resources.filter((resource) => resource.temporary)).toHaveLength(0);
    const handBefore = state.players.player.hand.length;
    state = cast(state, 'mina-bajo-la-muralla', { kind: 'piece', pieceId: 'sampo' });
    expect(state.board.some((piece) => piece.instanceId === 'sampo')).toBe(false);
    expect(state.players.player.hand).toHaveLength(handBefore + 3);
    expect(state.players.player.runo).toBe(4);
  });
});
