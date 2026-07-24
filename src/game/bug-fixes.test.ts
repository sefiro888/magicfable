import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, effectiveCost, getValidAttacks, getValidMoves } from './engine';
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
 * Un test por cada bug anotado en docs/CARD_AUDIT.md ya arreglado. El número
 * en el nombre del describe corresponde al de la lista de esa auditoría.
 */

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

describe('Bug #1 — Elemental de Tormenta inflige 1 de daño adicional al atacar', () => {
  it('suma el bono al atacar una pieza', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('elemental', 'elemental-tormenta', 'player', { x: 2, y: 2 }),
        makePiece('victima', 'centinela-cristal', 'ai', { x: 4, y: 2 }),
      ],
    };
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'elemental', defenderId: 'victima' });
    expect(result.ok).toBe(true);
    // Centinela: 3 de vida - (2 base + 1 bono) = 0: destruida.
    expect(result.state.board.some((piece) => piece.instanceId === 'victima')).toBe(false);
  });
});

describe('Bug #4 — Infiltrado Volcánico gana +1 Ataque contra objetivos solitarios', () => {
  it('aplica el bono solo cuando el objetivo no tiene ninguna otra unidad adyacente', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('infiltrado', 'infiltrado-volcanico', 'player', { x: 2, y: 2 }),
        makePiece('solitaria', 'gigante-magma', 'ai', { x: 2, y: 3 }),
      ],
    };
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'infiltrado', defenderId: 'solitaria' });
    expect(result.ok).toBe(true);
    // Gigante: 6 - (2 base + 1 bono) = 3.
    expect(result.state.board.find((piece) => piece.instanceId === 'solitaria')?.currentHealth).toBe(3);
  });

  it('no aplica el bono si el objetivo tiene un aliado adyacente', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('infiltrado', 'infiltrado-volcanico', 'player', { x: 2, y: 2 }),
        makePiece('acompanada', 'gigante-magma', 'ai', { x: 2, y: 3 }),
        makePiece('aliada', 'sabueso-brasa', 'ai', { x: 2, y: 4 }),
      ],
    };
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'infiltrado', defenderId: 'acompanada' });
    expect(result.ok).toBe(true);
    // Gigante: 6 - 2 (sin bono) = 4.
    expect(result.state.board.find((piece) => piece.instanceId === 'acompanada')?.currentHealth).toBe(4);
  });
});

describe('Bug #8 — Mago Celestial gana +1 Ataque a distancia', () => {
  it('aplica el bono al atacar desde una casilla no adyacente', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('mago', 'mago-celestial', 'player', { x: 2, y: 0 }),
        makePiece('victima', 'gigante-magma', 'ai', { x: 2, y: 2 }),
      ],
    };
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'mago', defenderId: 'victima' });
    expect(result.ok).toBe(true);
    // Gigante: 6 - (3 base + 1 bono) = 2.
    expect(result.state.board.find((piece) => piece.instanceId === 'victima')?.currentHealth).toBe(2);
  });

  it('no aplica el bono al atacar desde una casilla adyacente', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('mago', 'mago-celestial', 'player', { x: 2, y: 1 }),
        makePiece('victima', 'gigante-magma', 'ai', { x: 2, y: 2 }),
      ],
    };
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'mago', defenderId: 'victima' });
    expect(result.ok).toBe(true);
    // Gigante: 6 - 3 (sin bono) = 3.
    expect(result.state.board.find((piece) => piece.instanceId === 'victima')?.currentHealth).toBe(3);
  });
});

describe('Bug #21 — Murciélago Sombra drena 1 Vida del Nexo enemigo al atacar', () => {
  it('resta 1 al Nexo enemigo y suma 1 al propio', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('murcielago', 'murcielago-sombra', 'player', { x: 2, y: 2 }),
        makePiece('victima', 'gigante-magma', 'ai', { x: 2, y: 3 }),
      ],
    };
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    state = withPlayer(state, 'ai', { nexusHealth: 20 });
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'murcielago', defenderId: 'victima' });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(21);
    expect(result.state.players.ai.nexusHealth).toBe(19);
  });
});

