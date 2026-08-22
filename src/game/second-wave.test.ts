import { describe, expect, it } from 'vitest';
import { CARD_BY_ID, CARDS } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch } from './engine';
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
 * Segunda oleada (NEX-02 «Fractura»): las tres mecánicas que estrena.
 *
 * 1. **Mantenimiento de estructuras** — «al final de tu turno», que hasta
 *    ahora ninguna estructura sabía hacer.
 * 2. **Disparador de muerte** — «cuando destruye una unidad».
 * 3. **Palabras clave prestadas** — Perforar hasta el final del turno.
 *
 * Igual que en `bug-fixes.test.ts`, las partidas van SIN terreno: estos casos
 * colocan piezas en casillas concretas y unas ruinas sorteadas los romperían
 * por un motivo ajeno a lo que se prueba.
 */
const freshMatch = (seed = 42): MatchState => ({
  ...createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, seed),
  terrain: [],
});

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

/** Termina el turno del jugador, que es cuando cobran sus estructuras. */
const endPlayerTurn = (state: MatchState): MatchState => {
  const result = applyAction(state, { type: 'end-turn', playerId: 'player' });
  expect(result.ok).toBe(true);
  return result.state;
};

describe('catálogo de la segunda oleada', () => {
  it('añade 24 cartas repartidas a 4 por facción, todas del conjunto NEX-02', () => {
    const wave = CARDS.filter((card) => card.set.startsWith('NEX-02'));
    expect(wave).toHaveLength(24);
    for (const faction of ['fury', 'arcane', 'nature', 'order', 'shadow', 'void'] as const) {
      expect(wave.filter((card) => card.faction === faction), faction).toHaveLength(4);
    }
  });

  it('cada carta nueva declara su ilustración por id, como el resto del catálogo', () => {
    for (const card of CARDS.filter((definition) => definition.set.startsWith('NEX-02'))) {
      expect(card.art.webp).toBe(`/assets/cards/art/${card.id}.webp`);
      expect(card.art.fallback).toBe(`/assets/cards/art/${card.id}.svg`);
    }
  });
});

