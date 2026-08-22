import { describe, expect, it } from 'vitest';
import { CARD_BY_ID, COMMANDER_BY_ID, STARTER_DECKS } from './index';
import { applyAction, createMatch } from './engine';
import type { BoardPiece, MatchState, PlayerId, Position, ResourceState } from './types';

/**
 * El poder del comandante es la única jugada del juego que no sale de una
 * carta: se paga con Esencia y solo se puede usar una vez por partida.
 */

const pieza = (instanceId: string, cardId: string, owner: PlayerId, position: Position): BoardPiece => {
  const card = CARD_BY_ID[cardId]!;
  return {
    instanceId, cardId, owner, position,
    currentHealth: card.health ?? card.resistance ?? 1,
    attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
    enteredOnTurn: 0, statuses: [],
  };
};

/** Fuentes de sobra de la facción indicada, para poder pagar cualquier poder. */
const fuentes = (owner: PlayerId, faction: string, count = 6): ResourceState[] =>
  Array.from({ length: count }, (_, index) => ({
    instanceId: `${owner}-src-${index}`,
    cardId: `fuente-${faction}`,
    faction: faction as ResourceState['faction'],
    exhausted: false,
  }));

/** Partida en fase principal con Esencia lista y dos unidades enemigas. */
const listo = (deckIndex = 0): MatchState => {
  const base = createMatch(STARTER_DECKS[deckIndex]!, STARTER_DECKS[1]!, 31);
  const faction = STARTER_DECKS[deckIndex]!.faction;
  return {
    ...base,
    phase: 'main',
    activePlayer: 'player',
    board: [
      pieza('e1', 'centinela-cristal', 'ai', { x: 3, y: 2 }),
      pieza('e2', 'duelista-prisma', 'ai', { x: 4, y: 2 }),
    ],
    players: {
      ...base.players,
      player: { ...base.players.player, resources: fuentes('player', faction) },
    },
  };
};

describe('poder del comandante', () => {
  it('todos los comandantes tienen un poder con coste, nombre y efectos', () => {
    for (const deck of STARTER_DECKS) {
      const commander = COMMANDER_BY_ID[deck.commanderId]!;
      expect(commander.power.name, deck.name).toBeTruthy();
      expect(commander.power.description, deck.name).toBeTruthy();
      expect(commander.power.effects.length, deck.name).toBeGreaterThan(0);
      expect(commander.power.cost.generic, deck.name).toBeGreaterThanOrEqual(0);
    }
  });

  it('el de Kaela daña a todas las unidades enemigas', () => {
    const state = listo(0);
    const antes = state.board.map((piece) => piece.currentHealth);
    const result = applyAction(state, { type: 'commander-power', playerId: 'player' });
    expect(result.ok).toBe(true);
    const despues = result.state.board.map((piece) => piece.currentHealth);
    expect(despues[0]).toBeLessThan(antes[0]!);
    expect(despues[1] ?? 0).toBeLessThan(antes[1]!);
  });

  it('solo se puede usar una vez por partida', () => {
    const primera = applyAction(listo(0), { type: 'commander-power', playerId: 'player' });
    expect(primera.ok).toBe(true);
    expect(primera.state.players.player.commanderPowerUsed).toBe(true);
    const segunda = applyAction(primera.state, { type: 'commander-power', playerId: 'player' });
    expect(segunda.ok).toBe(false);
    expect(segunda.error?.message).toMatch(/ya ha usado/i);
  });

  it('cuesta Esencia de verdad: sin fuentes no se puede', () => {
    const base = listo(0);
    const sinEsencia: MatchState = {
      ...base,
      players: { ...base.players, player: { ...base.players.player, resources: [] } },
    };
    const result = applyAction(sinEsencia, { type: 'commander-power', playerId: 'player' });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('insufficient-mana');
  });

  it('los poderes con objetivo exigen señalar una unidad enemiga', () => {
    // Oriel (Arcano) congela: necesita objetivo.
    const state = listo(1);
    const sinObjetivo = applyAction(state, { type: 'commander-power', playerId: 'player' });
    expect(sinObjetivo.ok).toBe(false);
    expect(sinObjetivo.error?.code).toBe('target-required');

    const conObjetivo = applyAction(state, {
      type: 'commander-power', playerId: 'player', target: { kind: 'piece', pieceId: 'e1' },
    });
    expect(conObjetivo.ok).toBe(true);
    const congelada = conObjetivo.state.board.find((piece) => piece.instanceId === 'e1');
    expect(congelada?.statuses.some((status) => status.kind === 'frozen')).toBe(true);
  });

  it('no se puede apuntar a una unidad propia', () => {
    const base = listo(1);
    const conAliada: MatchState = {
      ...base,
      board: [...base.board, pieza('mia', 'centinela-cristal', 'player', { x: 3, y: 6 })],
    };
    const result = applyAction(conAliada, {
      type: 'commander-power', playerId: 'player', target: { kind: 'piece', pieceId: 'mia' },
    });
    expect(result.ok).toBe(false);
  });

  it('no se puede usar fuera de tu turno', () => {
    const base = listo(0);
    const result = applyAction({ ...base, activePlayer: 'ai' }, { type: 'commander-power', playerId: 'player' });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('wrong-turn');
  });

  it('deja rastro en la cola de animaciones', () => {
    const result = applyAction(listo(0), { type: 'commander-power', playerId: 'player' });
    const evento = result.state.animations.find((event) => event.effectId === 'commander-fury-power');
    expect(evento).toBeDefined();
  });
});
