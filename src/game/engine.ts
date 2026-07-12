import { BOARD_SIZE, deploymentRow, isInsideBoard, nexusRow } from './board';
import { CARD_BY_ID } from './cards';
import { COMMANDER_BY_ID, expandDeck } from './decks';
import { payMana, restoreMana } from './mana';
import type { ManaCost } from './types';
import { deriveSeed, shuffleSeeded } from './random';
import { validateDeck } from './deck-validation';
import type {
  ActionResult,
  AnimationEvent,
  BoardPiece,
  CardDefinition,
  CardInstance,
  DeckDefinition,
  GameAction,
  GameErrorCode,
  MatchState,
  PlayerId,
  PlayerState,
  Position,
  SpellTarget,
} from './types';

export const OPENING_HAND_SIZE = 5;

export interface ValidAttacks {
  readonly pieceIds: readonly string[];
  readonly canAttackNexus: boolean;
}

type AnimationDraft = Omit<AnimationEvent, 'id'>;

const opponentOf = (playerId: PlayerId): PlayerId => (playerId === 'player' ? 'ai' : 'player');
const distance = (from: Position, to: Position): number =>
  Math.abs(from.x - to.x) + Math.abs(from.y - to.y);

const withPlayer = (state: MatchState, playerId: PlayerId, player: PlayerState): MatchState => ({
  ...state,
  players: { ...state.players, [playerId]: player },
});

const enqueue = (state: MatchState, ...drafts: readonly AnimationDraft[]): MatchState => {
  let nextId = state.nextId;
  const events = drafts.map((draft) => ({ ...draft, id: `event-${nextId++}` }));
  return { ...state, nextId, animations: [...state.animations, ...events] };
};

const fail = (state: MatchState, code: GameErrorCode, message: string): ActionResult => ({
  ok: false,
  state,
  error: { code, message },
});

const success = (state: MatchState): ActionResult => ({ ok: true, state });

const instantiateDeck = (
  deck: DeckDefinition,
  playerId: PlayerId,
): readonly CardInstance[] =>
  expandDeck(deck).map((cardId, index) => ({
    cardId,
    instanceId: `${playerId}-card-${index + 1}`,
  }));

const createPlayer = (
  id: PlayerId,
  deck: DeckDefinition,
  seed: number,
): PlayerState => {
  const commander = COMMANDER_BY_ID[deck.commanderId];
  if (!commander) throw new Error(`Comandante desconocido: ${deck.commanderId}`);
  const shuffled = shuffleSeeded(instantiateDeck(deck, id), seed);
  return {
    id,
    commanderId: commander.id,
    nexusHealth: commander.nexusHealth,
    hand: shuffled.slice(0, OPENING_HAND_SIZE),
    deck: shuffled.slice(OPENING_HAND_SIZE),
    discard: [],
    resources: [],
    resourcePlayedThisTurn: false,
    spellsCastThisTurn: 0,
    towerLootUsedThisTurn: false,
    forgeBuffUsedThisTurn: false,
    nexusDamagedThisTurn: false,
    unitDiscountPending: false,
    mulliganTaken: false,
    stats: { cardsPlayed: 0, damageDealt: 0 },
  };
};

/** Creates a deterministic match. Same decks + seed always produce the same opening hands. */
export const createMatch = (
  playerDeck: DeckDefinition,
  aiDeck: DeckDefinition,
  seed: number,
): MatchState => {
  const playerValidation = validateDeck(playerDeck);
  const aiValidation = validateDeck(aiDeck);
  if (!playerValidation.valid || !aiValidation.valid) {
    const reasons = [...playerValidation.issues, ...aiValidation.issues].map((issue) => issue.message);
    throw new Error(`No se puede iniciar una partida con mazos inválidos: ${reasons.join(' ')}`);
  }
  return {
    seed: Math.trunc(seed) >>> 0,
    nextId: 1,
    activePlayer: 'player',
    turn: 1,
    phase: 'main',
    players: {
      player: createPlayer('player', playerDeck, deriveSeed(seed, 1)),
      ai: createPlayer('ai', aiDeck, deriveSeed(seed, 2)),
    },
    board: [],
    tileEffects: [],
    animations: [],
    startedAtTurn: 1,
  };
};

const drawInternal = (state: MatchState, playerId: PlayerId): MatchState => {
  const player = state.players[playerId];
  const card = player.deck[0];
  if (!card) return state;
  const next = withPlayer(state, playerId, {
    ...player,
    deck: player.deck.slice(1),
    hand: [...player.hand, card],
  });
  return enqueue(next, {
    type: 'draw', actorId: playerId, targetId: card.instanceId, effectId: 'draw-card', durationMs: 240,
  });
};

export const drawCard = (state: MatchState, playerId: PlayerId = state.activePlayer): ActionResult => {
  if (state.phase === 'finished') return fail(state, 'game-finished', 'La partida ya ha terminado.');
  if (playerId !== state.activePlayer) return fail(state, 'wrong-turn', 'Solo roba el jugador activo.');
  if (state.phase !== 'draw') return fail(state, 'wrong-phase', 'Solo se roba durante la fase de robo.');
  return success({ ...drawInternal(state, playerId), phase: 'main' });
};

