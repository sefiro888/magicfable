import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import {
  applyAction,
  clearAnimationQueue,
  createMatch,
  getValidAttacks,
  getValidMoves,
  mulliganOpeningHand,
  reorderTopCards,
  shiftAnimationQueue,
} from './engine';
import type {
  BoardPiece,
  CardInstance,
  FactionId,
  MatchState,
  PlayerId,
  Position,
  ResourceState,
} from './types';

const freshMatch = (seed = 42): MatchState => createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, seed);

const handCard = (cardId: string, instanceId = `hand-${cardId}`): CardInstance => ({ cardId, instanceId });

const SOURCE_BY_FACTION: Record<FactionId, string> = {
  fury: 'fuente-furia',
  arcane: 'fuente-arcana',
  nature: 'fuente-naturaleza',
  order: 'fuente-orden',
  shadow: 'fuente-sombra',
  void: 'fuente-vacio',
};

const resources = (faction: FactionId, count: number, exhausted = false): readonly ResourceState[] =>
  Array.from({ length: count }, (_, index) => ({
    instanceId: `${faction}-mana-${index}`,
    cardId: SOURCE_BY_FACTION[faction],
    faction,
    exhausted,
  }));

const withPlayer = (
  state: MatchState,
  playerId: PlayerId,
  values: Partial<MatchState['players'][PlayerId]>,
): MatchState => ({
  ...state,
  players: {
    ...state.players,
    [playerId]: { ...state.players[playerId], ...values },
  },
});

const makePiece = (
  instanceId: string,
  cardId: string,
  owner: PlayerId,
  position: Position,
  options: Partial<BoardPiece> = {},
): BoardPiece => {
  const card = CARD_BY_ID[cardId]!;
  return {
    instanceId,
    cardId,
    owner,
    position,
    currentHealth: card.health ?? card.resistance ?? 1,
    attackModifier: 0,
    movedThisTurn: false,
    attackedThisTurn: false,
    enteredOnTurn: 0,
    statuses: [],
    ...options,
  };
};

describe('inicio, robo y mulligan', () => {
  it('crea manos reproducibles de cinco cartas sin alterar los mazos definidos', () => {
    const first = freshMatch(90210);
    const second = freshMatch(90210);
    expect(first.players.player.hand).toEqual(second.players.player.hand);
    expect(first.players.ai.hand).toEqual(second.players.ai.hand);
    expect(first.players.player.hand).toHaveLength(5);
    expect(first.players.player.deck).toHaveLength(45);
    expect(first.players.player.nexusHealth).toBe(25);
    expect(first.players.ai.nexusHealth).toBe(25);
  });

  it('roba del tope y crea un evento sin mutar el estado anterior', () => {
    const state: MatchState = { ...freshMatch(), phase: 'draw' };
    const top = state.players.player.deck[0];
    const result = applyAction(state, { type: 'draw', playerId: 'player' });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.hand.at(-1)).toEqual(top);
    expect(result.state.players.player.deck).toHaveLength(44);
    expect(result.state.phase).toBe('main');
    expect(result.state.animations.at(-1)?.type).toBe('draw');
    expect(state.players.player.hand).toHaveLength(5);
  });

  it('impide robar manualmente fuera de la fase de robo', () => {
    const state = freshMatch();
    const result = applyAction(state, { type: 'draw', playerId: 'player' });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('wrong-phase');
    expect(result.state.players.player.hand).toHaveLength(5);
  });

  it('hace mulligan determinista y conserva las 50 instancias', () => {
    const state = freshMatch(7);
    const selected = state.players.player.hand.slice(0, 2).map((card) => card.instanceId);
    const one = mulliganOpeningHand(state, 'player', selected);
    const two = mulliganOpeningHand(state, 'player', selected);
    expect(one.ok).toBe(true);
    expect(one.state.players.player.hand).toEqual(two.state.players.player.hand);
    expect(one.state.players.player.hand).toHaveLength(5);
    const allIds = [...one.state.players.player.hand, ...one.state.players.player.deck].map((card) => card.instanceId);
    expect(new Set(allIds).size).toBe(50);
    expect(mulliganOpeningHand(one.state, 'player', []).ok).toBe(false);
  });

  it('aplica el orden elegido a las cartas observadas por escrutinio', () => {
    const state = freshMatch();
    const top = state.players.player.deck.slice(0, 2);
    const reversed = [...top].reverse().map((card) => card.instanceId);
    const result = reorderTopCards(state, 'player', reversed);
    expect(result.ok).toBe(true);
    expect(result.state.players.player.deck.slice(0, 2).map((card) => card.instanceId)).toEqual(reversed);
    expect(reorderTopCards(state, 'player', ['inventada']).ok).toBe(false);
  });
});

