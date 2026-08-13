import { distanceToCenter, distanceToEnemyNexusRow } from './board';
import { CARD_BY_ID } from './cards';
import { COMMANDER_BY_ID } from './decks';
import {
  applyAction,
  effectiveCost,
  getValidAttacks,
  getValidDeploymentPositions,
  getValidMoves,
} from './engine';
import { planManaPayment } from './mana';
import type {
  BoardPiece,
  CardDefinition,
  CardInstance,
  FactionId,
  GameAction,
  MatchState,
  PlayerId,
  Position,
  SpellTarget,
} from './types';

/**
 * Todas las rutinas de decisión reciben el asiento en el que juegan (`me`).
 * En la partida real siempre es 'ai' —el valor por defecto, para no cambiar
 * ninguna llamada existente—, pero dejarlo parametrizado permite enfrentar a
 * la IA contra sí misma en los dos bandos (ver la simulación de balance),
 * que es la única forma de medir el equilibrio entre facciones sin que el
 * resultado dependa de qué lado juega mejor.
 */
const rivalOf = (me: PlayerId): PlayerId => (me === 'player' ? 'ai' : 'player');

const MAX_AI_ACTIONS = 64;

/**
 * Nivel de la IA rival. Nunca cambia qué jugadas son legales, solo cuáles elige:
 *
 * - `easy`: no remata el Nexo, pelea solo en el tablero y deja respirar.
 * - `normal`: ataca el Nexo en cuanto puede y golpea al objetivo más amenazante,
 *   pieza por pieza en un orden fijo. Es directa y previsible.
 * - `hard`: evalúa TODOS los pares atacante-objetivo posibles antes de mover
 *   ficha y elige el mejor intercambio, midiendo qué muere de cada lado y el
 *   contragolpe que va a recibir. Solo golpea el Nexo cuando eso vale más que
 *   el mejor intercambio disponible (o cuando es letal).
 */
export type AiDifficulty = 'easy' | 'normal' | 'hard';

/**
 * Sesgo de puntuación por arquetipo de facción: cada IA rival prioriza sus
 * propias cartas y objetivos de forma distinta según su identidad temática
 * (ver src/game/factions.ts). Solo reordena candidatos ya válidos; nunca
 * habilita una jugada que el motor rechazaría.
 */
export const factionCardBias = (card: CardDefinition, faction: FactionId | undefined): number => {
  if (!faction) return 0;
  switch (faction) {
    case 'fury':
      return (card.attack ?? 0) * 1.5 + card.effects.reduce((sum, effect) => sum + (effect.kind === 'scorch' ? 5 : effect.kind === 'damage' ? effect.amount : 0), 0);
    case 'arcane':
      return card.effects.reduce((sum, effect) => sum + (effect.kind === 'freeze' ? 6 : effect.kind === 'draw' ? effect.amount * 3 : effect.kind === 'scry' ? effect.amount * 2 : 0), 0);
    case 'nature':
      return (card.health ?? card.resistance ?? 0) * 1.5 + card.effects.reduce((sum, effect) => sum + (effect.kind === 'heal-nexus' ? effect.amount * 2 : 0), 0);
    case 'order':
      return (card.type === 'structure' ? 6 : 0) + card.effects.reduce((sum, effect) => sum + (effect.kind === 'passive' && effect.id === 'target-attack-until-end' ? 4 : 0), 0);
    case 'shadow':
      return card.effects.reduce((sum, effect) => sum + (effect.kind === 'discard' ? effect.amount * 4 : effect.kind === 'adjacent-damage' ? effect.amount * 2 : effect.kind === 'splash-weakest-enemy' ? effect.amount * 2 : 0), 0);
    case 'void':
      return (card.unique ? 4 : 0) + card.effects.reduce((sum, effect) => sum + (effect.kind === 'refresh-move' ? 5 : effect.kind === 'passive' ? 2 : 0), 0);
    default:
      return 0;
  }
};

const seatFaction = (state: MatchState, me: PlayerId): FactionId | undefined =>
  COMMANDER_BY_ID[state.players[me].commanderId]?.faction;