/** Applies the ordering chosen after a scry event to the currently revealed top cards. */
export const reorderTopCards = (
  state: MatchState,
  playerId: PlayerId,
  orderedInstanceIds: readonly string[],
): ActionResult => {
  const player = state.players[playerId];
  const revealed = player.deck.slice(0, orderedInstanceIds.length);
  const expectedIds = new Set(revealed.map((card) => card.instanceId));
  const chosenIds = new Set(orderedInstanceIds);
  if (
    orderedInstanceIds.length === 0 ||
    chosenIds.size !== orderedInstanceIds.length ||
    expectedIds.size !== chosenIds.size ||
    orderedInstanceIds.some((id) => !expectedIds.has(id))
  ) {
    return fail(state, 'card-not-found', 'El orden elegido no coincide con las cartas observadas.');
  }
  const byId = new Map(revealed.map((card) => [card.instanceId, card]));
  const ordered = orderedInstanceIds.map((id) => byId.get(id)).filter((card): card is CardInstance => Boolean(card));
  return success(withPlayer(state, playerId, {
    ...player,
    deck: [...ordered, ...player.deck.slice(ordered.length)],
  }));
};

const pieceDefinition = (piece: BoardPiece): CardDefinition | undefined => CARD_BY_ID[piece.cardId];
const pieceAt = (state: MatchState, position: Position): BoardPiece | undefined =>
  state.board.find((piece) => piece.position.x === position.x && piece.position.y === position.y);
const isFrozen = (state: MatchState, piece: BoardPiece): boolean =>
  piece.statuses.some((status) => status.kind === 'frozen' && status.expiresOnTurn > state.turn);

const pathIsClear = (
  state: MatchState,
  from: Position,
  to: Position,
  ignoredPieceId?: string,
): boolean => {
  if (from.x !== to.x && from.y !== to.y) return false;
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  let x = from.x + dx;
  let y = from.y + dy;
  while (x !== to.x || y !== to.y) {
    if (state.board.some((piece) => piece.instanceId !== ignoredPieceId && piece.position.x === x && piece.position.y === y)) {
      return false;
    }
    x += dx;
    y += dy;
  }
  return true;
};

const canMovePiece = (state: MatchState, piece: BoardPiece, to: Position): boolean => {
  const definition = pieceDefinition(piece);
  if (!definition || definition.type !== 'unit' || piece.owner !== state.activePlayer) return false;
  if (piece.movedThisTurn || isFrozen(state, piece) || !isInsideBoard(to) || pieceAt(state, to)) return false;
  if (piece.enteredOnTurn === state.turn && !definition.keywords.includes('impulse')) return false;
  const movement = definition.movement ?? 1;
  const travel = distance(piece.position, to);
  return travel > 0 && travel <= movement && pathIsClear(state, piece.position, to, piece.instanceId);
};

export const getValidMoves = (state: MatchState, pieceId: string): readonly Position[] => {
  const piece = state.board.find((candidate) => candidate.instanceId === pieceId);
  if (!piece || state.phase === 'finished') return [];
  const positions: Position[] = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const to = { x, y };
      if (canMovePiece(state, piece, to)) positions.push(to);
    }
  }
  return positions;
};

const canAttackPiece = (state: MatchState, attacker: BoardPiece, defender: BoardPiece): boolean => {
  const definition = pieceDefinition(attacker);
  if (!definition || definition.type !== 'unit' || attacker.owner !== state.activePlayer) return false;
  if (attacker.owner === defender.owner || attacker.attackedThisTurn || isFrozen(state, attacker)) return false;
  if (attacker.enteredOnTurn === state.turn && !definition.keywords.includes('swift-strike')) return false;
  const range = definition.range ?? 1;
  const targetDistance = distance(attacker.position, defender.position);
  return targetDistance > 0 && targetDistance <= range && pathIsClear(state, attacker.position, defender.position, attacker.instanceId);
};

const canAttackEnemyNexus = (state: MatchState, attacker: BoardPiece): boolean => {
  const definition = pieceDefinition(attacker);
  if (!definition || definition.type !== 'unit' || attacker.owner !== state.activePlayer) return false;
  if (attacker.attackedThisTurn || isFrozen(state, attacker)) return false;
  if (attacker.enteredOnTurn === state.turn && !definition.keywords.includes('swift-strike')) return false;
  const enemy = opponentOf(attacker.owner);
  const target = { x: attacker.position.x, y: nexusRow(enemy) };
  const range = definition.range ?? 1;
  return distance(attacker.position, target) <= range && pathIsClear(state, attacker.position, target, attacker.instanceId);
};