describe('fuentes y despliegue', () => {
  it('juega una sola fuente por turno en una zona separada', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('fuente-furia', 'source-1'), handCard('fuente-furia', 'source-2')],
    });
    const first = applyAction(state, { type: 'play-resource', playerId: 'player', cardInstanceId: 'source-1' });
    expect(first.ok).toBe(true);
    expect(first.state.players.player.resources).toHaveLength(1);
    expect(first.state.players.player.resources[0]?.exhausted).toBe(false);
    expect(first.state.board).toHaveLength(0);
    const second = applyAction(first.state, { type: 'play-resource', playerId: 'player', cardInstanceId: 'source-2' });
    expect(second.ok).toBe(false);
    expect(second.error?.code).toBe('resource-already-played');
  });

  it('rechaza costes impagables sin modificar la partida', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('berserker-ignivoro', 'berserker')],
      resources: resources('fury', 2),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'berserker', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('insufficient-mana');
    expect(result.state).toBe(state);
    expect(state.players.player.resources.every((entry) => !entry.exhausted)).toBe(true);
  });

  it('paga, agota maná e invoca una unidad solo en la fila propia', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('sabueso-brasa', 'hound')],
      resources: resources('fury', 1),
    });
    const invalid = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'hound', position: { x: 2, y: 3 },
    });
    expect(invalid.ok).toBe(false);
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'hound', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(true);
    expect(result.state.board[0]).toMatchObject({ cardId: 'sabueso-brasa', currentHealth: 1, position: { x: 2, y: 7 } });
    expect(result.state.players.player.resources[0]?.exhausted).toBe(true);
    expect(result.state.animations.map((event) => event.type)).toEqual(['mana-flow', 'summon']);
  });

  it('Forja Carmesí potencia solo la primera unidad aunque esa unidad sea destruida', () => {
    let state: MatchState = {
      ...freshMatch(),
      board: [makePiece('forge', 'forja-carmesi', 'player', { x: 0, y: 7 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('sabueso-brasa', 'first'), handCard('sabueso-brasa', 'second')],
      resources: resources('fury', 2),
    });
    const first = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'first', position: { x: 1, y: 7 },
    });
    expect(first.ok).toBe(true);
    expect(first.state.board.find((piece) => piece.instanceId === 'first')?.attackModifier).toBe(1);
    const afterDestruction: MatchState = {
      ...first.state,
      board: first.state.board.filter((piece) => piece.instanceId !== 'first'),
      players: {
        ...first.state.players,
        player: {
          ...first.state.players.player,
          resources: first.state.players.player.resources.map((entry) => ({ ...entry, exhausted: false })),
        },
      },
    };
    const second = applyAction(afterDestruction, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'second', position: { x: 2, y: 7 },
    });
    expect(second.ok).toBe(true);
    expect(second.state.board.find((piece) => piece.instanceId === 'second')?.attackModifier).toBe(0);
  });
});

describe('movimiento táctico', () => {
  it('permite movimiento ortogonal, una sola vez y sin atravesar ocupantes', () => {
    let state: MatchState = {
      ...freshMatch(),
      board: [
        makePiece('runner', 'lancera-magma', 'player', { x: 2, y: 2 }),
        makePiece('blocker', 'centinela-cristal', 'ai', { x: 2, y: 3 }),
      ],
    };
    expect(getValidMoves(state, 'runner')).not.toContainEqual({ x: 2, y: 7 });
    expect(getValidMoves(state, 'runner')).toContainEqual({ x: 1, y: 2 });
    const moved = applyAction(state, { type: 'move', playerId: 'player', pieceId: 'runner', to: { x: 1, y: 2 } });
    expect(moved.ok).toBe(true);
    state = moved.state;
    const twice = applyAction(state, { type: 'move', playerId: 'player', pieceId: 'runner', to: { x: 0, y: 2 } });
    expect(twice.ok).toBe(false);
    expect(twice.error?.code).toBe('cannot-move');
  });

  it('aplica mareo de invocación y la excepción Impulso', () => {
    const state: MatchState = {
      ...freshMatch(),
      board: [
        makePiece('normal', 'berserker-ignivoro', 'player', { x: 1, y: 7 }, { enteredOnTurn: 1 }),
        makePiece('impulse', 'sabueso-brasa', 'player', { x: 3, y: 7 }, { enteredOnTurn: 1 }),
      ],
    };
    expect(getValidMoves(state, 'normal')).toEqual([]);
    expect(getValidMoves(state, 'impulse')).toContainEqual({ x: 3, y: 6 });
  });
});

