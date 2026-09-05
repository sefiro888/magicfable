import { z } from 'zod';
import { CARD_TYPES, ELEMENTS, FACTION_IDS, KEYWORDS, RARITIES } from './types';

export const ManaCostSchema = z
  .object({
    generic: z.number().int().nonnegative(),
    colored: z
      .object({
        fury: z.number().int().nonnegative().optional(),
        arcane: z.number().int().nonnegative().optional(),
        nature: z.number().int().nonnegative().optional(),
        order: z.number().int().nonnegative().optional(),
        shadow: z.number().int().nonnegative().optional(),
        void: z.number().int().nonnegative().optional(),
        duna: z.number().int().nonnegative().optional(),
        fimbul: z.number().int().nonnegative().optional(),
        samsara: z.number().int().nonnegative().optional(),
        jade: z.number().int().nonnegative().optional(),
        olimpo: z.number().int().nonnegative().optional(),
        sol: z.number().int().nonnegative().optional(),
        bestiario: z.number().int().nonnegative().optional(),
        plaga: z.number().int().nonnegative().optional(),
        marea: z.number().int().nonnegative().optional(),
        forja: z.number().int().nonnegative().optional(),
      })
      .strict(),
  })
  .strict();

export const CardArtSchema = z
  .object({
    webp: z.string().startsWith('/assets/cards/art/').endsWith('.webp'),
    fallback: z.string().startsWith('/assets/cards/art/').endsWith('.svg'),
    alt: z.string().min(1),
  })
  .strict();

export const CardVfxSchema = z
  .object({
    summonEffect: z.string().min(1).optional(),
    attackEffect: z.string().min(1).optional(),
    impactEffect: z.string().min(1).optional(),
    deathEffect: z.string().min(1).optional(),
    persistentEffect: z.string().min(1).optional(),
  })
  .strict();

export const CardSfxSchema = z
  .object({
    play: z.string().min(1).optional(),
    attack: z.string().min(1).optional(),
    impact: z.string().min(1).optional(),
    death: z.string().min(1).optional(),
  })
  .strict();

export const CardEffectSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('damage'), amount: z.number().int().positive(), target: z.enum(['enemy-piece', 'any-piece']) }),
  z.object({ kind: z.literal('damage-all-enemies'), amount: z.number().int().positive(), scorch: z.boolean().optional(), includeAllies: z.boolean().optional() }),
  z.object({ kind: z.literal('freeze'), duration: z.number().int().positive() }),
  z.object({ kind: z.literal('stun') }),
  z.object({ kind: z.literal('grant-keyword'), keyword: z.enum(KEYWORDS) }),
  z.object({ kind: z.literal('draw'), amount: z.number().int().positive() }),
  z.object({ kind: z.literal('discard'), amount: z.number().int().positive(), target: z.enum(['own-hand', 'enemy-hand']).optional() }),
  z.object({ kind: z.literal('heal-nexus'), amount: z.number().int().positive() }),
  z.object({
    kind: z.literal('adjacent-damage'), amount: z.number().int().positive(), includeAllies: z.boolean(),
    trigger: z.enum(['entry', 'attack']).optional(),
  }),
  z.object({ kind: z.literal('buff-self-on-attack'), attack: z.number().int().positive() }),
  z.object({ kind: z.literal('scry'), amount: z.number().int().positive() }),
  z.object({ kind: z.literal('scorch'), duration: z.number().int().positive() }),
  z.object({ kind: z.literal('refresh-move') }),
  z.object({ kind: z.literal('refresh-attack') }),
  z.object({ kind: z.literal('shield-all-allies'), amount: z.number().int().positive() }),
  z.object({ kind: z.literal('buff-all-allies-attack'), amount: z.number().int().positive() }),
  z.object({ kind: z.literal('refresh-attack-all') }),
  z.object({ kind: z.literal('splash-weakest-enemy'), amount: z.number().int().positive() }),
  z.object({ kind: z.literal('destroy-all-enemy-structures'), gainEssencePerResistance: z.boolean() }),
  z.object({ kind: z.literal('offering'), cost: z.number().int().positive() }),
  z.object({ kind: z.literal('judgement') }),
  z.object({ kind: z.literal('otherwise') }),
  z.object({ kind: z.literal('always') }),
  z.object({ kind: z.literal('slow-all-enemies'), amount: z.number().int().positive() }),
  // Marea — la rama del ciclo y los dos empujes.
  z.object({ kind: z.literal('tide'), phase: z.enum(['high', 'low']) }),
  // Forja — la rama por estructuras y los dos efectos de taller.
  z.object({ kind: z.literal('has-structure'), count: z.number().int().positive().optional() }),
  z.object({
    kind: z.literal('buff-automata'),
    attack: z.number().int(),
    health: z.number().int().optional(),
  }),
  z.object({ kind: z.literal('restore-structures') }),
  z.object({
    kind: z.literal('push-target'),
    amount: z.number().int().positive(),
    toward: z.enum(['away', 'pusher']).optional(),
  }),
  z.object({
    kind: z.literal('push-all-enemies'),
    amount: z.number().int().positive(),
    toward: z.enum(['away', 'pusher']),
    stunIfBlocked: z.boolean().optional(),
  }),
  z.object({ kind: z.literal('destroy-strongest-enemy') }),
  z.object({ kind: z.literal('destroy-low-health-all'), threshold: z.number().int().positive() }),
  z.object({
    kind: z.literal('conditional-damage-all-enemies'),
    baseAmount: z.number().int().positive(), deathAmount: z.number().int().positive(),
  }),
  z.object({ kind: z.literal('return-fallen-allies'), bonus: z.number().int().positive() }),
  z.object({ kind: z.literal('return-graveyard-renacer') }),
  z.object({ kind: z.literal('mandate') }),
  z.object({ kind: z.literal('claim-mandate'), bonusDrawIfRivalHeld: z.number().int().positive().optional() }),
  z.object({ kind: z.literal('buff-all-allies-permanent'), amount: z.number().int().positive() }),
  z.object({ kind: z.literal('reset-hybris-and-heal') }),
  z.object({ kind: z.literal('sacrifice') }),
  z.object({ kind: z.literal('damage-all-enemies-by-sun-count'), cap: z.number().int().positive().optional() }),
  z.object({ kind: z.literal('passive'), id: z.string().min(1), value: z.number().optional() }),
]);

