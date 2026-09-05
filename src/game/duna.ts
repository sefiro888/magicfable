import { CARD_BY_ID } from './cards';
import type { CardDefinition, CardEffect, MatchState, PlayerId } from './types';

/**
 * Duna, «El Tribunal de Arena»: sus dos mecánicas propias.
 *
 * **Ofrenda N** — al jugar la carta puedes pagar N de Vida de tu Nexo. Si lo
 * haces, obtienes el efecto mejorado. Tu Vida deja de ser solo el marcador de
 * derrota y pasa a ser un recurso.
 *
 * **Juicio** — al resolverse, si tu Nexo tiene MENOS Vida que el del rival,
 * obtienes una recompensa. Es la contrapartida de Ofrenda: cuanto más has
 * pagado, más cerca estás de que el Tribunal falle a tu favor, y hace de Duna
 * la única facción que saca provecho de ir perdiendo.
 *
 * Las dos se escriben como RAMAS dentro de la lista de efectos de la carta, en
 * vez de como campos aparte, para que una misma carta pueda combinarlas y para
 * no tener que tocar cada sitio que resuelve efectos:
 *
 * ```
 * [ {damage:3}, {offering:2}, {damage:2} ]     // 3 de daño, o 5 si ofrendas
 * [ {judgement}, {destroy}, {otherwise}, {damage:4} ]  // una cosa u otra
 * ```
 *
 * `otherwise` abre la rama alternativa y `always` cierra las condicionales:
 * lo que va después se resuelve pase lo que pase.
 */

/** ¿El Tribunal falla a tu favor? Vas por detrás en Vida de Nexo. */
export const isUnderJudgement = (state: MatchState, playerId: PlayerId): boolean => {
  const rivalId: PlayerId = playerId === 'player' ? 'ai' : 'player';
  return state.players[playerId].nexusHealth < state.players[rivalId].nexusHealth;
};

/** La Ofrenda que pide una carta, si es que pide alguna. */
export const offeringOf = (card: CardDefinition): number | undefined => {
  const effect = card.effects.find((candidate) => candidate.kind === 'offering');
  return effect?.kind === 'offering' ? effect.cost : undefined;
};

/** Rebaja mínima de una Ofrenda: nunca puede salir gratis. */
const MINIMUM_OFFERING = 1;

/**
 * Lo que cuesta de verdad una Ofrenda, con los descuentos en juego.
 *
 * Los rebaja el Visir de la Arena (siempre) y la Mesa de Ofrendas (solo la
 * primera de cada turno). Se acumulan, pero nunca por debajo de 1: una Ofrenda
 * gratis dejaría de ser una decisión, que es justo lo que la hace interesante.
 */
export const offeringCost = (state: MatchState, playerId: PlayerId, base: number): number => {
  const mine = state.board.filter((piece) => piece.owner === playerId);
  const discount = (id: string) =>
    mine.reduce((total, piece) => {
      const effect = CARD_BY_ID[piece.cardId]?.effects.find(
        (candidate) => candidate.kind === 'passive' && candidate.id === id,
      );
      return effect?.kind === 'passive' ? total + (effect.value ?? 1) : total;
    }, 0);
  let cost = base - discount('offering-discount');
  if ((state.players[playerId].offeringsPaidThisTurn ?? 0) === 0) cost -= discount('offering-discount-first');
  return Math.max(MINIMUM_OFFERING, cost);
};

/**
 * ¿Se puede pagar esta Ofrenda? Hay que quedar VIVO después: pagar hasta 0 de
 * Vida sería perder la partida para ganar un efecto, que no tiene sentido como
 * jugada y complicaría cada comprobación de victoria.
 */
export const canPayOffering = (state: MatchState, playerId: PlayerId, base: number): boolean =>
  state.players[playerId].nexusHealth > offeringCost(state, playerId, base);

/**
 * Los efectos que hay que resolver de verdad, ya podadas las ramas que no
 * tocan. Quien resuelve efectos itera sobre esto y no se entera de que existen
 * Ofrenda ni Juicio.
 */
export const activeEffects = (
  card: CardDefinition,
  options: {
    readonly offered: boolean;
    readonly judged: boolean;
    readonly hasMandate?: boolean;
    /** Marea — la fase del ciclo en la que se resuelve la carta. */
    readonly tide?: 'high' | 'low';
    /** Forja — cuántas estructuras controla quien juega la carta. */
    readonly structures?: number;
  },
): readonly CardEffect[] => {
  const active: CardEffect[] = [];
  let skipping = false;
  let lastConditionMet = true;
  for (const effect of card.effects) {
    if (effect.kind === 'offering') {
      lastConditionMet = options.offered;
      skipping = !options.offered;
      continue;
    }
    if (effect.kind === 'judgement') {
      lastConditionMet = options.judged;
      skipping = !options.judged;
      continue;
    }
    // Jade — el Mandato: mismo patrón de rama que Ofrenda/Juicio, para poder
    // combinar «Mandato: …» con lo que ya sabe resolver este podador.
    if (effect.kind === 'mandate') {
      lastConditionMet = options.hasMandate ?? false;
      skipping = !lastConditionMet;
      continue;
    }
    // Marea — el ciclo: misma forma de rama que las anteriores, para que una
    // carta pueda decir «En Pleamar, …» sin tocar a quien resuelve efectos.
    if (effect.kind === 'tide') {
      lastConditionMet = options.tide === effect.phase;
      skipping = !lastConditionMet;
      continue;
    }
    // Forja — «Si controlas una estructura…»: misma forma de rama.
    if (effect.kind === 'has-structure') {
      lastConditionMet = (options.structures ?? 0) >= (effect.count ?? 1);
      skipping = !lastConditionMet;
      continue;
    }
    if (effect.kind === 'otherwise') {
      skipping = lastConditionMet;
      continue;
    }
    if (effect.kind === 'always') {
      skipping = false;
      continue;
    }
    if (!skipping) active.push(effect);
  }
  return active;
};
