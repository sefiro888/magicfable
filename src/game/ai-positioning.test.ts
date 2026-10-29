import { describe, expect, it } from 'vitest';
import { chooseNextAiAction, runAiTurn } from './ai';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, getValidAttacks, spellNeedsPiece, validSpellTargets } from './engine';
import type { BoardPiece, MatchState, PlayerId } from './types';

const piece = (instanceId: string, cardId: string, owner: PlayerId, x: number, y: number): BoardPiece => ({
  instanceId, cardId, owner, position: { x, y },
  currentHealth: CARD_BY_ID[cardId]!.health ?? CARD_BY_ID[cardId]!.resistance ?? 1,
  attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
});

const scenario = (cards: readonly string[], board: readonly BoardPiece[], me: PlayerId = 'ai'): MatchState => {
  const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
  return {
    ...base, activePlayer: me, turn: 4, terrain: [], board, animations: [],
    players: {
      ...base.players,
      [me]: {
        ...base.players[me], commanderPowerUsed: true, deck: [],
        hand: cards.map((cardId) => ({ instanceId: `hand-${cardId}`, cardId })),
        resources: Array.from({ length: 6 }, (_, index) => ({
          instanceId: `r${index}`, cardId: 'fuente-marea', faction: 'marea' as const, exhausted: false,
        })),
      },
    },
  };
};

describe('integración de los hechizos de empuje dirigido', () => {
  it.each(['resaca-subita', 'canto-de-la-sirena'])('%s exige una unidad enemiga como objetivo', (cardId) => {
    const state = scenario([cardId], [
      piece('enemy', 'oso-forestal', 'player', 2, 3),
      piece('ally', 'oso-forestal', 'ai', 5, 3),
      piece('structure', 'torre-horizonte', 'player', 7, 4),
    ]);
    expect(spellNeedsPiece(CARD_BY_ID[cardId]!)).toBe(true);
    expect(validSpellTargets(state, 'ai', CARD_BY_ID[cardId]!).map((target) => target.instanceId)).toEqual(['enemy']);
    for (const target of [undefined, { kind: 'piece' as const, pieceId: 'ally' }, { kind: 'piece' as const, pieceId: 'structure' }]) {
      const result = applyAction(state, { type: 'play-card', playerId: 'ai', cardInstanceId: `hand-${cardId}`, target });
      expect(result.ok).toBe(false);
      expect(result.state).toEqual(state);
    }
    const result = applyAction(state, {
      type: 'play-card', playerId: 'ai', cardInstanceId: `hand-${cardId}`, target: { kind: 'piece', pieceId: 'enemy' },
    });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((unit) => unit.instanceId === 'enemy')!.position.y).toBe(cardId === 'resaca-subita' ? 5 : 1);
  });
});