const cardScore = (card: CardDefinition, faction?: FactionId): number => {
  const cost = card.cost.generic + Object.values(card.cost.colored).reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const boardValue = (card.attack ?? 0) * 2 + (card.health ?? card.resistance ?? 0);
  const removalValue = card.effects.reduce(
    (sum, effect) => sum + (effect.kind === 'damage' ? effect.amount * 3 : effect.kind === 'freeze' ? 4 : effect.kind === 'draw' ? effect.amount * 2 : 0),
    0,
  );
  // Palabras clave que valen más de lo que dicen los números impresos: sin
  // esto la IA trataba a un Ariete con Perforar igual que a un 4/5 cualquiera.
  const keywordValue =
    (card.keywords.includes('pierce') ? (card.attack ?? 0) : 0) +
    (card.keywords.includes('lifelink') ? (card.attack ?? 0) : 0) +
    (card.keywords.includes('stun') ? 3 : 0) +
    (card.keywords.includes('guard') ? 2 : 0) +
    (card.keywords.includes('flying') ? 2 : 0);
  return boardValue + removalValue + keywordValue + cost + (card.unique ? 2 : 0) + factionCardBias(card, faction);
};

const stableTieBreaker = (value: string, seed: number): number => {
  let hash = seed >>> 0;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16_777_619) >>> 0;
  return hash;
};

const chooseEnemyTarget = (state: MatchState, card: CardDefinition, me: PlayerId): BoardPiece | undefined => {
  const enemies = state.board.filter((piece) => piece.owner === rivalOf(me));
  // El motor rechaza estos hechizos sobre estructuras; filtrar aquí evita gastar el turno en una acción inválida.
  const unitsOnly = card.id === 'lluvia-ceniza' || card.effects.some((effect) => effect.kind === 'freeze');
  const allowed = unitsOnly
    ? enemies.filter((piece) => CARD_BY_ID[piece.cardId]?.type === 'unit')
    : enemies;
  return [...allowed].sort((left, right) => {
    const leftCard = CARD_BY_ID[left.cardId];
    const rightCard = CARD_BY_ID[right.cardId];
    const leftThreat = (leftCard?.attack ?? 0) * 3 - left.currentHealth;
    const rightThreat = (rightCard?.attack ?? 0) * 3 - right.currentHealth;
    return rightThreat - leftThreat || left.currentHealth - right.currentHealth || left.instanceId.localeCompare(right.instanceId);
  })[0];
};

const targetForCard = (state: MatchState, card: CardDefinition, me: PlayerId): SpellTarget | undefined => {
  const refreshMove = card.effects.some((effect) => effect.kind === 'refresh-move');
  if (refreshMove) {
    const movedAlly = state.board
      .filter(
        (piece) =>
          piece.owner === me && piece.movedThisTurn && CARD_BY_ID[piece.cardId]?.type === 'unit',
      )
      .sort((left, right) => left.instanceId.localeCompare(right.instanceId))[0];
    return movedAlly ? { kind: 'piece', pieceId: movedAlly.instanceId } : undefined;
  }
  const friendlyBuff = card.effects.some(
    (effect) => effect.kind === 'passive' && effect.id === 'target-attack-until-end',
  );
  if (friendlyBuff) {
    const ally = state.board
      .filter((piece) => piece.owner === me && CARD_BY_ID[piece.cardId]?.type === 'unit')
      .sort((left, right) => {
        const attackDifference = (CARD_BY_ID[right.cardId]?.attack ?? 0) - (CARD_BY_ID[left.cardId]?.attack ?? 0);
        return attackDifference || left.instanceId.localeCompare(right.instanceId);
      })[0];
    return ally ? { kind: 'piece', pieceId: ally.instanceId } : undefined;
  }
  const needsEnemy = card.effects.some(
    (effect) => effect.kind === 'damage' || effect.kind === 'freeze' || effect.kind === 'scorch',
  );
  if (!needsEnemy) return { kind: 'none' };
  const target = chooseEnemyTarget(state, card, me);
  return target ? { kind: 'piece', pieceId: target.instanceId } : undefined;
};

const chooseDeployment = (state: MatchState, me: PlayerId): Position | undefined => {
  const positions = getValidDeploymentPositions(state, me);
  if (positions.length === 0) return undefined;
  const enemyPieces = state.board.filter((piece) => piece.owner === rivalOf(me));
  return [...positions].sort((left, right) => {
    const proximity = (position: Position): number =>
      enemyPieces.length === 0
        ? distanceToCenter(position.x)
        : Math.min(...enemyPieces.map((piece) => Math.abs(position.x - piece.position.x)));
    return proximity(left) - proximity(right) || left.x - right.x;
  })[0];
};

