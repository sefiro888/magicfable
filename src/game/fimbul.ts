import type { BoardPiece, CardDefinition } from './types';

/**
 * Fimbul, «El invierno que no termina»: sus dos mecánicas.
 *
 * **Desafío** — cuando esta unidad ataca a una con Ataque igual o mayor que
 * el suyo, obtiene el efecto de la carta. **Furor** — mientras a esta unidad
 * le falte la mitad o más de su Vida, tiene el segundo bloque de reglas.
 *
 * Las dos son condiciones puras sobre datos que el motor ya conoce en el
 * momento del ataque o del mantenimiento —el Ataque efectivo de las dos
 * piezas, la Vida actual frente al máximo—, así que no hace falta ningún
 * campo nuevo en `MatchState` ni en `BoardPiece`.
 */

/** Ataque efectivo de una pieza: el de su carta más los modificadores en curso. */
export const effectiveAttack = (piece: BoardPiece, card: CardDefinition): number =>
  Math.max(0, (card.attack ?? 0) + piece.attackModifier);

/** ¿Se cumple Desafío? El defensor iguala o supera el Ataque del atacante. */
export const isChallenge = (
  attacker: BoardPiece,
  attackerCard: CardDefinition,
  defender: BoardPiece,
  defenderCard: CardDefinition,
): boolean => effectiveAttack(defender, defenderCard) >= effectiveAttack(attacker, attackerCard);

/**
 * ¿Se cumple Furor? A la pieza le falta la mitad o más de su Vida máxima.
 *
 * El máximo se lee de la carta (Vida de unidad o Resistencia de estructura),
 * no de la Vida actual con la que entró: un +1/+1 permanente sube también el
 * umbral a partir del cual la pieza entra en Furor.
 */
export const isFurious = (piece: BoardPiece, card: CardDefinition): boolean => {
  const max = (card.type === 'unit' ? card.health : card.resistance) ?? 0;
  const bonus = piece.permanentAttackBonus ?? 0;
  if (max <= 0) return false;
  return piece.currentHealth * 2 <= max + bonus;
};
