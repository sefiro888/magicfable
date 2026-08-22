import { describe, expect, it } from 'vitest';
import { CARD_BY_ID, CARDS } from './cards';
import { STARTER_DECKS } from './decks';
import { activeEffects, canPayOffering, isUnderJudgement, offeringCost, offeringOf } from './duna';
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
 * Duna, «El Tribunal de Arena»: las dos mecánicas que la definen.
 *
 * **Ofrenda** convierte tu Vida en un recurso que gastas por voluntad propia.
 * **Juicio** te premia por ir por detrás, que es lo que impide que Ofrenda sea
 * simplemente «pagar vida por poder».
 */
const dunaMatch = (): MatchState => {
  const duna = STARTER_DECKS.find((deck) => deck.faction === 'duna')!;
  const rival = STARTER_DECKS.find((deck) => deck.faction === 'fury')!;
  return { ...createMatch(duna, rival, 42), terrain: [] };
};

const handCard = (cardId: string, instanceId = `hand-${cardId}`): CardInstance => ({ cardId, instanceId });

const resources = (faction: FactionId, count: number): readonly ResourceState[] =>
  Array.from({ length: count }, (_, index) => ({
    instanceId: `${faction}-essence-${index}`,
    cardId: 'fuente-duna',
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

/** Estado listo para lanzar una carta de la mano, con Esencia de sobra. */
const conMano = (cardId: string, instanceId: string, extras: Partial<MatchState['players']['player']> = {}) => {
  let state = dunaMatch();
  state = withPlayer(state, 'player', {
    hand: [handCard(cardId, instanceId)],
    resources: resources('duna', 10),
    ...extras,
  });
  return state;
};

describe('el catálogo de Duna', () => {
  it('trae 31 cartas de la facción, con fuente propia y mazo jugable', () => {
    const duna = CARDS.filter((card) => card.faction === 'duna');
    expect(duna).toHaveLength(31);
    expect(duna.filter((card) => card.type === 'mana')).toHaveLength(1);
    const deck = STARTER_DECKS.find((candidate) => candidate.faction === 'duna');
    expect(deck?.commanderId).toBe('khaeris-la-balanza');
  });

  it('cada carta con Ofrenda declara su coste en la lista de efectos', () => {
    const conOfrenda = CARDS.filter((card) => offeringOf(card) !== undefined);
    expect(conOfrenda.length).toBeGreaterThan(0);
    for (const card of conOfrenda) {
      expect(offeringOf(card), card.id).toBeGreaterThan(0);
      // Y el texto de la carta lo cuenta, para que no sea un coste invisible.
      expect(card.rules, card.id).toMatch(/Ofrenda/);
    }
  });
});

describe('podar las ramas de una carta', () => {
  const plegaria = CARD_BY_ID['plegaria-al-sol']!;
  const balanza = CARD_BY_ID['balanza-de-maat']!;

  it('sin Ofrenda solo queda el efecto base', () => {
    const efectos = activeEffects(plegaria, { offered: false, judged: false });
    expect(efectos).toEqual([{ kind: 'damage', amount: 3, target: 'enemy-piece' }]);
  });

  it('con Ofrenda se añade la parte mejorada', () => {
    const efectos = activeEffects(plegaria, { offered: true, judged: false });
    expect(efectos).toHaveLength(2);
    expect(efectos.reduce((total, effect) => total + (effect.kind === 'damage' ? effect.amount : 0), 0)).toBe(5);
  });

  it('«otherwise» da la rama alternativa: una cosa o la otra, nunca las dos', () => {
    const conJuicio = activeEffects(balanza, { offered: false, judged: true });
    expect(conJuicio).toEqual([{ kind: 'destroy-strongest-enemy' }]);
    const sinJuicio = activeEffects(balanza, { offered: false, judged: false });
    expect(sinJuicio).toEqual([{ kind: 'damage', amount: 4, target: 'enemy-piece' }]);
  });
});

describe('Juicio: el Tribunal falla a favor del que va perdiendo', () => {
  it('solo cuenta si tu Nexo tiene MENOS Vida que el del rival', () => {
    let state = dunaMatch();
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    state = withPlayer(state, 'ai', { nexusHealth: 30 });
    expect(isUnderJudgement(state, 'player')).toBe(true);
    expect(isUnderJudgement(state, 'ai')).toBe(false);
    // Empatados no hay veredicto: hay que ir por detrás, no igualado.
    state = withPlayer(state, 'ai', { nexusHealth: 20 });
    expect(isUnderJudgement(state, 'player')).toBe(false);
  });

  it('Crecida del Río cura 6 de salida y 10 bajo Juicio', () => {
    // Por delante en Vida: el Tribunal no falla a su favor.
    let porDelante = conMano('crecida-del-rio', 'crecida');
    porDelante = withPlayer(porDelante, 'player', { ...porDelante.players.player, nexusHealth: 20 });
    porDelante = withPlayer(porDelante, 'ai', { nexusHealth: 10 });
    const sinJuicio = applyAction(porDelante, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'crecida',
    });
    expect(sinJuicio.ok).toBe(true);
    expect(sinJuicio.state.players.player.nexusHealth).toBe(26);

    let bajoJuicio = conMano('crecida-del-rio', 'crecida');
    bajoJuicio = withPlayer(bajoJuicio, 'player', { nexusHealth: 10 });
    bajoJuicio = withPlayer(bajoJuicio, 'ai', { nexusHealth: 35 });
    const resultado = applyAction(bajoJuicio, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'crecida',
    });
    expect(resultado.ok).toBe(true);
    expect(resultado.state.players.player.nexusHealth).toBe(20);
  });

  it('el Templo del Veredicto solo roba cuando vas por detrás', () => {
    const conTemplo = (mia: number, suya: number): number => {
      let state = dunaMatch();
      state = withPlayer(state, 'player', { nexusHealth: mia, hand: [] });
      state = withPlayer(state, 'ai', { nexusHealth: suya });
      state = { ...state, board: [makePiece('templo', 'templo-del-veredicto', 'player', { x: 3, y: 6 })] };
      const result = applyAction(state, { type: 'end-turn', playerId: 'player' });
      expect(result.ok).toBe(true);
      return result.state.players.player.hand.length;
    };
    expect(conTemplo(10, 35)).toBe(1);
    expect(conTemplo(35, 10)).toBe(0);
  });
});

describe('Ofrenda: pagar Vida para mejorar la carta', () => {
  it('cobra la Vida y sube el daño de la Plegaria de 3 a 5', () => {
    let state = conMano('plegaria-al-sol', 'plegaria');
    state = withPlayer(state, 'player', { ...state.players.player, nexusHealth: 30 });
    state = { ...state, board: [makePiece('presa', 'gigante-magma', 'ai', { x: 3, y: 3 })] };
    const vida = CARD_BY_ID['gigante-magma']!.health!;

    const sinPagar = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'plegaria',
      target: { kind: 'piece', pieceId: 'presa' },
    });
    expect(sinPagar.ok).toBe(true);
    expect(sinPagar.state.players.player.nexusHealth).toBe(30);
    expect(sinPagar.state.board.find((piece) => piece.instanceId === 'presa')?.currentHealth).toBe(vida - 3);

    const pagando = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'plegaria',
      target: { kind: 'piece', pieceId: 'presa' }, offering: true,
    });
    expect(pagando.ok).toBe(true);
    expect(pagando.state.players.player.nexusHealth).toBe(28);
    expect(pagando.state.board.find((piece) => piece.instanceId === 'presa')?.currentHealth).toBe(vida - 5);
  });

  it('no se puede ofrendar hasta morir: la carta se juega sin la Ofrenda', () => {
    let state = conMano('plegaria-al-sol', 'plegaria');
    state = withPlayer(state, 'player', { ...state.players.player, nexusHealth: 2 });
    state = { ...state, board: [makePiece('presa', 'gigante-magma', 'ai', { x: 3, y: 3 })] };
    expect(canPayOffering(state, 'player', 2)).toBe(false);
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'plegaria',
      target: { kind: 'piece', pieceId: 'presa' }, offering: true,
    });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(2);
    const vida = CARD_BY_ID['gigante-magma']!.health!;
    expect(result.state.board.find((piece) => piece.instanceId === 'presa')?.currentHealth).toBe(vida - 3);
  });

  it('el Visir y la Mesa abaratan la Ofrenda, pero nunca por debajo de 1', () => {
    let state = dunaMatch();
    expect(offeringCost(state, 'player', 3)).toBe(3);
    state = { ...state, board: [makePiece('visir', 'visir-de-la-arena', 'player', { x: 1, y: 6 })] };
    expect(offeringCost(state, 'player', 3)).toBe(2);
    state = {
      ...state,
      board: [...state.board, makePiece('mesa', 'mesa-de-ofrendas', 'player', { x: 2, y: 6 })],
    };
    expect(offeringCost(state, 'player', 3)).toBe(1);
    // Una Ofrenda gratis dejaría de ser una decisión: se queda en 1.
    expect(offeringCost(state, 'player', 2)).toBe(1);
    // Y la Mesa solo cuenta para la primera de cada turno.
    const usada = withPlayer(state, 'player', { offeringsPaidThisTurn: 1 });
    expect(offeringCost(usada, 'player', 3)).toBe(2);
  });

  it('Khaeris roba con la primera Ofrenda del turno, y solo con la primera', () => {
    let state = dunaMatch();
    state = withPlayer(state, 'player', {
      nexusHealth: 30,
      hand: [handCard('oro-de-la-camara', 'oro1'), handCard('oro-de-la-camara', 'oro2')],
      resources: resources('duna', 12),
    });
    expect(state.players.player.commanderId).toBe('khaeris-la-balanza');

    // Oro de la Cámara roba 2, o 3 con Ofrenda; Khaeris añade 1 la primera vez.
    const primera = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'oro1', offering: true,
    });
    expect(primera.ok).toBe(true);
    // De 2 en la mano: se gasta la jugada, se roban 3 por la Ofrenda y 1 por Khaeris.
    expect(primera.state.players.player.hand).toHaveLength(2 - 1 + 3 + 1);
    expect(primera.state.players.player.offeringsPaidThisTurn).toBe(1);

    const antes = primera.state.players.player.hand.length;
    const segunda = applyAction(primera.state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'oro2', offering: true,
    });
    expect(segunda.ok).toBe(true);
    expect(segunda.state.players.player.hand).toHaveLength(antes - 1 + 3);
  });

  it('la cuenta de Ofrendas se reinicia al pasar el turno', () => {
    const jugada = applyAction(
      withPlayer(conMano('oro-de-la-camara', 'oro'), 'player', { nexusHealth: 30 }),
      { type: 'play-card', playerId: 'player', cardInstanceId: 'oro', offering: true },
    );
    expect(jugada.ok).toBe(true);
    expect(jugada.state.players.player.offeringsPaidThisTurn).toBe(1);
    const fin = applyAction(jugada.state, { type: 'end-turn', playerId: 'player' });
    expect(fin.ok).toBe(true);
    expect(fin.state.players.player.offeringsPaidThisTurn).toBe(0);
  });
});

