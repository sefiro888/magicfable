export const FACTION_IDS = ['fury', 'arcane', 'nature', 'order', 'shadow', 'void'] as const;
export type FactionId = (typeof FACTION_IDS)[number];

export const CARD_TYPES = [
  'mana',
  'unit',
  'instant',
  'structure',
] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const RARITIES = ['common', 'uncommon', 'rare', 'mythic'] as const;
export type Rarity = (typeof RARITIES)[number];

export const KEYWORDS = [
  'impulse',
  'swift-strike',
  'guard',
  'flying',
] as const;
export type Keyword = (typeof KEYWORDS)[number];

export interface FactionDefinition {
  readonly id: FactionId;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly accentColor: string;
  readonly icon: string;
  readonly unlocked: boolean;
  readonly themes: readonly string[];
}

export interface ManaCost {
  readonly generic: number;
  readonly colored: Readonly<Partial<Record<FactionId, number>>>;
}

export interface CardArt {
  readonly webp: string;
  readonly fallback: string;
  readonly alt: string;
}

export interface CardVfx {
  readonly summonEffect?: string;
  readonly attackEffect?: string;
  readonly impactEffect?: string;
  readonly deathEffect?: string;
  readonly persistentEffect?: string;
}

export interface CardSfx {
  readonly play?: string;
  readonly attack?: string;
  readonly impact?: string;
  readonly death?: string;
}

export type CardEffect =
  | { readonly kind: 'damage'; readonly amount: number; readonly target: 'enemy-piece' | 'any-piece' }
  | { readonly kind: 'damage-all-enemies'; readonly amount: number; readonly scorch?: boolean }
  | { readonly kind: 'freeze'; readonly duration: number }
  | { readonly kind: 'draw'; readonly amount: number }
  | { readonly kind: 'discard'; readonly amount: number; readonly target?: 'own-hand' | 'enemy-hand' }
  | { readonly kind: 'heal-nexus'; readonly amount: number }
  | {
      readonly kind: 'adjacent-damage';
      readonly amount: number;
      readonly includeAllies: boolean;
      /** Cuándo se dispara: al entrar en juego (por defecto) o al atacar. */
      readonly trigger?: 'entry' | 'attack';
    }
  | { readonly kind: 'buff-self-on-attack'; readonly attack: number }
  | { readonly kind: 'scry'; readonly amount: number }
  | { readonly kind: 'scorch'; readonly duration: number }
  | { readonly kind: 'refresh-move' }
  | { readonly kind: 'splash-weakest-enemy'; readonly amount: number }
  | { readonly kind: 'destroy-all-enemy-structures'; readonly gainEssencePerResistance: boolean }
  | { readonly kind: 'passive'; readonly id: string; readonly value?: number };

export interface CardDefinition {
  readonly id: string;
  readonly name: string;
  readonly faction: FactionId;
  readonly color: string;
  readonly type: CardType;
  readonly subtype?: string;
  readonly rarity: Rarity;
  readonly cost: ManaCost;
  readonly rules: string;
  readonly flavor: string;
  readonly attack?: number;
  readonly health?: number;
  readonly resistance?: number;
  readonly range?: number;
  readonly movement?: number;
  readonly keywords: readonly Keyword[];
  readonly set: string;
  readonly collectorNumber: number;
  readonly artist: string;
  readonly aiTags: readonly string[];
  readonly art: CardArt;
  readonly vfx: CardVfx;
  readonly sfx: CardSfx;
  readonly unlocked: boolean;
  readonly unique: boolean;
  readonly effects: readonly CardEffect[];
}

export interface CommanderDefinition {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly faction: FactionId;
  readonly nexusHealth: number;
  readonly rules: string;
  readonly flavor: string;
  readonly art: CardArt;
  readonly vfx: CardVfx;
}

export interface DeckEntry {
  readonly cardId: string;
  readonly count: number;
}

export interface DeckDefinition {
  readonly id: string;
  readonly name: string;
  readonly faction: FactionId;
  readonly commanderId: string;
  readonly cards: readonly DeckEntry[];
}

export type PlayerId = 'player' | 'ai';

export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface ResourceState {
  readonly instanceId: string;
  readonly cardId: string;
  readonly faction: FactionId;
  readonly exhausted: boolean;
}

export interface CardInstance {
  readonly instanceId: string;
  readonly cardId: string;
}

export type PieceStatus =
  | { readonly kind: 'frozen'; readonly expiresOnTurn: number }
  | { readonly kind: 'shielded'; readonly amount: number }
  /** Maldición Sombra: pierde 1 Vida al final de cada turno hasta que muere. */
  | { readonly kind: 'cursed'; readonly amount: number };

export interface TileEffect {
  readonly kind: 'scorched';
  readonly position: Position;
  readonly sourceOwner: PlayerId;
  readonly expiresOnTurn: number;
}

export interface BoardPiece {
  readonly instanceId: string;
  readonly cardId: string;
  readonly owner: PlayerId;
  readonly position: Position;
  readonly currentHealth: number;
  readonly attackModifier: number;
  /** Casillas de Movimiento restadas hasta que su dueño termine su turno (p. ej. Horror Abisal). */
  readonly movementModifier?: number;
  readonly movedThisTurn: boolean;
  readonly attackedThisTurn: boolean;
  readonly enteredOnTurn: number;
  /** Turno en el que la pieza ya consumió su reducción de primer daño (pasiva del Gólem Azur). */
  readonly reductionUsedOnTurn?: number;
  /** Pégaso Celestial: si ya curó en su primer ataque (solo ocurre una vez por pieza). */
  readonly firstAttackHealUsed?: boolean;
  readonly statuses: readonly PieceStatus[];
}

