import { describe, expect, it } from 'vitest';
import { nextRandom } from './random';
import { chooseSparkFace, grantPetardazoAll, rollSpark, startSpark } from './goblins';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch } from './engine';
import { sinkUnit } from './kalevala';
import type { BoardPiece, MatchState, PlayerId } from './types';

const unit = (id: string, owner: PlayerId, x: number, y: number): BoardPiece => ({
  instanceId: id, cardId: 'sabueso-brasa', owner, position: { x, y }, currentHealth: 1,
  attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
});

describe('Chispa reproducible', () => {
  it('repite la misma secuencia con la misma semilla y avanza una vez', () => {
    const result = rollSpark(42, false);
    expect(rollSpark(42, false)).toEqual(result);
    expect(result.faces).toHaveLength(1);
    expect(result.nextSeed).toBe(nextRandom(42).state);
  });

  it('la doble tirada ofrece dos resultados sin volver a tirar al elegir', () => {
    const first = nextRandom(42);
    const second = nextRandom(first.state);
    const result = rollSpark(42, true);
    expect(result.faces).toEqual([first.value < 0.5 ? 'cara' : 'cruz', second.value < 0.5 ? 'cara' : 'cruz']);
    expect(result.nextSeed).toBe(second.state);
    expect(chooseSparkFace(result, 0)).toBe(result.faces[0]);
    expect(chooseSparkFace(result, 1)).toBe(result.faces[1]);
    expect(chooseSparkFace(result, 2)).toBeUndefined();
    expect(chooseSparkFace(result, -1)).toBeUndefined();
    expect(chooseSparkFace(result, 0.5)).toBeUndefined();
  });

  it('Bromuro dobla solo la primera Chispa y conserva la semilla original', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const state = { ...base, players: { ...base.players, player: { ...base.players.player, commanderId: 'bromuro-el-afortunado' } } };
    const first = startSpark(state, 'player');
    const second = startSpark(first.state, 'player');
    expect(first.roll.faces).toHaveLength(2);
    expect(second.roll.faces).toHaveLength(1);
    expect(second.state.seed).toBe(state.seed);
    expect(startSpark(state, 'player')).toEqual(first);
    const aiTurn = applyAction(second.state, { type: 'end-turn', playerId: 'player' });
    const playerTurn = applyAction(aiTurn.state, { type: 'end-turn', playerId: 'ai' });
    expect(startSpark(playerTurn.state, 'player').roll.faces).toHaveLength(2);
  });

  it('las auras propias doblan la tirada sin apilar con Bromuro', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const aura = { ...unit('ingeniera', 'player', 3, 3), cardId: 'ingeniera-jefa' };
    const otherAura = { ...unit('maquina', 'player', 4, 3), cardId: 'maquina-de-la-suerte' };
    const state = { ...base, board: [aura, otherAura], players: { ...base.players, player: { ...base.players.player, commanderId: 'bromuro-el-afortunado' } } };
    const first = startSpark(state, 'player');
    expect(first.roll.faces).toHaveLength(2);
    expect(startSpark(first.state, 'player').roll.faces).toHaveLength(2);
    expect(startSpark({ ...state, board: [{ ...aura, owner: 'ai' }] }, 'ai').roll.faces).toHaveLength(2);
  });
});

describe('Petardazo', () => {
  it('encadena explosiones, afecta a ambos bandos y no daña estructuras', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const first = { ...unit('primera', 'ai', 3, 3), grantedPetardazo: 'permanent' as const };
    const second = { ...unit('segunda', 'ai', 4, 3), grantedPetardazo: 'permanent' as const };
    const ally = { ...unit('aliada', 'player', 3, 2), currentHealth: 5 };
    const bystander = { ...unit('vecina', 'player', 5, 3), currentHealth: 5 };
    const building = { ...unit('estructura', 'player', 2, 3), cardId: 'torre-horizonte', currentHealth: 5 };
    const state: MatchState = { ...base, terrain: [], board: [first, second, ally, bystander, building], players: {
      ...base.players, player: { ...base.players.player, hand: [{ instanceId: 'hechizo', cardId: 'lluvia-ceniza' }],
        resources: Array.from({ length: 3 }, (_, i) => ({ instanceId: `fuente-${i}`, cardId: 'fuente-furia', faction: 'fury' as const, exhausted: false })) },
    } };
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'hechizo', target: { kind: 'piece', pieceId: 'primera' } });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'primera')).toBeUndefined();
    expect(result.state.board.find((piece) => piece.instanceId === 'segunda')).toBeUndefined();
    expect(result.state.board.find((piece) => piece.instanceId === 'aliada')?.currentHealth).toBe(3);
    expect(result.state.board.find((piece) => piece.instanceId === 'vecina')?.currentHealth).toBe(3);
    expect(result.state.board.find((piece) => piece.instanceId === 'estructura')?.currentHealth).toBe(5);
    expect(result.state.animations.filter((event) => event.type === 'destroy')).toHaveLength(2);
    const sunken = sinkUnit(state, first);
    expect(sunken.animations.filter((event) => event.type === 'destroy')).toHaveLength(0);
    expect(sunken.board.find((piece) => piece.instanceId === 'segunda')?.currentHealth).toBe(1);
    expect(sunken.board.find((piece) => piece.instanceId === 'aliada')?.currentHealth).toBe(5);
    expect(sunken.players.ai.discard).toEqual(state.players.ai.discard);
  });

  it('caduca al terminar el turno solo si el Petardazo fue prestado temporalmente', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const temporary = { ...unit('temporal', 'player', 1, 3), grantedPetardazo: 'turn' as const };
    const permanent = { ...unit('permanente', 'player', 2, 3), grantedPetardazo: 'permanent' as const };
    const result = applyAction({ ...base, terrain: [], board: [temporary, permanent] }, { type: 'end-turn', playerId: 'player' });
    expect(result.state.board.find((piece) => piece.instanceId === 'temporal')?.grantedPetardazo).toBeUndefined();
    expect(result.state.board.find((piece) => piece.instanceId === 'permanente')?.grantedPetardazo).toBe('permanent');
  });

  it('el poder solo afecta unidades propias y conserva el Petardazo permanente', () => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42);
    const permanent = { ...unit('permanente', 'player', 1, 3), grantedPetardazo: 'permanent' as const };
    const ally = unit('aliada', 'player', 2, 3);
    const enemy = unit('enemiga', 'ai', 3, 3);
    const building = { ...unit('estructura', 'player', 4, 3), cardId: 'torre-horizonte' };
    const result = grantPetardazoAll({ ...base, board: [permanent, ally, enemy, building] }, 'player');
    expect(result.board.map((piece) => piece.grantedPetardazo)).toEqual(['permanent', 'turn', undefined, undefined]);
  });
});