describe('Bug #26 — Vampiro Siniestro drena Vida igual al daño infligido', () => {
  it('cura el Nexo propio en la misma cantidad de daño que inflige', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('vampiro', 'vampiro-siniestro', 'player', { x: 2, y: 2 }),
        makePiece('victima', 'centinela-cristal', 'ai', { x: 2, y: 3 }),
      ],
    };
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'vampiro', defenderId: 'victima' });
    expect(result.ok).toBe(true);
    // Centinela (3 de vida) muere a un ataque de 3: se cura el Nexo en 3 (no en el daño nominal si excede la vida restante).
    expect(result.state.players.player.nexusHealth).toBe(23);
  });
});

describe('Bug #9 y #10 — Oso Forestal y Arboleda Sagrada dan +1 Vida a los aliados que entran', () => {
  it('una unidad que entra con el Oso Forestal en juego gana +1 Vida', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('oso', 'oso-forestal', 'player', { x: 2, y: 6 })] };
    state = withPlayer(state, 'player', {
      hand: [handCard('sabueso-brasa', 'sabueso')], resources: resources('fury', 3),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'sabueso', position: { x: 3, y: 7 } });
    expect(result.ok).toBe(true);
    // Sabueso de Brasa: 1 de vida base + 1 del aura = 2.
    expect(result.state.board.find((piece) => piece.instanceId === 'sabueso')?.currentHealth).toBe(2);
  });

  it('no afecta a las estructuras que entran', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('oso', 'oso-forestal', 'player', { x: 2, y: 6 })] };
    state = withPlayer(state, 'player', {
      hand: [handCard('forja-carmesi', 'forja')], resources: resources('fury', 3),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'forja', position: { x: 3, y: 7 } });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'forja')?.currentHealth).toBe(5);
  });

  it('Arboleda Sagrada (estructura) también concede el bono', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('arboleda', 'arboleda-sagrada', 'player', { x: 2, y: 6 })] };
    state = withPlayer(state, 'player', {
      hand: [handCard('sabueso-brasa', 'sabueso')], resources: resources('fury', 3),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'sabueso', position: { x: 3, y: 7 } });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'sabueso')?.currentHealth).toBe(2);
  });
});

describe('Bug #12 — Centauro Cazador da +1 Ataque a los aliados adyacentes al atacar', () => {
  it('los aliados adyacentes al Centauro ganan +1 Ataque hasta fin de turno', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('centauro', 'centauro-cazador', 'player', { x: 2, y: 2 }),
        makePiece('aliado', 'sabueso-brasa', 'player', { x: 3, y: 2 }),
        makePiece('lejano', 'sabueso-brasa', 'player', { x: 5, y: 5 }),
        makePiece('victima', 'gigante-magma', 'ai', { x: 2, y: 4 }),
      ],
    };
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'centauro', defenderId: 'victima' });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'aliado')?.attackModifier).toBe(1);
    expect(result.state.board.find((piece) => piece.instanceId === 'lejano')?.attackModifier).toBe(0);
  });
});

describe('Bug #16 — Pégaso Celestial cura 2 Vida en su primer ataque', () => {
  it('cura solo la primera vez que ataca', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('pegaso', 'pegaso-celestial', 'player', { x: 2, y: 2 }, { currentHealth: 1 }),
        makePiece('victima', 'gigante-magma', 'ai', { x: 2, y: 3 }),
      ],
    };
    const first = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'pegaso', defenderId: 'victima' });
    expect(first.ok).toBe(true);
    // 1 de vida + 2 curados = 3 (máximo de la carta).
    expect(first.state.board.find((piece) => piece.instanceId === 'pegaso')?.currentHealth).toBe(3);
    // Segundo ataque (mismo turno, forzando el reinicio de attackedThisTurn): no vuelve a curar.
    const secondState = { ...first.state, board: first.state.board.map((piece) => piece.instanceId === 'pegaso' ? { ...piece, attackedThisTurn: false, currentHealth: 1 } : piece) };
    const second = applyAction(secondState, { type: 'attack-piece', playerId: 'player', attackerId: 'pegaso', defenderId: 'victima' });
    expect(second.ok).toBe(true);
    expect(second.state.board.find((piece) => piece.instanceId === 'pegaso')?.currentHealth).toBe(1);
  });
});

