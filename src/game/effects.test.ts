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

describe('Fénix de Pavesa — daño adyacente al entrar', () => {
  it('inflige 1 de daño a una carta enemiga adyacente al desplegarse', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('enemy', 'centinela-cristal', 'ai', { x: 1, y: 7 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('fenix-pavesa', 'fenix')], resources: resources('fury', 5),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'fenix', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(true);
    // Centinela de Cristal: 3 de vida - 1 de daño = 2.
    expect(result.state.board.find((piece) => piece.instanceId === 'enemy')?.currentHealth).toBe(2);
  });
});

describe('Ariete Volcánico — daño adicional a estructuras', () => {
  it('añade 2 de daño extra cuando el objetivo es una estructura, no una unidad', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('ariete', 'ariete-volcanico', 'player', { x: 2, y: 2 }),
        makePiece('muro', 'bastion-marmoreo', 'ai', { x: 2, y: 3 }),
        makePiece('unidad', 'gigante-magma', 'ai', { x: 1, y: 2 }),
      ],
    };
    const onStructure = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'ariete', defenderId: 'muro',
    });
    expect(onStructure.ok).toBe(true);
    // 4 ATQ base + 2 de bono contra estructuras = 6 de daño sobre una resistencia de 7.
    expect(onStructure.state.board.find((piece) => piece.instanceId === 'muro')?.currentHealth).toBe(1);

    const onUnit = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'ariete', defenderId: 'unidad',
    });
    expect(onUnit.ok).toBe(true);
    // Contra una unidad no aplica el bono: solo los 4 de ataque base (Gigante de Magma: 6 - 4 = 2).
    expect(onUnit.state.board.find((piece) => piece.instanceId === 'unidad')?.currentHealth).toBe(2);
  });
});

describe('Pacto de Ascuas — +2 Ataque hasta fin de turno', () => {
  it('aumenta el ataque de la unidad objetivo y se refleja en el combate', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('sabueso', 'sabueso-brasa', 'player', { x: 2, y: 2 }),
        makePiece('victima', 'gigante-magma', 'ai', { x: 2, y: 3 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('pacto-ascuas', 'pacto')], resources: resources('fury', 2),
    });
    const cast = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'pacto', target: { kind: 'piece', pieceId: 'sabueso' },
    });
    expect(cast.ok).toBe(true);
    expect(cast.state.board.find((piece) => piece.instanceId === 'sabueso')?.attackModifier).toBe(2);
    const attack = applyAction(cast.state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'sabueso', defenderId: 'victima',
    });
    expect(attack.ok).toBe(true);
    // Sabueso de Brasa: 2 ATQ base + 2 del pacto = 4 de daño (Gigante de Magma: 6 - 4 = 2).
    expect(attack.state.board.find((piece) => piece.instanceId === 'victima')?.currentHealth).toBe(2);
  });

  it('rechaza objetivos enemigos', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('enemigo', 'sabueso-brasa', 'ai', { x: 2, y: 2 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('pacto-ascuas', 'pacto')], resources: resources('fury', 2),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'pacto', target: { kind: 'piece', pieceId: 'enemigo' },
    });
    expect(result.ok).toBe(false);
  });
});

describe('Duelista del Prisma — roba una carta y descarta una al entrar', () => {
  it('roba una carta y descarta la que le precedía en la mano', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('duelista-prisma', 'duelista'), handCard('fuente-arcana', 'filler')],
      resources: resources('arcane', 3),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'duelista', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(true);
    // Se juega el duelista (-1), se roba una carta (+1) y se descarta la que quedaba (-1).
    expect(result.state.players.player.hand).toHaveLength(1);
    expect(result.state.players.player.hand.some((card) => card.instanceId === 'filler')).toBe(false);
    expect(result.state.players.player.discard.some((card) => card.instanceId === 'filler')).toBe(true);
  });
});

describe('Congelación Rápida — congela 1 turno', () => {
  it('impide moverse y atacar durante el siguiente turno del objetivo', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('frozen', 'centinela-cristal', 'ai', { x: 2, y: 2 }),
        makePiece('enemy', 'sabueso-brasa', 'player', { x: 2, y: 3 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('congelacion-rapida', 'congela')], resources: resources('arcane', 2),
    });
    const cast = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'congela', target: { kind: 'piece', pieceId: 'frozen' },
    });
    expect(cast.ok).toBe(true);
    const aiTurn = applyAction(cast.state, { type: 'end-turn', playerId: 'player' });
    expect(aiTurn.ok).toBe(true);
    expect(getValidMoves(aiTurn.state, 'frozen')).toEqual([]);
    expect(getValidAttacks(aiTurn.state, 'frozen').pieceIds).toEqual([]);
  });
});

