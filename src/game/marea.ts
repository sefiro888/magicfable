import { isInsideBoard } from './board';
import { CARD_BY_ID } from './cards';
import type { BoardPiece, MatchState, PlayerId, Position } from './types';

/**
 * Marea, «El Ciclo de las Aguas»: su mecánica propia.
 *
 * **El ciclo de marea.** En los turnos impares hay BAJAMAR; en los pares,
 * PLEAMAR. Cambia solo, nadie lo controla, y muchas cartas hacen una cosa u
 * otra según el momento:
 *
 * - **Pleamar** (turnos pares): la facción golpea y cura. El agua está alta.
 * - **Bajamar** (turnos impares): mueve, roba y coloca. El agua se retira.
 *
 * No guarda estado nuevo: se deduce del número de turno que el motor ya lleva.
 * Es deliberado — un ciclo que se calcula no se puede desincronizar, y evita
 * un campo más que habría que serializar en el guardado y en el PvP.
 *
 * La condición se escribe como RAMA dentro de la lista de efectos, igual que
 * el Juicio de Duna o el Mandato de Jade:
 *
 * ```
 * [ {damage:3}, {tide:'high'}, {heal-nexus:2} ]   // 3 de daño; si Pleamar, cura 2
 * ```
 *
 * **El empuje.** La segunda seña de identidad: mover unidades por el tablero
 * en vez de matarlas. El motor ya empujaba en un solo sitio (el Leviatán
 * Abismal del Vacío), con el cálculo escrito a mano allí mismo; aquí se
 * generaliza para que lo use toda la facción, con dos reglas que antes no
 * existían: una unidad puede ser INMUNE al empuje, y una que no tiene sitio
 * donde retroceder se queda donde está (lo que la Vorágine aprovecha para
 * aturdirla).
 */

/** El rival. Repetido aquí a propósito: `engine.ts` importa este módulo, así
 *  que importar de él cerraría un ciclo por una función de una línea. */
const opponentOf = (playerId: PlayerId): PlayerId => (playerId === 'player' ? 'ai' : 'player');

/** Las dos fases del ciclo. */
export type TidePhase = 'high' | 'low';

/**
 * Pleamar en los turnos pares, bajamar en los impares.
 *
 * `turn` arranca en 1, así que el primer turno de la partida es Bajamar: la
 * facción empieza colocando y moviendo, y no puede rematar hasta el segundo.
 */
export const tidePhase = (state: MatchState): TidePhase => (state.turn % 2 === 0 ? 'high' : 'low');

/** ¿Estamos en la fase que pide la carta? */
export const isTide = (state: MatchState, phase: TidePhase): boolean => tidePhase(state) === phase;

/**
 * Solo se empujan UNIDADES. Una estructura está anclada al suelo, y además
 * moverla rompería las pasivas que dependen de qué tiene al lado.
 */
const isPushablePiece = (piece: BoardPiece): boolean => CARD_BY_ID[piece.cardId]?.type === 'unit';

/**
 * ¿Esta pieza aguanta el empuje? El Crustáceo Acorazado se agarra al fondo.
 * Se mira en la definición de la carta y no en la pieza, porque es una
 * propiedad del tipo de unidad y no algo que se gane durante la partida.
 */
export const isPushImmune = (piece: BoardPiece): boolean => {
  const card = CARD_BY_ID[piece.cardId];
  if (!card) return false;
  return card.effects.some((effect) => effect.kind === 'passive' && effect.id === 'push-immune');
};

/**
 * Hacia dónde retrocede una pieza: en dirección contraria al Nexo de quien
 * empuja. Como los dos Nexos están en filas opuestas, basta el signo de la
 * diferencia de filas — no hace falta trigonometría ni conocer la posición
 * exacta del que empuja.
 */
const retreatStep = (pusher: PlayerId): number => (pusher === 'player' ? -1 : 1);

/**
 * Empuja una pieza `amount` casillas y devuelve dónde acaba.
 *
 * Avanza de una en una y se para en cuanto la siguiente casilla está fuera
 * del tablero u ocupada: empujar tiene que poder quedarse a medias, porque si
 * no una unidad acorralada saldría del tablero o se solaparía con otra.
 * Devuelve `null` si no se movió ni una casilla — es lo que distingue «la
 * empujé menos de lo que quería» de «no pude empujarla en absoluto», y la
 * Vorágine necesita esa diferencia para saber a quién aturde.
 */
export const pushDestination = (
  state: MatchState,
  piece: BoardPiece,
  amount: number,
  direction: number,
): Position | null => {
  if (isPushImmune(piece)) return null;
  let current = piece.position;
  let moved = 0;
  for (let step = 0; step < amount; step += 1) {
    const next = { x: current.x, y: current.y + direction };
    if (!isInsideBoard(next)) break;
    if (state.board.some((other) => other.position.x === next.x && other.position.y === next.y)) break;
    current = next;
    moved += 1;
  }
  return moved === 0 ? null : current;
};

/**
 * Empuja a todas las unidades de `victimOwner` y devuelve el estado nuevo y
 * quiénes NO se movieron.
 *
 * El orden importa: se empuja empezando por las que están MÁS LEJOS del que
 * empuja, para que cada una encuentre libre la casilla de detrás. Si se
 * hiciera al revés, la primera chocaría con la siguiente y una fila entera se
 * quedaría clavada por un detalle de implementación en vez de por la regla.
 */
export const pushAll = (
  state: MatchState,
  pusher: PlayerId,
  amount: number,
  toward: 'away' | 'pusher',
): { readonly state: MatchState; readonly blocked: readonly string[] } => {
  const victimOwner: PlayerId = opponentOf(pusher);
  const direction = toward === 'away' ? retreatStep(pusher) : -retreatStep(pusher);
  const victims = state.board
    .filter((piece) => piece.owner === victimOwner && isPushablePiece(piece))
    // De más lejos a más cerca en la dirección del empuje.
    .slice()
    .sort((a, b) => (direction < 0 ? a.position.y - b.position.y : b.position.y - a.position.y));

  let next = state;
  const blocked: string[] = [];
  for (const victim of victims) {
    const current = next.board.find((piece) => piece.instanceId === victim.instanceId);
    if (!current) continue;
    const destination = pushDestination(next, current, amount, direction);
    if (!destination) {
      blocked.push(current.instanceId);
      continue;
    }
    next = {
      ...next,
      board: next.board.map((piece) =>
        piece.instanceId === current.instanceId ? { ...piece, position: destination } : piece,
      ),
    };
  }
  return { state: next, blocked };
};

/** Empuja una sola pieza. Devuelve el estado sin tocar si no hubo hueco. */
export const pushOne = (
  state: MatchState,
  pusher: PlayerId,
  pieceId: string,
  amount: number,
  toward: 'away' | 'pusher' = 'away',
): MatchState => {
  const piece = state.board.find((item) => item.instanceId === pieceId);
  if (!piece || !isPushablePiece(piece)) return state;
  const direction = toward === 'away' ? retreatStep(pusher) : -retreatStep(pusher);
  const destination = pushDestination(state, piece, amount, direction);
  if (!destination) return state;
  return {
    ...state,
    board: state.board.map((item) => (item.instanceId === pieceId ? { ...item, position: destination } : item)),
  };
};