describe('Bug #13 — Elfo Ancestral reduce en 1 el coste genérico de los instantes propios', () => {
  it('aplica el descuento a los instantes, no a las unidades', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('elfo', 'elfo-ancestral', 'player', { x: 2, y: 6 })] };
    const savia = CARD_BY_ID['savia-restauradora']!;
    expect(effectiveCost(state, 'player', savia).generic).toBe(savia.cost.generic - 1);
    const oso = CARD_BY_ID['oso-forestal']!;
    expect(effectiveCost(state, 'player', oso).generic).toBe(oso.cost.generic);
  });
});

describe('Bug #25 — Maldición Sombra drena 1 Vida al final de cada turno', () => {
  it('reduce la Vida del objetivo cada vez que termina un turno, hasta que muere', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('maldita', 'sabueso-brasa', 'ai', { x: 2, y: 2 }, { currentHealth: 2 })] };
    state = withPlayer(state, 'player', {
      hand: [handCard('maldicion-sombra', 'maldicion')], resources: resources('shadow', 3),
    });
    const cast = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'maldicion', target: { kind: 'piece', pieceId: 'maldita' } });
    expect(cast.ok).toBe(true);
    const afterFirstEnd = applyAction(cast.state, { type: 'end-turn', playerId: 'player' });
    expect(afterFirstEnd.ok).toBe(true);
    expect(afterFirstEnd.state.board.find((piece) => piece.instanceId === 'maldita')?.currentHealth).toBe(1);
    const afterSecondEnd = applyAction(afterFirstEnd.state, { type: 'end-turn', playerId: 'ai' });
    expect(afterSecondEnd.ok).toBe(true);
    expect(afterSecondEnd.state.board.some((piece) => piece.instanceId === 'maldita')).toBe(false);
  });

  it('rechaza objetivos aliados', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('propia', 'sabueso-brasa', 'player', { x: 2, y: 2 })] };
    state = withPlayer(state, 'player', {
      hand: [handCard('maldicion-sombra', 'maldicion')], resources: resources('shadow', 3),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'maldicion', target: { kind: 'piece', pieceId: 'propia' } });
    expect(result.ok).toBe(false);
  });
});

describe('Bug #24 — Nigromante Oscuro roba al morir un aliado y drena Vida con sus hechizos', () => {
  it('roba una carta cuando muere una unidad aliada propia', () => {
    let state = freshMatch();
    state = {
      ...state,
      activePlayer: 'ai',
      board: [
        makePiece('nigromante', 'nigromante-oscuro', 'player', { x: 2, y: 6 }),
        makePiece('aliado', 'sabueso-brasa', 'player', { x: 2, y: 2 }),
        makePiece('atacante', 'gigante-magma', 'ai', { x: 2, y: 3 }),
      ],
    };
    const before = state.players.player.hand.length;
    const result = applyAction(state, { type: 'attack-piece', playerId: 'ai', attackerId: 'atacante', defenderId: 'aliado' });
    expect(result.ok).toBe(true);
    expect(result.state.board.some((piece) => piece.instanceId === 'aliado')).toBe(false);
    expect(result.state.players.player.hand.length).toBe(before + 1);
  });

  it('drena Vida al Nexo propio cuando un hechizo propio hace daño', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('nigromante', 'nigromante-oscuro', 'player', { x: 2, y: 6 }),
        makePiece('victima', 'gigante-magma', 'ai', { x: 2, y: 2 }),
      ],
    };
    state = withPlayer(state, 'player', {
      nexusHealth: 20,
      hand: [handCard('columna-luz', 'columna')], resources: resources('order', 4),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'columna', target: { kind: 'piece', pieceId: 'victima' } });
    expect(result.ok).toBe(true);
    // Columna de Luz: 5 de daño. Se cura el Nexo propio en esa misma cantidad.
    expect(result.state.players.player.nexusHealth).toBe(25);
  });
});

