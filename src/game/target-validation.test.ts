import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, validSpellTargets } from './engine';
import type { BoardPiece, MatchState, PlayerId, Position } from './types';

/**
 * Regresión de dos bugs reales de resaltado de objetivo: `BattlePage.tsx`
 * mantenía su propio filtro a mano (enemyOnly/friendlyOnly/unitsOnly) que no
 * conocía dos reglas del motor, así que resaltaba fichas como «objetivo
 * válido» que el motor iba a rechazar igual al clicarlas. `validSpellTargets`
 * reemplaza ese filtro reutilizando la validación real del motor.
 */

const freshMatch = (seed = 42): MatchState => createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, seed);

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

describe('validSpellTargets', () => {
  it('Maldición Sombra solo resalta fichas enemigas, nunca las propias', () => {
    const state = {
      ...freshMatch(),
      board: [
        makePiece('propia', 'sabueso-brasa', 'player', { x: 1, y: 1 }),
        makePiece('rival', 'sabueso-brasa', 'ai', { x: 1, y: 2 }),
      ],
    };
    const targets = validSpellTargets(state, 'player', CARD_BY_ID['maldicion-sombra']!);
    expect(targets.map((piece) => piece.instanceId)).toEqual(['rival']);
  });

  it('Juicio Divino solo resalta enemigos con 2 Vida o menos', () => {
    const state = {
      ...freshMatch(),
      board: [
        makePiece('debil', 'sabueso-brasa', 'ai', { x: 1, y: 1 }, { currentHealth: 2 }),
        makePiece('fuerte', 'oso-forestal', 'ai', { x: 1, y: 2 }, { currentHealth: 4 }),
      ],
    };
    const targets = validSpellTargets(state, 'player', CARD_BY_ID['juicio-divino']!);
    expect(targets.map((piece) => piece.instanceId)).toEqual(['debil']);
  });

  it('lanzar Juicio Divino sobre un objetivo con más de 2 Vida lo rechaza el motor, como dice el resaltado', () => {
    const base = freshMatch();
    const state: MatchState = {
      ...base,
      board: [makePiece('fuerte', 'oso-forestal', 'ai', { x: 1, y: 2 }, { currentHealth: 4 })],
      players: {
        ...base.players,
        player: {
          ...base.players.player,
          hand: [{ instanceId: 'hand-juicio', cardId: 'juicio-divino' }],
          resources: [
            { instanceId: 'r1', cardId: 'fuente-orden', faction: 'order', exhausted: false },
            { instanceId: 'r2', cardId: 'fuente-orden', faction: 'order', exhausted: false },
            { instanceId: 'r3', cardId: 'fuente-orden', faction: 'order', exhausted: false },
            { instanceId: 'r4', cardId: 'fuente-orden', faction: 'order', exhausted: false },
          ],
        },
      },
    };
    // Sin la carta ni la ficha rechazadas de antemano, la falta de objetivo
    // válido es la ÚNICA razón por la que el motor puede rechazar la jugada.
    expect(validSpellTargets(state, 'player', CARD_BY_ID['juicio-divino']!)).toHaveLength(0);
    const result = applyAction(state, {
      type: 'play-card', playerId: 'player', cardInstanceId: 'hand-juicio',
      target: { kind: 'piece', pieceId: 'fuerte' },
    });
    expect(result.ok).toBe(false);
    expect(result.ok || result.error?.message).toBe('El hechizo necesita un objetivo válido.');
  });

  it('una carta sin objetivo no propone ninguna ficha', () => {
    const state = {
      ...freshMatch(),
      board: [makePiece('cualquiera', 'sabueso-brasa', 'ai', { x: 1, y: 1 })],
    };
    expect(validSpellTargets(state, 'player', CARD_BY_ID['pacto-ascuas']!)).toHaveLength(0);
  });
});
