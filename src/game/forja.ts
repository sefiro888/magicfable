import { CARD_BY_ID } from './cards';
import type { BoardPiece, CardDefinition, MatchState, PlayerId } from './types';

/**
 * Forja, «El Gremio de los Engranajes»: su mecánica propia.
 *
 * Las demás facciones ganan echando más cartas. Forja gana MEJORANDO lo que ya
 * tiene: sus estructuras no son paredes, son fábricas que dan cuerda a sus
 * autómatas, y si la dejas trabajar seis turnos ya no hay quien la pare.
 *
 * **El motor.** Cada estructura de Forja que entra en juego da +1 de Ataque
 * PERMANENTE a todos tus autómatas. Eso convierte cada estructura en una
 * decisión de ataque y no de defensa, y le da al rival un objetivo claro: si
 * te desmonta las fábricas a tiempo, te desmonta la partida.
 *
 * **Ensamblaje N.** Al entrar en juego, la carta gana +1/+1 por cada estructura
 * aliada en el tablero, hasta un máximo de N. Es la decisión que la facción
 * estrena: ¿juego ya la unidad grande, o levanto antes otra fábrica y la juego
 * el turno siguiente valiendo el doble?
 *
 * El tope importa. Sin él, una partida larga convertiría al Autómata de Taller
 * en un finalizador de 8/10, y el Ensamblaje dejaría de ser una decisión para
 * ser un premio por sobrevivir.
 */

/**
 * ¿Es un autómata? Se mira el subtipo de la carta.
 *
 * Cuidado al tocar esto: la comparación lleva tilde («Autómata») porque así
 * está escrito en las cartas, y sin ella el motor entero de la facción deja de
 * dispararse sin que falle ningún tipo ni salte ningún error.
 */
export const isAutomaton = (piece: BoardPiece): boolean =>
  CARD_BY_ID[piece.cardId]?.subtype === 'Autómata';

/** Cuántas estructuras controla un jugador ahora mismo. */
export const countStructures = (state: MatchState, playerId: PlayerId): number =>
  state.board.filter(
    (piece) => piece.owner === playerId && CARD_BY_ID[piece.cardId]?.type === 'structure',
  ).length;

/**
 * El bono de Ensamblaje que le toca a una carta al desplegarse: una estructura
 * aliada por punto, sin pasar del tope que diga la carta.
 */
export const assemblyBonus = (state: MatchState, playerId: PlayerId, card: CardDefinition): number => {
  const assembly = card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'assembly');
  if (assembly?.kind !== 'passive') return 0;
  return Math.min(assembly.value ?? 1, countStructures(state, playerId));
};

/**
 * Da cuerda a los autómatas: +N de Ataque permanente a todos los del jugador.
 *
 * Va sobre `attackModifier`, que es el campo que sobrevive al final del turno,
 * a diferencia de los bonos temporales. Es lo que hace que Forja acumule.
 */
export const windUpAutomata = (state: MatchState, playerId: PlayerId, attack: number): MatchState => ({
  ...state,
  board: state.board.map((piece) =>
    piece.owner === playerId && isAutomaton(piece)
      ? { ...piece, attackModifier: piece.attackModifier + attack }
      : piece,
  ),
});

/**
 * ¿Esta estructura que acaba de entrar da cuerda a los autómatas? Solo las de
 * Forja: el motor es de la facción, no del tipo de carta, así que una
 * estructura de Orden en un mazo mixto no debe activarlo.
 */
export const isForgeStructure = (card: CardDefinition): boolean =>
  card.faction === 'forja' && card.type === 'structure';

/**
 * Resistencia extra con la que entran las estructuras: la suma de lo que
 * aporten la Cadena de Montaje y el propio Torvald.
 */
export const structureEntryBonus = (state: MatchState, playerId: PlayerId, commanderId: string): number => {
  let bonus = commanderId === 'torvald-maestro-del-yunque' ? 1 : 0;
  for (const piece of state.board) {
    if (piece.owner !== playerId) continue;
    const extra = CARD_BY_ID[piece.cardId]?.effects.find(
      (effect) => effect.kind === 'passive' && effect.id === 'structures-enter-with-resistance',
    );
    if (extra?.kind === 'passive') bonus += extra.value ?? 1;
  }
  return bonus;
};