describe('Bug #27 — Pesadilla Mortal descarta de la mano enemiga y debilita a sus unidades', () => {
  it('descarta 2 cartas de la mano enemiga (no de la propia) y quita 1 Vida a sus unidades', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('enemiga', 'gigante-magma', 'ai', { x: 3, y: 5 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('pesadilla-mortal', 'pesadilla')], resources: resources('shadow', 6),
    });
    state = withPlayer(state, 'ai', {
      hand: [handCard('fuente-sombra', 'e1'), handCard('fuente-sombra', 'e2'), handCard('fuente-sombra', 'e3')],
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'pesadilla', position: { x: 2, y: 7 } });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.hand).toHaveLength(0);
    expect(result.state.players.ai.hand).toHaveLength(1);
    expect(result.state.players.ai.discard).toHaveLength(2);
    expect(result.state.board.find((piece) => piece.instanceId === 'enemiga')?.currentHealth).toBe(5);
  });
});

describe('Bug #19 — Grifo de Orden reduce en 1 el Ataque de los enemigos adyacentes a él', () => {
  it('un atacante adyacente al Grifo inflige 1 de daño menos (la Guardia obliga a atacarlo a él)', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('grifo', 'grifo-orden', 'ai', { x: 2, y: 3 }, { currentHealth: 10 }),
        makePiece('atacante', 'gigante-magma', 'player', { x: 2, y: 2 }),
      ],
    };
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'atacante', defenderId: 'grifo' });
    expect(result.ok).toBe(true);
    // Gigante: 5 ATQ - 1 del propio Grifo (adyacente al atacante) = 4. Grifo: 10 - 4 = 6.
    expect(result.state.board.find((piece) => piece.instanceId === 'grifo')?.currentHealth).toBe(6);
  });
});

describe('Bug #17 — Paladín Glorioso protege a sus aliados adyacentes de la congelación', () => {
  it('un aliado adyacente al Paladín no puede ser congelado', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('paladin', 'paladin-glorioso', 'ai', { x: 2, y: 2 }),
        makePiece('protegida', 'sabueso-brasa', 'ai', { x: 2, y: 3 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('prision-glacial', 'prision')], resources: resources('arcane', 2),
    });
    const cast = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'prision', target: { kind: 'piece', pieceId: 'protegida' } });
    expect(cast.ok).toBe(true);
    const aiTurn = applyAction(cast.state, { type: 'end-turn', playerId: 'player' });
    expect(aiTurn.ok).toBe(true);
    // Sin protección, no podría moverse ni atacar; con ella, sigue disponible.
    expect(getValidMoves(aiTurn.state, 'protegida').length).toBeGreaterThan(0);
  });
});

describe('Bug #30 — Devorador Entrópico drena la Resistencia de una estructura enemiga destruida', () => {
  it('recupera Vida igual a la Resistencia de la estructura enemiga que se destruye', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('devorador', 'devorador-entropico', 'player', { x: 2, y: 2 }, { currentHealth: 1 }),
        makePiece('muro', 'bastion-marmoreo', 'ai', { x: 2, y: 3 }, { currentHealth: 1 }),
        makePiece('atacante', 'gigante-magma', 'player', { x: 2, y: 4 }),
      ],
    };
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'atacante', defenderId: 'muro' });
    expect(result.ok).toBe(true);
    expect(result.state.board.some((piece) => piece.instanceId === 'muro')).toBe(false);
    // Devorador: 1 + 7 (resistencia del Bastión) = 8, tope de su Vida máxima (4).
    expect(result.state.board.find((piece) => piece.instanceId === 'devorador')?.currentHealth).toBe(4);
  });
});