export const getValidAttacks = (state: MatchState, pieceId: string): ValidAttacks => {
  const attacker = state.board.find((piece) => piece.instanceId === pieceId);
  if (!attacker || state.phase === 'finished') return { pieceIds: [], canAttackNexus: false };
  return {
    pieceIds: state.board
      .filter((defender) => canAttackPiece(state, attacker, defender))
      .map((defender) => defender.instanceId),
    canAttackNexus: canAttackEnemyNexus(state, attacker),
  };
};

export const getValidDeploymentPositions = (
  state: MatchState,
  playerId: PlayerId,
): readonly Position[] => {
  const row = deploymentRow(playerId);
  return Array.from({ length: BOARD_SIZE }, (_, x) => ({ x, y: row })).filter(
    (position) => !pieceAt(state, position),
  );
};

const updatePiece = (
  state: MatchState,
  pieceId: string,
  transform: (piece: BoardPiece) => BoardPiece,
): MatchState => ({
  ...state,
  board: state.board.map((piece) => (piece.instanceId === pieceId ? transform(piece) : piece)),
});

const damagePiece = (
  state: MatchState,
  pieceId: string,
  amount: number,
  sourceOwner?: PlayerId,
  effectId = 'impact',
): MatchState => {
  const target = state.board.find((piece) => piece.instanceId === pieceId);
  if (!target || amount <= 0) return state;
  const targetDefinition = pieceDefinition(target);
  const reduction = targetDefinition?.effects.find(
    (effect) => effect.kind === 'passive' && effect.id === 'first-damage-reduction',
  );
  let reducedBy = 0;
  if (reduction?.kind === 'passive' && target.reductionUsedOnTurn !== state.turn) {
    reducedBy = Math.min(amount, reduction.value ?? 1);
  }
  const finalAmount = amount - reducedBy;
  let next: MatchState =
    reducedBy > 0
      ? updatePiece(state, pieceId, (piece) => ({ ...piece, reductionUsedOnTurn: state.turn }))
      : state;
  if (reducedBy > 0) {
    next = enqueue(next, {
      type: 'shield', targetId: pieceId, to: target.position, amount: reducedBy, effectId: 'water-shield', durationMs: 260,
    });
  }
  if (finalAmount <= 0) return next;
  next = {
    ...next,
    board: next.board.map((piece) =>
      piece.instanceId === pieceId ? { ...piece, currentHealth: piece.currentHealth - finalAmount } : piece,
    ),
  };
  if (sourceOwner) {
    const source = next.players[sourceOwner];
    next = withPlayer(next, sourceOwner, {
      ...source,
      stats: { ...source.stats, damageDealt: source.stats.damageDealt + finalAmount },
    });
  }
  next = enqueue(next, {
    type: 'damage', targetId: pieceId, to: target.position, amount: finalAmount, effectId, durationMs: 300,
  });
  if (target.currentHealth - finalAmount <= 0) {
    const owner = next.players[target.owner];
    next = withPlayer(
      { ...next, board: next.board.filter((piece) => piece.instanceId !== pieceId) },
      target.owner,
      { ...owner, discard: [...owner.discard, { instanceId: target.instanceId, cardId: target.cardId }] },
    );
    const definition = pieceDefinition(target);
    next = enqueue(next, {
      type: 'destroy', targetId: pieceId, to: target.position, effectId: definition?.vfx.deathEffect ?? 'card-destroy', durationMs: 420,
    });
  }
  return next;
};

const addStatus = (
  state: MatchState,
  pieceId: string,
  duration: number,
): MatchState => {
  const target = state.board.find((piece) => piece.instanceId === pieceId);
  if (!target) return state;
  const expiresOnTurn = state.turn + Math.max(1, duration) * 2;
  let next = updatePiece(state, pieceId, (piece) => ({
    ...piece,
    statuses: [{ kind: 'frozen', expiresOnTurn }],
  }));
  next = enqueue(next, { type: 'freeze', targetId: pieceId, to: target.position, effectId: 'freeze-lock', durationMs: 360 });
  return next;
};

const requireTargetPiece = (
  state: MatchState,
  target: SpellTarget | undefined,
): BoardPiece | undefined =>
  target?.kind === 'piece'
    ? state.board.find((piece) => piece.instanceId === target.pieceId)
    : undefined;

const spellNeedsPiece = (card: CardDefinition): boolean =>
  card.effects.some(
    (effect) =>
      effect.kind === 'damage' ||
      effect.kind === 'freeze' ||
      effect.kind === 'scorch' ||
      effect.kind === 'refresh-move' ||
      (effect.kind === 'passive' && effect.id === 'target-attack-until-end'),
  );

const resolveDrawAndDiscard = (
  state: MatchState,
  playerId: PlayerId,
  draw: number,
  discard: number,
): MatchState => {
  let next = state;
  for (let index = 0; index < draw; index += 1) next = drawInternal(next, playerId);
  if (discard <= 0) return next;
  const player = next.players[playerId];
  const discardCount = Math.min(discard, player.hand.length);
  const discarded = player.hand.slice(0, discardCount);
  return withPlayer(next, playerId, {
    ...player,
    hand: player.hand.slice(discardCount),
    discard: [...player.discard, ...discarded],
  });
};

