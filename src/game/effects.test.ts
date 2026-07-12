import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, effectiveCost, getValidMoves } from './engine';
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

const resources = (faction: FactionId, count: number): readonly ResourceState[] =>
  Array.from({ length: count }, (_, index) => ({
    instanceId: `${faction}-essence-${index}`,
    cardId: faction === 'fury' ? 'fuente-furia' : 'fuente-arcana',
    faction,
    exhausted: false,
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

describe('Gólem Azur — reducción del primer daño', () => {
  it('reduce en 1 el primer daño de cada turno y solo el primero', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('golem', 'golem-azur', 'ai', { x: 2, y: 2 }),
        makePiece('atacante', 'berserker-ignivoro', 'player', { x: 2, y: 3 }),
        makePiece('atacante-2', 'sabueso-brasa', 'player', { x: 1, y: 2 }),
      ],
    };
    const first = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'atacante', defenderId: 'golem',
    });
    expect(first.ok).toBe(true);
    // Berserker: 3 ATQ + 1 por su propio bono al atacar = 4; el Gólem reduce 1 → 3.
    const golemAfterFirst = first.state.board.find((piece) => piece.instanceId === 'golem');
    expect(golemAfterFirst?.currentHealth).toBe(5 - 3);
    expect(first.state.animations.some((event) => event.type === 'shield')).toBe(true);
    const second = applyAction(first.state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'atacante-2', defenderId: 'golem',
    });
    expect(second.ok).toBe(true);
    // Sabueso: 2 ATQ sin reducción (ya consumida este turno) → el Gólem cae a 0 y se destruye.
    expect(second.state.board.some((piece) => piece.instanceId === 'golem')).toBe(false);
    expect(second.state.players.ai.discard.some((card) => card.instanceId === 'golem')).toBe(true);
  });
});

describe('Archivo Viviente — descuento de hechizos', () => {
  it('reduce en 1 el coste genérico de los hechizos propios, sin bajar de 0', () => {
    let state = freshMatch();
    state = { ...state, activePlayer: 'ai', board: [makePiece('archivo', 'archivo-viviente', 'ai', { x: 2, y: 1 })] };
    const eco = CARD_BY_ID['eco-cronomante']!;
    const discounted = effectiveCost(state, 'ai', eco);
    expect(eco.cost.generic).toBe(1);
    expect(discounted.generic).toBe(0);
    // Con una única fuente arcana (solo cubre el coste de color) el hechizo es pagable.
    state = withPlayer(state, 'ai', {
      hand: [handCard('eco-cronomante')],
      resources: resources('arcane', 1),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'ai', cardInstanceId: 'hand-eco-cronomante', target: { kind: 'none' },
    });
    expect(result.ok).toBe(true);
  });

  it('no descuenta unidades ni afecta al rival', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('archivo', 'archivo-viviente', 'ai', { x: 2, y: 1 })] };
    const berserker = CARD_BY_ID['berserker-ignivoro']!;
    expect(effectiveCost(state, 'ai', berserker).generic).toBe(berserker.cost.generic);
    const eco = CARD_BY_ID['eco-cronomante']!;
    expect(effectiveCost(state, 'player', eco).generic).toBe(eco.cost.generic);
  });
});

describe('Kaela — descuento tras daño al Nexo', () => {
  it('arma el descuento la primera vez que el Nexo recibe daño y lo consume la siguiente unidad', () => {
    let state = freshMatch();
    // El jugador usa el mazo de Furia (Kaela). La IA ataca su Nexo.
    state = {
      ...state,
      activePlayer: 'ai',
      board: [makePiece('asaltante', 'sabueso-brasa', 'ai', { x: 2, y: 7 })],
    };
    const hit = applyAction(state, { type: 'attack-nexus', playerId: 'ai', attackerId: 'asaltante' });
    expect(hit.ok).toBe(true);
    expect(hit.state.players.player.unitDiscountPending).toBe(true);
    expect(hit.state.players.player.nexusDamagedThisTurn).toBe(true);

    // Turno del jugador: el Berserker (1 genérico + 2 Furia) se paga con solo 2 Furia.
    let playerTurn = applyAction(hit.state, { type: 'end-turn', playerId: 'ai' }).state;
    playerTurn = withPlayer(playerTurn, 'player', {
      hand: [handCard('berserker-ignivoro')],
      resources: resources('fury', 2),
    });
    const berserker = CARD_BY_ID['berserker-ignivoro']!;
    expect(effectiveCost(playerTurn, 'player', berserker).generic).toBe(0);
    const played = applyAction(playerTurn, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'hand-berserker-ignivoro', position: { x: 0, y: 7 },
    });
    expect(played.ok).toBe(true);
    expect(played.state.players.player.unitDiscountPending).toBe(false);
  });

  it('no se arma para un comandante distinto de Kaela', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('asaltante', 'sabueso-brasa', 'player', { x: 2, y: 0 })],
    };
    const hit = applyAction(state, { type: 'attack-nexus', playerId: 'player', attackerId: 'asaltante' });
    expect(hit.ok).toBe(true);
    // El Nexo dañado es el de Oriel (IA): no debe armarse ningún descuento.
    expect(hit.state.players.ai.unitDiscountPending).toBe(false);
  });
});