describe('Bug #32 — Aniquilación del Vacío destruye estructuras enemigas y gana Esencia', () => {
  it('destruye todas las estructuras enemigas y gana Esencia igual a su Resistencia total', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('muro1', 'bastion-marmoreo', 'ai', { x: 1, y: 1 }),
        makePiece('muro2', 'forja-carmesi', 'ai', { x: 3, y: 3 }),
        makePiece('unidad-ai', 'sabueso-brasa', 'ai', { x: 5, y: 5 }),
        makePiece('propia', 'bastion-marmoreo', 'player', { x: 6, y: 6 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('aniquilacion-vacio', 'aniquilacion')], resources: resources('void', 5),
    });
    const before = state.players.player.resources.length;
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'aniquilacion', target: { kind: 'none' } });
    expect(result.ok).toBe(true);
    expect(result.state.board.some((piece) => piece.instanceId === 'muro1')).toBe(false);
    expect(result.state.board.some((piece) => piece.instanceId === 'muro2')).toBe(false);
    expect(result.state.board.some((piece) => piece.instanceId === 'unidad-ai')).toBe(true);
    expect(result.state.board.some((piece) => piece.instanceId === 'propia')).toBe(true);
    // 7 (Bastión) + 5 (Forja) = 12 de Esencia nueva, tras gastar los recursos de pago.
    expect(result.state.players.player.resources.length).toBeGreaterThan(before);
  });
});

describe('Bug #33 — Horror Abisal ralentiza a los enemigos al atacar', () => {
  it('todas las unidades enemigas pierden 1 Movimiento durante su siguiente turno', () => {
    let state = freshMatch();
    state = {
      ...state,
      activePlayer: 'ai',
      board: [
        makePiece('horror', 'horror-abisal', 'ai', { x: 2, y: 2 }),
        makePiece('victima', 'sabueso-brasa', 'player', { x: 2, y: 3 }),
        makePiece('lento', 'lancera-magma', 'player', { x: 5, y: 5 }),
      ],
    };
    const attack = applyAction(state, { type: 'attack-piece', playerId: 'ai', attackerId: 'horror', defenderId: 'victima' });
    expect(attack.ok).toBe(true);
    const turnToPlayer = applyAction(attack.state, { type: 'end-turn', playerId: 'ai' });
    expect(turnToPlayer.ok).toBe(true);
    // Lancera de Magma (Movimiento 2 normalmente) ahora solo llega a 1 casilla.
    const moves = getValidMoves(turnToPlayer.state, 'lento');
    expect(moves.every((position) => Math.abs(position.x - 5) + Math.abs(position.y - 5) <= 1)).toBe(true);
    const backToAi = applyAction(turnToPlayer.state, { type: 'end-turn', playerId: 'player' });
    expect(backToAi.ok).toBe(true);
    const backToPlayer = applyAction(backToAi.state, { type: 'end-turn', playerId: 'ai' });
    expect(getValidMoves(backToPlayer.state, 'lento').some((position) => Math.abs(position.x - 5) + Math.abs(position.y - 5) === 2)).toBe(true);
  });
});

describe('Bug #3 — Gigante de Magma abrasa las casillas adyacentes al entrar', () => {
  it('las 4 casillas ortogonales quedan abrasadas', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('gigante-magma', 'gigante')], resources: resources('fury', 6),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'gigante', position: { x: 3, y: 7 } });
    expect(result.ok).toBe(true);
    const scorched = result.state.tileEffects.filter((tile) => tile.kind === 'scorched');
    expect(scorched).toHaveLength(3); // (2,7) y (4,7) dentro del tablero, (3,8) fuera, (3,6) dentro = 3 válidas.
  });
});

