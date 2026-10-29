import { describe, expect, it, vi } from 'vitest';
import type * as CardModule from './cards';
import type { BoardPiece, MatchState, PlayerId } from './types';

vi.mock('./cards', async (importOriginal) => {
  const original = await importOriginal<typeof CardModule>();
  const { EXPANSION_DRAFTS } = await import('./expansionCards');
  return { ...original, CARD_BY_ID: { ...original.CARD_BY_ID, ...Object.fromEntries(EXPANSION_DRAFTS.map((card) => [card.id, card])) } };
});

import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, decisionOptions, getValidMoves } from './engine';
import { chooseNextAiAction } from './ai';

const unit = (id: string, cardId: string, owner: PlayerId, x: number, y: number): BoardPiece => ({
  instanceId: id, cardId, owner, position: { x, y }, currentHealth: CARD_BY_ID[cardId]!.health ?? CARD_BY_ID[cardId]!.resistance ?? 1,
  attackModifier: 0, enteredOnTurn: 0, movedThisTurn: false, attackedThisTurn: false, statuses: [],
});
const base = (): MatchState => ({ ...createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42), terrain: [] });
const withCard = (state: MatchState, cardId: string): MatchState => ({ ...state, players: { ...state.players, player: {
  ...state.players.player, hand: [{ instanceId: 'carta', cardId }], runo: 0,
  resources: Array.from({ length: 10 }, (_, i) => ({ instanceId: `r-${i}`, cardId: `fuente-${CARD_BY_ID[cardId]!.faction}`, faction: CARD_BY_ID[cardId]!.faction, exhausted: false })),
} } });