describe('Destello Rúnico — daño y robo', () => {
  it('inflige 2 de daño a una unidad enemiga y roba una carta', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('victima', 'gigante-magma', 'ai', { x: 2, y: 2 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('destello-runico', 'destello')], resources: resources('arcane', 2),
    });
    const before = state.players.player.hand.length;
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'destello', target: { kind: 'piece', pieceId: 'victima' },
    });
    expect(result.ok).toBe(true);
    // Gigante de Magma: 6 de vida - 2 de daño = 4.
    expect(result.state.board.find((piece) => piece.instanceId === 'victima')?.currentHealth).toBe(4);
    // Jugó la carta (-1) y robó una (+1): la mano queda igual de larga.
    expect(result.state.players.player.hand).toHaveLength(before);
  });
});

describe('Muralla de Zarzas — daño adyacente al alzarse', () => {
  it('inflige 2 de daño a una unidad enemiga adyacente al desplegarse', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('enemy', 'gigante-magma', 'ai', { x: 1, y: 7 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('muralla-zarzas', 'muralla')], resources: resources('nature', 5),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'muralla', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(true);
    // Gigante de Magma: 6 de vida - 2 de daño = 4.
    expect(result.state.board.find((piece) => piece.instanceId === 'enemy')?.currentHealth).toBe(4);
  });
});

describe('Savia Restauradora — cura el Nexo y roba una carta', () => {
  it('recupera 5 de Vida en el Nexo propio y roba una carta', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      nexusHealth: 15,
      hand: [handCard('savia-restauradora', 'savia')], resources: resources('nature', 3),
    });
    const before = state.players.player.hand.length;
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'savia', target: { kind: 'none' },
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(20);
    expect(result.state.players.player.hand).toHaveLength(before);
  });

  it('no supera la Vida máxima del Nexo', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      nexusHealth: 24,
      hand: [handCard('savia-restauradora', 'savia')], resources: resources('nature', 3),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'savia', target: { kind: 'none' },
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(25);
  });
});

describe('Aliento de Primavera — +3 Ataque y refresca movimiento', () => {
  it('aumenta el ataque y permite volver a mover a la unidad objetivo', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('lancera', 'lancera-magma', 'player', { x: 2, y: 3 }, { movedThisTurn: true })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('aliento-primavera', 'aliento')], resources: resources('nature', 4),
    });
    expect(getValidMoves(state, 'lancera')).toHaveLength(0);
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'aliento', target: { kind: 'piece', pieceId: 'lancera' },
    });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'lancera')?.attackModifier).toBe(3);
    expect(getValidMoves(result.state, 'lancera').length).toBeGreaterThan(0);
  });
});

describe('Lancero del Alba — reduce en 1 el primer daño del turno', () => {
  it('reduce el primer golpe del turno pero no el segundo', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('lancero', 'lancero-alba', 'ai', { x: 2, y: 2 }, { currentHealth: 6 }),
        makePiece('atacante', 'sabueso-brasa', 'player', { x: 2, y: 3 }),
        makePiece('atacante-2', 'sabueso-brasa', 'player', { x: 1, y: 2 }),
      ],
    };
    const first = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'atacante', defenderId: 'lancero',
    });
    expect(first.ok).toBe(true);
    // Sabueso: 2 ATQ, reducido 1 → 1 de daño. 6 - 1 = 5.
    expect(first.state.board.find((piece) => piece.instanceId === 'lancero')?.currentHealth).toBe(5);
    const second = applyAction(first.state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'atacante-2', defenderId: 'lancero',
    });
    expect(second.ok).toBe(true);
    // Segundo ataque del turno: sin reducción. 5 - 2 = 3.
    expect(second.state.board.find((piece) => piece.instanceId === 'lancero')?.currentHealth).toBe(3);
  });
});

describe('Bendición del Escudo — cura el Nexo propio', () => {
  it('recupera 4 de Vida en el Nexo propio', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      nexusHealth: 15,
      hand: [handCard('bendicion-escudo', 'bendicion')], resources: resources('order', 2),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'bendicion', target: { kind: 'none' },
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(19);
  });
});