const resolveSpell = (
  state: MatchState,
  caster: PlayerId,
  card: CardDefinition,
  target: SpellTarget | undefined,
): MatchState => {
  let next = state;
  const initialTarget = requireTargetPiece(next, target);
  const frozenAtCast = initialTarget ? isFrozen(next, initialTarget) : false;
  let draws = 0;
  let discards = 0;
  for (const effect of card.effects) {
    const targetPiece = requireTargetPiece(next, target);
    if (effect.kind === 'damage' && targetPiece) {
      const bonus = frozenAtCast
        ? card.effects.find((candidate) => candidate.kind === 'passive' && candidate.id === 'frozen-bonus-damage')
        : undefined;
      const bonusDamage = bonus?.kind === 'passive' ? bonus.value ?? 0 : 0;
      next = damagePiece(next, targetPiece.instanceId, effect.amount + bonusDamage, caster, card.vfx.impactEffect);
    } else if (effect.kind === 'freeze' && targetPiece) {
      next = addStatus(next, targetPiece.instanceId, effect.duration);
    } else if (effect.kind === 'scorch' && initialTarget) {
      const expiresOnTurn = state.turn + Math.max(1, effect.duration) * 2;
      next = {
        ...next,
        tileEffects: [
          ...next.tileEffects.filter(
            (tile) => tile.position.x !== initialTarget.position.x || tile.position.y !== initialTarget.position.y,
          ),
          { kind: 'scorched', position: initialTarget.position, sourceOwner: caster, expiresOnTurn },
        ],
      };
    } else if (effect.kind === 'draw') {
      draws += effect.amount;
    } else if (effect.kind === 'discard') {
      discards += effect.amount;
    } else if (effect.kind === 'scry') {
      next = enqueue(next, {
        type: 'spell', actorId: caster, amount: effect.amount, effectId: 'scry-top-cards', durationMs: 300,
      });
    } else if (effect.kind === 'heal-nexus') {
      const player = next.players[caster];
      const maximum = COMMANDER_BY_ID[player.commanderId]?.nexusHealth ?? 25;
      next = withPlayer(next, caster, { ...player, nexusHealth: Math.min(maximum, player.nexusHealth + effect.amount) });
    } else if (effect.kind === 'refresh-move' && targetPiece?.owner === caster) {
      next = updatePiece(next, targetPiece.instanceId, (piece) => ({
        ...piece,
        movedThisTurn: false,
        enteredOnTurn: Math.min(piece.enteredOnTurn, state.turn - 1),
      }));
      next = enqueue(next, {
        type: 'spell', targetId: targetPiece.instanceId, effectId: 'astral-refresh', durationMs: 320,
      });
    } else if (effect.kind === 'splash-weakest-enemy') {
      const enemy = opponentOf(caster);
      const candidates = next.board
        .filter(
          (piece) =>
            piece.owner === enemy &&
            piece.instanceId !== initialTarget?.instanceId &&
            pieceDefinition(piece)?.type === 'unit',
        )
        .sort(
          (left, right) =>
            left.currentHealth - right.currentHealth || left.instanceId.localeCompare(right.instanceId),
        );
      const weakest = candidates[0];
      if (weakest) {
        next = damagePiece(next, weakest.instanceId, effect.amount, caster, card.vfx.impactEffect);
      }
    } else if (effect.kind === 'passive' && effect.id === 'target-attack-until-end' && targetPiece?.owner === caster) {
      next = updatePiece(next, targetPiece.instanceId, (piece) => ({
        ...piece,
        attackModifier: piece.attackModifier + (effect.value ?? 0),
      }));
    }
  }
  return resolveDrawAndDiscard(next, caster, draws, discards);
};

const resolveEntryEffects = (state: MatchState, piece: BoardPiece, card: CardDefinition): MatchState => {
  let next = state;
  for (const effect of card.effects) {
    if (effect.kind === 'adjacent-damage') {
      const targets = next.board.filter(
        (candidate) =>
          candidate.instanceId !== piece.instanceId &&
          distance(candidate.position, piece.position) === 1 &&
          (effect.includeAllies || candidate.owner !== piece.owner),
      );
      for (const target of targets) {
        next = damagePiece(next, target.instanceId, effect.amount, piece.owner, card.vfx.impactEffect);
      }
    } else if (effect.kind === 'draw') {
      next = resolveDrawAndDiscard(next, piece.owner, effect.amount, 0);
    } else if (effect.kind === 'scry') {
      next = enqueue(next, {
        type: 'spell', actorId: piece.owner, targetId: piece.instanceId,
        amount: effect.amount, effectId: 'scry-top-cards', durationMs: 300,
      });
    } else if (effect.kind === 'passive' && effect.id === 'entry-adjacent-enemy-damage') {
      const target = next.board.find(
        (candidate) => candidate.owner !== piece.owner && distance(candidate.position, piece.position) === 1,
      );
      if (target) next = damagePiece(next, target.instanceId, effect.value ?? 1, piece.owner, card.vfx.impactEffect);
    }
  }
  const discardEffect = card.effects.find((effect) => effect.kind === 'discard');
  if (discardEffect?.kind === 'discard') {
    next = resolveDrawAndDiscard(next, piece.owner, 0, discardEffect.amount);
  }
  return next;
};