describe('mantenimiento de estructuras: «al final de tu turno»', () => {
  it('el Corazón del Manantial cura al Nexo propio al terminar el turno', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    state = { ...state, board: [makePiece('manantial', 'corazon-del-manantial', 'player', { x: 3, y: 1 })] };
    expect(endPlayerTurn(state).players.player.nexusHealth).toBe(22);
  });

  it('solo cobra en el turno de su dueño, no en el del rival', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    state = { ...state, board: [makePiece('manantial', 'corazon-del-manantial', 'player', { x: 3, y: 1 })] };
    // El turno que termina es el del rival: la estructura del jugador no trabaja.
    state = { ...state, activePlayer: 'ai' };
    const result = applyAction(state, { type: 'end-turn', playerId: 'ai' });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(20);
  });

  it('el Mausoleo Hambriento drena 1 al Nexo enemigo y cura 1 al propio', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    state = withPlayer(state, 'ai', { nexusHealth: 20 });
    state = { ...state, board: [makePiece('mausoleo', 'mausoleo-hambriento', 'player', { x: 3, y: 1 })] };
    const next = endPlayerTurn(state);
    expect(next.players.ai.nexusHealth).toBe(19);
    expect(next.players.player.nexusHealth).toBe(21);
  });

  it('si el drenaje del Mausoleo es letal, la partida termina ahí mismo', () => {
    let state = freshMatch();
    state = withPlayer(state, 'ai', { nexusHealth: 1 });
    state = { ...state, board: [makePiece('mausoleo', 'mausoleo-hambriento', 'player', { x: 3, y: 1 })] };
    const result = applyAction(state, { type: 'end-turn', playerId: 'player' });
    expect(result.ok).toBe(true);
    expect(result.state.winner).toBe('player');
    expect(result.state.phase).toBe('finished');
  });

  it('la Pira de los Caídos castiga a la unidad enemiga más débil, no a la primera que encuentre', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('pira', 'pira-de-los-caidos', 'player', { x: 1, y: 1 }),
        makePiece('sana', 'gigante-magma', 'ai', { x: 3, y: 5 }),
        makePiece('herida', 'gigante-magma', 'ai', { x: 4, y: 5 }, { currentHealth: 2 }),
      ],
    };
    const next = endPlayerTurn(state);
    expect(next.board.find((piece) => piece.instanceId === 'herida')?.currentHealth).toBe(1);
    const sana = next.board.find((piece) => piece.instanceId === 'sana')!;
    expect(sana.currentHealth).toBe(CARD_BY_ID['gigante-magma']!.health);
  });

  it('el Muro de Plegarias escuda a la unidad aliada más herida y no repite escudo', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('muro', 'muro-de-plegarias', 'player', { x: 1, y: 1 }),
        makePiece('sana', 'gigante-magma', 'player', { x: 3, y: 2 }),
        makePiece('herida', 'gigante-magma', 'player', { x: 4, y: 2 }, { currentHealth: 1 }),
      ],
    };
    const next = endPlayerTurn(state);
    const herida = next.board.find((piece) => piece.instanceId === 'herida')!;
    expect(herida.statuses).toContainEqual({ kind: 'shielded', amount: 2 });
    expect(next.board.find((piece) => piece.instanceId === 'sana')!.statuses).toHaveLength(0);
  });

  it('la Biblioteca Sumergida roba con la mano corta y se calla con la mano llena', () => {
    let base = freshMatch();
    base = { ...base, board: [makePiece('biblioteca', 'biblioteca-sumergida', 'player', { x: 1, y: 1 })] };

    const conManoCorta = withPlayer(base, 'player', { hand: [handCard('fuente-furia', 'una')] });
    // Roba 1 por el mantenimiento; el robo normal del cambio de turno es del rival.
    expect(endPlayerTurn(conManoCorta).players.player.hand).toHaveLength(2);

    const conManoLlena = withPlayer(base, 'player', {
      hand: Array.from({ length: 6 }, (_, index) => handCard('fuente-furia', `c${index}`)),
    });
    expect(endPlayerTurn(conManoLlena).players.player.hand).toHaveLength(6);
  });

  it('el Faro de la Fractura roba una y descarta otra: la mano no crece', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('faro', 'faro-de-la-fractura', 'player', { x: 1, y: 1 })] };
    state = withPlayer(state, 'player', { hand: [handCard('fuente-furia', 'a'), handCard('fuente-furia', 'b')] });
    const next = endPlayerTurn(state);
    expect(next.players.player.hand).toHaveLength(2);
    expect(next.players.player.discard).toHaveLength(1);
  });
});

describe('disparador de muerte: el Carroñero del Osario', () => {
  it('cura 1 al Nexo cuando su ataque destruye a la defensora', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    state = {
      ...state,
      board: [
        makePiece('carronero', 'carronero-del-osario', 'player', { x: 3, y: 3 }),
        makePiece('presa', 'sabueso-brasa', 'ai', { x: 3, y: 4 }, { currentHealth: 1 }),
      ],
    };
    const result = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'carronero', defenderId: 'presa',
    });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'presa')).toBeUndefined();
    expect(result.state.players.player.nexusHealth).toBe(21);
  });

  it('no cura nada si la defensora sobrevive al golpe', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    state = {
      ...state,
      board: [
        makePiece('carronero', 'carronero-del-osario', 'player', { x: 3, y: 3 }),
        makePiece('presa', 'gigante-magma', 'ai', { x: 3, y: 4 }),
      ],
    };
    const result = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'carronero', defenderId: 'presa',
    });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'presa')).toBeDefined();
    expect(result.state.players.player.nexusHealth).toBe(20);
  });
});