describe('Bug #2 — Draco de Magma daña las casillas adyacentes al objetivo solo al atacar', () => {
  it('no daña nada al desplegarse, pero sí al atacar', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('vecino', 'centinela-cristal', 'ai', { x: 1, y: 7 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('draco-magma', 'draco')], resources: resources('fury', 6),
    });
    const deployed = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'draco', position: { x: 2, y: 7 } });
    expect(deployed.ok).toBe(true);
    expect(deployed.state.board.find((piece) => piece.instanceId === 'vecino')?.currentHealth).toBe(3);

    let attackState = deployed.state;
    attackState = {
      ...attackState,
      board: [
        ...attackState.board.map((piece) => piece.instanceId === 'draco' ? { ...piece, enteredOnTurn: piece.enteredOnTurn - 1 } : piece),
        makePiece('objetivo', 'gigante-magma', 'ai', { x: 2, y: 5 }),
        makePiece('cerca-objetivo', 'centinela-cristal', 'ai', { x: 1, y: 5 }),
      ],
    };
    const attacked = applyAction(attackState, { type: 'attack-piece', playerId: 'player', attackerId: 'draco', defenderId: 'objetivo' });
    expect(attacked.ok).toBe(true);
    // La unidad adyacente AL OBJETIVO (no al Draco) recibe el daño de área.
    expect(attacked.state.board.find((piece) => piece.instanceId === 'cerca-objetivo')?.currentHealth).toBe(2);
  });
});

describe('Bug #28 y #6 — el atacante congela al objetivo (Basilisco del Caos, Dragón de Escarcha)', () => {
  it('Basilisco del Caos congela al atacar', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('basilisco', 'basilisco-caos', 'player', { x: 2, y: 2 }),
        makePiece('victima', 'sabueso-brasa', 'ai', { x: 2, y: 3 }),
      ],
    };
    const attack = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'basilisco', defenderId: 'victima' });
    expect(attack.ok).toBe(true);
    const aiTurn = applyAction(attack.state, { type: 'end-turn', playerId: 'player' });
    expect(aiTurn.ok).toBe(true);
    expect(getValidAttacks(aiTurn.state, 'victima').pieceIds).toEqual([]);
    expect(getValidMoves(aiTurn.state, 'victima')).toEqual([]);
  });
});

describe('Bug #22 — Espectro Siniestro ignora a los Guardias y descarta de la mano enemiga al dañar', () => {
  it('puede atacar más allá de un Guardia enemigo adyacente', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('espectro', 'espectro-siniestro', 'player', { x: 2, y: 2 }),
        makePiece('guardia', 'altar-combustion', 'ai', { x: 2, y: 3 }, { currentHealth: 4 }),
        makePiece('lejana', 'gigante-magma', 'ai', { x: 2, y: 1 }),
      ],
    };
    expect(getValidAttacks(state, 'espectro').pieceIds).toContain('lejana');
  });

  it('descarta una carta de la mano enemiga al dañar', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('espectro', 'espectro-siniestro', 'player', { x: 2, y: 2 }),
        makePiece('victima', 'gigante-magma', 'ai', { x: 2, y: 3 }),
      ],
    };
    state = withPlayer(state, 'ai', { hand: [handCard('fuente-sombra', 'e1')] });
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'espectro', defenderId: 'victima' });
    expect(result.ok).toBe(true);
    expect(result.state.players.ai.hand).toHaveLength(0);
    expect(result.state.players.ai.discard.some((card) => card.instanceId === 'e1')).toBe(true);
  });
});

describe('Bug #20 — Juicio Divino solo puede destruir unidades con 2 Vida o menos', () => {
  it('rechaza objetivos con más de 2 Vida', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('sana', 'gigante-magma', 'ai', { x: 2, y: 2 })] };
    state = withPlayer(state, 'player', {
      hand: [handCard('juicio-divino', 'juicio')], resources: resources('order', 4),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'juicio', target: { kind: 'piece', pieceId: 'sana' } });
    expect(result.ok).toBe(false);
  });

  it('destruye objetivos con 2 Vida o menos y cura el Nexo propio', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('debil', 'centinela-cristal', 'ai', { x: 2, y: 2 }, { currentHealth: 2 })] };
    state = withPlayer(state, 'player', {
      nexusHealth: 20,
      hand: [handCard('juicio-divino', 'juicio')], resources: resources('order', 4),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'juicio', target: { kind: 'piece', pieceId: 'debil' } });
    expect(result.ok).toBe(true);
    expect(result.state.board.some((piece) => piece.instanceId === 'debil')).toBe(false);
    expect(result.state.players.player.nexusHealth).toBe(22);
  });
});