const validateTurn = (state: MatchState, playerId: PlayerId): ActionResult | undefined => {
  if (state.phase === 'finished') return fail(state, 'game-finished', 'La partida ya ha terminado.');
  if (state.activePlayer !== playerId) return fail(state, 'wrong-turn', 'No es el turno de ese jugador.');
  if (state.phase !== 'main' && state.phase !== 'combat') {
    return fail(state, 'wrong-phase', 'La acción no está disponible en esta fase.');
  }
  return undefined;
};

export const playResource = (
  state: MatchState,
  playerId: PlayerId,
  cardInstanceId: string,
): ActionResult => {
  const turnError = validateTurn(state, playerId);
  if (turnError) return turnError;
  const player = state.players[playerId];
  if (player.resourcePlayedThisTurn) {
    return fail(state, 'resource-already-played', 'Solo se puede jugar una fuente por turno.');
  }
  const instance = player.hand.find((card) => card.instanceId === cardInstanceId);
  if (!instance) return fail(state, 'card-not-found', 'La carta no está en la mano.');
  const card = CARD_BY_ID[instance.cardId];
  if (!card || card.type !== 'mana') return fail(state, 'invalid-card-type', 'La carta no es una fuente de Esencia.');
  let next = withPlayer(state, playerId, {
    ...player,
    hand: player.hand.filter((candidate) => candidate.instanceId !== cardInstanceId),
    resources: [
      ...player.resources,
      { instanceId: instance.instanceId, cardId: card.id, faction: card.faction, exhausted: false },
    ],
    resourcePlayedThisTurn: true,
    stats: { ...player.stats, cardsPlayed: player.stats.cardsPlayed + 1 },
  });
  next = enqueue(next, {
    type: 'resource', actorId: playerId, targetId: instance.instanceId,
    effectId: card.vfx.persistentEffect, durationMs: 320,
  });
  return success(next);
};

const cardTargetIsValid = (
  state: MatchState,
  playerId: PlayerId,
  card: CardDefinition,
  target: SpellTarget | undefined,
): boolean => {
  if (!spellNeedsPiece(card)) return true;
  const piece = requireTargetPiece(state, target);
  if (!piece) return false;
  const damage = card.effects.find((effect) => effect.kind === 'damage');
  if (damage?.kind === 'damage' && damage.target === 'enemy-piece' && piece.owner === playerId) return false;
  if ((card.id === 'lluvia-ceniza' || card.effects.some((effect) => effect.kind === 'freeze')) && pieceDefinition(piece)?.type !== 'unit') return false;
  const friendlyBuff = card.effects.some(
    (effect) => effect.kind === 'passive' && effect.id === 'target-attack-until-end',
  );
  if (friendlyBuff && piece.owner !== playerId) return false;
  const refreshMove = card.effects.some((effect) => effect.kind === 'refresh-move');
  if (refreshMove && (piece.owner !== playerId || pieceDefinition(piece)?.type !== 'unit')) return false;
  return true;
};

/**
 * Coste efectivo de una carta tras aplicar descuentos activos:
 * Archivo Viviente (hechizos) y la pasiva de Kaela (unidades).
 */
export const effectiveCost = (
  state: MatchState,
  playerId: PlayerId,
  card: CardDefinition,
): ManaCost => {
  let generic = card.cost.generic;
  if (card.type === 'instant' || card.type === 'persistent') {
    for (const piece of state.board) {
      if (piece.owner !== playerId) continue;
      const discount = CARD_BY_ID[piece.cardId]?.effects.find(
        (effect) => effect.kind === 'passive' && effect.id === 'spell-generic-discount',
      );
      if (discount?.kind === 'passive') generic = Math.max(0, generic - (discount.value ?? 1));
    }
  }
  if (card.type === 'unit' && state.players[playerId].unitDiscountPending) {
    generic = Math.max(0, generic - 1);
  }
  return { generic, colored: card.cost.colored };
};