describe('combate, daño y destrucción', () => {
  it('aplica la bonificación del Berserker, destruye y descarta al objetivo', () => {
    const state: MatchState = {
      ...freshMatch(),
      board: [
        makePiece('berserker', 'berserker-ignivoro', 'player', { x: 2, y: 2 }),
        makePiece('target', 'centinela-cristal', 'ai', { x: 2, y: 1 }, { currentHealth: 4 }),
      ],
    };
    const result = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'berserker', defenderId: 'target',
    });
    expect(result.ok).toBe(true);
    expect(result.state.board.some((piece) => piece.instanceId === 'target')).toBe(false);
    expect(result.state.players.ai.discard).toContainEqual({ instanceId: 'target', cardId: 'centinela-cristal' });
    expect(result.state.players.player.stats.damageDealt).toBe(4);
    expect(result.state.animations.map((event) => event.type)).toEqual(['attack', 'damage', 'destroy']);
  });

  it('respeta alcance y bloqueos de línea', () => {
    const clear: MatchState = {
      ...freshMatch(),
      board: [
        makePiece('weaver', 'tejedora-escarcha', 'player', { x: 2, y: 2 }),
        makePiece('target', 'sabueso-brasa', 'ai', { x: 2, y: 0 }),
      ],
    };
    expect(getValidAttacks(clear, 'weaver').pieceIds).toContain('target');
    const blocked: MatchState = {
      ...clear,
      board: [...clear.board, makePiece('wall', 'altar-combustion', 'player', { x: 2, y: 1 })],
    };
    expect(getValidAttacks(blocked, 'weaver').pieceIds).not.toContain('target');
  });

  it('gana al reducir el Nexo enemigo a cero', () => {
    let state: MatchState = {
      ...freshMatch(),
      board: [makePiece('dragon', 'dragon-caldera', 'player', { x: 2, y: 0 })],
    };
    state = withPlayer(state, 'ai', { nexusHealth: 7 });
    expect(getValidAttacks(state, 'dragon').canAttackNexus).toBe(true);
    const result = applyAction(state, { type: 'attack-nexus', playerId: 'player', attackerId: 'dragon' });
    expect(result.ok).toBe(true);
    expect(result.state.players.ai.nexusHealth).toBe(0);
    expect(result.state.winner).toBe('player');
    expect(result.state.phase).toBe('finished');
    expect(result.state.animations.at(-1)?.type).toBe('victory');
  });
});