describe('IA: valor del reposicionamiento real', () => {
  it('reconoce como letal una Descarga que atraviesa una aliada', () => {
    const shooter = { ...piece('tirador', 'tejedora-escarcha', 'ai', 2, 6), grantedDischarge: true };
    const ally = { ...piece('aliada', 'oso-forestal', 'ai', 2, 7), attackedThisTurn: true, movedThisTurn: true };
    const base = scenario([], [shooter, ally]);
    const state = { ...base, players: { ...base.players, player: { ...base.players.player, nexusHealth: 4 } } };
    expect(chooseNextAiAction(state, new Set(), 'hard')).toEqual({ type: 'attack-nexus', playerId: 'ai', attackerId: 'tirador' });
  });
  it.each(['ai', 'player'] as const)('en el asiento %s aparta la amenaza cercana aunque otra tenga más ataque', (me) => {
    const rival = me === 'ai' ? 'player' : 'ai';
    const mirror = (y: number) => me === 'ai' ? y : 7 - y;
    const state = scenario(['resaca-subita'], [
      piece('near', 'oso-forestal', rival, 2, mirror(0)),
      piece('far', 'leviatan-de-las-simas', rival, 6, mirror(6)),
    ], me);
    const snapshot = structuredClone(state);
    const action = chooseNextAiAction(state, new Set(), 'normal', me);
    expect(action).toEqual({
      type: 'play-card', playerId: me, cardInstanceId: 'hand-resaca-subita', target: { kind: 'piece', pieceId: 'near' },
    });
    expect(chooseNextAiAction(state, new Set(), 'normal', me)).toEqual(action);
    expect(state).toEqual(snapshot);
    const pushed = applyAction(state, action);
    expect(pushed.ok).toBe(true);
    const reply = applyAction(pushed.state, { type: 'end-turn', playerId: me });
    expect(reply.ok).toBe(true);
    expect(getValidAttacks(reply.state, 'near').canAttackNexus).toBe(false);
  });

  it.each([
    ['inmune', 'crustaceo-acorazado', 3, 3],
    ['borde', 'oso-forestal', 3, 7],
  ] as const)('conserva Resaca Súbita si el objetivo está %s', (_name, cardId, x, y) => {
    const state = scenario(['resaca-subita'], [piece('enemy', cardId, 'player', x, y)]);
    expect(chooseNextAiAction(state)).toEqual({ type: 'end-turn', playerId: 'ai' });
  });

  it('conserva el empuje si una pieza bloquea el retroceso', () => {
    const state = scenario(['resaca-subita'], [
      piece('enemy', 'oso-forestal', 'player', 3, 0),
      piece('wall', 'torre-horizonte', 'player', 3, 1),
    ]);
    expect(chooseNextAiAction(state)).toEqual({ type: 'end-turn', playerId: 'ai' });
  });

  it('no atrae una unidad que puede rematar el Nexo después de moverse', () => {
    const base = scenario(['canto-de-la-sirena'], [piece('enemy', 'sabueso-brasa', 'player', 3, 4)]);
    const state = { ...base, players: { ...base.players, ai: { ...base.players.ai, nexusHealth: 2 } } };
    expect(chooseNextAiAction(state)).toEqual({ type: 'end-turn', playerId: 'ai' });
  });

  it('atrae una presa cuando habilita un intercambio favorable lejos del Nexo', () => {
    const state = scenario(['canto-de-la-sirena'], [
      piece('enemy', 'oso-forestal', 'player', 3, 6),
      piece('hunter', 'leviatan-de-las-simas', 'ai', 2, 4),
    ]);
    const action = chooseNextAiAction(state);
    expect(action.type).toBe('play-card');
    const pulled = applyAction(state, action);
    expect(pulled.ok).toBe(true);
    const attack = chooseNextAiAction(pulled.state, new Set(), 'hard');
    expect(attack).toEqual({ type: 'attack-piece', playerId: 'ai', attackerId: 'hunter', defenderId: 'enemy' });
    const result = applyAction(pulled.state, attack);
    expect(result.ok).toBe(true);
    expect(result.state.board.some((unit) => unit.instanceId === 'enemy')).toBe(false);
  });

  it('prefiere evitar un remate a desplegar una unidad cara', () => {
    const base = scenario(['leviatan-de-las-simas', 'resaca-subita'], [piece('enemy', 'oso-forestal', 'player', 3, 0)]);
    const state = { ...base, players: { ...base.players, ai: { ...base.players.ai, nexusHealth: 2 } } };
    expect(chooseNextAiAction(state)).toMatchObject({ type: 'play-card', cardInstanceId: 'hand-resaca-subita' });
  });

  it('valora el daño de Marea Viva aunque el empuje quede bloqueado', () => {
    const state = scenario(['marea-viva'], [piece('enemy', 'remora-oportunista', 'player', 3, 7)]);
    const action = chooseNextAiAction(state);
    expect(action).toMatchObject({ type: 'play-card', cardInstanceId: 'hand-marea-viva' });
    expect(applyAction(state, action).state.board).toHaveLength(0);
  });

  it('usa Vorágine por el aturdimiento aunque la amenaza sea inmune al empuje', () => {
    const state = scenario(['voragine'], [piece('enemy', 'crustaceo-acorazado', 'player', 3, 0)]);
    const action = chooseNextAiAction(state);
    expect(action).toMatchObject({ type: 'play-card', cardInstanceId: 'hand-voragine' });
    const result = applyAction(state, action);
    expect(result.ok).toBe(true);
    expect(result.state.board[0]!.statuses).toContainEqual({ kind: 'stunned', expiresOnTurn: 6 });
  });

  it('sin objetivos conserva el hechizo y el turno completo termina', () => {
    const state = scenario(['resaca-subita'], []);
    const result = runAiTurn(state);
    expect(result.activePlayer).toBe('player');
    expect(result.players.ai.hand.map((card) => card.cardId)).toContain('resaca-subita');
  });
});