export const playCard = (
  state: MatchState,
  playerId: PlayerId,
  cardInstanceId: string,
  position?: Position,
  target?: SpellTarget,
): ActionResult => {
  const turnError = validateTurn(state, playerId);
  if (turnError) return turnError;
  const player = state.players[playerId];
  const instance = player.hand.find((card) => card.instanceId === cardInstanceId);
  if (!instance) return fail(state, 'card-not-found', 'La carta no está en la mano.');
  const card = CARD_BY_ID[instance.cardId];
  if (!card) return fail(state, 'card-not-found', 'La definición de la carta no existe.');
  if (card.type === 'mana') return fail(state, 'invalid-card-type', 'Usa la acción de jugar fuente.');
  if (card.type === 'relic') return fail(state, 'invalid-card-type', 'Las reliquias aún no son jugables.');

  const isPiece = card.type === 'unit' || card.type === 'structure';
  if (isPiece) {
    if (!position) return fail(state, 'position-required', 'Debes elegir una casilla de despliegue.');
    if (!isInsideBoard(position)) return fail(state, 'out-of-bounds', 'La casilla está fuera del tablero.');
    if (position.y !== deploymentRow(playerId)) {
      return fail(state, 'out-of-bounds', 'Solo puedes desplegar en tu fila inicial.');
    }
    if (pieceAt(state, position)) return fail(state, 'occupied', 'La casilla ya está ocupada.');
  } else if (!cardTargetIsValid(state, playerId, card, target)) {
    return fail(state, 'target-required', 'El hechizo necesita un objetivo válido.');
  }

  const cost = effectiveCost(state, playerId, card);
  const payment = payMana(player.resources, cost);
  if (!payment.plan.payable) return fail(state, 'insufficient-mana', 'No hay Esencia disponible suficiente.');
  const receivesForgeBuff =
    card.type === 'unit' &&
    !player.forgeBuffUsedThisTurn &&
    state.board.some((piece) => piece.owner === playerId && piece.cardId === 'forja-carmesi');
  const usedUnitDiscount =
    card.type === 'unit' && player.unitDiscountPending && card.cost.generic > 0;
  let nextPlayer: PlayerState = {
    ...player,
    hand: player.hand.filter((candidate) => candidate.instanceId !== cardInstanceId),
    resources: payment.resources,
    spellsCastThisTurn:
      card.type === 'instant' || card.type === 'persistent'
        ? player.spellsCastThisTurn + 1
        : player.spellsCastThisTurn,
    forgeBuffUsedThisTurn: player.forgeBuffUsedThisTurn || receivesForgeBuff,
    unitDiscountPending: player.unitDiscountPending && !usedUnitDiscount,
    stats: { ...player.stats, cardsPlayed: player.stats.cardsPlayed + 1 },
  };
  let next = withPlayer(state, playerId, nextPlayer);
  if (payment.plan.resourceIds.length > 0) {
    next = enqueue(next, {
      type: 'mana-flow', actorId: playerId, targetId: cardInstanceId,
      amount: payment.plan.resourceIds.length, effectId: `${card.faction}-mana-flow`, durationMs: 280,
    });
  }

  if (isPiece && position) {
    const maximumHealth = card.type === 'unit' ? card.health : card.resistance;
    if (maximumHealth === undefined) return fail(state, 'invalid-card-type', 'La carta no tiene resistencia válida.');
    const piece: BoardPiece = {
      instanceId: instance.instanceId,
      cardId: card.id,
      owner: playerId,
      position,
      currentHealth: maximumHealth,
      attackModifier: receivesForgeBuff ? 1 : 0,
      movedThisTurn: false,
      attackedThisTurn: false,
      enteredOnTurn: state.turn,
      statuses: [],
    };
    next = { ...next, board: [...next.board, piece] };
    next = enqueue(next, {
      type: 'summon', actorId: playerId, targetId: piece.instanceId, to: position,
      effectId: card.vfx.summonEffect, durationMs: 440,
    });
    next = resolveEntryEffects(next, piece, card);
  } else {
    nextPlayer = next.players[playerId];
    next = withPlayer(next, playerId, {
      ...nextPlayer,
      discard: [...nextPlayer.discard, instance],
    });
    const spellTargetPiece = requireTargetPiece(next, target);
    next = enqueue(next, {
      type: 'spell', actorId: playerId, targetId: target?.kind === 'piece' ? target.pieceId : undefined,
      to: spellTargetPiece?.position,
      effectId: card.vfx.impactEffect ?? card.vfx.persistentEffect, durationMs: 420,
    });
    next = resolveSpell(next, playerId, card, target);
    const afterSpell = next.players[playerId];
    const hasTower = next.board.some(
      (piece) => piece.owner === playerId && piece.cardId === 'torre-horizonte',
    );
    if (hasTower && !afterSpell.towerLootUsedThisTurn) {
      next = withPlayer(next, playerId, { ...afterSpell, towerLootUsedThisTurn: true });
      next = resolveDrawAndDiscard(next, playerId, 1, 1);
      next = enqueue(next, {
        type: 'spell', actorId: playerId, effectId: 'horizon-loot', durationMs: 300,
      });
    }
    const commander = COMMANDER_BY_ID[next.players[playerId].commanderId];
    if (commander?.id === 'oriel-custodio-septima-runa' && next.players[playerId].spellsCastThisTurn === 2) {
      const topCard = next.players[playerId].deck[0];
      if (topCard) {
        next = enqueue(next, {
          type: 'reveal', actorId: playerId, targetId: topCard.instanceId,
          amount: 1, effectId: 'commander-scry', durationMs: 900,
        });
      }
    }
  }
  return success(next);
};

