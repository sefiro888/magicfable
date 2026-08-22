import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { applyAction, createMatch, previewAttackNexus, previewAttackPiece } from './engine';
import type { BoardPiece, MatchState, PlayerId, Position } from './types';

/**
 * `previewAttackPiece`/`previewAttackNexus` deben predecir EXACTAMENTE lo que
 * hace `attackPiece`/`attackNexus` al confirmarse — es la base de la vista
 * previa de daño del jugador. Cada caso comprueba la previsión y luego
 * dispara el ataque real para confirmar que coinciden.
 */

/**
 * Partida de pruebas SIN terreno: estos tests colocan piezas en casillas
 * concretas y disparan en línea recta, así que unas ruinas repartidas por la
 * semilla romperían el caso por un motivo que no es el que se está probando.
 * El terreno tiene sus propios tests en `terrain.test.ts`.
 */
const freshMatch = (seed = 42): MatchState => ({ ...createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, seed), terrain: [] });

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

describe('previewAttackPiece', () => {
  it('predice el intercambio cuerpo a cuerpo, incluida la reducción del Gólem y el contragolpe', () => {
    const state = {
      ...freshMatch(),
      board: [
        makePiece('sabueso', 'sabueso-brasa', 'player', { x: 2, y: 2 }),
        makePiece('golem', 'golem-azur', 'ai', { x: 2, y: 3 }),
      ],
    };
    const preview = previewAttackPiece(state, 'sabueso', 'golem')!;
    // El Gólem reduce en 1 el primer daño que recibe cada turno: 2 de Ataque - 1 = 1.
    expect(preview.damageToDefender).toBe(1);
    expect(preview.defenderHealthAfter).toBe(4);
    expect(preview.defenderDies).toBe(false);
    expect(preview.retaliationToAttacker).toBe(2);
    expect(preview.attackerHealthAfter).toBe(0);
    expect(preview.attackerDies).toBe(true);

    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'sabueso', defenderId: 'golem' });
    expect(result.ok).toBe(true);
    const defender = result.state.board.find((piece) => piece.instanceId === 'golem');
    expect(defender?.currentHealth).toBe(preview.defenderHealthAfter);
    expect(result.state.board.find((piece) => piece.instanceId === 'sabueso')).toBeUndefined();
  });

  it('con Perforar, predice cuánto del golpe letal pasa al Nexo enemigo', () => {
    const state = {
      ...freshMatch(),
      board: [
        makePiece('ariete', 'ariete-volcanico', 'player', { x: 2, y: 2 }),
        makePiece('presa', 'sabueso-brasa', 'ai', { x: 2, y: 3 }),
      ],
    };
    const preview = previewAttackPiece(state, 'ariete', 'presa')!;
    expect(preview.defenderDies).toBe(true);
    expect(preview.pierceOverkill).toBe(3);

    const nexusBefore = state.players.ai.nexusHealth;
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'ariete', defenderId: 'presa' });
    expect(result.ok).toBe(true);
    expect(result.state.players.ai.nexusHealth).toBe(nexusBefore - preview.pierceOverkill);
  });

  it('a distancia, sin contragolpe', () => {
    const state = {
      ...freshMatch(),
      board: [
        makePiece('elemental', 'elemental-tormenta', 'player', { x: 2, y: 1 }),
        makePiece('sabueso', 'sabueso-brasa', 'ai', { x: 2, y: 3 }),
      ],
    };
    const preview = previewAttackPiece(state, 'elemental', 'sabueso')!;
    expect(preview.retaliationToAttacker).toBe(0);
    expect(preview.attackerDies).toBe(false);
  });
});

describe('previewAttackNexus', () => {
  it('predice el daño directo y si es letal', () => {
    const base = freshMatch();
    // El Nexo de la IA está en la fila -1: desde y=0 el Sabueso (Alcance 1) lo alcanza.
    const state: MatchState = {
      ...base,
      board: [makePiece('sabueso', 'sabueso-brasa', 'player', { x: 3, y: 0 })],
      players: { ...base.players, ai: { ...base.players.ai, nexusHealth: 1 } },
    };
    const preview = previewAttackNexus(state, 'sabueso')!;
    expect(preview.damage).toBe(2);
    expect(preview.lethal).toBe(true);
    expect(preview.nexusHealthAfter).toBe(0);

    const result = applyAction(state, { type: 'attack-nexus', playerId: 'player', attackerId: 'sabueso' });
    expect(result.ok).toBe(true);
    expect(result.state.winner).toBe('player');
  });
});