describe('Heraldo del Juicio — daño adyacente al entrar', () => {
  it('inflige 2 de daño a una unidad enemiga adyacente al desplegarse', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('enemy', 'gigante-magma', 'ai', { x: 1, y: 7 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('heraldo-juicio', 'heraldo')], resources: resources('order', 6),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'heraldo', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(true);
    // Gigante de Magma: 6 de vida - 2 de daño = 4.
    expect(result.state.board.find((piece) => piece.instanceId === 'enemy')?.currentHealth).toBe(4);
  });
});

describe('Columna de Luz — 5 de daño a una pieza enemiga', () => {
  it('inflige 5 de daño al objetivo', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('victima', 'gigante-magma', 'ai', { x: 2, y: 2 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('columna-luz', 'columna')], resources: resources('order', 4),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'columna', target: { kind: 'piece', pieceId: 'victima' },
    });
    expect(result.ok).toBe(true);
    // Gigante de Magma: 6 de vida - 5 de daño = 1.
    expect(result.state.board.find((piece) => piece.instanceId === 'victima')?.currentHealth).toBe(1);
  });
});

describe('Sacerdote de la Carroña — roba y descarta al entrar', () => {
  it('roba una carta y descarta la que le precedía en la mano', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      hand: [handCard('sacerdote-carrona', 'sacerdote'), handCard('fuente-sombra', 'filler')],
      resources: resources('shadow', 3),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'sacerdote', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.hand).toHaveLength(1);
    expect(result.state.players.player.discard.some((card) => card.instanceId === 'filler')).toBe(true);
  });
});

describe('Ritual Sanguino — cura el Nexo y descarta una carta', () => {
  it('recupera 4 de Vida y descarta una carta de la mano', () => {
    let state = freshMatch();
    state = withPlayer(state, 'player', {
      nexusHealth: 15,
      hand: [handCard('ritual-sanguino', 'ritual'), handCard('fuente-sombra', 'filler')],
      resources: resources('shadow', 2),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'ritual', target: { kind: 'none' },
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(19);
    expect(result.state.players.player.discard.some((card) => card.instanceId === 'filler')).toBe(true);
  });
});

describe('Cripta Olvidada — descuento a los hechizos propios', () => {
  it('reduce en 1 el coste genérico de los hechizos, sin bajar de 0', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('cripta', 'cripta-olvidada', 'player', { x: 2, y: 7 })] };
    const ritual = CARD_BY_ID['ritual-sanguino']!;
    expect(effectiveCost(state, 'player', ritual).generic).toBe(0);
    expect(ritual.cost.generic).toBeGreaterThan(0);
  });
});

describe('Guadaña Espectral — daño y réplica al más débil', () => {
  it('inflige 4 al objetivo y 2 a la unidad enemiga restante con menos vida', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('objetivo', 'gigante-magma', 'ai', { x: 2, y: 2 }),
        makePiece('debil', 'sabueso-brasa', 'ai', { x: 4, y: 2 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('guadana-espectral', 'guadana')], resources: resources('shadow', 4),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'guadana',
      target: { kind: 'piece', pieceId: 'objetivo' },
    });
    expect(result.ok).toBe(true);
    // Gigante de Magma: 6 - 4 = 2.
    expect(result.state.board.find((piece) => piece.instanceId === 'objetivo')?.currentHealth).toBe(2);
    // Sabueso de Brasa (1 de vida) es el más débil: recibe 2 y muere.
    expect(result.state.board.some((piece) => piece.instanceId === 'debil')).toBe(false);
  });
});

describe('Señor del Osario — daño a todos los enemigos adyacentes al entrar', () => {
  it('inflige 2 de daño a cada unidad enemiga adyacente, no a las aliadas', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('enemy', 'centinela-cristal', 'ai', { x: 1, y: 7 }),
        makePiece('ally', 'sabueso-brasa', 'player', { x: 3, y: 7 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('senor-osario', 'senor')], resources: resources('shadow', 6),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'senor', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'enemy')?.currentHealth).toBe(1);
    // Sabueso de Brasa (1 de vida) es aliado: includeAllies:false no le afecta.
    expect(result.state.board.find((piece) => piece.instanceId === 'ally')?.currentHealth).toBe(1);
  });
});

describe('Heraldo de la Fractura — daño adyacente al entrar', () => {
  it('inflige 1 de daño a una unidad enemiga adyacente al desplegarse', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('enemy', 'centinela-cristal', 'ai', { x: 1, y: 7 })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('heraldo-fractura', 'heraldo')], resources: resources('void', 3),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'heraldo', position: { x: 2, y: 7 },
    });
    expect(result.ok).toBe(true);
    // Centinela de Cristal: 3 de vida - 1 de daño = 2.
    expect(result.state.board.find((piece) => piece.instanceId === 'enemy')?.currentHealth).toBe(2);
  });
});

