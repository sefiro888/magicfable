import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch } from './engine';
import { previewMovementHazard } from './movementHazard';
import type { BoardPiece, MatchState } from './types';

const piece = (id: string, x: number, y: number, extra: Partial<BoardPiece> = {}): BoardPiece => ({
  instanceId: id, cardId: 'piquero-de-flandes', owner: 'player', position: { x, y },
  currentHealth: CARD_BY_ID['piquero-de-flandes']!.health!, attackModifier: 0, enteredOnTurn: 0,
  movedThisTurn: false, attackedThisTurn: false, statuses: [], ...extra,
});
const base = (board: readonly BoardPiece[]): MatchState => ({
  ...createMatch(STARTER_DECKS.find((deck) => deck.faction === 'tercios')!, STARTER_DECKS.find((deck) => deck.faction === 'void')!, 42),
  turn: 4, terrain: [], board, animations: [],
});

describe('pérdida de Vida al moverse contra Fractura del Vacío', () => {
  it.each([1, 2, 4])('prevé la pérdida de Formación con %i de Vida y coincide con el movimiento real', (health) => {
    const state = base([piece('elegida', 3, 5, { currentHealth: health, formationHealthApplied: 2 }),
      piece('apoyo', 4, 5, { cardId: 'rodelero' })]);
    const before = JSON.stringify(state);
    const risk = previewMovementHazard(state, 'player', 'elegida', { x: 3, y: 4 })!;
    expect(risk.movingPieceDies).toBe(health <= 2);
    expect(risk.losses).toContainEqual({ pieceId: 'elegida', name: 'Piquero de Flandes', amount: Math.min(health, 2),
      dies: health <= 2, losesFormation: true });
    expect(JSON.stringify(state)).toBe(before);
    const moved = applyAction(state, { type: 'move', playerId: 'player', pieceId: 'elegida', to: { x: 3, y: 4 } });
    expect(moved.ok).toBe(true);
    expect(moved.state.board.find((unit) => unit.instanceId === 'elegida')?.currentHealth ?? 0).toBe(Math.max(0, health - 2));
  });
  it('no marca como peligroso un destino que conserva la aliada necesaria para Farnesio', () => {
    const state = base([piece('elegida', 3, 5, { currentHealth: 1, formationHealthApplied: 2 }),
      piece('apoyo', 4, 4, { cardId: 'rodelero' })]);
    expect(previewMovementHazard(state, 'player', 'elegida', { x: 3, y: 4 })).toBeUndefined();
  });
  it('avisa si la que se mueve vive pero deja morir a otra aliada', () => {
    const state = base([piece('herida', 3, 3, { currentHealth: 1, formationHealthApplied: 2 }),
      piece('apoyo', 3, 4, { cardId: 'rodelero' })]);
    const risk = previewMovementHazard(state, 'player', 'apoyo', { x: 3, y: 5 })!;
    expect(risk.movingPieceDies).toBe(false);
    expect(risk.deaths).toBe(1);
    expect(risk.losses[0]).toMatchObject({ pieceId: 'herida', losesFormation: true, dies: true });
  });
  it('un escudo no evita que desaparezca el bono de Vida de Formación', () => {
    const state = base([piece('elegida', 3, 5, { currentHealth: 2, formationHealthApplied: 2,
      statuses: [{ kind: 'shielded', amount: 10 }] }), piece('apoyo', 4, 5, { cardId: 'rodelero' })]);
    expect(previewMovementHazard(state, 'player', 'elegida', { x: 3, y: 4 })?.movingPieceDies).toBe(true);
  });
  it('no convierte los ataques rivales ni el hollín decorativo en daño de suelo', () => {
    const state: MatchState = { ...base([piece('elegida', 3, 5, { cardId: 'rodelero', currentHealth: 1 }),
      piece('rival', 3, 3, { cardId: 'heraldo-fractura', owner: 'ai' })]),
      tileEffects: [{ kind: 'scorched', position: { x: 3, y: 4 }, sourceOwner: 'ai', expiresOnTurn: 6 }] };
    expect(previewMovementHazard(state, 'player', 'elegida', { x: 3, y: 4 })).toBeUndefined();
  });
  it('no anuncia riesgos para un movimiento ilegal', () => {
    expect(previewMovementHazard(base([piece('elegida', 3, 5)]), 'player', 'elegida', { x: 7, y: 0 })).toBeUndefined();
  });
});