describe('palabras clave prestadas: Salto de Umbral', () => {
  const conSalto = (): MatchState => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('salto-de-umbral', 'salto')],
      resources: resources('void', 4),
    });
    return {
      ...state,
      board: [makePiece('aliada', 'gigante-magma', 'player', { x: 3, y: 3 }, { movedThisTurn: true })],
    };
  };

  it('presta Perforar a la unidad señalada y le devuelve el movimiento', () => {
    const result = applyAction(conSalto(), {
      type: 'play-card', playerId: 'player', cardInstanceId: 'salto',
      target: { kind: 'piece', pieceId: 'aliada' },
    });
    expect(result.ok).toBe(true);
    const aliada = result.state.board.find((piece) => piece.instanceId === 'aliada')!;
    expect(aliada.grantedKeywords).toContain('pierce');
    expect(aliada.movedThisTurn).toBe(false);
  });

  it('el préstamo caduca al terminar el turno de quien lo recibió', () => {
    const jugado = applyAction(conSalto(), {
      type: 'play-card', playerId: 'player', cardInstanceId: 'salto',
      target: { kind: 'piece', pieceId: 'aliada' },
    });
    expect(jugado.ok).toBe(true);
    const next = endPlayerTurn(jugado.state);
    expect(next.board.find((piece) => piece.instanceId === 'aliada')?.grantedKeywords).toBeUndefined();
  });

  it('no puede apuntar a una unidad enemiga', () => {
    let state = conSalto();
    state = {
      ...state,
      board: [...state.board, makePiece('rival', 'gigante-magma', 'ai', { x: 3, y: 5 })],
    };
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'salto',
      target: { kind: 'piece', pieceId: 'rival' },
    });
    expect(result.ok).toBe(false);
  });
});

describe('entradas nuevas de la segunda oleada', () => {
  it('el Coloso de Escoria daña a todas las unidades enemigas al entrar', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('coloso-de-escoria', 'coloso')],
      resources: resources('fury', 8),
    });
    state = {
      ...state,
      board: [
        makePiece('e1', 'gigante-magma', 'ai', { x: 2, y: 5 }),
        makePiece('e2', 'gigante-magma', 'ai', { x: 5, y: 5 }),
      ],
    };
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'coloso', position: { x: 3, y: 7 },
    });
    expect(result.ok).toBe(true);
    const vida = CARD_BY_ID['gigante-magma']!.health!;
    for (const id of ['e1', 'e2']) {
      expect(result.state.board.find((piece) => piece.instanceId === id)?.currentHealth, id).toBe(vida - 2);
    }
  });

  it('el Arcángel del Veredicto aturde a la unidad enemiga con más Ataque, no a la primera', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('arcangel-del-veredicto', 'arcangel')],
      resources: resources('order', 8),
    });
    state = {
      ...state,
      board: [
        makePiece('floja', 'sabueso-brasa', 'ai', { x: 2, y: 5 }),
        makePiece('fuerte', 'gigante-magma', 'ai', { x: 5, y: 5 }),
      ],
    };
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'arcangel', position: { x: 3, y: 7 },
    });
    expect(result.ok).toBe(true);
    const fuerte = result.state.board.find((piece) => piece.instanceId === 'fuerte')!;
    expect(fuerte.statuses.some((status) => status.kind === 'stunned')).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'floja')!.statuses).toHaveLength(0);
  });

  it('el Devorador de Ecos le quita una carta de la mano al rival cada vez que ataca', () => {
    let state = freshMatch();
    state = withPlayer(state, 'ai', {
      hand: [handCard('fuente-furia', 'a'), handCard('fuente-furia', 'b')],
    });
    state = {
      ...state,
      board: [
        makePiece('devorador', 'devorador-de-ecos', 'player', { x: 3, y: 3 }),
        makePiece('presa', 'gigante-magma', 'ai', { x: 3, y: 4 }),
      ],
    };
    const result = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'devorador', defenderId: 'presa',
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.ai.hand).toHaveLength(1);
    expect(result.state.players.ai.discard).toHaveLength(1);
  });
});