export const movePiece = (
  state: MatchState,
  playerId: PlayerId,
  pieceId: string,
  to: Position,
): ActionResult => {
  const turnError = validateTurn(state, playerId);
  if (turnError) return turnError;
  const piece = state.board.find((candidate) => candidate.instanceId === pieceId);
  if (!piece) return fail(state, 'piece-not-found', 'La unidad no existe.');
  if (piece.owner !== playerId) return fail(state, 'not-owner', 'No controlas esa unidad.');
  if (!canMovePiece(state, piece, to)) return fail(state, 'cannot-move', 'La unidad no puede moverse a esa casilla.');
  let next = updatePiece(state, pieceId, (candidate) => ({ ...candidate, position: to, movedThisTurn: true }));
  next = enqueue(next, {
    type: 'move', actorId: pieceId, from: piece.position, to, effectId: 'card-slide', durationMs: 360,
  });
  return success(next);
};

export const attackPiece = (
  state: MatchState,
  playerId: PlayerId,
  attackerId: string,
  defenderId: string,
): ActionResult => {
  const turnError = validateTurn(state, playerId);
  if (turnError) return turnError;
  const attacker = state.board.find((piece) => piece.instanceId === attackerId);
  const defender = state.board.find((piece) => piece.instanceId === defenderId);
  if (!attacker || !defender) return fail(state, 'piece-not-found', 'El atacante o el objetivo no existe.');
  if (attacker.owner !== playerId) return fail(state, 'not-owner', 'No controlas al atacante.');
  if (!canAttackPiece(state, attacker, defender)) return fail(state, 'cannot-attack', 'El objetivo no está al alcance.');
  const card = pieceDefinition(attacker);
  if (!card || card.attack === undefined) return fail(state, 'cannot-attack', 'La carta no puede atacar.');
  const attackBuff = card.effects.find((effect) => effect.kind === 'buff-self-on-attack');
  const structureBonus = pieceDefinition(defender)?.type === 'structure'
    ? card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'structure-bonus-damage')
    : undefined;
  const amount = card.attack + attacker.attackModifier +
    (attackBuff?.kind === 'buff-self-on-attack' ? attackBuff.attack : 0) +
    (structureBonus?.kind === 'passive' ? structureBonus.value ?? 0 : 0);
  let next = updatePiece(state, attackerId, (piece) => ({ ...piece, attackedThisTurn: true }));
  next = enqueue(next, {
    type: 'attack', actorId: attackerId, targetId: defenderId,
    from: attacker.position, to: defender.position, effectId: card.vfx.attackEffect, durationMs: 380,
  });
  next = damagePiece(next, defenderId, amount, playerId, card.vfx.impactEffect);
  if (
    pieceDefinition(defender)?.type === 'unit' &&
    card.effects.some((effect) => effect.kind === 'passive' && effect.id === 'freeze-on-damage')
  ) {
    next = addStatus(next, defenderId, 1);
  }
  return success(next);
};

export const attackNexus = (
  state: MatchState,
  playerId: PlayerId,
  attackerId: string,
): ActionResult => {
  const turnError = validateTurn(state, playerId);
  if (turnError) return turnError;
  const attacker = state.board.find((piece) => piece.instanceId === attackerId);
  if (!attacker) return fail(state, 'piece-not-found', 'El atacante no existe.');
  if (attacker.owner !== playerId) return fail(state, 'not-owner', 'No controlas al atacante.');
  if (!canAttackEnemyNexus(state, attacker)) return fail(state, 'out-of-range', 'El Nexo no está al alcance.');
  const card = pieceDefinition(attacker);
  if (!card || card.attack === undefined) return fail(state, 'cannot-attack', 'La carta no puede atacar.');
  const attackBuff = card.effects.find((effect) => effect.kind === 'buff-self-on-attack');
  const amount = card.attack + attacker.attackModifier +
    (attackBuff?.kind === 'buff-self-on-attack' ? attackBuff.attack : 0);
  const enemyId = opponentOf(playerId);
  const enemy = state.players[enemyId];
  const source = state.players[playerId];
  const kaelaTriggers =
    COMMANDER_BY_ID[enemy.commanderId]?.id === 'kaela-corazon-caldera' && !enemy.nexusDamagedThisTurn;
  let next = updatePiece(state, attackerId, (piece) => ({ ...piece, attackedThisTurn: true }));
  next = withPlayer(next, enemyId, {
    ...enemy,
    nexusHealth: Math.max(0, enemy.nexusHealth - amount),
    nexusDamagedThisTurn: true,
    unitDiscountPending: enemy.unitDiscountPending || kaelaTriggers,
  });
  next = withPlayer(next, playerId, {
    ...source,
    stats: { ...source.stats, damageDealt: source.stats.damageDealt + amount },
  });
  next = enqueue(next, {
    type: 'attack', actorId: attackerId, targetId: `${enemyId}-nexus`,
    effectId: card.vfx.attackEffect, durationMs: 380,
  }, {
    type: 'nexus-damage', actorId: attackerId, targetId: `${enemyId}-nexus`, amount,
    effectId: card.vfx.impactEffect ?? `${card.faction}-nexus-impact`, durationMs: 440,
  });
  if (enemy.nexusHealth - amount <= 0) {
    next = { ...next, winner: playerId, phase: 'finished' };
    next = enqueue(next, {
      type: 'victory', actorId: playerId, targetId: `${enemyId}-nexus`, effectId: `${card.faction}-victory`, durationMs: 900,
    });
  }
  return success(next);
};

