import { distanceToCenter, distanceToEnemyNexusRow } from './board';
import { CARD_BY_ID } from './cards';
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
  GameAction,
  MatchState,
  Position,
  SpellTarget,
} from './types';

const MAX_AI_ACTIONS = 64;

/** Nivel de la IA rival. Solo cambia su agresividad, no su validez de jugadas. */
export type AiDifficulty = 'easy' | 'normal' | 'hard';

const cardScore = (card: CardDefinition): number => {
  const cost = card.cost.generic + Object.values(card.cost.colored).reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const boardValue = (card.attack ?? 0) * 2 + (card.health ?? card.resistance ?? 0);
  const removalValue = card.effects.reduce(
    (sum, effect) => sum + (effect.kind === 'damage' ? effect.amount * 3 : effect.kind === 'freeze' ? 4 : effect.kind === 'draw' ? effect.amount * 2 : 0),
    0,
  );
  return boardValue + removalValue + cost + (card.unique ? 2 : 0);
};

const stableTieBreaker = (value: string, seed: number): number => {
  let hash = seed >>> 0;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16_777_619) >>> 0;
  return hash;
};

const chooseEnemyTarget = (state: MatchState, card: CardDefinition): BoardPiece | undefined => {
  const enemies = state.board.filter((piece) => piece.owner === 'player');
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

const targetForCard = (state: MatchState, card: CardDefinition): SpellTarget | undefined => {
  const refreshMove = card.effects.some((effect) => effect.kind === 'refresh-move');
  if (refreshMove) {
    const movedAlly = state.board
      .filter(
        (piece) =>
          piece.owner === 'ai' && piece.movedThisTurn && CARD_BY_ID[piece.cardId]?.type === 'unit',
      )
      .sort((left, right) => left.instanceId.localeCompare(right.instanceId))[0];
    return movedAlly ? { kind: 'piece', pieceId: movedAlly.instanceId } : undefined;
  }
  const friendlyBuff = card.effects.some(
    (effect) => effect.kind === 'passive' && effect.id === 'target-attack-until-end',
  );
  if (friendlyBuff) {
    const ally = state.board
      .filter((piece) => piece.owner === 'ai' && CARD_BY_ID[piece.cardId]?.type === 'unit')
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
  const target = chooseEnemyTarget(state, card);
  return target ? { kind: 'piece', pieceId: target.instanceId } : undefined;
};

const chooseDeployment = (state: MatchState): Position | undefined => {
  const positions = getValidDeploymentPositions(state, 'ai');
  if (positions.length === 0) return undefined;
  const enemyPieces = state.board.filter((piece) => piece.owner === 'player');
  return [...positions].sort((left, right) => {
    const proximity = (position: Position): number =>
      enemyPieces.length === 0
        ? distanceToCenter(position.x)
        : Math.min(...enemyPieces.map((piece) => Math.abs(position.x - piece.position.x)));
    return proximity(left) - proximity(right) || left.x - right.x;
  })[0];
};

const actionForCard = (state: MatchState, instance: CardInstance): GameAction | undefined => {
  const card = CARD_BY_ID[instance.cardId];
  if (!card || card.type === 'mana') return undefined;
  if (!planManaPayment(state.players.ai.resources, effectiveCost(state, 'ai', card)).payable) return undefined;
  if (card.type === 'unit' || card.type === 'structure') {
    const position = chooseDeployment(state);
    return position
      ? { type: 'play-card', playerId: 'ai', cardInstanceId: instance.instanceId, position }
      : undefined;
  }
  const target = targetForCard(state, card);
  const needsPiece = card.effects.some(
    (effect) =>
      effect.kind === 'damage' ||
      effect.kind === 'freeze' ||
      effect.kind === 'scorch' ||
      effect.kind === 'refresh-move' ||
      (effect.kind === 'passive' && effect.id === 'target-attack-until-end'),
  );
  if (needsPiece && (!target || target.kind !== 'piece')) return undefined;
  return { type: 'play-card', playerId: 'ai', cardInstanceId: instance.instanceId, target };
};

const chooseCardAction = (state: MatchState, skipped: ReadonlySet<string>): GameAction | undefined => {
  const candidates = state.players.ai.hand
    .filter((instance) => !skipped.has(instance.instanceId))
    .map((instance) => ({ instance, card: CARD_BY_ID[instance.cardId] }))
    .filter((candidate): candidate is { instance: CardInstance; card: CardDefinition } => Boolean(candidate.card))
    .sort((left, right) =>
      cardScore(right.card) - cardScore(left.card) ||
      stableTieBreaker(left.instance.instanceId, state.seed + state.turn) -
        stableTieBreaker(right.instance.instanceId, state.seed + state.turn),
    );
  for (const candidate of candidates) {
    const action = actionForCard(state, candidate.instance);
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

const chooseMove = (state: MatchState, pieceId: string): Position | undefined => {
  const moves = getValidMoves(state, pieceId);
  return [...moves].sort((left, right) => {
    // La IA avanza hacia el Nexo del jugador (fila BOARD_SIZE).
    const leftDistance = distanceToEnemyNexusRow('ai', left.y);
    const rightDistance = distanceToEnemyNexusRow('ai', right.y);
    const leftTargets = state.board.filter((piece) => piece.owner === 'player' && Math.abs(piece.position.x - left.x) + Math.abs(piece.position.y - left.y) === 1).length;
    const rightTargets = state.board.filter((piece) => piece.owner === 'player' && Math.abs(piece.position.x - right.x) + Math.abs(piece.position.y - right.y) === 1).length;
    return rightTargets - leftTargets || leftDistance - rightDistance || left.x - right.x;
  })[0];
};

const actWithPiece = (state: MatchState, pieceId: string): MatchState => {
  let next = state;
  let attacks = getValidAttacks(next, pieceId);
  if (attacks.canAttackNexus) {
    const result = applyAction(next, { type: 'attack-nexus', playerId: 'ai', attackerId: pieceId });
    return result.ok ? result.state : next;
  }
  if (attacks.pieceIds.length > 0) {
    const targetId = [...attacks.pieceIds].sort(
      (left, right) => targetScore(next, right) - targetScore(next, left) || left.localeCompare(right),
    )[0];
    if (targetId) {
      const result = applyAction(next, { type: 'attack-piece', playerId: 'ai', attackerId: pieceId, defenderId: targetId });
      return result.ok ? result.state : next;
    }
  }
  const move = chooseMove(next, pieceId);
  if (move) {
    const result = applyAction(next, { type: 'move', playerId: 'ai', pieceId, to: move });
    if (result.ok) next = result.state;
  }
  attacks = getValidAttacks(next, pieceId);
  if (attacks.canAttackNexus) {
    const result = applyAction(next, { type: 'attack-nexus', playerId: 'ai', attackerId: pieceId });
    return result.ok ? result.state : next;
  }
  const targetId = [...attacks.pieceIds].sort(
    (left, right) => targetScore(next, right) - targetScore(next, left) || left.localeCompare(right),
  )[0];
  if (targetId) {
    const result = applyAction(next, { type: 'attack-piece', playerId: 'ai', attackerId: pieceId, defenderId: targetId });
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
): GameAction => {
  const endTurn: GameAction = { type: 'end-turn', playerId: 'ai' };
  if (state.activePlayer !== 'ai' || state.phase === 'finished') return endTurn;

  const resource = state.players.ai.hand.find((instance) => CARD_BY_ID[instance.cardId]?.type === 'mana');
  if (resource && !state.players.ai.resourcePlayedThisTurn && !skippedCardIds.has(resource.instanceId)) {
    return { type: 'play-resource', playerId: 'ai', cardInstanceId: resource.instanceId };
  }

  const cardAction = chooseCardAction(state, skippedCardIds);
  if (cardAction) return cardAction;

  const pieces = state.board
    .filter((piece) => piece.owner === 'ai')
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  for (const piece of pieces) {
    const attacks = getValidAttacks(state, piece.instanceId);
    // En fácil la IA no remata el Nexo: pelea en el tablero y deja respirar al jugador.
    if (attacks.canAttackNexus && difficulty !== 'easy') {
      return { type: 'attack-nexus', playerId: 'ai', attackerId: piece.instanceId };
    }
    if (attacks.pieceIds.length > 0) {
      const targetId = [...attacks.pieceIds].sort(
        (left, right) => targetScore(state, right) - targetScore(state, left) || left.localeCompare(right),
      )[0];
      if (targetId) {
        return { type: 'attack-piece', playerId: 'ai', attackerId: piece.instanceId, defenderId: targetId };
      }
    }
  }
  for (const piece of pieces) {
    if (piece.movedThisTurn) continue;
    const move = chooseMove(state, piece.instanceId);
    if (move) return { type: 'move', playerId: 'ai', pieceId: piece.instanceId, to: move };
  }
  return endTurn;
};

/** Runs a complete, bounded and deterministic AI turn, always yielding control when possible. */
export const runAiTurn = (state: MatchState): MatchState => {
  if (state.activePlayer !== 'ai' || state.phase === 'finished') return state;
  let next = state;
  let actions = 0;
  const resource = next.players.ai.hand.find((instance) => CARD_BY_ID[instance.cardId]?.type === 'mana');
  if (resource && !next.players.ai.resourcePlayedThisTurn) {
    const result = applyAction(next, { type: 'play-resource', playerId: 'ai', cardInstanceId: resource.instanceId });
    if (result.ok) {
      next = result.state;
      actions += 1;
    }
  }

  const skipped = new Set<string>();
  while (actions < MAX_AI_ACTIONS && next.phase !== 'finished') {
    const action = chooseCardAction(next, skipped);
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
    .filter((piece) => piece.owner === 'ai')
    .map((piece) => piece.instanceId)
    .sort();
  for (const pieceId of pieceIds) {
    if (actions >= MAX_AI_ACTIONS || next.phase === 'finished') break;
    const before = next;
    next = actWithPiece(next, pieceId);
    if (next !== before) actions += 1;
  }
  if (next.phase === 'finished') return next;
  const ended = applyAction(next, { type: 'end-turn', playerId: 'ai' });
  return ended.ok ? ended.state : next;
};