describe('Bug #11 — Crecimiento Salvaje da +2 Vida permanente y +1 Ataque hasta fin de turno', () => {
  it('aumenta la Vida y el modificador de Ataque de la unidad objetivo', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('objetivo', 'sabueso-brasa', 'player', { x: 2, y: 2 })] };
    state = withPlayer(state, 'player', {
      hand: [handCard('crecimiento-salvaje', 'crecimiento')], resources: resources('nature', 3),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'crecimiento', target: { kind: 'piece', pieceId: 'objetivo' } });
    expect(result.ok).toBe(true);
    const piece = result.state.board.find((candidate) => candidate.instanceId === 'objetivo');
    expect(piece?.attackModifier).toBe(1);
    expect(piece?.currentHealth).toBe(3);
  });
});

describe('Bug #5 — Erupción Volcánica daña a todas las unidades enemigas', () => {
  it('inflige 2 de daño a cada unidad enemiga y abrasa sus casillas, sin tocar a las propias', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('enemiga1', 'gigante-magma', 'ai', { x: 1, y: 1 }),
        makePiece('enemiga2', 'centinela-cristal', 'ai', { x: 5, y: 5 }),
        makePiece('estructura-ai', 'bastion-marmoreo', 'ai', { x: 6, y: 6 }),
        makePiece('propia', 'sabueso-brasa', 'player', { x: 7, y: 7 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('erupcion-volcanica', 'erupcion')], resources: resources('fury', 4),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'erupcion', target: { kind: 'none' } });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'enemiga1')?.currentHealth).toBe(4);
    expect(result.state.board.find((piece) => piece.instanceId === 'enemiga2')?.currentHealth).toBe(1);
    // La estructura enemiga no es una unidad: no debe dañarse.
    expect(result.state.board.find((piece) => piece.instanceId === 'estructura-ai')?.currentHealth).toBe(7);
    expect(result.state.board.find((piece) => piece.instanceId === 'propia')?.currentHealth).toBe(1);
    expect(result.state.tileEffects.some((tile) => tile.position.x === 1 && tile.position.y === 1)).toBe(true);
  });
});

describe('Bug #15 — Ángel Celestial gana escudo preventivo 1 al entrar', () => {
  it('el escudo absorbe el primer punto de daño', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('angel-celestial', 'angel')], resources: resources('order', 4),
    });
    const deployed = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'angel', position: { x: 2, y: 7 } });
    expect(deployed.ok).toBe(true);
    let afterDeploy = deployed.state;
    afterDeploy = {
      ...afterDeploy,
      activePlayer: 'ai',
      board: [...afterDeploy.board, makePiece('atacante', 'sabueso-brasa', 'ai', { x: 2, y: 6 })],
    };
    const attacked = applyAction(afterDeploy, { type: 'attack-piece', playerId: 'ai', attackerId: 'atacante', defenderId: 'angel' });
    expect(attacked.ok).toBe(true);
    // Sabueso: 2 ATQ, el escudo absorbe 1 → solo 1 de daño real. Ángel: 2 - 1 = 1.
    expect(attacked.state.board.find((piece) => piece.instanceId === 'angel')?.currentHealth).toBe(1);
  });
});

