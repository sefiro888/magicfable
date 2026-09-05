import { describe, expect, it } from 'vitest';

import { CARD_BY_ID } from './cards';
import { STARTER_DECKS } from './decks';
import { createMatch } from './engine';
import { assemblyBonus, countStructures, isAutomaton, isForgeStructure, windUpAutomata } from './forja';
import type { BoardPiece, MatchState } from './types';

/** Solo las primitivas nuevas: Ensamblaje y el motor de estructuras. */

const baseMatch = (): MatchState => ({ ...createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 11), terrain: [] });

const piece = (cardId: string, x: number, y: number): BoardPiece => ({
  instanceId: `${cardId}-${x}-${y}`,
  cardId,
  owner: 'player',
  position: { x, y },
  currentHealth: 4,
  attackModifier: 0,
  movedThisTurn: false,
  attackedThisTurn: false,
  enteredOnTurn: 0,
  statuses: [],
});

describe('Ensamblaje', () => {
  it('da +1 por estructura aliada', () => {
    const carta = CARD_BY_ID['titan-de-cuerda']!;
    const state = { ...baseMatch(), board: [piece('yunque-del-gremio', 1, 1), piece('torre-de-vapor', 2, 1)] };
    expect(countStructures(state, 'player')).toBe(2);
    expect(assemblyBonus(state, 'player', carta)).toBe(2);
  });

  it('no pasa del tope de la carta, que es lo que lo hace una decisión y no un premio', () => {
    const carta = CARD_BY_ID['automata-de-taller']!; // Ensamblaje 2
    const state = {
      ...baseMatch(),
      board: [
        piece('yunque-del-gremio', 1, 1),
        piece('torre-de-vapor', 2, 1),
        piece('deposito-de-piezas', 3, 1),
        piece('muralla-remachada', 4, 1),
      ],
    };
    expect(countStructures(state, 'player')).toBe(4);
    expect(assemblyBonus(state, 'player', carta)).toBe(2);
  });

  it('vale cero sin estructuras: la facción arranca floja a propósito', () => {
    const carta = CARD_BY_ID['coloso-de-la-fundicion']!;
    expect(assemblyBonus(baseMatch(), 'player', carta)).toBe(0);
  });
});

describe('el motor del gremio', () => {
  it('reconoce a los autómatas por subtipo, con tilde', () => {
    expect(isAutomaton(piece('automata-de-taller', 0, 0))).toBe(true);
    // El Capataz es humano: dirige autómatas, no lo es.
    expect(isAutomaton(piece('capataz-del-gremio', 0, 0))).toBe(false);
  });

  it('solo las estructuras de Forja dan cuerda', () => {
    expect(isForgeStructure(CARD_BY_ID['yunque-del-gremio']!)).toBe(true);
    // Una estructura de otra facción en un mazo mixto no debe activar el motor.
    expect(isForgeStructure(CARD_BY_ID['arrecife-vivo']!)).toBe(false);
    // Y un autómata tampoco, aunque sea de Forja.
    expect(isForgeStructure(CARD_BY_ID['automata-de-taller']!)).toBe(false);
  });

  it('da cuerda solo a los autómatas propios', () => {
    const automata = piece('automata-de-taller', 1, 1);
    const humano = piece('capataz-del-gremio', 2, 1);
    const rival: BoardPiece = { ...piece('automata-de-taller', 3, 1), instanceId: 'rival', owner: 'ai' };
    const state = { ...baseMatch(), board: [automata, humano, rival] };
    const tras = windUpAutomata(state, 'player', 1);
    expect(tras.board.find((p) => p.instanceId === automata.instanceId)!.attackModifier).toBe(1);
    expect(tras.board.find((p) => p.instanceId === humano.instanceId)!.attackModifier).toBe(0);
    expect(tras.board.find((p) => p.instanceId === 'rival')!.attackModifier).toBe(0);
  });
});