const actionForCard = (state: MatchState, instance: CardInstance, me: PlayerId): GameAction | undefined => {
  const card = CARD_BY_ID[instance.cardId];
  if (!card || card.type === 'mana') return undefined;
  if (!planManaPayment(state.players[me].resources, effectiveCost(state, me, card)).payable) return undefined;
  if (card.type === 'unit' || card.type === 'structure') {
    const position = chooseDeployment(state, me);
    return position
      ? { type: 'play-card', playerId: me, cardInstanceId: instance.instanceId, position }
      : undefined;
  }
  const target = targetForCard(state, card, me);
  const needsPiece = card.effects.some(
    (effect) =>
      effect.kind === 'damage' ||
      effect.kind === 'freeze' ||
      effect.kind === 'scorch' ||
      effect.kind === 'refresh-move' ||
      (effect.kind === 'passive' && effect.id === 'target-attack-until-end'),
  );
  if (needsPiece && (!target || target.kind !== 'piece')) return undefined;
  return { type: 'play-card', playerId: me, cardInstanceId: instance.instanceId, target };
};

const chooseCardAction = (state: MatchState, skipped: ReadonlySet<string>, me: PlayerId): GameAction | undefined => {
  const faction = seatFaction(state, me);
  const candidates = state.players[me].hand
    .filter((instance) => !skipped.has(instance.instanceId))
    .map((instance) => ({ instance, card: CARD_BY_ID[instance.cardId] }))
    .filter((candidate): candidate is { instance: CardInstance; card: CardDefinition } => Boolean(candidate.card))
    .sort((left, right) =>
      cardScore(right.card, faction) - cardScore(left.card, faction) ||
      stableTieBreaker(left.instance.instanceId, state.seed + state.turn) -
        stableTieBreaker(right.instance.instanceId, state.seed + state.turn),
    );
  for (const candidate of candidates) {
    const action = actionForCard(state, candidate.instance, me);
    if (action) return action;
  }
  return undefined;
};

const targetScore = (state: MatchState, pieceId: string): number => {
  const piece = state.board.find((candidate) => candidate.instanceId === pieceId);
  if (!piece) return Number.NEGATIVE_INFINITY;
  const definition = CARD_BY_ID[piece.cardId];
  return (definition?.attack ?? 0) * 4 + (definition?.type === 'structure' ? 2 : 0) - piece.currentHealth;
};

/** Lo que vale una ficha en el tablero: perderla o matarla pesa esto. */
const pieceValue = (piece: BoardPiece): number => {
  const definition = CARD_BY_ID[piece.cardId];
  if (!definition) return 0;
  const keywordBonus =
    (definition.keywords.includes('guard') ? 2 : 0) +
    (definition.keywords.includes('flying') ? 2 : 0) +
    (definition.keywords.includes('lifelink') ? 2 : 0) +
    (definition.keywords.includes('pierce') ? 2 : 0) +
    (definition.keywords.includes('stun') ? 2 : 0);
  return (definition.attack ?? 0) * 2 + piece.currentHealth + keywordBonus;
};

/** Daño que reparte `piece` al atacar, con sus modificadores ya aplicados. */
const attackPower = (piece: BoardPiece): number => {
  const definition = CARD_BY_ID[piece.cardId];
  if (!definition || definition.attack === undefined) return 0;
  const onAttackBuff = definition.effects.find((effect) => effect.kind === 'buff-self-on-attack');
  return Math.max(0, definition.attack + piece.attackModifier +
    (onAttackBuff?.kind === 'buff-self-on-attack' ? onAttackBuff.attack : 0));
};

/**
 * Cuánto gana la IA con un intercambio concreto. Positivo = le compensa.
 *
 * Suma lo que destruye y resta lo que va a perder por el contragolpe: por eso
 * la IA difícil no lanza un 2/2 contra un Guardia 4/5 solo porque «podía
 * atacar», que es justo lo que hace la normal.
 */
const tradeValue = (attacker: BoardPiece, defender: BoardPiece): number => {
  const attackerCard = CARD_BY_ID[attacker.cardId];
  const damage = attackPower(attacker);
  const defenderDies = damage >= defender.currentHealth;
  // El contragolpe solo existe cuerpo a cuerpo y si la defensora tiene Ataque.
  const meleeRange = (attackerCard?.range ?? 1) === 1;
  const retaliation = meleeRange ? attackPower(defender) : 0;
  const attackerDies = retaliation >= attacker.currentHealth;
  let value = defenderDies ? pieceValue(defender) : Math.min(damage, defender.currentHealth);
  if (attackerDies) value -= pieceValue(attacker);
  // Rematar a la defensora con Perforar además empuja daño al Nexo.
  if (defenderDies && attackerCard?.keywords.includes('pierce')) {
    value += Math.max(0, damage - defender.currentHealth) * NEXUS_DAMAGE_WEIGHT;
  }
  return value;
};

