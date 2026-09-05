import { describe, expect, it } from 'vitest';

import { createMatch } from './engine';
import { STARTER_DECKS } from './decks';
import { isPushImmune, pushAll, pushDestination, pushOne, tidePhase } from './marea';
import type { BoardPiece, MatchState } from './types';

/**
 * Solo las primitivas NUEVAS del motor: el ciclo y el empuje. Las cartas que
 * las usan no se prueban una a una a propósito — se prueban jugando.
 */

const baseMatch = (): MatchState => ({ ...createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 7), terrain: [] });

const piece = (cardId: string, x: number, y: number, owner: 'player' | 'ai' = 'ai'): BoardPiece => ({
  instanceId: `${cardId}-${x}-${y}`,
  cardId,
  owner,
  position: { x, y },
  currentHealth: 4,
  attackModifier: 0,
  movedThisTurn: false,
  attackedThisTurn: false,
  enteredOnTurn: 0,
  statuses: [],
});

describe('el ciclo de marea', () => {
  it('alterna bajamar en impares y pleamar en pares', () => {
    const match = baseMatch();
    expect(tidePhase({ ...match, turn: 1 })).toBe('low');
    expect(tidePhase({ ...match, turn: 2 })).toBe('high');
    expect(tidePhase({ ...match, turn: 7 })).toBe('low');
  });
});

describe('el empuje', () => {
  it('aparta la pieza en dirección contraria al Nexo de quien empuja', () => {
    const victim = piece('nadadora-de-arrecife', 3, 4);
    const state = { ...baseMatch(), board: [victim] };
    const pushed = pushOne(state, 'player', victim.instanceId, 2);
    // 'player' empuja hacia filas menores, así que la víctima retrocede a y=2.
    expect(pushed.board[0]!.position).toEqual({ x: 3, y: 2 });
  });

  it('se queda a medias si topa con el borde, en vez de salirse del tablero', () => {
    const victim = piece('nadadora-de-arrecife', 3, 1);
    const state = { ...baseMatch(), board: [victim] };
    const pushed = pushOne(state, 'player', victim.instanceId, 3);
    expect(pushed.board[0]!.position).toEqual({ x: 3, y: 0 });
  });

  it('no mueve nada si la casilla de detrás está ocupada', () => {
    const victim = piece('nadadora-de-arrecife', 3, 4);
    const wall = piece('centinela-de-coral', 3, 3, 'player');
    const state = { ...baseMatch(), board: [victim, wall] };
    expect(pushDestination(state, victim, 2, -1)).toBeNull();
  });

  it('el Crustáceo Acorazado aguanta: se agarra al fondo', () => {
    const crab = piece('crustaceo-acorazado', 3, 4);
    const state = { ...baseMatch(), board: [crab] };
    expect(isPushImmune(crab)).toBe(true);
    expect(pushOne(state, 'player', crab.instanceId, 2).board[0]!.position).toEqual({ x: 3, y: 4 });
  });

  it('empuja la fila entera sin que unas se estorben a otras', () => {
    // Dos en columna: si se empujara de cerca a lejos, la primera chocaría con
    // la segunda y ninguna se movería. Se empieza por la más lejana.
    const frente = piece('nadadora-de-arrecife', 2, 4);
    const detras = piece('remora-oportunista', 2, 3);
    const state = { ...baseMatch(), board: [frente, detras] };
    const { state: pushed, blocked } = pushAll(state, 'player', 1, 'away');
    expect(blocked).toHaveLength(0);
    expect(pushed.board.find((p) => p.instanceId === detras.instanceId)!.position).toEqual({ x: 2, y: 2 });
    expect(pushed.board.find((p) => p.instanceId === frente.instanceId)!.position).toEqual({ x: 2, y: 3 });
  });

  it('informa de quién no pudo moverse, que es lo que la Vorágine aturde', () => {
    const acorralada = piece('nadadora-de-arrecife', 5, 0);
    const state = { ...baseMatch(), board: [acorralada] };
    const { blocked } = pushAll(state, 'player', 1, 'away');
    expect(blocked).toEqual([acorralada.instanceId]);
  });
});
