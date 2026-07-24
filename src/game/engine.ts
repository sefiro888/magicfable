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
    firstUnitDeployedThisTurn: false,
    fatigueStacks: 0,
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

/**
 * Fatiga: robar con el mazo vacío no se ignora. Cada intento cuenta una carga
 * más y esa cantidad de daño golpea el propio Nexo, así que dos jugadores
 * pasivos no alargan la partida indefinidamente.
 */
const applyFatigue = (state: MatchState, playerId: PlayerId): MatchState => {
  const player = state.players[playerId];
  const stacks = player.fatigueStacks + 1;
  const nexusHealth = Math.max(0, player.nexusHealth - stacks);
  let next = withPlayer(state, playerId, { ...player, fatigueStacks: stacks, nexusHealth });
  next = enqueue(next, {
    type: 'nexus-damage', actorId: playerId, targetId: `${playerId}-nexus`,
    amount: stacks, effectId: 'fatigue-exhaustion', durationMs: 420,
  });
  if (nexusHealth <= 0) {
    const winner = opponentOf(playerId);
    next = { ...next, winner, phase: 'finished' };
    next = enqueue(next, {
      type: 'victory', actorId: winner, targetId: `${playerId}-nexus`, effectId: 'fatigue-victory', durationMs: 900,
    });
  }
  return next;
};