/**
 * Cuánto vale cada punto de daño al Nexo frente a un intercambio de fichas.
 *
 * Valor calibrado a base de simular, no elegido a ojo: ver
 * `ai-strength-sim.test.ts`. Pesos altos (10-40) hacen que la difícil corra al
 * Nexo ignorando el tablero y PIERDA contra la normal (45-48%); por debajo de
 * 1 se estabiliza en un 57% de victorias. Un golpe letal se trata aparte, como
 * infinito, así que bajar este peso nunca le hace perder un remate.
 */
const NEXUS_DAMAGE_WEIGHT = 0.5;

interface AttackPlan {
  readonly action: GameAction;
  readonly value: number;
  /** Solo para desempatar de forma determinista. */
  readonly key: string;
}

/**
 * Plan de ataque de la IA difícil: mira todos los pares atacante-objetivo del
 * tablero de una vez, en lugar de recorrer sus fichas en orden fijo y lanzar
 * la primera que tenga algo a tiro.
 */
const chooseBestAttack = (state: MatchState, me: PlayerId): GameAction | undefined => {
  const enemy = state.players[rivalOf(me)];
  const plans: AttackPlan[] = [];
  for (const piece of state.board) {
    if (piece.owner !== me) continue;
    const attacks = getValidAttacks(state, piece.instanceId);
    if (attacks.canAttackNexus) {
      const damage = attackPower(piece);
      const lethal = damage >= enemy.nexusHealth;
      plans.push({
        action: { type: 'attack-nexus', playerId: me, attackerId: piece.instanceId },
        // Un golpe letal termina la partida: nada puede valer más que eso.
        value: lethal ? Number.POSITIVE_INFINITY : damage * NEXUS_DAMAGE_WEIGHT,
        key: `nexus-${piece.instanceId}`,
      });
    }
    for (const defenderId of attacks.pieceIds) {
      const defender = state.board.find((candidate) => candidate.instanceId === defenderId);
      if (!defender) continue;
      plans.push({
        action: { type: 'attack-piece', playerId: me, attackerId: piece.instanceId, defenderId },
        value: tradeValue(piece, defender),
        key: `piece-${piece.instanceId}-${defenderId}`,
      });
    }
  }
  // Siempre se ataca si hay con qué: se probó a que la difícil rechazara los
  // intercambios malos y salía perdiendo (45-50% frente al 57% de atacar
  // siempre). Quedarse quieta le regala el tempo al rival, y la ficha que
  // «salva» acaba muriendo igual un turno después. Lo que la hace fuerte no es
  // atacar menos, sino elegir mejor con qué ficha y contra cuál.
  const best = plans.sort((left, right) => right.value - left.value || left.key.localeCompare(right.key))[0];
  return best?.action;
};

const chooseMove = (state: MatchState, pieceId: string, me: PlayerId): Position | undefined => {
  const moves = getValidMoves(state, pieceId);
  const rival = rivalOf(me);
  return [...moves].sort((left, right) => {
    // Avanza hacia el Nexo rival y prefiere casillas con objetivos adyacentes.
    const leftDistance = distanceToEnemyNexusRow(me, left.y);
    const rightDistance = distanceToEnemyNexusRow(me, right.y);
    const leftTargets = state.board.filter((piece) => piece.owner === rival && Math.abs(piece.position.x - left.x) + Math.abs(piece.position.y - left.y) === 1).length;
    const rightTargets = state.board.filter((piece) => piece.owner === rival && Math.abs(piece.position.x - right.x) + Math.abs(piece.position.y - right.y) === 1).length;
    return rightTargets - leftTargets || leftDistance - rightDistance || left.x - right.x;
  })[0];
};

const actWithPiece = (state: MatchState, pieceId: string, me: PlayerId): MatchState => {
  let next = state;
  let attacks = getValidAttacks(next, pieceId);
  if (attacks.canAttackNexus) {
    const result = applyAction(next, { type: 'attack-nexus', playerId: me, attackerId: pieceId });
    return result.ok ? result.state : next;
  }
  if (attacks.pieceIds.length > 0) {
    const targetId = [...attacks.pieceIds].sort(
      (left, right) => targetScore(next, right) - targetScore(next, left) || left.localeCompare(right),
    )[0];
    if (targetId) {
      const result = applyAction(next, { type: 'attack-piece', playerId: me, attackerId: pieceId, defenderId: targetId });
      return result.ok ? result.state : next;
    }
  }
  const move = chooseMove(next, pieceId, me);
  if (move) {
    const result = applyAction(next, { type: 'move', playerId: me, pieceId, to: move });
    if (result.ok) next = result.state;
  }
  attacks = getValidAttacks(next, pieceId);
  if (attacks.canAttackNexus) {
    const result = applyAction(next, { type: 'attack-nexus', playerId: me, attackerId: pieceId });
    return result.ok ? result.state : next;
  }
  const targetId = [...attacks.pieceIds].sort(
    (left, right) => targetScore(next, right) - targetScore(next, left) || left.localeCompare(right),
  )[0];
  if (targetId) {
    const result = applyAction(next, { type: 'attack-piece', playerId: me, attackerId: pieceId, defenderId: targetId });
    if (result.ok) next = result.state;
  }
  return next;
};

