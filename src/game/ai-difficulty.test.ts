import { describe, expect, it } from 'vitest';
import { chooseNextAiAction } from './ai';
import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { createMatch } from './engine';
import type { BoardPiece, MatchState, PlayerId, Position } from './types';

/**
 * Los tres niveles deben jugar de forma distinta de verdad. Durante mucho
 * tiempo 'normal' y 'hard' compartían todo el código salvo una condición, así
 * que elegir «Difícil» en ajustes no cambiaba absolutamente nada: estos tests
 * existen para que eso no pueda volver a pasar sin que salte una alarma.
 */

/**
 * Partida de pruebas SIN terreno: estos tests colocan piezas en casillas
 * concretas y disparan en línea recta, así que unas ruinas repartidas por la
 * semilla romperían el caso por un motivo que no es el que se está probando.
 * El terreno tiene sus propios tests en `terrain.test.ts`.
 */
const freshMatch = (seed = 7): MatchState => ({ ...createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, seed), terrain: [] });

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

/** Turno de la IA con la mano vacía, para aislar sus decisiones de combate. */
const aiCombatState = (board: readonly BoardPiece[]): MatchState => {
  const state = freshMatch();
  return {
    ...state,
    activePlayer: 'ai',
    board: [...board],
    players: {
      ...state.players,
      ai: { ...state.players.ai, hand: [] },
    },
  };
};

describe('Niveles de IA', () => {
  it('en fácil no remata el Nexo aunque lo tenga a tiro', () => {
    // El Nexo del jugador está en la fila 8: desde y=7 el sabueso lo alcanza.
    const state = aiCombatState([makePiece('sabueso', 'sabueso-brasa', 'ai', { x: 3, y: 7 })]);
    const action = chooseNextAiAction(state, new Set(), 'easy');
    expect(action.type).not.toBe('attack-nexus');
  });

  it('en normal y en difícil sí lo remata', () => {
    const state = aiCombatState([makePiece('sabueso', 'sabueso-brasa', 'ai', { x: 3, y: 7 })]);
    expect(chooseNextAiAction(state, new Set(), 'normal').type).toBe('attack-nexus');
    expect(chooseNextAiAction(state, new Set(), 'hard').type).toBe('attack-nexus');
  });

  it('difícil elige el atacante que no muere en el intento', () => {
    // Contra un Oso Forestal (4/4) hay dos candidatos: el Sabueso (2/1) muere
    // al contragolpe sin llegar a matarlo; el Elemental (Alcance 2) le pega
    // desde lejos sin recibir nada. Los ids fuerzan que el malo vaya primero
    // en orden alfabético, que es justo el criterio que usa la IA normal.
    const state = aiCombatState([
      makePiece('a-sabueso', 'sabueso-brasa', 'ai', { x: 3, y: 3 }),
      makePiece('z-elemental', 'elemental-tormenta', 'ai', { x: 5, y: 4 }),
      makePiece('oso', 'oso-forestal', 'player', { x: 3, y: 4 }),
    ]);
    // Normal recorre sus fichas por orden y manda al primero que tenga algo a tiro.
    expect(chooseNextAiAction(state, new Set(), 'normal')).toEqual({
      type: 'attack-piece', playerId: 'ai', attackerId: 'a-sabueso', defenderId: 'oso',
    });
    // Difícil compara los dos ataques y usa el que no le cuesta la ficha.
    expect(chooseNextAiAction(state, new Set(), 'hard')).toEqual({
      type: 'attack-piece', playerId: 'ai', attackerId: 'z-elemental', defenderId: 'oso',
    });
  });

  it('difícil prefiere el remate limpio antes que arañar a un muro', () => {
    // Dos opciones: el Elemental (Alcance 2, sin contragolpe) remata una presa
    // de 1 de Vida; la Lancera solo arañaría a un Gólem de 5 y moriría al
    // devolvérsela. Difícil debe quedarse con el remate.
    const state = aiCombatState([
      makePiece('lancera', 'lancera-magma', 'ai', { x: 1, y: 3 }),
      makePiece('elemental', 'elemental-tormenta', 'ai', { x: 5, y: 2 }),
      makePiece('golem', 'golem-azur', 'player', { x: 1, y: 4 }),
      makePiece('presa', 'sabueso-brasa', 'player', { x: 5, y: 4 }),
    ]);
    const hard = chooseNextAiAction(state, new Set(), 'hard');
    expect(hard).toEqual({ type: 'attack-piece', playerId: 'ai', attackerId: 'elemental', defenderId: 'presa' });
  });

  it('difícil no se acobarda: si el único ataque es malo, lo hace igual', () => {
    // Regla aprendida midiendo (ver ai-strength-sim): una difícil que rechaza
    // los malos intercambios PIERDE contra la normal. Quedarse quieta regala
    // el tempo y la ficha «salvada» muere igual al turno siguiente.
    const state = aiCombatState([
      makePiece('sabueso', 'sabueso-brasa', 'ai', { x: 3, y: 3 }),
      makePiece('oso', 'oso-forestal', 'player', { x: 3, y: 4 }),
    ]);
    expect(chooseNextAiAction(state, new Set(), 'hard')).toEqual({
      type: 'attack-piece', playerId: 'ai', attackerId: 'sabueso', defenderId: 'oso',
    });
  });

  it('difícil antepone el golpe letal al Nexo a cualquier intercambio', () => {
    const base = aiCombatState([
      makePiece('sabueso', 'sabueso-brasa', 'ai', { x: 3, y: 7 }),
      makePiece('presa', 'sabueso-brasa', 'player', { x: 4, y: 7 }),
    ]);
    const state: MatchState = {
      ...base,
      players: { ...base.players, player: { ...base.players.player, nexusHealth: 1 } },
    };
    const hard = chooseNextAiAction(state, new Set(), 'hard');
    expect(hard).toEqual({ type: 'attack-nexus', playerId: 'ai', attackerId: 'sabueso' });
  });

  it('difícil mueve cuando no tiene a nadie a tiro', () => {
    const state = aiCombatState([
      makePiece('sabueso', 'sabueso-brasa', 'ai', { x: 3, y: 3 }),
      makePiece('lejano', 'oso-forestal', 'player', { x: 7, y: 7 }),
    ]);
    expect(chooseNextAiAction(state, new Set(), 'hard').type).toBe('move');
  });

  it('los tres niveles siguen siendo deterministas', () => {
    const state = aiCombatState([
      makePiece('lancera', 'lancera-magma', 'ai', { x: 1, y: 3 }),
      makePiece('presa', 'sabueso-brasa', 'player', { x: 1, y: 4 }),
    ]);
    for (const level of ['easy', 'normal', 'hard'] as const) {
      const first = chooseNextAiAction(state, new Set(), level);
      const second = chooseNextAiAction(state, new Set(), level);
      expect(first).toEqual(second);
    }
  });
});