describe('Temblor Rojo — réplica sobre la unidad más debilitada', () => {
  it('inflige 3 al objetivo y 1 a la unidad enemiga restante con menos vida', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('objetivo', 'golem-azur', 'ai', { x: 2, y: 2 }),
        makePiece('debil', 'sabueso-brasa', 'ai', { x: 4, y: 2 }),
        makePiece('sano', 'berserker-ignivoro', 'ai', { x: 0, y: 2 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('temblor-rojo')],
      resources: resources('fury', 4),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'hand-temblor-rojo',
      target: { kind: 'piece', pieceId: 'objetivo' },
    });
    expect(result.ok).toBe(true);
    const golem = result.state.board.find((piece) => piece.instanceId === 'objetivo');
    // Gólem: 5 de vida, reduce 1 → recibe 2.
    expect(golem?.currentHealth).toBe(3);
    // El Sabueso (1 de vida) es el más débil: recibe la réplica y muere.
    expect(result.state.board.some((piece) => piece.instanceId === 'debil')).toBe(false);
    const sano = result.state.board.find((piece) => piece.instanceId === 'sano');
    expect(sano?.currentHealth).toBe(3);
  });
});

describe('Convergencia Astral — refrescar movimiento', () => {
  it('permite volver a mover una unidad aliada que ya movió', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('lancera', 'lancera-magma', 'player', { x: 2, y: 3 }, { movedThisTurn: true })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('convergencia-astral')],
      resources: resources('arcane', 3),
    });
    // El mazo del jugador es de Furia, pero el motor no restringe facción en mano: probamos la regla pura.
    expect(getValidMoves(state, 'lancera')).toHaveLength(0);
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'hand-convergencia-astral',
      target: { kind: 'piece', pieceId: 'lancera' },
    });
    expect(result.ok).toBe(true);
    expect(getValidMoves(result.state, 'lancera').length).toBeGreaterThan(0);
  });

  it('rechaza objetivos enemigos o estructuras', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('enemiga', 'sabueso-brasa', 'ai', { x: 2, y: 1 }),
        makePiece('forja', 'forja-carmesi', 'player', { x: 1, y: 7 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('convergencia-astral')],
      resources: resources('arcane', 3),
    });
    const onEnemy = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'hand-convergencia-astral',
      target: { kind: 'piece', pieceId: 'enemiga' },
    });
    expect(onEnemy.ok).toBe(false);
    const onStructure = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'hand-convergencia-astral',
      target: { kind: 'piece', pieceId: 'forja' },
    });
    expect(onStructure.ok).toBe(false);
  });
});

describe('Niebla Espejada y Oriel — observación del mazo', () => {
  it('Niebla Espejada emite el evento de escrutinio y roba una carta', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('niebla-espejada')],
      resources: resources('arcane', 3),
    });
    const before = state.players.player.hand.length;
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'hand-niebla-espejada', target: { kind: 'none' },
    });
    expect(result.ok).toBe(true);
    const scry = result.state.animations.find((event) => event.effectId === 'scry-top-cards');
    expect(scry?.amount).toBe(3);
    // Jugó la carta (-1) y robó una (+1).
    expect(result.state.players.player.hand).toHaveLength(before);
  });

  it('Oriel revela la primera carta del mazo tras el segundo hechizo del turno', () => {
    let state = freshMatch();
    state = { ...state, activePlayer: 'ai' };
    state = withPlayer(state, 'ai', {
      // El descarte de Eco Cronomante consume la carta que esté delante en la mano.
      hand: [
        handCard('eco-cronomante', 'eco-1'),
        handCard('eco-cronomante', 'eco-2'),
        handCard('eco-cronomante', 'eco-3'),
      ],
      resources: resources('arcane', 4),
    });
    const first = applyAction(state, {
      type: 'play-card', playerId: 'ai', cardInstanceId: 'eco-1', target: { kind: 'none' },
    });
    expect(first.ok).toBe(true);
    expect(first.state.animations.filter((event) => event.type === 'reveal')).toHaveLength(0);
    const second = applyAction(first.state, {
      type: 'play-card', playerId: 'ai', cardInstanceId: 'eco-3', target: { kind: 'none' },
    });
    expect(second.ok).toBe(true);
    const reveal = second.state.animations.find((event) => event.type === 'reveal');
    expect(reveal).toBeDefined();
    expect(reveal?.targetId).toBe(second.state.players.ai.deck[0]?.instanceId);
  });
});
