import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch } from './engine';
import type { BoardPiece, MatchState, PlayerId, Position } from './types';

/**
 * Los eventos de combate llevan la geometría del golpe (de dónde sale y a
 * dónde llega) porque la presentación la necesita: el atacante embiste hacia
 * su objetivo y el golpeado retrocede en la dirección correcta. Sin `from` en
 * el daño, la ficha retrocedía siempre «hacia fuera del centro», que en medio
 * tablero es justo al revés de lo que acababa de pasar.
 */

const makePiece = (
  instanceId: string,
  cardId: string,
  owner: PlayerId,
  position: Position,
  options: Partial<BoardPiece> = {},
): BoardPiece => {
  const card = CARD_BY_ID[cardId]!;
  return {
    instanceId, cardId, owner, position,
    currentHealth: card.health ?? card.resistance ?? 1,
    attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
    enteredOnTurn: 0, statuses: [],
    ...options,
  };
};

/** Dos unidades cuerpo a cuerpo, adyacentes y listas para pegarse. */
const duel = (): MatchState => {
  const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 7);
  return {
    ...base,
    phase: 'main',
    activePlayer: 'player',
    board: [
      makePiece('att', 'sabueso-brasa', 'player', { x: 3, y: 4 }),
      makePiece('def', 'golem-azur', 'ai', { x: 3, y: 3 }),
    ],
  };
};

describe('geometría de los eventos de combate', () => {
  it('el ataque a una unidad dice de dónde sale y a dónde va', () => {
    const result = applyAction(duel(), { type: 'attack-piece', playerId: 'player', attackerId: 'att', defenderId: 'def' });
    expect(result.ok).toBe(true);
    const attack = result.state!.animations.find((event) => event.type === 'attack');
    expect(attack?.from).toEqual({ x: 3, y: 4 });
    expect(attack?.to).toEqual({ x: 3, y: 3 });
  });

  it('el daño al defensor viene marcado con la casilla del atacante', () => {
    const result = applyAction(duel(), { type: 'attack-piece', playerId: 'player', attackerId: 'att', defenderId: 'def' });
    const damage = result.state!.animations.find(
      (event) => event.type === 'damage' && event.targetId === 'def',
    );
    expect(damage?.from).toEqual({ x: 3, y: 4 });
    expect(damage?.to).toEqual({ x: 3, y: 3 });
  });

  it('la represalia marca el golpe en sentido contrario', () => {
    const result = applyAction(duel(), { type: 'attack-piece', playerId: 'player', attackerId: 'att', defenderId: 'def' });
    const back = result.state!.animations.find(
      (event) => event.type === 'damage' && event.targetId === 'att',
    );
    // El combate cuerpo a cuerpo es mutuo: la defensora devuelve el golpe.
    expect(back).toBeDefined();
    expect(back?.from).toEqual({ x: 3, y: 3 });
    expect(back?.to).toEqual({ x: 3, y: 4 });
  });

  it('atacar al Nexo también emite su evento de ataque', () => {
    const state: MatchState = {
      ...duel(),
      board: [makePiece('att', 'sabueso-brasa', 'player', { x: 3, y: 0 })],
    };
    const result = applyAction(state, { type: 'attack-nexus', playerId: 'player', attackerId: 'att' });
    expect(result.ok).toBe(true);
    const attack = result.state!.animations.find((event) => event.type === 'attack');
    expect(attack?.actorId).toBe('att');
    expect(attack?.targetId).toBe('ai-nexus');
  });
});