describe('habilidades de comienzo de turno de la expansión', () => {
  it('Maestre concede Formación a dos unidades distintas y bloquea otras acciones entre elecciones', () => {
    const state = withCard({ ...base(), board: [unit('a', 'rodelero', 'player', 2, 6), unit('b', 'rodelero', 'player', 4, 6)] }, 'maestre-de-campo');
    const played = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'carta', position: { x: 3, y: 7 } });
    expect(played.ok).toBe(true);
    const id = played.state.pendingDecisions![0]!.id;
    expect(applyAction(played.state, { type: 'end-turn', playerId: 'player' }).ok).toBe(false);
    const first = applyAction(played.state, { type: 'resolve-choice', playerId: 'player', decisionId: id, pieceId: 'a' });
    expect(first.ok).toBe(true);
    expect(applyAction(first.state, { type: 'resolve-choice', playerId: 'player', decisionId: id, pieceId: 'a' }).ok).toBe(false);
    const second = applyAction(first.state, { type: 'resolve-choice', playerId: 'player', decisionId: id, pieceId: 'b' });
    expect(second.ok).toBe(true);
    expect(second.state.pendingDecisions).toHaveLength(0);
    expect(second.state.board.filter((piece) => piece.grantedFormation)).toHaveLength(2);
  });

  it('Canto de la Helada exige que la segunda unidad sea adyacente a la primera', () => {
    const state = withCard({ ...base(), board: [unit('a', 'rodelero', 'ai', 3, 3), unit('b', 'rodelero', 'ai', 3, 4), unit('c', 'rodelero', 'ai', 6, 6)] }, 'canto-de-la-helada');
    const played = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'carta' });
    expect(played.ok).toBe(true);
    const id = played.state.pendingDecisions![0]!.id;
    const first = applyAction(played.state, { type: 'resolve-choice', playerId: 'player', decisionId: id, pieceId: 'a' });
    expect(decisionOptions(first.state, first.state.pendingDecisions![0]!).map((option) => option.pieceId)).toEqual(['b']);
    expect(applyAction(first.state, { type: 'resolve-choice', playerId: 'player', decisionId: id, pieceId: 'c' }).ok).toBe(false);
    const second = applyAction(first.state, { type: 'resolve-choice', playerId: 'player', decisionId: id, pieceId: 'b' });
    expect(second.ok).toBe(true);
    expect(second.state.sunkenUnits).toHaveLength(2);
    expect(second.state.animations.some((event) => event.type === 'destroy')).toBe(false);
  });

  it('el Brulote respeta la fila elegida y alcanza unidades y estructuras de ambos bandos', () => {
    const state = withCard({ ...base(), board: [
      { ...unit('a', 'rodelero', 'ai', 3, 3), currentHealth: 10 },
      { ...unit('b', 'fuerte-de-estrella', 'player', 5, 3), currentHealth: 10 },
      { ...unit('c', 'rodelero', 'ai', 3, 4), currentHealth: 10 },
    ] }, 'el-brulote');
    const played = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'carta' });
    const result = applyAction(played.state, { type: 'resolve-choice', playerId: 'player', decisionId: played.state.pendingDecisions![0]!.id, axis: 'row', index: 3 });
    expect(result.ok).toBe(true);
    expect(result.state.board.map((piece) => piece.currentHealth)).toEqual([6, 6, 10]);
  });
  it('Chispa conserva la tirada, bloquea el turno y cobra la carta una sola vez', () => {
    const initial = base();
    const enemy = { ...unit('objetivo', 'piquero-de-flandes', 'ai', 3, 3), currentHealth: 8 };
    const state = { ...initial, board: [enemy], players: { ...initial.players, player: { ...initial.players.player,
      commanderId: 'bromuro-el-afortunado', hand: [{ instanceId: 'chispa', cardId: 'chispazo' }],
      resources: [{ instanceId: 'fuente', cardId: 'fuente-goblin', faction: 'goblins' as const, exhausted: false }],
    } } };
    const rolled = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'chispa' });
    expect(rolled.ok).toBe(true);
    expect(rolled.state.pendingSpark?.faces).toHaveLength(2);
    expect(rolled.state.players.player.resources[0]?.exhausted).toBe(false);
    expect(applyAction(rolled.state, { type: 'end-turn', playerId: 'player' }).ok).toBe(false);
    const face = rolled.state.pendingSpark!.faces[0]!;
    const chosen = applyAction(rolled.state, { type: 'choose-spark', playerId: 'player', face, target: face === 'cara' ? { kind: 'piece', pieceId: 'objetivo' } : undefined });
    expect(chosen.ok).toBe(true);
    expect(chosen.state.pendingSpark).toBeUndefined();
    expect(chosen.state.players.player.hand).toHaveLength(0);
    expect(chosen.state.players.player.resources[0]?.exhausted).toBe(true);
    expect(chosen.state.sparkRandomState).toBe(rolled.state.sparkRandomState);
    expect(chosen.state.board[0]?.currentHealth).toBe(face === 'cara' ? 5 : 7);
    expect(chosen.state.players.player.stats.cardsPlayed).toBe(1);
  });

  it('la IA resuelve una Chispa pendiente sin volver a tirar', () => {
    const initial = base();
    const state = { ...initial, activePlayer: 'ai' as const, board: [unit('enemiga', 'oso-otso', 'player', 3, 3)], players: {
      ...initial.players, ai: { ...initial.players.ai, hand: [{ instanceId: 'chispa', cardId: 'chispazo' }],
        resources: [{ instanceId: 'fuente', cardId: 'fuente-goblin', faction: 'goblins' as const, exhausted: false }] },
    } };
    const rolled = applyAction(state, { type: 'play-card', playerId: 'ai', cardInstanceId: 'chispa' });
    const action = chooseNextAiAction(rolled.state);
    expect(action.type).toBe('choose-spark');
    const chosen = applyAction(rolled.state, action);
    expect(chosen.ok).toBe(true);
    expect(chosen.state.pendingSpark).toBeUndefined();
  });
  it('Antero gana Runo al comenzar su turno, no al acabarlo, y no puede moverse', () => {
    const initial = { ...base(), board: [unit('antero', 'antero-vipunen', 'player', 3, 3)] };
    expect(getValidMoves(initial, 'antero')).toEqual([]);
    const enemyTurn = applyAction(initial, { type: 'end-turn', playerId: 'player' });
    expect(enemyTurn.state.players.player.runo ?? 0).toBe(0);
    const ownTurn = applyAction(enemyTurn.state, { type: 'end-turn', playerId: 'ai' });
    expect(ownTurn.state.players.player.runo).toBe(2);
  });

  it('el mecánico repara la estructura dañada al empezar y la torreta dispara a la unidad más cercana', () => {
    const state = { ...base(), activePlayer: 'ai' as const, turn: 2, board: [
      unit('mecanico', 'mecanico-de-urgencia', 'player', 0, 6),
      { ...unit('torreta', 'torreta-de-chatarra', 'player', 3, 6), currentHealth: 1 },
      unit('enemiga', 'piquero-de-flandes', 'ai', 3, 4),
      unit('lejana', 'piquero-de-flandes', 'ai', 7, 0),
    ] };
    const result = applyAction(state, { type: 'end-turn', playerId: 'ai' });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'torreta')?.currentHealth).toBe(3);
    expect(result.state.board.find((piece) => piece.instanceId === 'enemiga')?.currentHealth).toBe(CARD_BY_ID['piquero-de-flandes']!.health! - 1);
    expect(result.state.board.find((piece) => piece.instanceId === 'lejana')?.currentHealth).toBe(CARD_BY_ID['piquero-de-flandes']!.health);
  });

  it('la pagaduría solo roba con tres unidades, además del robo normal', () => {
    const initial = { ...base(), activePlayer: 'ai' as const, turn: 2, board: [unit('paga', 'pagaduria', 'player', 0, 7),
      unit('a', 'rodelero', 'player', 2, 6), unit('b', 'rodelero', 'player', 4, 6), unit('c', 'rodelero', 'player', 6, 6)] };
    const result = applyAction(initial, { type: 'end-turn', playerId: 'ai' });
    expect(result.state.players.player.hand).toHaveLength(initial.players.player.hand.length + 2);
    const fewer = { ...initial, board: initial.board.filter((piece) => piece.instanceId !== 'c') };
    expect(applyAction(fewer, { type: 'end-turn', playerId: 'ai' }).state.players.player.hand).toHaveLength(initial.players.player.hand.length + 1);
  });
});
