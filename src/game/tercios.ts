import { CARD_BY_ID } from './cards';
import { isBlocked } from './terrain';
import type { BoardPiece, MatchState, Position } from './types';

/** La Formación se deriva del tablero: guardar el bono en la pieza lo dejaría
 * activo después de que un compañero se moviese o fuese destruido. */
export const formationActive = (state: MatchState, piece: BoardPiece, threshold = 2): boolean => {
  if (CARD_BY_ID[piece.cardId]?.type !== 'unit') return false;
  const allies = state.board.filter((other) => other.instanceId !== piece.instanceId
    && other.owner === piece.owner
    && CARD_BY_ID[other.cardId]?.type === 'unit'
    && Math.abs(other.position.x - piece.position.x) + Math.abs(other.position.y - piece.position.y) === 1);
  const hasTrench = state.board.some((other) => other.owner === piece.owner
    && other.cardId === 'trinchera'
    && Math.abs(other.position.x - piece.position.x) + Math.abs(other.position.y - piece.position.y) === 1);
  const required = state.players[piece.owner].commanderId === 'farnesio-duque-de-parma' ? 1 : threshold;
  return allies.length + (hasTrench ? 1 : 0) >= required;
};

export const hasFormation = (piece: BoardPiece): boolean => !piece.statuses.some((status) => status.kind === 'silenced') && Boolean(piece.grantedFormation ||
  CARD_BY_ID[piece.cardId]?.effects.some((effect) => effect.kind === 'passive' && effect.id === 'formation'));

/** Los bonos de ataque se calculan con las posiciones actuales: al moverse o
 * morir una aliada no debe permanecer un modificador guardado en la ficha. */
export const formationAttackBonus = (state: MatchState, piece: BoardPiece): number => {
  if (CARD_BY_ID[piece.cardId]?.type !== 'unit') return 0;
  const active = hasFormation(piece) && formationActive(state, piece);
  const captains = active ? state.board.filter((ally) => ally.owner === piece.owner && ally.cardId === 'capitan-de-infanteria' && !ally.statuses.some((status) => status.kind === 'silenced')).length : 0;
  const corporals = state.board.filter((ally) => ally.owner === piece.owner && ally.cardId === 'cabo-de-escuadra' && !ally.statuses.some((status) => status.kind === 'silenced')
    && Math.abs(ally.position.x - piece.position.x) + Math.abs(ally.position.y - piece.position.y) === 1).length;
  const flying = CARD_BY_ID[piece.cardId]?.keywords.includes('flying') || piece.grantedKeywords?.includes('flying');
  const pines = flying ? state.board.filter((ally) => ally.owner === piece.owner && ally.cardId === 'el-pino-que-llega-al-cielo').length : 0;
  return (active ? 1 : 0) + captains + corporals + pines;
};

export const continuousHealthBonus = (state: MatchState, piece: BoardPiece): number => {
  const card = CARD_BY_ID[piece.cardId];
  if (card?.type !== 'unit') return 0;
  const flying = card.keywords.includes('flying') || piece.grantedKeywords?.includes('flying');
  return formationHealthBonus(state, piece) + state.board.filter((ally) => ally.owner === piece.owner &&
    (ally.cardId === 'fragua-de-ilmarinen' ||
      (ally.cardId === 'el-pino-que-llega-al-cielo' && flying) ||
      (ally.cardId === 'fuerte-de-estrella' && Math.abs(ally.position.x - piece.position.x) + Math.abs(ally.position.y - piece.position.y) === 1))).length;
};

/** Solo las unidades en Formación reciben el +2 y las auras de Vida; el
 * máximo se recalcula al cambiar el tablero, no al entrar la carta. */
export const formationHealthBonus = (state: MatchState, piece: BoardPiece): number => {
  if (!hasFormation(piece) || !formationActive(state, piece)) return 0;
  return 2 + state.board.filter((ally) => ally.owner === piece.owner && !ally.statuses.some((status) => status.kind === 'silenced')
    && (ally.cardId === 'alferez-de-la-cruz' || ally.cardId === 'capitan-de-infanteria')).length;
};

export const hasDischarge = (state: MatchState, piece: BoardPiece): boolean => !piece.statuses.some((status) => status.kind === 'silenced') && Boolean(piece.grantedDischarge ||
  CARD_BY_ID[piece.cardId]?.effects.some((effect) => effect.kind === 'passive' && effect.id === 'discharge') ||
  (hasFormation(piece) && formationActive(state, piece) && state.board.some((ally) => ally.owner === piece.owner && ally.cardId === 'el-gran-capitan' && !ally.statuses.some((status) => status.kind === 'silenced'))));

/** Descarga solo atraviesa unidades amigas, nunca estructuras, enemigos ni
 * ruinas. El resultado es derivado y no altera la línea de movimiento normal. */
export const dischargeLine = (state: MatchState, attacker: BoardPiece, to: Position): { clear: boolean; throughAlly: boolean } => {
  const from = attacker.position;
  if ((from.x !== to.x && from.y !== to.y) || (from.x === to.x && from.y === to.y)) {
    return { clear: false, throughAlly: false };
  }
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  let throughAlly = false;
  for (let x = from.x + dx, y = from.y + dy; x !== to.x || y !== to.y; x += dx, y += dy) {
    if (isBlocked(state, { x, y })) return { clear: false, throughAlly: false };
    const occupant = state.board.find((piece) => piece.position.x === x && piece.position.y === y);
    if (!occupant) continue;
    if (occupant.owner !== attacker.owner || CARD_BY_ID[occupant.cardId]?.type !== 'unit') {
      return { clear: false, throughAlly: false };
    }
    throughAlly = true;
  }
  return { clear: true, throughAlly };
};