export const CardDefinitionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    faction: z.enum(FACTION_IDS),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    type: z.enum(CARD_TYPES),
    subtype: z.string().min(1).optional(),
    rarity: z.enum(RARITIES),
    cost: ManaCostSchema,
    rules: z.string().min(1),
    flavor: z.string().min(1),
    element: z.enum(ELEMENTS).optional(),
    attack: z.number().int().nonnegative().optional(),
    health: z.number().int().positive().optional(),
    resistance: z.number().int().positive().optional(),
    range: z.number().int().positive().optional(),
    movement: z.number().int().nonnegative().optional(),
    keywords: z.array(z.enum(KEYWORDS)),
    set: z.string().min(1),
    collectorNumber: z.number().int().positive(),
    artist: z.string().min(1),
    aiTags: z.array(z.string().min(1)),
    art: CardArtSchema,
    vfx: CardVfxSchema,
    sfx: CardSfxSchema,
    unlocked: z.boolean(),
    unique: z.boolean(),
    effects: z.array(CardEffectSchema),
  })
  .strict()
  .superRefine((card, context) => {
    if (card.type === 'unit' && (card.attack === undefined || card.health === undefined)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Las unidades necesitan ataque y vida.' });
    }
    if (card.type === 'structure' && card.resistance === undefined) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Las estructuras necesitan resistencia.' });
    }
    if (card.type === 'mana' && (card.cost.generic !== 0 || Object.keys(card.cost.colored).length > 0)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Las fuentes de maná no tienen coste.' });
    }
  });

export const CommanderDefinitionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    title: z.string().min(1),
    faction: z.enum(FACTION_IDS),
    nexusHealth: z.number().int().positive(),
    rules: z.string().min(1),
    flavor: z.string().min(1),
    art: CardArtSchema,
    vfx: CardVfxSchema,
    power: z
      .object({
        name: z.string().min(1),
        description: z.string().min(1),
        cost: ManaCostSchema,
        needsEnemyTarget: z.boolean().optional(),
        effects: z.array(CardEffectSchema).min(1),
        effectId: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const DeckEntrySchema = z
  .object({ cardId: z.string().min(1), count: z.number().int().positive() })
  .strict();

export const DeckDefinitionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    faction: z.enum(FACTION_IDS),
    commanderId: z.string().min(1),
    cards: z.array(DeckEntrySchema),
  })
  .strict();