const drawInternal = (state: MatchState, playerId: PlayerId): MatchState => {
  const player = state.players[playerId];
  const card = player.deck[0];
  if (!card) return applyFatigue(state, playerId);
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
  const drawn = drawInternal(state, playerId);
  return success(drawn.phase === 'finished' ? drawn : { ...drawn, phase: 'main' });
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

const hasKeyword = (piece: BoardPiece, keyword: 'guard' | 'flying' | 'impulse' | 'swift-strike'): boolean =>
  Boolean(pieceDefinition(piece)?.keywords.includes(keyword));

/**
 * Guardia: mientras una unidad enemiga esté adyacente a un Guardia, solo puede
 * atacar a ese Guardia (protege al resto de piezas y al Nexo). Devuelve el
 * conjunto de ids de Guardias enemigos adyacentes al atacante, si los hay.
 */
const adjacentEnemyGuards = (state: MatchState, attacker: BoardPiece): Set<string> => {
  const guards = new Set<string>();
  for (const piece of state.board) {
    if (piece.owner === attacker.owner) continue;
    if (distance(piece.position, attacker.position) === 1 && hasKeyword(piece, 'guard')) {
      guards.add(piece.instanceId);
    }
  }
  return guards;
};

/** Guardián Escarchado: las unidades enemigas adyacentes a él no pueden atacar. */
const isPacified = (state: MatchState, attacker: BoardPiece): boolean =>
  state.board.some(
    (piece) =>
      piece.owner !== attacker.owner &&
      distance(piece.position, attacker.position) === 1 &&
      pieceDefinition(piece)?.effects.some((effect) => effect.kind === 'passive' && effect.id === 'pacify-adjacent-enemies'),
  );

const canMovePiece = (state: MatchState, piece: BoardPiece, to: Position): boolean => {
  const definition = pieceDefinition(piece);
  if (!definition || definition.type !== 'unit' || piece.owner !== state.activePlayer) return false;
  if (piece.movedThisTurn || isFrozen(state, piece) || !isInsideBoard(to) || pieceAt(state, to)) return false;
  if (piece.enteredOnTurn === state.turn && !definition.keywords.includes('impulse')) return false;
  // Horror Abisal: ralentiza a los enemigos que atacó, sin bajar de 0.
  const movement = Math.max(0, (definition.movement ?? 1) - (piece.movementModifier ?? 0));
  const travel = distance(piece.position, to);
  if (travel <= 0 || travel > movement) return false;
  // Volador: ignora las piezas del camino (pero no puede aterrizar en casilla ocupada).
  if (definition.keywords.includes('flying')) return true;
  return pathIsClear(state, piece.position, to, piece.instanceId);
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

/** Espectro Siniestro: incorpóreo, ningún Guardia enemigo puede obligarlo a atacarlo a él. */
const ignoresGuards = (definition: CardDefinition): boolean =>
  definition.effects.some((effect) => effect.kind === 'passive' && effect.id === 'unblockable-ghost');

const canAttackPiece = (state: MatchState, attacker: BoardPiece, defender: BoardPiece): boolean => {
  const definition = pieceDefinition(attacker);
  if (!definition || definition.type !== 'unit' || attacker.owner !== state.activePlayer) return false;
  if (attacker.owner === defender.owner || attacker.attackedThisTurn || isFrozen(state, attacker)) return false;
  if (attacker.enteredOnTurn === state.turn && !definition.keywords.includes('swift-strike')) return false;
  if (isPacified(state, attacker)) return false;
  // Guardia: si hay Guardias enemigos adyacentes, el objetivo debe ser uno de ellos (salvo incorpóreos).
  const guards = adjacentEnemyGuards(state, attacker);
  if (guards.size > 0 && !guards.has(defender.instanceId) && !ignoresGuards(definition)) return false;
  const range = definition.range ?? 1;
  const targetDistance = distance(attacker.position, defender.position);
  return targetDistance > 0 && targetDistance <= range && pathIsClear(state, attacker.position, defender.position, attacker.instanceId);
};

const canAttackEnemyNexus = (state: MatchState, attacker: BoardPiece): boolean => {
  const definition = pieceDefinition(attacker);
  if (!definition || definition.type !== 'unit' || attacker.owner !== state.activePlayer) return false;
  if (attacker.attackedThisTurn || isFrozen(state, attacker)) return false;
  if (attacker.enteredOnTurn === state.turn && !definition.keywords.includes('swift-strike')) return false;
  if (isPacified(state, attacker)) return false;
  // Guardia: no se puede golpear el Nexo mientras un Guardia enemigo esté adyacente (salvo incorpóreos).
  if (adjacentEnemyGuards(state, attacker).size > 0 && !ignoresGuards(definition)) return false;
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
  const shield = target.statuses.find((status) => status.kind === 'shielded');
  const absorbedByShield = shield?.kind === 'shielded' ? Math.min(amount - reducedBy, shield.amount) : 0;
  const finalAmount = amount - reducedBy - absorbedByShield;
  let next: MatchState =
    reducedBy > 0
      ? updatePiece(state, pieceId, (piece) => ({ ...piece, reductionUsedOnTurn: state.turn }))
      : state;
  if (reducedBy > 0) {
    next = enqueue(next, {
      type: 'shield', targetId: pieceId, to: target.position, amount: reducedBy, effectId: 'water-shield', durationMs: 260,
    });
  }
  if (absorbedByShield > 0 && shield?.kind === 'shielded') {
    const remaining = shield.amount - absorbedByShield;
    next = updatePiece(next, pieceId, (piece) => ({
      ...piece,
      statuses: remaining > 0
        ? piece.statuses.map((status) => (status.kind === 'shielded' ? { kind: 'shielded', amount: remaining } : status))
        : piece.statuses.filter((status) => status.kind !== 'shielded'),
    }));
    next = enqueue(next, {
      type: 'shield', targetId: pieceId, to: target.position, amount: absorbedByShield, effectId: 'commander-order-shield', durationMs: 260,
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
    const dyingDefinition = pieceDefinition(target);
    const structureResistanceDrain = dyingDefinition?.type === 'structure'
      ? next.board.filter(
          (candidate) =>
            candidate.instanceId !== pieceId &&
            candidate.owner !== target.owner &&
            pieceDefinition(candidate)?.effects.some(
              (effect) => effect.kind === 'passive' && effect.id === 'devour-structure-resistance',
            ),
        )
      : [];
    next = withPlayer(
      { ...next, board: next.board.filter((piece) => piece.instanceId !== pieceId) },
      target.owner,
      { ...owner, discard: [...owner.discard, { instanceId: target.instanceId, cardId: target.cardId }] },
    );
    next = enqueue(next, {
      type: 'destroy', targetId: pieceId, to: target.position, effectId: dyingDefinition?.vfx.deathEffect ?? 'card-destroy', durationMs: 420,
    });
    // Devorador Entrópico: drena la Resistencia de una estructura enemiga destruida como Vida propia.
    for (const devourer of structureResistanceDrain) {
      const maxHealth = pieceDefinition(devourer)?.health ?? devourer.currentHealth;
      next = updatePiece(next, devourer.instanceId, (piece) => ({
        ...piece, currentHealth: Math.min(maxHealth, piece.currentHealth + (dyingDefinition?.resistance ?? 0)),
      }));
    }
    // Nigromante Oscuro: roba una carta por cada unidad aliada propia que muere.
    if (dyingDefinition?.type === 'unit') {
      const necromancers = next.board.filter(
        (candidate) =>
          candidate.owner === target.owner &&
          pieceDefinition(candidate)?.effects.some(
            (effect) => effect.kind === 'passive' && effect.id === 'draw-on-ally-death',
          ),
      );
      for (let index = 0; index < necromancers.length; index += 1) {
        next = resolveDrawAndDiscard(next, target.owner, 1, 0);
      }
    }
  }
  return next;
};

/** Paladín Glorioso: sus aliados adyacentes no pueden ser congelados por ninguna vía. */
const isProtectedFromFreeze = (state: MatchState, pieceId: string): boolean => {
  const piece = state.board.find((candidate) => candidate.instanceId === pieceId);
  if (!piece) return false;
  return state.board.some(
    (ally) =>
      ally.owner === piece.owner &&
      ally.instanceId !== piece.instanceId &&
      distance(ally.position, piece.position) === 1 &&
      pieceDefinition(ally)?.effects.some((effect) => effect.kind === 'passive' && effect.id === 'protect-adjacent-from-freeze'),
  );
};

const addStatus = (
  state: MatchState,
  pieceId: string,
  duration: number,
): MatchState => {
  const target = state.board.find((piece) => piece.instanceId === pieceId);
  if (!target || isProtectedFromFreeze(state, pieceId)) return state;
  const expiresOnTurn = state.turn + Math.max(1, duration) * 2;
  let next = updatePiece(state, pieceId, (piece) => ({
    ...piece,
    statuses: [...piece.statuses.filter((status) => status.kind !== 'frozen'), { kind: 'frozen', expiresOnTurn }],
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

/** Cura el Nexo propio sin superar el máximo del comandante. */
const healNexus = (state: MatchState, playerId: PlayerId, amount: number): MatchState => {
  if (amount <= 0) return state;
  const player = state.players[playerId];
  const maximum = COMMANDER_BY_ID[player.commanderId]?.nexusHealth ?? 25;
  return withPlayer(state, playerId, { ...player, nexusHealth: Math.min(maximum, player.nexusHealth + amount) });
};

const spellNeedsPiece = (card: CardDefinition): boolean =>
  card.effects.some(
    (effect) =>
      effect.kind === 'damage' ||
      effect.kind === 'freeze' ||
      effect.kind === 'scorch' ||
      effect.kind === 'refresh-move' ||
      (effect.kind === 'passive' && effect.id === 'curse-drain-health') ||
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
  let damageDealt = 0;
  for (const effect of card.effects) {
    const targetPiece = requireTargetPiece(next, target);
    if (effect.kind === 'damage' && targetPiece) {
      const bonus = frozenAtCast
        ? card.effects.find((candidate) => candidate.kind === 'passive' && candidate.id === 'frozen-bonus-damage')
        : undefined;
      const bonusDamage = bonus?.kind === 'passive' ? bonus.value ?? 0 : 0;
      const before = targetPiece.currentHealth;
      next = damagePiece(next, targetPiece.instanceId, effect.amount + bonusDamage, caster, card.vfx.impactEffect);
      damageDealt += Math.min(effect.amount + bonusDamage, before);
    } else if (effect.kind === 'damage-all-enemies') {
      const enemy = opponentOf(caster);
      for (const piece of next.board.filter((candidate) => candidate.owner === enemy && pieceDefinition(candidate)?.type === 'unit')) {
        const before = piece.currentHealth;
        next = damagePiece(next, piece.instanceId, effect.amount, caster, card.vfx.impactEffect);
        damageDealt += Math.min(effect.amount, before);
        if (effect.scorch) {
          const expiresOnTurn = state.turn + 2;
          next = {
            ...next,
            tileEffects: [
              ...next.tileEffects.filter((tile) => tile.position.x !== piece.position.x || tile.position.y !== piece.position.y),
              { kind: 'scorched', position: piece.position, sourceOwner: caster, expiresOnTurn },
            ],
          };
        }
      }
    } else if (effect.kind === 'destroy-all-enemy-structures') {
      const enemy = opponentOf(caster);
      const structures = next.board.filter((piece) => piece.owner === enemy && pieceDefinition(piece)?.type === 'structure');
      let gainedEssence = 0;
      for (const structure of structures) {
        gainedEssence += pieceDefinition(structure)?.resistance ?? 0;
        next = damagePiece(next, structure.instanceId, structure.currentHealth, caster, card.vfx.impactEffect);
      }
      if (effect.gainEssencePerResistance && gainedEssence > 0) {
        const player = next.players[caster];
        const newResources = Array.from({ length: gainedEssence }, (_, index) => ({
          instanceId: `${caster}-void-essence-${next.nextId + index}`,
          cardId: card.id, faction: card.faction, exhausted: false,
        }));
        next = { ...next, nextId: next.nextId + gainedEssence };
        next = withPlayer(next, caster, { ...player, resources: [...player.resources, ...newResources] });
      }
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
      next = healNexus(next, caster, effect.amount);
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
        const before = weakest.currentHealth;
        next = damagePiece(next, weakest.instanceId, effect.amount, caster, card.vfx.impactEffect);
        damageDealt += Math.min(effect.amount, before);
      }
    } else if (effect.kind === 'passive' && effect.id === 'target-attack-until-end' && targetPiece?.owner === caster) {
      next = updatePiece(next, targetPiece.instanceId, (piece) => ({
        ...piece,
        attackModifier: piece.attackModifier + (effect.value ?? 0),
      }));
    } else if (effect.kind === 'passive' && effect.id === 'target-health-permanent' && targetPiece?.owner === caster) {
      next = updatePiece(next, targetPiece.instanceId, (piece) => ({
        ...piece, currentHealth: piece.currentHealth + (effect.value ?? 1),
      }));
    } else if (effect.kind === 'passive' && effect.id === 'curse-drain-health' && targetPiece && targetPiece.owner !== caster) {
      next = updatePiece(next, targetPiece.instanceId, (piece) => ({
        ...piece, statuses: [...piece.statuses.filter((status) => status.kind !== 'cursed'), { kind: 'cursed', amount: effect.value ?? 1 }],
      }));
    }
  }
  // Nigromante Oscuro: los hechizos propios que hayan hecho daño drenan esa Vida al Nexo.
  if (damageDealt > 0 && next.board.some(
    (piece) => piece.owner === caster && pieceDefinition(piece)?.effects.some((e) => e.kind === 'passive' && e.id === 'drain-spells'),
  )) {
    next = healNexus(next, caster, damageDealt);
  }
  return resolveDrawAndDiscard(next, caster, draws, discards);
};

/** Las 4 casillas ortogonales adyacentes a una posición, dentro del tablero. */
const orthogonalNeighbors = (position: Position): readonly Position[] =>
  ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const)
    .map(([dx, dy]) => ({ x: position.x + dx, y: position.y + dy }))
    .filter(isInsideBoard);

const resolveEntryEffects = (state: MatchState, piece: BoardPiece, card: CardDefinition): MatchState => {
  let next = state;
  for (const effect of card.effects) {
    if (effect.kind === 'adjacent-damage') {
      if (effect.trigger === 'attack') continue;
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
    } else if (effect.kind === 'heal-nexus') {
      next = healNexus(next, piece.owner, effect.amount);
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
    } else if (effect.kind === 'passive' && effect.id === 'copy-adjacent-attack') {
      const ally = next.board.find(
        (candidate) =>
          candidate.instanceId !== piece.instanceId &&
          candidate.owner === piece.owner &&
          distance(candidate.position, piece.position) === 1,
      );
      const allyAttack = ally ? pieceDefinition(ally)?.attack ?? 0 : 0;
      if (allyAttack > 0) {
        next = updatePiece(next, piece.instanceId, (candidate) => ({
          ...candidate, attackModifier: candidate.attackModifier + allyAttack,
        }));
      }
    } else if (effect.kind === 'passive' && effect.id === 'scorch-adjacents') {
      const expiresOnTurn = state.turn + 2;
      const scorched = orthogonalNeighbors(piece.position).map((position) => ({
        kind: 'scorched' as const, position, sourceOwner: piece.owner, expiresOnTurn,
      }));
      next = {
        ...next,
        tileEffects: [
          ...next.tileEffects.filter((tile) => !scorched.some((added) => added.position.x === tile.position.x && added.position.y === tile.position.y)),
          ...scorched,
        ],
      };
    }
  }
  const discardEffect = card.effects.find((effect) => effect.kind === 'discard');
  if (discardEffect?.kind === 'discard') {
    const target = discardEffect.target === 'enemy-hand' ? opponentOf(piece.owner) : piece.owner;
    next = resolveDrawAndDiscard(next, target, 0, discardEffect.amount);
    // Pesadilla Mortal: además de descartar de la mano enemiga, debilita a las unidades enemigas en juego.
    if (discardEffect.target === 'enemy-hand' && card.effects.some((e) => e.kind === 'passive' && e.id === 'discarded-units-weaken')) {
      const weaken = card.effects.find((e) => e.kind === 'passive' && e.id === 'discarded-units-weaken');
      const amount = weaken?.kind === 'passive' ? weaken.value ?? 1 : 1;
      for (const enemyUnit of next.board.filter((p) => p.owner === target && pieceDefinition(p)?.type === 'unit')) {
        next = damagePiece(next, enemyUnit.instanceId, amount, piece.owner, card.vfx.impactEffect);
      }
    }
  }
  return next;
};

/**
 * Drena Vida del Nexo enemigo al propio (Malachar, Murciélago Sombra): resta
 * al rival, suma al propio Nexo y comprueba si eso decide la partida.
 */
const applyNexusDrain = (state: MatchState, attackerOwner: PlayerId, amount: number, effectId: string): MatchState => {
  if (amount <= 0) return state;
  const enemyId = opponentOf(attackerOwner);
  const enemy = state.players[enemyId];
  if (enemy.nexusHealth <= 0) return state;
  const drained = Math.min(amount, enemy.nexusHealth);
  let next = withPlayer(state, enemyId, { ...enemy, nexusHealth: enemy.nexusHealth - drained });
  next = healNexus(next, attackerOwner, drained);
  next = enqueue(next, {
    type: 'nexus-damage', actorId: attackerOwner, targetId: `${enemyId}-nexus`,
    amount: drained, effectId, durationMs: 320,
  });
  if (next.players[enemyId].nexusHealth <= 0) {
    next = { ...next, winner: attackerOwner, phase: 'finished' };
    next = enqueue(next, {
      type: 'victory', actorId: attackerOwner, targetId: `${enemyId}-nexus`, effectId: 'shadow-victory', durationMs: 900,
    });
  }
  return next;
};

/** Pasiva de Malachar: cada ataque de sus unidades roba 1 Vida al Nexo enemigo. */
const applyMalacharDrain = (state: MatchState, attackerOwner: PlayerId): MatchState => {
  if (state.players[attackerOwner].commanderId !== 'malachar-reidor-sombra') return state;
  return applyNexusDrain(state, attackerOwner, 1, 'commander-shadow-drain');
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
  // Juicio Divino: solo puede destruir unidades enemigas con 2 Vida o menos.
  if (card.id === 'juicio-divino' && piece.currentHealth > 2) return false;
  const curseDrain = card.effects.some((effect) => effect.kind === 'passive' && effect.id === 'curse-drain-health');
  if (curseDrain && piece.owner === playerId) return false;
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
  if (card.type === 'instant') {
    for (const piece of state.board) {
      if (piece.owner !== playerId) continue;
      const discount = CARD_BY_ID[piece.cardId]?.effects.find(
        (effect) => effect.kind === 'passive' && (effect.id === 'spell-generic-discount' || effect.id === 'instant-cost-discount'),
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
    spellsCastThisTurn: card.type === 'instant' ? player.spellsCastThisTurn + 1 : player.spellsCastThisTurn,
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
    const commanderId = player.commanderId;
    const verdaniaBonus = commanderId === 'verdania-guardiana-raices' && card.type === 'unit' ? 1 : 0;
    // Oso Forestal / Arboleda Sagrada: cada aliada propia en juego con esta aura suma su bono
    // a toda unidad nueva que entra (no a estructuras, el texto dice "unidades aliadas").
    const alliedAuraBonus = card.type === 'unit'
      ? state.board.reduce((sum, ally) => {
          if (ally.owner !== playerId) return sum;
          const auraEffect = CARD_BY_ID[ally.cardId]?.effects.find(
            (effect) => effect.kind === 'passive' && (effect.id === 'buff-allied-units-health' || effect.id === 'entry-allied-units-gain-health'),
          );
          return auraEffect?.kind === 'passive' ? sum + (auraEffect.value ?? 1) : sum;
        }, 0)
      : 0;
    // El escudo preventivo al entrar lo concede la aura de Asterin o la propia carta (Ángel Celestial).
    const ownShieldEffect = card.type === 'unit'
      ? card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'entry-shield-gain')
      : undefined;
    const shieldAmount = commanderId === 'asterin-protector-luz' && card.type === 'unit'
      ? 1
      : ownShieldEffect?.kind === 'passive' ? ownShieldEffect.value ?? 1 : 0;
    const asterinShield = shieldAmount > 0;
    const nyxarisRush =
      commanderId === 'nyxaris-heraldo-vacio' && card.type === 'unit' && !player.firstUnitDeployedThisTurn;
    const piece: BoardPiece = {
      instanceId: instance.instanceId,
      cardId: card.id,
      owner: playerId,
      position,
      currentHealth: maximumHealth + verdaniaBonus + alliedAuraBonus,
      attackModifier: receivesForgeBuff ? 1 : 0,
      movedThisTurn: false,
      attackedThisTurn: false,
      enteredOnTurn: nyxarisRush ? state.turn - 1 : state.turn,
      statuses: asterinShield ? [{ kind: 'shielded', amount: shieldAmount }] : [],
    };
    next = { ...next, board: [...next.board, piece] };
    if (card.type === 'unit') {
      next = withPlayer(next, playerId, { ...next.players[playerId], firstUnitDeployedThisTurn: true });
    }
    if (nyxarisRush) {
      next = enqueue(next, {
        type: 'summon', actorId: playerId, targetId: piece.instanceId, to: position,
        effectId: 'commander-void-aura', durationMs: 300,
      });
    }
    next = enqueue(next, {
      type: 'summon', actorId: playerId, targetId: piece.instanceId, to: position,
      effectId: card.vfx.summonEffect, durationMs: 440,
    });
    if (verdaniaBonus > 0) {
      next = enqueue(next, {
        type: 'shield', actorId: playerId, targetId: piece.instanceId, to: position,
        amount: verdaniaBonus, effectId: 'commander-nature-aura', durationMs: 300,
      });
    }
    if (alliedAuraBonus > 0) {
      next = enqueue(next, {
        type: 'shield', actorId: playerId, targetId: piece.instanceId, to: position,
        amount: alliedAuraBonus, effectId: 'nature-ally-aura', durationMs: 300,
      });
    }
    if (asterinShield) {
      next = enqueue(next, {
        type: 'shield', actorId: playerId, targetId: piece.instanceId, to: position,
        amount: shieldAmount, effectId: 'commander-order-aura', durationMs: 300,
      });
    }
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

/**
 * Bono de daño adicional al atacar, según los pasivos propios del atacante
 * (daño a distancia, contra estructuras, contra objetivos solitarios...) y
 * las penalizaciones de pasivos enemigos adyacentes (Grifo de Orden).
 * `defender` se omite al atacar el Nexo: los bonos que dependen del objetivo
 * (estructura, aislamiento) no aplican ahí.
 */
const attackBonus = (state: MatchState, attacker: BoardPiece, card: CardDefinition, defender?: BoardPiece): number => {
  let bonus = 0;
  const flatDamage = card.effects.find((effect) => effect.kind === 'damage');
  if (flatDamage?.kind === 'damage') bonus += flatDamage.amount;
  if (defender) {
    if (pieceDefinition(defender)?.type === 'structure') {
      const structureBonus = card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'structure-bonus-damage');
      if (structureBonus?.kind === 'passive') bonus += structureBonus.value ?? 0;
    }
    const isolatedBonus = card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'bonus-damage-isolated-target');
    if (isolatedBonus?.kind === 'passive') {
      const hasNeighbor = state.board.some(
        (piece) =>
          piece.instanceId !== defender.instanceId &&
          piece.instanceId !== attacker.instanceId &&
          distance(piece.position, defender.position) === 1,
      );
      if (!hasNeighbor) bonus += isolatedBonus.value ?? 1;
    }
    const rangedBonus = card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'ranged-attack-bonus');
    if (rangedBonus?.kind === 'passive' && distance(attacker.position, defender.position) > 1) bonus += rangedBonus.value ?? 1;
  }
  let weaken = 0;
  for (const piece of state.board) {
    if (piece.owner === attacker.owner || distance(piece.position, attacker.position) !== 1) continue;
    const effect = pieceDefinition(piece)?.effects.find((candidate) => candidate.kind === 'passive' && candidate.id === 'weaken-adjacent-enemies');
    if (effect?.kind === 'passive') weaken += effect.value ?? 1;
  }
  return bonus - weaken;
};

/** Efectos secundarios que se disparan al atacar (drenar, congelar, ralentizar, descartar…). */
const applyOnAttackExtras = (
  state: MatchState,
  playerId: PlayerId,
  attackerId: string,
  card: CardDefinition,
  dealt: number,
  defenderId?: string,
  defenderPosition?: Position,
): MatchState => {
  let next = state;
  const defender = defenderId ? next.board.find((piece) => piece.instanceId === defenderId) : undefined;
  const defenderIsUnit = defender ? pieceDefinition(defender)?.type === 'unit' : false;

  if (defenderIsUnit && card.effects.some((effect) => effect.kind === 'passive' && effect.id === 'freeze-on-damage')) {
    next = addStatus(next, defenderId!, 1);
  }
  const rawFreeze = card.effects.find((effect) => effect.kind === 'freeze');
  if (defenderIsUnit && rawFreeze?.kind === 'freeze') {
    next = addStatus(next, defenderId!, rawFreeze.duration);
  }
  // Draco de Magma: al atacar, daña también las casillas adyacentes al objetivo.
  const attackAdjacent = card.effects.find((effect) => effect.kind === 'adjacent-damage' && effect.trigger === 'attack');
  const splashOrigin = defender?.position ?? defenderPosition;
  if (attackAdjacent?.kind === 'adjacent-damage' && splashOrigin) {
    const splashTargets = next.board.filter(
      (piece) =>
        piece.instanceId !== defenderId &&
        piece.instanceId !== attackerId &&
        distance(piece.position, splashOrigin) === 1 &&
        (attackAdjacent.includeAllies || piece.owner !== playerId),
    );
    for (const splashed of splashTargets) {
      next = damagePiece(next, splashed.instanceId, attackAdjacent.amount, playerId, card.vfx.impactEffect);
    }
  }
  const drainLife = card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'drain-life-on-attack');
  if (drainLife?.kind === 'passive') {
    next = applyNexusDrain(next, playerId, drainLife.value ?? 1, `${card.faction}-lifedrain`);
  }
  if (dealt > 0 && card.effects.some((effect) => effect.kind === 'passive' && effect.id === 'lifesteal-on-attack')) {
    next = healNexus(next, playerId, dealt);
  }
  const slow = card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'slow-enemies-on-attack');
  if (slow?.kind === 'passive') {
    const enemyId = opponentOf(playerId);
    next = {
      ...next,
      board: next.board.map((piece) =>
        piece.owner === enemyId ? { ...piece, movementModifier: (piece.movementModifier ?? 0) + (slow.value ?? 1) } : piece,
      ),
    };
  }
  const knockback = card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'push-adjacent-enemies-on-attack');
  if (knockback?.kind === 'passive' && splashOrigin) {
    const attackerPiece = next.board.find((piece) => piece.instanceId === attackerId);
    if (attackerPiece) {
      const pushTargets = next.board.filter(
        (piece) => piece.owner !== playerId && distance(piece.position, splashOrigin) === 1,
      );
      for (const target of pushTargets) {
        const dx = Math.sign(target.position.x - attackerPiece.position.x);
        const dy = Math.sign(target.position.y - attackerPiece.position.y);
        const destination = { x: target.position.x + dx, y: target.position.y + dy };
        if (isInsideBoard(destination) && !pieceAt(next, destination)) {
          next = updatePiece(next, target.instanceId, (piece) => ({ ...piece, position: destination }));
        }
      }
    }
  }
  const discardEnemy = card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'discard-enemy-on-damage');
  if (dealt > 0 && discardEnemy?.kind === 'passive') {
    next = resolveDrawAndDiscard(next, opponentOf(playerId), 0, discardEnemy.value ?? 1);
  }
  const nearbyAllyBuff = card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'attack-buff-nearby-allies');
  if (nearbyAllyBuff?.kind === 'passive') {
    const attackerPiece = next.board.find((piece) => piece.instanceId === attackerId);
    if (attackerPiece) {
      next = {
        ...next,
        board: next.board.map((piece) =>
          piece.owner === playerId && piece.instanceId !== attackerId && distance(piece.position, attackerPiece.position) === 1
            ? { ...piece, attackModifier: piece.attackModifier + (nearbyAllyBuff.value ?? 1) }
            : piece,
        ),
      };
    }
  }
  const firstAttackHeal = card.effects.find((effect) => effect.kind === 'passive' && effect.id === 'first-attack-heal');
  if (firstAttackHeal?.kind === 'passive') {
    const attackerPiece = next.board.find((piece) => piece.instanceId === attackerId);
    if (attackerPiece && !attackerPiece.firstAttackHealUsed) {
      const maxHealth = pieceDefinition(attackerPiece)?.health ?? attackerPiece.currentHealth;
      next = updatePiece(next, attackerId, (piece) => ({
        ...piece, firstAttackHealUsed: true, currentHealth: Math.min(maxHealth, piece.currentHealth + (firstAttackHeal.value ?? 1)),
      }));
    }
  }
  return next;
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
  const amount = Math.max(0, card.attack + attacker.attackModifier +
    (attackBuff?.kind === 'buff-self-on-attack' ? attackBuff.attack : 0) +
    attackBonus(state, attacker, card, defender));
  let next = updatePiece(state, attackerId, (piece) => ({ ...piece, attackedThisTurn: true }));
  next = enqueue(next, {
    type: 'attack', actorId: attackerId, targetId: defenderId,
    from: attacker.position, to: defender.position, effectId: card.vfx.attackEffect, durationMs: 380,
  });
  const defenderPosition = defender.position;
  next = damagePiece(next, defenderId, amount, playerId, card.vfx.impactEffect);
  next = applyOnAttackExtras(next, playerId, attackerId, card, amount, defenderId, defenderPosition);
  next = applyMalacharDrain(next, playerId);
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
  const amount = Math.max(0, card.attack + attacker.attackModifier +
    (attackBuff?.kind === 'buff-self-on-attack' ? attackBuff.attack : 0) +
    attackBonus(state, attacker, card));
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
  next = applyOnAttackExtras(next, playerId, attackerId, card, amount);
  if (enemy.nexusHealth - amount <= 0) {
    next = { ...next, winner: playerId, phase: 'finished' };
    next = enqueue(next, {
      type: 'victory', actorId: playerId, targetId: `${enemyId}-nexus`, effectId: `${card.faction}-victory`, durationMs: 900,
    });
    return success(next);
  }
  next = applyMalacharDrain(next, playerId);
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
        firstUnitDeployedThisTurn: false,
      },
      [nextPlayerId]: {
        ...incoming,
        resources: restoreMana(incoming.resources),
        resourcePlayedThisTurn: false,
        nexusDamagedThisTurn: false,
        firstUnitDeployedThisTurn: false,
      },
    },
    board: state.board.map((piece) => ({
      ...piece,
      movedThisTurn: piece.owner === nextPlayerId ? false : piece.movedThisTurn,
      attackedThisTurn: piece.owner === nextPlayerId ? false : piece.attackedThisTurn,
      attackModifier: piece.owner === playerId ? 0 : piece.attackModifier,
      // Horror Abisal: la ralentización dura exactamente el siguiente turno del enemigo.
      movementModifier: piece.owner === playerId ? 0 : piece.movementModifier,
      statuses: piece.statuses.filter((status) => status.kind !== 'frozen' || status.expiresOnTurn > nextTurn),
    })),
    tileEffects: state.tileEffects.filter((tile) => tile.expiresOnTurn > nextTurn),
  };
  // Maldición Sombra: cada unidad maldita pierde Vida al final de cada turno.
  for (const cursed of state.board.filter((piece) => piece.statuses.some((status) => status.kind === 'cursed'))) {
    const curse = cursed.statuses.find((status) => status.kind === 'cursed');
    if (curse?.kind === 'cursed') next = damagePiece(next, cursed.instanceId, curse.amount, undefined, 'curse-drain');
  }
  next = enqueue(next, {
    type: 'turn', actorId: nextPlayerId, effectId: 'turn-transition', durationMs: 400,
  });
  next = { ...next, phase: 'draw' };
  next = drawInternal(next, nextPlayerId);
  if (next.phase !== 'finished') next = { ...next, phase: 'main' };
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
