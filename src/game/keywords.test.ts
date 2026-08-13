import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, getValidAttacks, getValidMoves } from './engine';
import type { BoardPiece, MatchState, PlayerId, Position } from './types';

/**
 * Reglas de las palabras clave que no dependen de una carta concreta:
 * Perforar, Vínculo vital y Aturdir. Se prueban sobre cartas reales del
 * catálogo para que el test falle también si alguna pierde su palabra clave.
 */

const freshMatch = (seed = 42): MatchState => createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, seed);

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

describe('Perforar', () => {
  it('el exceso de daño al destruir a la defensora golpea el Nexo enemigo', () => {
    // Ariete Volcánico: 4 de Ataque contra un Sabueso de Brasa de 1 de Vida → sobran 3.
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('ariete', 'ariete-volcanico', 'player', { x: 2, y: 2 }),
        makePiece('presa', 'sabueso-brasa', 'ai', { x: 2, y: 3 }),
      ],
    };
    const nexusBefore = state.players.ai.nexusHealth;
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'ariete', defenderId: 'presa' });
    expect(result.ok).toBe(true);
    expect(result.state.board.find((piece) => piece.instanceId === 'presa')).toBeUndefined();
    expect(result.state.players.ai.nexusHealth).toBe(nexusBefore - 3);
  });

  it('no filtra daño al Nexo si la defensora sobrevive', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('ariete', 'ariete-volcanico', 'player', { x: 2, y: 2 }),
        makePiece('muro', 'golem-azur', 'ai', { x: 2, y: 3 }),
      ],
    };
    const nexusBefore = state.players.ai.nexusHealth;
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'ariete', defenderId: 'muro' });
    expect(result.ok).toBe(true);
    expect(result.state.players.ai.nexusHealth).toBe(nexusBefore);
  });

  it('sin Perforar el exceso se pierde, como siempre', () => {
    // Dragón de la Caldera pega 7 y no tiene Perforar: el Nexo no debe notarlo.
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('dragon', 'dragon-caldera', 'player', { x: 2, y: 2 }),
        makePiece('presa', 'sabueso-brasa', 'ai', { x: 2, y: 3 }),
      ],
    };
    const nexusBefore = state.players.ai.nexusHealth;
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'dragon', defenderId: 'presa' });
    expect(result.ok).toBe(true);
    expect(result.state.players.ai.nexusHealth).toBe(nexusBefore);
  });

  it('el exceso puede rematar la partida', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('ariete', 'ariete-volcanico', 'player', { x: 2, y: 2 }),
        makePiece('presa', 'sabueso-brasa', 'ai', { x: 2, y: 3 }),
      ],
    };
    state = withPlayer(state, 'ai', { nexusHealth: 2 });
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'ariete', defenderId: 'presa' });
    expect(result.ok).toBe(true);
    expect(result.state.players.ai.nexusHealth).toBe(0);
    expect(result.state.winner).toBe('player');
  });
});

describe('Vínculo vital', () => {
  it('curar por atacar a una unidad no supera la vida máxima del Nexo', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('vampiro', 'vampiro-siniestro', 'player', { x: 2, y: 2 }),
        makePiece('victima', 'centinela-cristal', 'ai', { x: 2, y: 3 }),
      ],
    };
    const full = state.players.player.nexusHealth;
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'vampiro', defenderId: 'victima' });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(full);
  });

  it('cura el Nexo propio por el daño repartido a una unidad', () => {
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
    expect(result.state.players.player.nexusHealth).toBe(23);
  });

  it('también cura al golpear el Nexo enemigo', () => {
    let state = freshMatch();
    // El Nexo de la IA está en la fila -1: desde y=0 el Vampiro (Alcance 1) lo alcanza.
    state = { ...state, board: [makePiece('vampiro', 'vampiro-siniestro', 'player', { x: 3, y: 0 })] };
    state = withPlayer(state, 'player', { nexusHealth: 20 });
    const attacker = state.board[0]!;
    const options = getValidAttacks(state, attacker.instanceId);
    expect(options.canAttackNexus).toBe(true);
    const result = applyAction(state, { type: 'attack-nexus', playerId: 'player', attackerId: 'vampiro' });
    expect(result.ok).toBe(true);
    expect(result.state.players.player.nexusHealth).toBe(23);
  });
});

describe('Aturdir', () => {
  it('la unidad golpeada no puede atacar en su siguiente turno', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('centinela', 'centinela-solar', 'player', { x: 2, y: 2 }),
        // Gólem Azur: 5 de Vida, sobrevive al golpe de 3 y queda aturdido.
        makePiece('golem', 'golem-azur', 'ai', { x: 2, y: 3 }),
      ],
    };
    const hit = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'centinela', defenderId: 'golem' });
    expect(hit.ok).toBe(true);
    const stunned = hit.state.board.find((piece) => piece.instanceId === 'golem');
    expect(stunned?.statuses.some((status) => status.kind === 'stunned')).toBe(true);

    const passed = applyAction(hit.state, { type: 'end-turn', playerId: 'player' });
    expect(passed.ok).toBe(true);
    // Es el turno de la IA y su Gólem sigue aturdido: no puede atacar a nadie.
    expect(getValidAttacks(passed.state, 'golem').pieceIds).toHaveLength(0);
    expect(getValidAttacks(passed.state, 'golem').canAttackNexus).toBe(false);
  });

  it('aturdida sí puede moverse: es más suave que Congelar', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('centinela', 'centinela-solar', 'player', { x: 2, y: 2 }),
        makePiece('golem', 'golem-azur', 'ai', { x: 2, y: 3 }),
      ],
    };
    const hit = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'centinela', defenderId: 'golem' });
    const passed = applyAction(hit.state, { type: 'end-turn', playerId: 'player' });
    expect(passed.ok).toBe(true);
    expect(getValidMoves(passed.state, 'golem').length).toBeGreaterThan(0);
  });

  it('el aturdimiento se agota tras ese turno y vuelve a atacar', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('centinela', 'centinela-solar', 'player', { x: 2, y: 2 }),
        makePiece('golem', 'golem-azur', 'ai', { x: 2, y: 3 }),
      ],
    };
    let current = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'centinela', defenderId: 'golem' }).state;
    current = applyAction(current, { type: 'end-turn', playerId: 'player' }).state;
    current = applyAction(current, { type: 'end-turn', playerId: 'ai' }).state;
    current = applyAction(current, { type: 'end-turn', playerId: 'player' }).state;
    // Segundo turno de la IA: el aturdimiento ya expiró.
    expect(getValidAttacks(current, 'golem').pieceIds.length).toBeGreaterThan(0);
  });

  it('sin Aturdir la defensora no queda marcada', () => {
    let state = freshMatch();
    state = {
      ...state,
      board: [
        makePiece('berserker', 'berserker-ignivoro', 'player', { x: 2, y: 2 }),
        makePiece('golem', 'golem-azur', 'ai', { x: 2, y: 3 }),
      ],
    };
    const hit = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'berserker', defenderId: 'golem' });
    expect(hit.ok).toBe(true);
    const defender = hit.state.board.find((piece) => piece.instanceId === 'golem');
    expect(defender?.statuses.some((status) => status.kind === 'stunned')).toBe(false);
  });
});