export interface PlayerStats {
  readonly cardsPlayed: number;
  readonly damageDealt: number;
}

export interface PlayerState {
  readonly id: PlayerId;
  readonly commanderId: string;
  readonly nexusHealth: number;
  readonly deck: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  readonly discard: readonly CardInstance[];
  readonly resources: readonly ResourceState[];
  readonly resourcePlayedThisTurn: boolean;
  readonly spellsCastThisTurn: number;
  readonly towerLootUsedThisTurn: boolean;
  readonly forgeBuffUsedThisTurn: boolean;
  /** Marca de la pasiva de Kaela: el Nexo ya recibió su primer daño este turno. */
  readonly nexusDamagedThisTurn: boolean;
  /** Pasiva de Kaela armada: la siguiente unidad cuesta 1 genérico menos. */
  readonly unitDiscountPending: boolean;
  /** Pasiva de Nyxaris: la primera unidad del turno ya entró en juego. */
  readonly firstUnitDeployedThisTurn: boolean;
  /** Veces que se ha intentado robar con el mazo vacío. Cada una inflige esa cantidad de daño al Nexo propio. */
  readonly fatigueStacks: number;
  readonly mulliganTaken: boolean;
  readonly stats: PlayerStats;
}

export type TurnPhase = 'start' | 'draw' | 'main' | 'combat' | 'end' | 'finished';

export type AnimationEventType =
  | 'draw'
  | 'resource'
  | 'mana-flow'
  | 'summon'
  | 'spell'
  | 'move'
  | 'attack'
  | 'damage'
  | 'shield'
  | 'destroy'
  | 'freeze'
  | 'reveal'
  | 'nexus-damage'
  | 'turn'
  | 'victory';

export interface AnimationEvent {
  readonly id: string;
  readonly type: AnimationEventType;
  readonly actorId?: string;
  readonly targetId?: string;
  readonly from?: Position;
  readonly to?: Position;
  readonly amount?: number;
  readonly effectId?: string;
  readonly durationMs: number;
}

export interface MatchState {
  readonly seed: number;
  readonly nextId: number;
  readonly activePlayer: PlayerId;
  readonly turn: number;
  readonly phase: TurnPhase;
  readonly players: Readonly<Record<PlayerId, PlayerState>>;
  readonly board: readonly BoardPiece[];
  readonly tileEffects: readonly TileEffect[];
  readonly animations: readonly AnimationEvent[];
  readonly winner?: PlayerId;
  readonly startedAtTurn: number;
}

export type SpellTarget =
  | { readonly kind: 'piece'; readonly pieceId: string }
  | { readonly kind: 'nexus'; readonly playerId: PlayerId }
  | { readonly kind: 'none' };

export type GameAction =
  | { readonly type: 'draw'; readonly playerId?: PlayerId }
  | { readonly type: 'play-resource'; readonly playerId: PlayerId; readonly cardInstanceId: string }
  | {
      readonly type: 'play-card';
      readonly playerId: PlayerId;
      readonly cardInstanceId: string;
      readonly position?: Position;
      readonly target?: SpellTarget;
    }
  | { readonly type: 'move'; readonly playerId: PlayerId; readonly pieceId: string; readonly to: Position }
  | {
      readonly type: 'attack-piece';
      readonly playerId: PlayerId;
      readonly attackerId: string;
      readonly defenderId: string;
    }
  | { readonly type: 'attack-nexus'; readonly playerId: PlayerId; readonly attackerId: string }
  | { readonly type: 'end-turn'; readonly playerId: PlayerId };

export interface ActionResult {
  readonly ok: boolean;
  readonly state: MatchState;
  readonly error?: GameError;
}

export type GameErrorCode =
  | 'game-finished'
  | 'wrong-turn'
  | 'wrong-phase'
  | 'card-not-found'
  | 'invalid-card-type'
  | 'resource-already-played'
  | 'insufficient-mana'
  | 'position-required'
  | 'target-required'
  | 'out-of-bounds'
  | 'occupied'
  | 'piece-not-found'
  | 'not-owner'
  | 'cannot-move'
  | 'cannot-attack'
  | 'out-of-range'
  | 'blocked-line';

export interface GameError {
  readonly code: GameErrorCode;
  readonly message: string;
}

export interface DeckValidationIssue {
  readonly code:
    | 'wrong-size'
    | 'wrong-mana-count'
    | 'unknown-card'
    | 'wrong-faction'
    | 'too-many-copies'
    | 'too-many-unique'
    | 'unknown-commander'
    | 'wrong-commander-faction';
  readonly message: string;
  readonly cardId?: string;
}

export interface DeckValidationResult {
  readonly valid: boolean;
  readonly issues: readonly DeckValidationIssue[];
  readonly totalCards: number;
  readonly manaCards: number;
  readonly nonManaCards: number;
}

export interface PaymentPlan {
  readonly payable: boolean;
  readonly resourceIds: readonly string[];
  readonly missingGeneric: number;
  readonly missingColored: Readonly<Partial<Record<FactionId, number>>>;
}