/**
 * Decide la SIGUIENTE acción individual de la IA para el estado actual.
 * Permite reproducir el turno rival paso a paso, con una animación por acción.
 * Devuelve siempre una acción legal según las validaciones locales; si no queda
 * nada útil por hacer, devuelve el fin de turno.
 */
export const chooseNextAiAction = (
  state: MatchState,
  skippedCardIds: ReadonlySet<string> = new Set(),
  difficulty: AiDifficulty = 'normal',
  me: PlayerId = 'ai',
): GameAction => {
  const endTurn: GameAction = { type: 'end-turn', playerId: me };
  if (state.activePlayer !== me || state.phase === 'finished') return endTurn;

  const resource = state.players[me].hand.find((instance) => CARD_BY_ID[instance.cardId]?.type === 'mana');
  if (resource && !state.players[me].resourcePlayedThisTurn && !skippedCardIds.has(resource.instanceId)) {
    return { type: 'play-resource', playerId: me, cardInstanceId: resource.instanceId };
  }

  const cardAction = chooseCardAction(state, skippedCardIds, me);
  if (cardAction) return cardAction;

  // En difícil el combate se decide mirando el tablero entero de una vez y
  // eligiendo el mejor intercambio, no ficha por ficha en orden fijo.
  if (difficulty === 'hard') {
    const best = chooseBestAttack(state, me);
    if (best) return best;
  }

  const pieces = state.board
    .filter((piece) => piece.owner === me)
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  if (difficulty !== 'hard') {
    for (const piece of pieces) {
      const attacks = getValidAttacks(state, piece.instanceId);
      // En fácil la IA no remata el Nexo: pelea en el tablero y deja respirar al jugador.
      if (attacks.canAttackNexus && difficulty !== 'easy') {
        return { type: 'attack-nexus', playerId: me, attackerId: piece.instanceId };
      }
      if (attacks.pieceIds.length > 0) {
        const targetId = [...attacks.pieceIds].sort(
          (left, right) => targetScore(state, right) - targetScore(state, left) || left.localeCompare(right),
        )[0];
        if (targetId) {
          return { type: 'attack-piece', playerId: me, attackerId: piece.instanceId, defenderId: targetId };
        }
      }
    }
  }
  for (const piece of pieces) {
    if (piece.movedThisTurn) continue;
    const move = chooseMove(state, piece.instanceId, me);
    if (move) return { type: 'move', playerId: me, pieceId: piece.instanceId, to: move };
  }
  return endTurn;
};

/** Runs a complete, bounded and deterministic AI turn, always yielding control when possible. */
export const runAiTurn = (state: MatchState, me: PlayerId = 'ai'): MatchState => {
  if (state.activePlayer !== me || state.phase === 'finished') return state;
  let next = state;
  let actions = 0;
  const resource = next.players[me].hand.find((instance) => CARD_BY_ID[instance.cardId]?.type === 'mana');
  if (resource && !next.players[me].resourcePlayedThisTurn) {
    const result = applyAction(next, { type: 'play-resource', playerId: me, cardInstanceId: resource.instanceId });
    if (result.ok) {
      next = result.state;
      actions += 1;
    }
  }

  const skipped = new Set<string>();
  while (actions < MAX_AI_ACTIONS && next.phase !== 'finished') {
    const action = chooseCardAction(next, skipped, me);
    if (!action || action.type !== 'play-card') break;
    const result = applyAction(next, action);
    if (!result.ok) {
      skipped.add(action.cardInstanceId);
    } else {
      next = result.state;
      actions += 1;
    }
  }

  const pieceIds = next.board
    .filter((piece) => piece.owner === me)
    .map((piece) => piece.instanceId)
    .sort();
  for (const pieceId of pieceIds) {
    if (actions >= MAX_AI_ACTIONS || next.phase === 'finished') break;
    const before = next;
    next = actWithPiece(next, pieceId, me);
    if (next !== before) actions += 1;
  }
  if (next.phase === 'finished') return next;
  const ended = applyAction(next, { type: 'end-turn', playerId: me });
  return ended.ok ? ended.state : next;
};