describe('Portal Inestable — reduce en 1 el primer daño del turno', () => {
  it('reduce el primer golpe del turno pero no el segundo', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('portal', 'portal-inestable', 'ai', { x: 2, y: 2 }, { currentHealth: 4 }),
        makePiece('atacante', 'sabueso-brasa', 'player', { x: 2, y: 3 }),
        makePiece('atacante-2', 'sabueso-brasa', 'player', { x: 1, y: 2 }),
      ],
    };
    const first = applyAction(state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'atacante', defenderId: 'portal',
    });
    expect(first.ok).toBe(true);
    // Sabueso: 2 ATQ, reducido 1 → 1 de daño. 4 - 1 = 3.
    expect(first.state.board.find((piece) => piece.instanceId === 'portal')?.currentHealth).toBe(3);
    const second = applyAction(first.state, {
      type: 'attack-piece', playerId: 'player', attackerId: 'atacante-2', defenderId: 'portal',
    });
    expect(second.ok).toBe(true);
    // Segundo ataque del turno: sin reducción. 3 - 2 = 1.
    expect(second.state.board.find((piece) => piece.instanceId === 'portal')?.currentHealth).toBe(1);
  });
});

describe('Tejedor de Entropía — descuento a los hechizos propios', () => {
  it('reduce en 1 el coste genérico de los hechizos, sin bajar de 0', () => {
    let state = freshMatch();
    state = { ...state, board: [makePiece('tejedor', 'tejedor-entropia', 'player', { x: 2, y: 7 })] };
    const singularidad = CARD_BY_ID['singularidad']!;
    expect(effectiveCost(state, 'player', singularidad).generic).toBe(singularidad.cost.generic - 1);
    expect(singularidad.cost.generic).toBeGreaterThan(0);
  });
});

describe('Paradoja del Vacío — refrescar movimiento', () => {
  it('permite volver a mover una unidad aliada que ya movió', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [makePiece('lancera', 'lancera-magma', 'player', { x: 2, y: 3 }, { movedThisTurn: true })],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('paradoja-vacio', 'paradoja')], resources: resources('void', 4),
    });
    expect(getValidMoves(state, 'lancera')).toHaveLength(0);
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'paradoja', target: { kind: 'piece', pieceId: 'lancera' },
    });
    expect(result.ok).toBe(true);
    expect(getValidMoves(result.state, 'lancera').length).toBeGreaterThan(0);
  });
});

describe('Colapso Dimensional — daño y réplica al más débil', () => {
  it('inflige 3 al objetivo y 3 a la unidad enemiga restante con menos vida', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('objetivo', 'gigante-magma', 'ai', { x: 2, y: 2 }),
        makePiece('debil', 'sabueso-brasa', 'ai', { x: 4, y: 2 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('colapso-dimensional', 'colapso')], resources: resources('void', 4),
    });
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'colapso',
      target: { kind: 'piece', pieceId: 'objetivo' },
    });
    expect(result.ok).toBe(true);
    // Gigante de Magma: 6 - 3 = 3.
    expect(result.state.board.find((piece) => piece.instanceId === 'objetivo')?.currentHealth).toBe(3);
    // Sabueso de Brasa (1 de vida) es el más débil: recibe 3 y muere.
    expect(result.state.board.some((piece) => piece.instanceId === 'debil')).toBe(false);
  });
});

describe('Singularidad — congela 2 turnos y daña', () => {
  it('inflige 2 de daño y congela durante los 2 siguientes turnos del objetivo', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('objetivo', 'gigante-magma', 'ai', { x: 2, y: 2 }),
        makePiece('enemy', 'sabueso-brasa', 'player', { x: 2, y: 3 }),
      ],
    };
    state = withPlayer(state, 'player', {
      hand: [handCard('singularidad', 'singularidad')], resources: resources('void', 3),
    });
    const cast = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'singularidad',
      target: { kind: 'piece', pieceId: 'objetivo' },
    });
    expect(cast.ok).toBe(true);
    // Gigante de Magma: 6 - 2 = 4.
    expect(cast.state.board.find((piece) => piece.instanceId === 'objetivo')?.currentHealth).toBe(4);
    const aiTurn = applyAction(cast.state, { type: 'end-turn', playerId: 'player' });
    expect(aiTurn.ok).toBe(true);
    expect(getValidMoves(aiTurn.state, 'objetivo')).toEqual([]);
    expect(getValidAttacks(aiTurn.state, 'objetivo').pieceIds).toEqual([]);
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