describe('efectos de cartas principales', () => {
  it('el Dragón de la Caldera hace 2 de daño a todas las cartas adyacentes al entrar', () => {
    let state: MatchState = {
      ...freshMatch(),
      board: [
        makePiece('enemy', 'centinela-cristal', 'ai', { x: 1, y: 7 }),
        makePiece('ally', 'berserker-ignivoro', 'player', { x: 3, y: 7 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('dragon-caldera', 'dragon-hand')], resources: resources('fury', 7),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'dragon-hand', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'enemy')?.currentHealth).toBe(1);
    expect(result.state.board.find((piece) => piece.instanceId === 'ally')?.currentHealth).toBe(1);
  });

  it('Lluvia de Ceniza daña y deja la casilla abrasada', () => {
    let state: MatchState = {
      ...freshMatch(),
      board: [makePiece('victim', 'centinela-cristal', 'ai', { x: 2, y: 2 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('lluvia-ceniza', 'ash'), handCard('fuente-furia', 'discard-me')], resources: resources('fury', 3),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'ash', target: { kind: 'piece', pieceId: 'victim' },
    });
    expect(result.ok).toBe(true);
    expect(result.state.board[0]?.currentHealth).toBe(1);
    expect(result.state.tileEffects).toContainEqual(expect.objectContaining({
      kind: 'scorched', position: { x: 2, y: 2 }, sourceOwner: 'player',
    }));
    expect(result.state.players.player.discard[0]?.cardId).toBe('lluvia-ceniza');
  });

  it('Prisión Glacial impide moverse y atacar durante el siguiente turno del objetivo', () => {
    let state: MatchState = {
      ...freshMatch(),
      board: [
        makePiece('frozen', 'centinela-cristal', 'ai', { x: 2, y: 2 }),
        makePiece('enemy', 'sabueso-brasa', 'player', { x: 2, y: 3 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('prision-glacial', 'prison')], resources: resources('arcane', 2),
    });
    const cast = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'prison', target: { kind: 'piece', pieceId: 'frozen' },
    });
    expect(cast.ok).toBe(true);
    const aiTurn = applyAction(cast.state, { type: 'end-turn', playerId: 'player' });
    expect(aiTurn.ok).toBe(true);
    expect(getValidMoves(aiTurn.state, 'frozen')).toEqual([]);
    expect(getValidAttacks(aiTurn.state, 'frozen').pieceIds).toEqual([]);
  });

  it('Cometa Arcano inflige 6 a un objetivo congelado', () => {
    let state: MatchState = {
      ...freshMatch(),
      board: [makePiece('victim', 'dragon-caldera', 'ai', { x: 2, y: 2 }, {
        currentHealth: 6,
        statuses: [{ kind: 'frozen', expiresOnTurn: 99 }],
      })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('cometa-arcano', 'comet')], resources: resources('arcane', 5),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'comet', target: { kind: 'piece', pieceId: 'victim' },
    });
    expect(result.ok).toBe(true);
    expect(result.state.board).toHaveLength(0);
    expect(result.state.players.ai.discard.at(-1)?.cardId).toBe('dragon-caldera');
    expect(result.state.players.player.stats.damageDealt).toBe(6);
  });

  it('Centinela anuncia el escrutinio y Torre del Horizonte filtra una vez por turno', () => {
    const summonState = withPlayer(freshMatch(), 'player', {
      hand: [handCard('centinela-cristal', 'sentinel')], resources: resources('arcane', 2),
    });
    const summoned = applyAction(summonState, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'sentinel', position: { x: 2, y: 7 },
    });
    expect(summoned.ok).toBe(true);
    expect(summoned.state.animations.some((event) => event.effectId === 'scry-top-cards' && event.amount === 2)).toBe(true);

    let state: MatchState = {
      ...freshMatch(),
      board: [
        makePiece('tower', 'torre-horizonte', 'player', { x: 0, y: 7 }),
        makePiece('victim', 'centinela-cristal', 'ai', { x: 2, y: 2 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('lluvia-ceniza', 'ash'), handCard('fuente-furia', 'discard-me')],
      resources: resources('fury', 3),
    });
    const deckBefore = state.players.player.deck.length;
    const cast = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'ash', target: { kind: 'piece', pieceId: 'victim' },
    });
    expect(cast.ok).toBe(true);
    expect(cast.state.players.player.towerLootUsedThisTurn).toBe(true);
    expect(cast.state.players.player.deck).toHaveLength(deckBefore - 1);
    expect(cast.state.players.player.discard).toHaveLength(2);
    expect(cast.state.players.player.discard.some((card) => card.instanceId === 'discard-me')).toBe(true);
    expect(cast.state.players.player.hand).toHaveLength(1);
    expect(cast.state.animations.some((event) => event.effectId === 'horizon-loot')).toBe(true);
  });
});