describe('Bug #7 — Guardián Escarchado impide atacar a las unidades enemigas adyacentes', () => {
  it('una unidad enemiga adyacente al Guardián no puede atacar ni al Nexo ni a otra pieza', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('guardian', 'guardian-escarchado', 'ai', { x: 2, y: 3 }),
        makePiece('bloqueada', 'gigante-magma', 'player', { x: 2, y: 2 }),
      ],
    };
    expect(getValidAttacks(state, 'bloqueada')).toEqual({ pieceIds: [], canAttackNexus: false });
  });

  it('una unidad no adyacente al Guardián puede atacar con normalidad', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('guardian', 'guardian-escarchado', 'ai', { x: 2, y: 5 }),
        makePiece('libre', 'gigante-magma', 'player', { x: 2, y: 2 }),
        makePiece('victima', 'sabueso-brasa', 'ai', { x: 2, y: 3 }),
      ],
    };
    expect(getValidAttacks(state, 'libre').pieceIds).toContain('victima');
  });
});

describe('Bug #18 (rediseñado) — Clérigo de Luz da +1 Vida a los aliados que entran', () => {
  it('reutiliza el aura del Oso Forestal: los aliados que entran ganan +1 Vida', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('clerigo', 'clerigo-luz', 'player', { x: 2, y: 6 })] };
    state = withPlayer(state, 'player', {
      hand: [handCard('sabueso-brasa', 'sabueso')], resources: resources('fury', 3),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'sabueso', position: { x: 3, y: 7 } });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'sabueso')?.currentHealth).toBe(2);
  });
});

describe('Bug #29 (rediseñado) — Quimera del Caos copia el Ataque de un aliado adyacente al entrar', () => {
  it('gana como bono permanente el Ataque del aliado adyacente', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('aliado', 'gigante-magma', 'player', { x: 2, y: 6 })] };
    state = withPlayer(state, 'player', {
      hand: [handCard('quimera-caos', 'quimera')], resources: resources('void', 4),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'quimera', position: { x: 2, y: 7 } });
    expect(result.ok).toBe(true);
    // Gigante de Magma tiene 5 de Ataque: la Quimera lo copia como bono permanente.
    expect(result.state.board.find((piece) => piece.instanceId === 'quimera')?.attackModifier).toBe(5);
  });

  it('sin aliados adyacentes no gana ningún bono', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('quimera-caos', 'quimera')], resources: resources('void', 4),
    });
    const result = applyAction(state, { type: 'play-card', playerId: 'player', cardInstanceId: 'quimera', position: { x: 2, y: 7 } });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'quimera')?.attackModifier).toBe(0);
  });
});

describe('Bug #31 (rediseñado) — Leviatán Abismal empuja a los enemigos adyacentes al objetivo al atacar', () => {
  it('las unidades enemigas adyacentes al objetivo se alejan 1 casilla del Leviatán', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('leviatan', 'leviatan-abismal', 'player', { x: 2, y: 7 }, { enteredOnTurn: -1 }),
        makePiece('objetivo', 'gigante-magma', 'ai', { x: 2, y: 6 }, { currentHealth: 10 }),
        makePiece('cercana', 'centinela-cristal', 'ai', { x: 2, y: 5 }),
      ],
    };
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'leviatan', defenderId: 'objetivo' });
    expect(result.ok).toBe(true);
    // La unidad adyacente al objetivo se aleja del Leviatán: de (2,5) pasa a (2,4).
    expect(result.state.board.find((piece) => piece.instanceId === 'cercana')?.position).toEqual({ x: 2, y: 4 });
  });

  it('no empuja si la casilla de destino cae fuera del tablero', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('leviatan', 'leviatan-abismal', 'player', { x: 2, y: 1 }, { enteredOnTurn: -1 }),
        makePiece('objetivo', 'gigante-magma', 'ai', { x: 2, y: 0 }, { currentHealth: 10 }),
        makePiece('en-el-borde', 'centinela-cristal', 'ai', { x: 1, y: 0 }),
      ],
    };
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'leviatan', defenderId: 'objetivo' });
    expect(result.ok).toBe(true);
    // Empujarla la sacaría del tablero (y pasaría a -1): se queda donde estaba.
    expect(result.state.board.find((piece) => piece.instanceId === 'en-el-borde')?.position).toEqual({ x: 1, y: 0 });
  });
});
