import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { COMMANDERS, STARTER_DECKS } from './decks';
import { applyAction, commanderForDeck, createMatch } from './engine';
import type {
  BoardPiece,
  CardInstance,
  FactionId,
  MatchState,
  PlayerId,
  Position,
  ResourceState,
} from './types';

/**
 * Comandantes alternativos de NEX-02: uno por facción, con una pasiva que
 * reorienta el mazo entero sin cambiar una sola carta.
 *
 * Cada partida se monta sin terreno, por el mismo motivo que en el resto de
 * tests de motor: unas ruinas sorteadas romperían casos que dependen de
 * casillas concretas.
 */
const matchWith = (deckId: string, commanderId: string): MatchState => {
  const deck = STARTER_DECKS.find((candidate) => candidate.id === deckId)!;
  const rival = STARTER_DECKS.find((candidate) => candidate.id !== deckId)!;
  return { ...createMatch(deck, rival, 42, { playerCommanderId: commanderId }), terrain: [] };
};

const handCard = (cardId: string, instanceId = `hand-${cardId}`): CardInstance => ({ cardId, instanceId });

const resources = (faction: FactionId, count: number): readonly ResourceState[] =>
  Array.from({ length: count }, (_, index) => ({
    instanceId: `${faction}-essence-${index}`,
    cardId: 'fuente-furia',
    faction,
    exhausted: false,
  }));

const withPlayer = (
  state: MatchState,
  playerId: PlayerId,
  values: Partial<MatchState['players'][PlayerId]>,
): MatchState => ({
  ...state,
  players: { ...state.players, [playerId]: { ...state.players[playerId], ...values } },
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

describe('elección de comandante', () => {
  it('cada facción con dos líderes deja quedarse con el elegido', () => {
    // Duna y Fimbul llegaron después y aún no tienen alternativo: se saltan.
    for (const deck of STARTER_DECKS.filter((candidate) => candidate.faction !== 'duna' && candidate.faction !== 'fimbul')) {
      const leaders = COMMANDERS.filter((commander) => commander.faction === deck.faction);
      expect(leaders, deck.id).toHaveLength(2);
      const alternativo = leaders.find((commander) => commander.id !== deck.commanderId)!;
      expect(commanderForDeck(deck, alternativo.id).id).toBe(alternativo.id);
    }
  });

  it('un comandante de otra facción se ignora: la pasiva no se puede cruzar', () => {
    const furia = STARTER_DECKS.find((deck) => deck.faction === 'fury')!;
    expect(commanderForDeck(furia, 'sialu-lengua-de-hielo').id).toBe(furia.commanderId);
    expect(commanderForDeck(furia, 'no-existe').id).toBe(furia.commanderId);
    expect(commanderForDeck(furia).id).toBe(furia.commanderId);
  });

  it('la partida arranca con el comandante pedido y su Vida de Nexo', () => {
    const state = matchWith('furia-caldera', 'borran-yunque-vivo');
    expect(state.players.player.commanderId).toBe('borran-yunque-vivo');
    expect(state.players.player.nexusHealth).toBe(35);
  });
});

describe('Borrán, Yunque Vivo (Furia)', () => {
  it('sus estructuras entran con +2 de Resistencia', () => {
    let state = matchWith('furia-caldera', 'borran-yunque-vivo');
    state = withPlayer(state, 'player', {
      hand: [handCard('altar-combustion', 'altar')],
      resources: resources('fury', 6),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'altar', position: { x: 3, y: 7 },
    });
    expect(result.ok).toBe(true);
    const altar = result.state.board.find((piece) => piece.instanceId === 'altar')!;
    expect(altar.currentHealth).toBe(CARD_BY_ID['altar-combustion']!.resistance! + 2);
  });

  it('la primera unidad que destruye cada turno cura 1 al Nexo, y solo la primera', () => {
    let state = matchWith('furia-caldera', 'borran-yunque-vivo');
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    state = {
      ...state,
      board: [
        makePiece('a', 'gigante-magma', 'player', { x: 2, y: 3 }),
        makePiece('b', 'gigante-magma', 'player', { x: 5, y: 3 }),
        makePiece('presa1', 'sabueso-brasa', 'ai', { x: 2, y: 4 }, { currentHealth: 1 }),
        makePiece('presa2', 'sabueso-brasa', 'ai', { x: 5, y: 4 }, { currentHealth: 1 }),
      ],
    };
    const primera = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'a', defenderId: 'presa1',
    });
    expect(primera.ok).toBe(true);
    expect(primera.state.players.player.nexusHealth).toBe(21);

    const segunda = applyAction(primera.state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'b', defenderId: 'presa2',
    });
    expect(segunda.ok).toBe(true);
    expect(segunda.state.players.player.nexusHealth).toBe(21);
  });
});