export const endTurn = (state: MatchState, playerId: PlayerId): ActionResult => {
  const turnError = validateTurn(state, playerId);
  if (turnError) return turnError;
  const nextPlayerId = opponentOf(playerId);
  const nextTurn = state.turn + 1;
  const incoming = state.players[nextPlayerId];
  const outgoing = state.players[playerId];
  let next: MatchState = {
    ...state,
    activePlayer: nextPlayerId,
    turn: nextTurn,
    phase: 'start',
    players: {
      ...state.players,
      [playerId]: {
        ...outgoing,
        resourcePlayedThisTurn: false,
        spellsCastThisTurn: 0,
        towerLootUsedThisTurn: false,
        forgeBuffUsedThisTurn: false,
        nexusDamagedThisTurn: false,
      },
      [nextPlayerId]: {
        ...incoming,
        resources: restoreMana(incoming.resources),
        resourcePlayedThisTurn: false,
        nexusDamagedThisTurn: false,
      },
    },
    board: state.board.map((piece) => ({
      ...piece,
      movedThisTurn: piece.owner === nextPlayerId ? false : piece.movedThisTurn,
      attackedThisTurn: piece.owner === nextPlayerId ? false : piece.attackedThisTurn,
      attackModifier: piece.owner === playerId ? 0 : piece.attackModifier,
      statuses: piece.statuses.filter((status) => status.expiresOnTurn > nextTurn),
    })),
    tileEffects: state.tileEffects.filter((tile) => tile.expiresOnTurn > nextTurn),
  };
  next = enqueue(next, {
    type: 'turn', actorId: nextPlayerId, effectId: 'turn-transition', durationMs: 400,
  });
  next = { ...next, phase: 'draw' };
  next = drawInternal(next, nextPlayerId);
  next = { ...next, phase: 'main' };
  return success(next);
};

export const mulliganOpeningHand = (
  state: MatchState,
  playerId: PlayerId,
  cardInstanceIds: readonly string[],
): ActionResult => {
  const player = state.players[playerId];
  const canMulligan = state.turn === 1 && state.board.length === 0 && player.stats.cardsPlayed === 0 && !player.mulliganTaken;
  if (!canMulligan) return fail(state, 'wrong-phase', 'El mulligan solo está disponible al comienzo de la partida.');
  const selected = new Set(cardInstanceIds);
  if (selected.size !== cardInstanceIds.length) {
    return fail(state, 'card-not-found', 'La selección de mulligan contiene cartas duplicadas.');
  }
  if (cardInstanceIds.some((id) => !player.hand.some((card) => card.instanceId === id))) {
    return fail(state, 'card-not-found', 'Una carta seleccionada no pertenece a la mano inicial.');
  }
  const kept = player.hand.filter((card) => !selected.has(card.instanceId));
  const returned = player.hand.filter((card) => selected.has(card.instanceId));
  const shuffled = shuffleSeeded(
    [...player.deck, ...returned],
    deriveSeed(state.seed, playerId === 'player' ? 31 + returned.length : 61 + returned.length),
  );
  const replacements = shuffled.slice(0, returned.length);
  return success(withPlayer(state, playerId, {
    ...player,
    hand: [...kept, ...replacements],
    deck: shuffled.slice(returned.length),
    mulliganTaken: true,
  }));
};

export const applyAction = (state: MatchState, action: GameAction): ActionResult => {
  switch (action.type) {
    case 'draw':
      return drawCard(state, action.playerId ?? state.activePlayer);
    case 'play-resource':
      return playResource(state, action.playerId, action.cardInstanceId);
    case 'play-card':
      return playCard(state, action.playerId, action.cardInstanceId, action.position, action.target);
    case 'move':
      return movePiece(state, action.playerId, action.pieceId, action.to);
    case 'attack-piece':
      return attackPiece(state, action.playerId, action.attackerId, action.defenderId);
    case 'attack-nexus':
      return attackNexus(state, action.playerId, action.attackerId);
    case 'end-turn':
      return endTurn(state, action.playerId);
  }
};

export const clearAnimationQueue = (state: MatchState): MatchState => ({ ...state, animations: [] });

export const shiftAnimationQueue = (
  state: MatchState,
): { readonly event?: AnimationEvent; readonly state: MatchState } => ({
  event: state.animations[0],
  state: { ...state, animations: state.animations.slice(1) },
});
