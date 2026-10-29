import { BOARD_SIZE } from './board';
import { isBlocked } from './terrain';
import { CARD_BY_ID } from './cards';
import type { BoardPiece, MatchState, PlayerId, Position } from './types';

/** Runo no se gasta: el bono se deriva del contador del dueño y afecta
 * también a las unidades que entren después de lanzar los hechizos. */
export const runoAttackBonus = (counters: number): number => Math.floor(Math.max(0, counters) / 3);

/** El ataque sustituido por Canto no causa daño ni contragolpe. Compartir
 * esta condición evita que la previsión y la IA anuncien una muerte falsa. */
export const attackSinksDefender = (state: MatchState, attacker: BoardPiece, defender: BoardPiece): boolean =>
  (state.players[attacker.owner].runo ?? 0) >= 9
  && CARD_BY_ID[defender.cardId]?.type === 'unit'
  && !attacker.statuses.some((status) => status.kind === 'silenced')
  && Boolean(CARD_BY_ID[attacker.cardId]?.effects.some((effect) => effect.kind === 'passive' && effect.id === 'attack-canto-at-nine'));

/** Väinämöinen suma un contador adicional solo al primer hechizo del turno;
 * el número anterior de hechizos evita que un segundo vuelva a activarlo. */
export const runoFromSpell = (spellsAlreadyCast: number, hasVainamoinen: boolean): number =>
  1 + (hasVainamoinen && spellsAlreadyCast === 0 ? 1 : 0);

export const gainRuno = (state: MatchState, owner: PlayerId, amount: number): MatchState => ({
  ...state, players: { ...state.players, [owner]: { ...state.players[owner], runo: (state.players[owner].runo ?? 0) + amount } },
});

/** Canto devuelve la pieza a la casilla libre más cercana si su origen está
 * ocupado. El desempate por fila y columna hace que una repetición llegue a
 * la misma casilla sin consumir azar; si no hay hueco se queda pendiente. */
export const returnPosition = (state: MatchState, origin: Position): Position | undefined => {
  const occupied = new Set(state.board.map((piece) => `${piece.position.x},${piece.position.y}`));
  const candidates: Position[] = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const position = { x, y };
      if (!occupied.has(`${x},${y}`) && !isBlocked(state, position)) candidates.push(position);
    }
  }
  return candidates.sort((a, b) =>
    (Math.abs(a.x - origin.x) + Math.abs(a.y - origin.y)) - (Math.abs(b.x - origin.x) + Math.abs(b.y - origin.y))
    || a.y - b.y || a.x - b.x)[0];
};

/** Hundir no pasa por la ruta de destrucción: no envía la carta al descarte
 * ni activa efectos de muerte o Renacer. */
export const sinkUnit = (state: MatchState, piece: BoardPiece): MatchState => {
  if (!state.board.some((candidate) => candidate.instanceId === piece.instanceId)
      || CARD_BY_ID[piece.cardId]?.type !== 'unit') return state;
  const returnTurn = state.turn + (state.activePlayer === piece.owner ? 2 : 1);
  return {
    ...state,
    board: state.board.filter((candidate) => candidate.instanceId !== piece.instanceId),
    sunkenUnits: [...(state.sunkenUnits ?? []), {
      instanceId: piece.instanceId, cardId: piece.cardId, owner: piece.owner,
      origin: piece.position, returnTurn, renacerSpent: piece.renacerSpent,
      metamorphosed: piece.metamorphosed, firstAttackHealUsed: piece.firstAttackHealUsed,
      permanentHealthPenalty: piece.permanentHealthPenalty,
    }],
  };
};

/** Las piezas se restituyen en orden de hundimiento y ocupan sitio antes de
 * buscar el siguiente, para que dos regresos nunca compartan una casilla. */
export const returnSunkenUnits = (state: MatchState, owner: PlayerId): MatchState => {
  if (!state.sunkenUnits?.length) return state;
  let board = state.board;
  const pending = [] as NonNullable<MatchState['sunkenUnits']>[number][];
  for (const sunk of state.sunkenUnits) {
    const card = CARD_BY_ID[sunk.cardId];
    if (sunk.owner !== owner || sunk.returnTurn > state.turn || card?.type !== 'unit' || card.health === undefined) {
      pending.push(sunk);
      continue;
    }
    if (!sunk.cantoDelayApplied && state.board.some((piece) => piece.owner !== owner && piece.cardId === 'cisne-de-tuonela' && !piece.statuses.some((status) => status.kind === 'silenced'))) {
      pending.push({ ...sunk, returnTurn: state.turn + 2, cantoDelayApplied: true });
      continue;
    }
    const position = returnPosition({ ...state, board }, sunk.origin);
    if (!position) {
      pending.push(sunk);
      continue;
    }
    const penalty = (sunk.permanentHealthPenalty ?? 0) + state.board.filter((piece) => piece.owner !== owner && piece.cardId === 'el-rio-de-tuonela').length;
    board = [...board, {
      instanceId: sunk.instanceId, cardId: sunk.cardId, owner: sunk.owner, position,
      currentHealth: card.health - penalty, permanentHealthPenalty: penalty, attackModifier: 0, movedThisTurn: true,
      attackedThisTurn: true, enteredOnTurn: state.turn, statuses: [],
      renacerSpent: sunk.renacerSpent, metamorphosed: sunk.metamorphosed,
      firstAttackHealUsed: sunk.firstAttackHealUsed,
    }];
  }
  return { ...state, board, sunkenUnits: pending };
};