describe('Síalu, Lengua de Hielo (Arcano)', () => {
  const conPrision = (): MatchState => {
    let state = matchWith('secretos-arcano', 'sialu-lengua-de-hielo');
    state = withPlayer(state, 'player', {
      hand: [handCard('prision-glacial', 'prision1'), handCard('prision-glacial', 'prision2')],
      resources: resources('arcane', 8),
    });
    return {
      ...state,
      board: [
        makePiece('v1', 'gigante-magma', 'ai', { x: 2, y: 3 }),
        makePiece('v2', 'gigante-magma', 'ai', { x: 5, y: 3 }),
      ],
    };
  };

  it('el primer congelar del turno roba una carta; el segundo ya no', () => {
    const state = conPrision();
    const manoInicial = state.players.player.hand.length;
    const primera = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'prision1',
      target: { kind: 'piece', pieceId: 'v1' },
    });
    expect(primera.ok).toBe(true);
    // Se gasta la carta jugada (-1) y se roba por la pasiva (+1).
    expect(primera.state.players.player.hand).toHaveLength(manoInicial - 1 + 1);
    expect(primera.state.players.player.commanderControlDrawUsedThisTurn).toBe(true);

    const antesDeLaSegunda = primera.state.players.player.hand.length;
    const segunda = applyAction(primera.state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'prision2',
      target: { kind: 'piece', pieceId: 'v2' },
    });
    expect(segunda.ok).toBe(true);
    expect(segunda.state.players.player.hand).toHaveLength(antesDeLaSegunda - 1);
  });

  it('la marca se borra al pasar el turno, así que vuelve a robar al siguiente', () => {
    const primera = applyAction(conPrision(), {
      type: 'play-card', playerId: 'player', cardInstanceId: 'prision1',
      target: { kind: 'piece', pieceId: 'v1' },
    });
    expect(primera.ok).toBe(true);
    const fin = applyAction(primera.state, { type: 'end-turn', playerId: 'player' });
    expect(fin.ok).toBe(true);
    expect(fin.state.players.player.commanderControlDrawUsedThisTurn).toBe(false);
  });
});

describe('Márnak, Raíz Profunda (Naturaleza)', () => {
  it('sus unidades con Guardia entran escudadas, y las demás no', () => {
    let state = matchWith('sabiduria-bosque', 'marnak-raiz-profunda');
    state = withPlayer(state, 'player', {
      hand: [handCard('escudera-del-alba', 'escudera'), handCard('sabueso-brasa', 'sabueso')],
      resources: [...resources('order', 4), ...resources('fury', 4)],
    });
    const conGuardia = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'escudera', position: { x: 3, y: 7 },
    });
    expect(conGuardia.ok).toBe(true);
    const escudera = conGuardia.state.board.find((piece) => piece.instanceId === 'escudera')!;
    // La carta ya trae escudo 2 y Márnak da otros 2: se queda con el mayor, no suma.
    expect(escudera.statuses).toContainEqual({ kind: 'shielded', amount: 2 });

    const sinGuardia = applyAction(conGuardia.state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'sabueso', position: { x: 4, y: 7 },
    });
    expect(sinGuardia.ok).toBe(true);
    expect(sinGuardia.state.board.find((piece) => piece.instanceId === 'sabueso')!.statuses).toHaveLength(0);
  });
});