describe('habilidades de comandante', () => {
  it('Verdania da +1 Vida a cada unidad aliada que entra en juego', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      commanderId: 'verdania-guardiana-raices',
      hand: [handCard('ciervo-sagrado', 'deer')],
      resources: resources('nature', 2),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'deer', position: { x: 3, y: 7 },
    });
    expect(result.ok).toBe(true);
    // El Ciervo Sagrado tiene 2 de vida base.
    expect(result.state.board[0]?.currentHealth).toBe(3);
    expect(result.state.animations.some((event) => event.effectId === 'commander-nature-aura')).toBe(true);
  });

  it('Asterin otorga escudo preventivo 1 que absorbe el primer daño', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      commanderId: 'asterin-protector-luz',
      hand: [handCard('aguila-celestial', 'eagle')],
      resources: resources('order', 3),
    });
    const deployed = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'eagle', position: { x: 3, y: 7 },
    });
    expect(deployed.ok).toBe(true);
    expect(deployed.state.board[0]?.statuses).toContainEqual({ kind: 'shielded', amount: 1 });

    // Un ataque enemigo de 2 solo debe restar 1 tras consumir el escudo.
    let combat: MatchState = {
      ...deployed.state,
      activePlayer: 'ai',
      board: [
        { ...deployed.state.board[0]!, position: { x: 3, y: 1 } },
        makePiece('ai-attacker', 'sabueso-brasa', 'ai', { x: 3, y: 0 }),
      ],
    };
    const attack = applyAction(combat, {
      type: 'attack-piece', playerId: 'ai', attackerId: 'ai-attacker', defenderId: 'eagle',
    });
    expect(attack.ok).toBe(true);
    const eagle = attack.state.board.find((piece) => piece.instanceId === 'eagle');
    // Águila 2 de vida, Sabueso 2 de ataque: el escudo absorbe 1, quedan 1.
    expect(eagle?.currentHealth).toBe(1);
    expect(eagle?.statuses.some((status) => status.kind === 'shielded')).toBe(false);
  });

  it('Malachar drena 1 Vida del Nexo enemigo cada vez que ataca', () => {
    let state: MatchState = {
      ...freshMatch(),
      board: [
        makePiece('shadow-unit', 'esqueleto-guerrero', 'player', { x: 3, y: 6 }),
        makePiece('ai-target', 'centinela-cristal', 'ai', { x: 3, y: 5 }),
      ],
    };
    state = withPlayer(state, 'player', { commanderId: 'malachar-reidor-sombra', nexusHealth: 20 });
    const result = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'shadow-unit', defenderId: 'ai-target',
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.ai.nexusHealth).toBe(24);
    expect(result.state.players.player.nexusHealth).toBe(21);
    expect(result.state.animations.some((event) => event.effectId === 'commander-shadow-drain')).toBe(true);
  });

  it('el drenaje de Malachar no supera la vida máxima del propio Nexo', () => {
    let state: MatchState = {
      ...freshMatch(),
      board: [
        makePiece('shadow-unit', 'esqueleto-guerrero', 'player', { x: 3, y: 6 }),
        makePiece('ai-target', 'centinela-cristal', 'ai', { x: 3, y: 5 }),
      ],
    };
    state = withPlayer(state, 'player', { commanderId: 'malachar-reidor-sombra' });
    const result = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'shadow-unit', defenderId: 'ai-target',
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(25);
    expect(result.state.players.ai.nexusHealth).toBe(24);
  });

  it('los comandantes sin pasiva de entrada no alteran la vida de sus unidades', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('sabueso-brasa', 'hound')],
      resources: resources('fury', 1),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'hound', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(true);
    expect(result.state.board[0]?.currentHealth).toBe(1);
    expect(result.state.board[0]?.statuses).toEqual([]);
  });
});

describe('cambio de turno y cola visual', () => {
  it('restaura recursos, estados de acción, roba y cede el turno', () => {
    let state: MatchState = {
      ...freshMatch(),
      board: [makePiece('ai-unit', 'centinela-cristal', 'ai', { x: 2, y: 0 }, {
        movedThisTurn: true, attackedThisTurn: true,
      })],
    };
    const oldAiHand = state.players.ai.hand.length;
    state = withPlayer(state, 'ai', { resources: resources('arcane', 3, true), resourcePlayedThisTurn: true });
    const result = applyAction(state, { type: 'end-turn', playerId: 'player' });
    expect(result.ok).toBe(true);
    expect(result.state.activePlayer).toBe('ai');
    expect(result.state.turn).toBe(2);
    expect(result.state.phase).toBe('main');
    expect(result.state.players.ai.resources.every((entry) => !entry.exhausted)).toBe(true);
    expect(result.state.players.ai.hand).toHaveLength(oldAiHand + 1);
    expect(result.state.board[0]).toMatchObject({ movedThisTurn: false, attackedThisTurn: false });
  });

  it('mantiene una cola FIFO con ids únicos que puede vaciarse', () => {
    let state = withPlayer(freshMatch(), 'player', { hand: [handCard('fuente-furia', 'source')] });
    const played = applyAction(state, { type: 'play-resource', playerId: 'player', cardInstanceId: 'source' });
    expect(played.ok).toBe(true);
    state = played.state;
    const shifted = shiftAnimationQueue(state);
    expect(shifted.event?.type).toBe('resource');
    expect(shifted.state.animations).toHaveLength(0);
    expect(clearAnimationQueue(state).animations).toEqual([]);
    expect(new Set(state.animations.map((event) => event.id)).size).toBe(state.animations.length);
  });
});
