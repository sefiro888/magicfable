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
  /** Perforar: el daño que sobra al destruir a la defensora golpea el Nexo enemigo. */
  'pierce',
  /** Vínculo vital: el daño de combate que reparte cura tu Nexo en la misma cantidad. */
  'lifelink',
  /** Aturdir: la unidad golpeada no puede atacar en su próximo turno. */
  'stun',
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
  /** Aturde a la unidad señalada: no podrá atacar en su próximo turno, pero sí moverse. */
  | { readonly kind: 'stun' }
  /** Presta una palabra clave a una unidad aliada hasta el final del turno. */
  | { readonly kind: 'grant-keyword'; readonly keyword: Keyword }
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

/**
 * Poder de comandante: una jugada grande que se paga con Esencia y se usa UNA
 * vez por partida. Las pasivas de comandante siempre han sido automáticas, así
 * que no daban ninguna decisión; esto añade un momento de «¿ahora o luego?»
 * sin necesidad de cartas nuevas.
 */
export interface CommanderPower {
  readonly name: string;
  readonly description: string;
  readonly cost: ManaCost;
  /** Necesita señalar una unidad enemiga (p. ej. congelarla). */
  readonly needsEnemyTarget?: boolean;
  readonly effects: readonly CardEffect[];
  readonly effectId: string;
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
  readonly power: CommanderPower;
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
  | { readonly kind: 'cursed'; readonly amount: number }
  /**
   * Aturdir: no puede atacar, pero sí moverse — a diferencia de Congelado, que
   * bloquea ambas cosas. Se mide con el contador de turno compartido, igual que
   * Congelado: aturdir en el turno N pone `expiresOnTurn` en N+2, de modo que
   * cubre exactamente el siguiente turno de su dueño.
   */
  | { readonly kind: 'stunned'; readonly expiresOnTurn: number };

/**
 * Marca temporal que deja un efecto sobre una casilla (hoy solo el fuego).
 * Caduca sola en el turno indicado.
 */
export interface TileEffect {
  readonly kind: 'scorched';
  readonly position: Position;
  readonly sourceOwner: PlayerId;
  readonly expiresOnTurn: number;
}

/**
 * Terreno del campo de batalla: parte del mapa, no un efecto pasajero.
 *
 * Hasta ahora las 64 casillas eran idénticas y la posición solo importaba por
 * las distancias. Con terreno, el tablero tiene sitios que valen más que otros:
 * hay que rodear, disputar y elegir dónde plantarse.
 *
 * - `rubble` (ruinas): nadie puede entrar ni desplegar ahí, y corta la línea de
 *   los ataques a distancia. Son los muros del mapa.
 * - `cover` (cobertura): quien esté encima recibe 1 de daño menos de los
 *   ataques a distancia. Premia adelantar y quedarse.
 */
export type TerrainKind = 'rubble' | 'cover';

export interface TerrainTile {
  readonly kind: TerrainKind;
  readonly position: Position;
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
  /**
   * Palabras clave prestadas hasta que su dueño termine el turno (Salto de
   * Umbral). Van aparte de las de la carta porque son temporales: la
   * definición de la carta es inmutable y compartida por todas sus copias.
   */
  readonly grantedKeywords?: readonly Keyword[];
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
  readonly mulliganTaken: boolean;
  /** El poder del comandante solo se puede usar una vez por partida. */
  readonly commanderPowerUsed: boolean;
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
  /**
   * Facción de la carta que origina el evento, cuando aplica (por ahora solo
   * al invocar). Antes la presentación adivinaba el tono por palabras clave
   * del `effectId` (p. ej. "azur" → arcano), un heurístico de 4 cubos que
   * dejaba fuera facciones enteras (Naturaleza, Orden, Sombra, Vacío caían
   * todas al dorado por defecto); con la facción real, el color del efecto
   * es exacto para las seis.
   */
  readonly faction?: FactionId;
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
  /** Terreno fijo de la partida: se reparte al crearla y no cambia. */
  readonly terrain: readonly TerrainTile[];
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
  | {
      readonly type: 'commander-power';
      readonly playerId: PlayerId;
      /** Unidad señalada, si el poder la pide. */
      readonly target?: SpellTarget;
    }
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