describe('Veyra, Espada Consagrada (Orden)', () => {
  it('sus voladoras curan al Nexo con el daño que reparten aunque su carta no diga Vínculo vital', () => {
    let state = matchWith('orden-celestial', 'veyra-espada-consagrada');
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    state = {
      ...state,
      board: [
        makePiece('fenix', 'fenix-pavesa', 'player', { x: 3, y: 3 }),
        makePiece('presa', 'gigante-magma', 'ai', { x: 3, y: 4 }),
      ],
    };
    expect(CARD_BY_ID['fenix-pavesa']!.keywords).toContain('flying');
    expect(CARD_BY_ID['fenix-pavesa']!.keywords).not.toContain('lifelink');
    const result = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'fenix', defenderId: 'presa',
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBeGreaterThan(20);
  });

  it('con el comandante de siempre, esa misma voladora no cura nada', () => {
    let state = matchWith('orden-celestial', 'asterin-protector-luz');
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    state = {
      ...state,
      board: [
        makePiece('fenix', 'fenix-pavesa', 'player', { x: 3, y: 3 }),
        makePiece('presa', 'gigante-magma', 'ai', { x: 3, y: 4 }),
      ],
    };
    const result = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'fenix', defenderId: 'presa',
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(20);
  });
});

describe('Orén, el Tercer Luto (Sombra)', () => {
  const conCuras = (curas: number): MatchState => {
    let state = matchWith('reidores-sombra', 'oren-el-tercer-luto');
    state = withPlayer(state, 'player', {
      nexusHealth: 20,
      hand: Array.from({ length: curas }, (_, index) => handCard('diezmo-de-sangre', `diezmo${index}`)),
      resources: resources('shadow', 12),
    });
    return withPlayer(state, 'ai', { nexusHealth: 20, hand: [handCard('fuente-furia', 'x')] });
  };

  it('cada cura del Nexo le quita 1 de Vida al rival', () => {
    const result = applyAction(conCuras(1), {
      type: 'play-card', playerId: 'player', cardInstanceId: 'diezmo0',
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(23);
    expect(result.state.players.ai.nexusHealth).toBe(19);
  });

  it('no cobra más de dos veces por turno', () => {
    let state = conCuras(3);
    for (const id of ['diezmo0', 'diezmo1', 'diezmo2']) {
      const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: id });
      expect(result.ok, `${id}: ${result.ok ? '' : result.error?.message}`).toBe(true);
      state = result.state;
    }
    expect(state.players.ai.nexusHealth).toBe(18);
    expect(state.players.player.commanderDrainCountThisTurn).toBe(2);
  });

  it('con el Nexo ya al máximo no hay cura, así que tampoco peaje', () => {
    let state = conCuras(1);
    state = withPlayer(state, 'player', { ...state.players.player, nexusHealth: 35 });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'diezmo0',
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.ai.nexusHealth).toBe(20);
  });
});

describe('Zeph, Sin Orilla (Vacío)', () => {
  it('la primera unidad del turno entra ya en movimiento; la segunda no', () => {
    let state = matchWith('fractura-vacio', 'zeph-sin-orilla');
    state = withPlayer(state, 'player', {
      hand: [handCard('golem-azur', 'primera'), handCard('golem-azur', 'segunda')],
      resources: resources('arcane', 12),
    });
    const primera = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'primera', position: { x: 3, y: 7 },
    });
    expect(primera.ok).toBe(true);
    expect(primera.state.board.find((piece) => piece.instanceId === 'primera')!.enteredOnTurn)
      .toBe(state.turn - 1);

    const segunda = applyAction(primera.state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'segunda', position: { x: 4, y: 7 },
    });
    expect(segunda.ok).toBe(true);
    expect(segunda.state.board.find((piece) => piece.instanceId === 'segunda')!.enteredOnTurn)
      .toBe(state.turn);
  });
});