describe('piezas propias de Duna', () => {
  it('la Guardiana de la Tumba no se puede aturdir', () => {
    // Dos tableros separados: la Guardiana tiene Guardia, así que si comparten
    // tablero obliga al escorpión a atacarla a ella y el segundo caso no se
    // podría probar.
    const conVictima = (cardId: string, instanceId: string): MatchState => ({
      ...dunaMatch(),
      board: [
        makePiece('escorpion', 'escorpion-de-basalto', 'ai', { x: 3, y: 3 }),
        makePiece(instanceId, cardId, 'player', { x: 3, y: 4 }),
      ],
      activePlayer: 'ai',
    });
    const contraGuardiana = applyAction(conVictima('guardiana-de-la-tumba', 'guardiana'), {
      type: 'attack-piece', playerId: 'ai', attackerId: 'escorpion', defenderId: 'guardiana',
    });
    expect(contraGuardiana.ok).toBe(true);
    expect(
      contraGuardiana.state.board.find((piece) => piece.instanceId === 'guardiana')!.statuses
        .some((status) => status.kind === 'stunned'),
    ).toBe(false);

    // Una pieza que aguante el golpe: si muere no queda nadie a quien mirarle
    // los estados.
    const contraOtra = applyAction(conVictima('coloso-de-la-necropolis', 'normal'), {
      type: 'attack-piece', playerId: 'ai', attackerId: 'escorpion', defenderId: 'normal',
    });
    expect(contraOtra.ok).toBe(true);
    expect(
      contraOtra.state.board.find((piece) => piece.instanceId === 'normal')!.statuses
        .some((status) => status.kind === 'stunned'),
    ).toBe(true);
  });

  it('el Embalsamador cura 1 de salida y 3 bajo Juicio', () => {
    const cura = (mia: number, suya: number): number => {
      let state = dunaMatch();
      state = withPlayer(state, 'player', { nexusHealth: mia });
      state = withPlayer(state, 'ai', { nexusHealth: suya });
      state = { ...state, board: [makePiece('emb', 'embalsamador', 'player', { x: 3, y: 6 })] };
      const result = applyAction(state, { type: 'end-turn', playerId: 'player' });
      expect(result.ok).toBe(true);
      return result.state.players.player.nexusHealth - mia;
    };
    expect(cura(20, 10)).toBe(1);
    expect(cura(10, 30)).toBe(3);
  });

  it('la Necrópolis engorda a una aliada, y el bono sobrevive al cambio de turno', () => {
    let state = dunaMatch();
    state = withPlayer(state, 'player', { nexusHealth: 10 });
    state = withPlayer(state, 'ai', { nexusHealth: 35 });
    state = {
      ...state,
      board: [
        makePiece('necro', 'necropolis', 'player', { x: 1, y: 6 }),
        makePiece('aliada', 'lancero-de-arena', 'player', { x: 3, y: 6 }),
      ],
    };
    const fin = applyAction(state, { type: 'end-turn', playerId: 'player' });
    expect(fin.ok).toBe(true);
    const aliada = fin.state.board.find((piece) => piece.instanceId === 'aliada')!;
    expect(aliada.attackModifier).toBe(1);
    expect(aliada.permanentAttackBonus).toBe(1);
    expect(aliada.currentHealth).toBe(CARD_BY_ID['lancero-de-arena']!.health! + 1);

    // Y tras el turno del rival sigue estando: no es un buff pasajero.
    const vuelta = applyAction(fin.state, { type: 'end-turn', playerId: 'ai' });
    expect(vuelta.ok).toBe(true);
    expect(vuelta.state.board.find((piece) => piece.instanceId === 'aliada')!.attackModifier).toBe(1);
  });

  it('la Balanza de Maat destruye a la más fuerte bajo Juicio', () => {
    let state = conMano('balanza-de-maat', 'balanza');
    state = withPlayer(state, 'player', { ...state.players.player, nexusHealth: 10 });
    state = withPlayer(state, 'ai', { nexusHealth: 35 });
    state = {
      ...state,
      board: [
        makePiece('floja', 'sabueso-brasa', 'ai', { x: 2, y: 3 }),
        makePiece('fuerte', 'gigante-magma', 'ai', { x: 5, y: 3 }),
      ],
    };
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'balanza',
      target: { kind: 'piece', pieceId: 'floja' },
    });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'fuerte')).toBeUndefined();
    expect(result.state.board.find((piece) => piece.instanceId === 'floja')).toBeDefined();
  });
});
