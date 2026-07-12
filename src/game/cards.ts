import { FACTION_BY_ID } from './factions';
import { CardDefinitionSchema } from './schemas';
import type { CardDefinition, CardSfx, FactionId, ManaCost } from './types';

type CardSeed = Omit<
  CardDefinition,
  'color' | 'art' | 'set' | 'artist' | 'unlocked' | 'sfx'
> & { readonly sfx?: CardSfx };

const factionCost = (faction: FactionId, colored: number, generic = 0): ManaCost => ({
  generic,
  colored: colored === 0 ? {} : { [faction]: colored },
});

const ARTIST_CREDITS: Readonly<Record<string, string>> = Object.freeze({
  'fuente-furia': 'L. Valcazar, M. Iriarte & Taller de Luz Volcanica',
  'sabueso-brasa': 'V. Sanz, I. Rauk & Taller de Bestiario Igneo',
  'berserker-ignivoro': 'A. Montiel, C. Nervo & Taller de Oleo Heroico',
  'dragon-caldera': 'S. Aranda, D. Korr & Taller de Mural Epico',
  'lluvia-ceniza': 'N. Beltran, E. Ros & Taller de Atmosfera Negra',
  'forja-carmesi': 'P. Duarte, L. Maceira & Taller de Metal Ritual',
  'lancera-magma': 'R. Astar, M. Quiral & Taller de Figura Dinamica',
  'fenix-pavesa': 'C. Echevarri, A. Soler & Taller de Gouache Luminoso',
  'ariete-volcanico': 'B. Iriondo, T. Mallo & Taller de Perspectiva Baja',
  'pacto-ascuas': 'F. Lera, O. Vey & Taller de Ritual Intimo',
  'altar-combustion': 'H. Nadir, S. Coto & Taller Simbolista',
  'temblor-rojo': 'D. Salvat, J. Roca & Taller de Paisaje Cataclismico',
  'fuente-arcana': 'M. Olarte, L. Vesper & Taller de Acuarela Luminica',
  'centinela-cristal': 'E. Rivas, N. Calve & Taller de Prisma Mineral',
  'tejedora-escarcha': 'I. Llorens, A. Vela & Taller de Figura Elegante',
  'prision-glacial': 'Q. Soria, L. Mael & Taller de Arquitectura Fria',
  'cometa-arcano': 'T. Nerea, B. Voss & Taller Astronomico',
  'torre-horizonte': 'G. Estel, M. Bruma & Taller de Arquitectura Romantica',
  'duelista-prisma': 'A. Faber, C. Lince & Taller de Esgrima Prismatica',
  'golem-azur': 'R. Navas, E. Aro & Taller de Criatura Mineral',
  'niebla-espejada': 'V. Merin, S. Albor & Taller de Nocturno Surreal',
  'eco-cronomante': 'J. Auren, P. Sibil & Taller Simbolista Arcano',
  'archivo-viviente': 'M. Doria, H. Clave & Taller de Biblioteca Imposible',
  'convergencia-astral': 'K. Morat, I. Serna & Taller de Geometria Cosmica',
});

const defineCard = (seed: CardSeed): CardDefinition => {
  const definition: CardDefinition = {
    ...seed,
    color: FACTION_BY_ID[seed.faction].color,
    art: {
      webp: `/assets/cards/art/${seed.id}.webp`,
      fallback: `/assets/cards/art/${seed.id}.svg`,
      alt: `Ilustración de ${seed.name}`,
    },
    set: 'NEX-01 · Despertar',
    artist: ARTIST_CREDITS[seed.id] ?? 'Atelier del Nexo',
    unlocked: true,
    sfx: seed.sfx ?? { play: `${seed.faction}-play`, impact: `${seed.faction}-impact` },
  };
  return CardDefinitionSchema.parse(definition) as CardDefinition;
};

const furyCards: readonly CardDefinition[] = [
  defineCard({
    id: 'fuente-furia', name: 'Fuente de Furia', faction: 'fury', type: 'mana', subtype: 'Fuente',
    rarity: 'common', cost: factionCost('fury', 0),
    rules: 'Agota esta fuente: genera 1 de Esencia Carmesí.',
    flavor: 'Bajo la montaña, el corazón del mundo todavía arde.',
    keywords: [], collectorNumber: 1, aiTags: ['resource'], unique: false, effects: [],
    vfx: { persistentEffect: 'fury-source-embers' }, sfx: { play: 'resource-fury' },
  }),
  defineCard({
    id: 'sabueso-brasa', name: 'Sabueso de Brasa', faction: 'fury', type: 'unit', subtype: 'Bestia',
    rarity: 'common', cost: factionCost('fury', 1), attack: 2, health: 1, range: 1, movement: 2,
    rules: 'Impulso: puede moverse el turno en que entra en juego.',
    flavor: 'No persigue el olor de la sangre, sino el miedo que la precede.',
    keywords: ['impulse'], collectorNumber: 2, aiTags: ['aggressive', 'fast'], unique: false, effects: [],
    vfx: { summonEffect: 'ember-pounce', attackEffect: 'ember-trail', deathEffect: 'ash-burst' },
  }),
  defineCard({
    id: 'berserker-ignivoro', name: 'Berserker Ignívoro', faction: 'fury', type: 'unit', subtype: 'Guerrero',
    rarity: 'uncommon', cost: factionCost('fury', 2, 1), attack: 3, health: 3, range: 1, movement: 2,
    rules: 'Cuando ataque por primera vez cada turno, obtiene +1 Ataque durante ese combate.',
    flavor: 'Cada cicatriz es una puerta por la que vuelve a entrar el fuego.',
    keywords: [], collectorNumber: 3, aiTags: ['aggressive', 'combat'], unique: false,
    effects: [{ kind: 'buff-self-on-attack', attack: 1 }],
    vfx: { summonEffect: 'fury-cracks', attackEffect: 'rage-flare', impactEffect: 'heavy-impact' },
  }),
  defineCard({
    id: 'dragon-caldera', name: 'Dragón de la Caldera', faction: 'fury', type: 'unit', subtype: 'Dragón',
    rarity: 'mythic', cost: factionCost('fury', 2, 5), attack: 7, health: 6, range: 1, movement: 2,
    rules: 'Al entrar en juego, inflige 2 de daño a todas las demás cartas de las casillas adyacentes.',
    flavor: 'La Caldera no entró en erupción. Simplemente abrió los ojos.',
    keywords: [], collectorNumber: 4, aiTags: ['finisher', 'area-damage'], unique: true,
    effects: [{ kind: 'adjacent-damage', amount: 2, includeAllies: true }],
    vfx: { summonEffect: 'caldera-eruption', attackEffect: 'dragon-flame', deathEffect: 'volcanic-collapse' },
  }),
  defineCard({
    id: 'lluvia-ceniza', name: 'Lluvia de Ceniza', faction: 'fury', type: 'instant', subtype: 'Conjuro',
    rarity: 'uncommon', cost: factionCost('fury', 1, 2),
    rules: 'Inflige 2 de daño a una unidad. Su casilla queda abrasada hasta el final del siguiente turno.',
    flavor: 'Cuando el cielo se vuelve gris, hasta las sombras buscan refugio.',
    keywords: [], collectorNumber: 5, aiTags: ['removal', 'damage'], unique: false,
    effects: [{ kind: 'damage', amount: 2, target: 'enemy-piece' }, { kind: 'scorch', duration: 1 }],
    vfx: { impactEffect: 'ash-rain', persistentEffect: 'scorched-tile' }, sfx: { play: 'ash-rain', impact: 'fire-impact' },
  }),
  defineCard({
    id: 'forja-carmesi', name: 'Forja Carmesí', faction: 'fury', type: 'structure', subtype: 'Forja',
    rarity: 'rare', cost: factionCost('fury', 1, 2), resistance: 5,
    rules: 'La primera unidad de Furia que juegues cada turno obtiene +1 Ataque hasta el final del turno.',
    flavor: 'Aquí no se fabrican armas. Se despierta su hambre.',
    keywords: [], collectorNumber: 6, aiTags: ['structure', 'buff'], unique: false,
    effects: [{ kind: 'passive', id: 'first-fury-unit-attack', value: 1 }],
    vfx: { summonEffect: 'forge-rise', persistentEffect: 'forge-glow', deathEffect: 'forge-collapse' },
  }),
  defineCard({
    id: 'lancera-magma', name: 'Lancera de Magma', faction: 'fury', type: 'unit', subtype: 'Guerrera',
    rarity: 'common', cost: factionCost('fury', 1, 1), attack: 2, health: 2, range: 1, movement: 2,
    rules: 'Impulso. Puede avanzar hasta 2 casillas si ambas están libres.',
    flavor: 'La lava siempre encuentra una grieta; su lanza también.',
    keywords: ['impulse'], collectorNumber: 7, aiTags: ['fast', 'flanker'], unique: false, effects: [],
    vfx: { summonEffect: 'slag-sparks', attackEffect: 'cinder-dash' },
  }),
  defineCard({
    id: 'fenix-pavesa', name: 'Fénix de Pavesa', faction: 'fury', type: 'unit', subtype: 'Ave ígnea',
    rarity: 'uncommon', cost: factionCost('fury', 1, 2), attack: 2, health: 3, range: 2, movement: 2,
    rules: 'Al entrar en juego, inflige 1 de daño a una carta enemiga adyacente.',
    flavor: 'Cada una de sus plumas recuerda un incendio distinto.',
    keywords: [], collectorNumber: 8, aiTags: ['ranged', 'damage'], unique: false,
    effects: [{ kind: 'passive', id: 'entry-adjacent-enemy-damage', value: 1 }],
    vfx: { summonEffect: 'rift-open', attackEffect: 'fire-bolt', impactEffect: 'magma-pop' },
  }),
  defineCard({
    id: 'ariete-volcanico', name: 'Ariete Volcánico', faction: 'fury', type: 'unit', subtype: 'Constructo',
    rarity: 'rare', cost: factionCost('fury', 2, 2), attack: 4, health: 5, range: 1, movement: 1,
    rules: 'Cuando daña una estructura, inflige 2 de daño adicional.',
    flavor: 'La puerta cede mucho antes que la piedra se canse.',
    keywords: [], collectorNumber: 9, aiTags: ['siege', 'durable'], unique: false,
    effects: [{ kind: 'passive', id: 'structure-bonus-damage', value: 2 }],
    vfx: { summonEffect: 'basalt-drop', attackEffect: 'siege-charge', impactEffect: 'stone-shockwave' },
  }),
  defineCard({
    id: 'pacto-ascuas', name: 'Pacto de Ascuas', faction: 'fury', type: 'instant', subtype: 'Ritual',
    rarity: 'rare', cost: factionCost('fury', 1, 1),
    rules: 'Una unidad aliada obtiene +2 Ataque hasta el final del turno.',
    flavor: 'Un juramento pronunciado sobre carbón nunca se enfría.',
    keywords: [], collectorNumber: 10, aiTags: ['buff', 'combat'], unique: false,
    effects: [{ kind: 'passive', id: 'target-attack-until-end', value: 2 }],
    vfx: { impactEffect: 'ember-oath' },
  }),
  defineCard({
    id: 'altar-combustion', name: 'Altar de Combustión', faction: 'fury', type: 'structure', subtype: 'Altar',
    rarity: 'common', cost: factionCost('fury', 1, 1), resistance: 4,
    rules: 'Las unidades enemigas no pueden atravesar esta casilla.',
    flavor: 'La llama acepta todas las ofrendas y nunca concede absolución.',
    keywords: ['guard'], collectorNumber: 11, aiTags: ['structure', 'defense'], unique: false,
    effects: [{ kind: 'passive', id: 'blocking-structure' }],
    vfx: { summonEffect: 'magma-wall', persistentEffect: 'heat-haze' },
  }),
  defineCard({
    id: 'temblor-rojo', name: 'Temblor Rojo', faction: 'fury', type: 'persistent', subtype: 'Cataclismo',
    rarity: 'rare', cost: factionCost('fury', 2, 2),
    rules: 'Inflige 3 de daño a una unidad. Después, la réplica inflige 1 de daño a la unidad enemiga más debilitada restante.',
    flavor: 'La tierra aprende a rugir antes de abrirse.',
    keywords: [], collectorNumber: 12, aiTags: ['removal', 'damage'], unique: false,
    effects: [{ kind: 'damage', amount: 3, target: 'enemy-piece' }, { kind: 'splash-weakest-enemy', amount: 1 }],
    vfx: { impactEffect: 'chain-eruption', persistentEffect: 'magma-chain' },
  }),
];

const arcaneCards: readonly CardDefinition[] = [
  defineCard({
    id: 'fuente-arcana', name: 'Fuente Arcana', faction: 'arcane', type: 'mana', subtype: 'Fuente',
    rarity: 'common', cost: factionCost('arcane', 0),
    rules: 'Agota esta fuente: genera 1 de Esencia Celeste.',
    flavor: 'Cada cristal conserva una pregunta que el mundo aún no sabe responder.',
    keywords: [], collectorNumber: 13, aiTags: ['resource'], unique: false, effects: [],
    vfx: { persistentEffect: 'arcane-source-runes' }, sfx: { play: 'resource-arcane' },
  }),
  defineCard({
    id: 'centinela-cristal', name: 'Centinela de Cristal', faction: 'arcane', type: 'unit', subtype: 'Constructo',
    rarity: 'common', cost: factionCost('arcane', 1, 1), attack: 1, health: 3, range: 1, movement: 1,
    rules: 'Al entrar en juego, observa las dos primeras cartas de tu mazo y colócalas en el orden que quieras.',
    flavor: 'No piensa, no duerme y jamás olvida una orden.',
    keywords: [], collectorNumber: 14, aiTags: ['defense', 'scry'], unique: false,
    effects: [{ kind: 'scry', amount: 2 }],
    vfx: { summonEffect: 'crystal-assemble', attackEffect: 'crystal-swipe', deathEffect: 'crystal-shatter' },
  }),
  defineCard({
    id: 'tejedora-escarcha', name: 'Tejedora de Escarcha', faction: 'arcane', type: 'unit', subtype: 'Hechicera',
    rarity: 'uncommon', cost: factionCost('arcane', 2, 1), attack: 2, health: 3, range: 2, movement: 2,
    rules: 'Cuando dañe a una unidad, esa unidad no podrá moverse durante su próximo turno.',
    flavor: 'Con un gesto detiene el agua. Con una palabra, detiene ejércitos.',
    keywords: [], collectorNumber: 15, aiTags: ['ranged', 'control'], unique: false,
    effects: [{ kind: 'passive', id: 'freeze-on-damage', value: 1 }],
    vfx: { summonEffect: 'frost-weave', attackEffect: 'ice-thread', impactEffect: 'freeze-lock' },
  }),
  defineCard({
    id: 'prision-glacial', name: 'Prisión Glacial', faction: 'arcane', type: 'persistent', subtype: 'Encantamiento',
    rarity: 'uncommon', cost: factionCost('arcane', 1, 1),
    rules: 'Congela una unidad hasta el comienzo de tu siguiente turno. No puede moverse ni atacar.',
    flavor: 'El hielo no encierra el cuerpo. Convence al tiempo de que deje de avanzar.',
    keywords: [], collectorNumber: 16, aiTags: ['freeze', 'control'], unique: false,
    effects: [{ kind: 'freeze', duration: 1 }],
    vfx: { impactEffect: 'glacial-prison', persistentEffect: 'frozen-runes' },
  }),
  defineCard({
    id: 'cometa-arcano', name: 'Cometa Arcano', faction: 'arcane', type: 'instant', subtype: 'Evocación',
    rarity: 'rare', cost: factionCost('arcane', 2, 3),
    rules: 'Inflige 4 de daño a una unidad o estructura. Si el objetivo estaba congelado, inflige 2 de daño adicional.',
    flavor: 'Los sabios estudian las estrellas. Los necios esperan a que caigan.',
    keywords: [], collectorNumber: 17, aiTags: ['removal', 'damage'], unique: false,
    effects: [{ kind: 'damage', amount: 4, target: 'any-piece' }, { kind: 'passive', id: 'frozen-bonus-damage', value: 2 }],
    vfx: { impactEffect: 'arcane-comet' }, sfx: { play: 'comet-cast', impact: 'comet-impact' },
  }),
  defineCard({
    id: 'torre-horizonte', name: 'Torre del Horizonte', faction: 'arcane', type: 'structure', subtype: 'Observatorio',
    rarity: 'rare', cost: factionCost('arcane', 1, 3), resistance: 5,
    rules: 'Una vez por turno, después de lanzar un hechizo, puedes robar una carta y descartar otra.',
    flavor: 'Desde lo alto puede verse el futuro, pero nunca el precio de alcanzarlo.',
    keywords: [], collectorNumber: 18, aiTags: ['structure', 'draw'], unique: false,
    effects: [{ kind: 'passive', id: 'loot-after-spell', value: 1 }],
    vfx: { summonEffect: 'tower-rise', persistentEffect: 'horizon-orbit', deathEffect: 'rune-collapse' },
  }),
  defineCard({
    id: 'duelista-prisma', name: 'Duelista del Prisma', faction: 'arcane', type: 'unit', subtype: 'Místico',
    rarity: 'common', cost: factionCost('arcane', 1), attack: 1, health: 2, range: 1, movement: 2,
    rules: 'Al entrar en juego, roba una carta y luego descarta una carta.',
    flavor: 'Su hoja elige un color distinto para cada adversario.',
    keywords: [], collectorNumber: 19, aiTags: ['draw', 'utility'], unique: false,
    effects: [{ kind: 'draw', amount: 1 }, { kind: 'discard', amount: 1 }],
    vfx: { summonEffect: 'seven-runes', attackEffect: 'rune-pulse' },
  }),
  defineCard({
    id: 'golem-azur', name: 'Gólem Azur', faction: 'arcane', type: 'unit', subtype: 'Constructo',
    rarity: 'uncommon', cost: factionCost('arcane', 1, 2), attack: 2, health: 5, range: 1, movement: 1,
    rules: 'La primera vez que reciba daño cada turno, reduce ese daño en 1.',
    flavor: 'Su núcleo contiene un mar que jamás conoció orillas.',
    keywords: ['guard'], collectorNumber: 20, aiTags: ['defense', 'durable'], unique: false,
    effects: [{ kind: 'passive', id: 'first-damage-reduction', value: 1 }],
    vfx: { summonEffect: 'azur-assemble', impactEffect: 'water-shield', deathEffect: 'azur-shatter' },
  }),
  defineCard({
    id: 'niebla-espejada', name: 'Niebla Espejada', faction: 'arcane', type: 'persistent', subtype: 'Encantamiento',
    rarity: 'rare', cost: factionCost('arcane', 2, 1),
    rules: 'Observa las tres primeras cartas de tu mazo y colócalas en el orden que quieras. Después, roba una carta.',
    flavor: 'Cada reflejo oculta a quien lo está mirando.',
    keywords: [], collectorNumber: 21, aiTags: ['scry', 'draw'], unique: false,
    effects: [{ kind: 'scry', amount: 3 }, { kind: 'draw', amount: 1 }],
    vfx: { summonEffect: 'mirror-unfold', persistentEffect: 'probability-shimmer' },
  }),
  defineCard({
    id: 'eco-cronomante', name: 'Eco Cronomante', faction: 'arcane', type: 'instant', subtype: 'Cronomancia',
    rarity: 'common', cost: factionCost('arcane', 1, 1),
    rules: 'Roba 2 cartas y luego descarta una carta.',
    flavor: 'Su voz llega siempre un instante antes que sus labios.',
    keywords: [], collectorNumber: 22, aiTags: ['draw', 'selection'], unique: false,
    effects: [{ kind: 'draw', amount: 2 }, { kind: 'discard', amount: 1 }],
    vfx: { impactEffect: 'time-current' },
  }),
  defineCard({
    id: 'archivo-viviente', name: 'Archivo Viviente', faction: 'arcane', type: 'unit', subtype: 'Místico',
    rarity: 'mythic', cost: factionCost('arcane', 2, 4), attack: 4, health: 6, range: 2, movement: 1,
    rules: 'Al entrar en juego, roba 2 cartas. Tus hechizos cuestan 1 genérico menos, hasta un mínimo de 0.',
    flavor: 'Ha catalogado cada final salvo el suyo.',
    keywords: ['channel'], collectorNumber: 23, aiTags: ['finisher', 'draw'], unique: true,
    effects: [{ kind: 'draw', amount: 2 }, { kind: 'passive', id: 'spell-generic-discount', value: 1 }],
    vfx: { summonEffect: 'infinite-library', attackEffect: 'glyph-beam', deathEffect: 'pages-to-stars' },
  }),
  defineCard({
    id: 'convergencia-astral', name: 'Convergencia Astral', faction: 'arcane', type: 'persistent', subtype: 'Portal',
    rarity: 'uncommon', cost: factionCost('arcane', 1, 2),
    rules: 'Una unidad aliada puede moverse de nuevo este turno, aunque acabe de entrar en juego.',
    flavor: 'Cuando las estrellas coinciden, la distancia pierde toda autoridad.',
    keywords: [], collectorNumber: 24, aiTags: ['movement', 'control'], unique: false,
    effects: [{ kind: 'refresh-move' }],
    vfx: { impactEffect: 'folded-threshold', persistentEffect: 'portal-ripple' },
  }),
];

export const CARDS = Object.freeze([...furyCards, ...arcaneCards]) as readonly CardDefinition[];

if (CARDS.length !== 24 || new Set(CARDS.map((card) => card.id)).size !== 24) {
  throw new Error('El conjunto NEX-01 debe contener exactamente 24 cartas con identificadores únicos.');
}

export const CARD_BY_ID: Readonly<Record<string, CardDefinition>> = Object.freeze(
  Object.fromEntries(CARDS.map((card) => [card.id, card])),
);

export const cardsForFaction = (faction: FactionId): readonly CardDefinition[] =>
  CARDS.filter((card) => card.faction === faction);

export const MANDATORY_CARD_IDS = [
  'fuente-furia', 'sabueso-brasa', 'berserker-ignivoro', 'dragon-caldera', 'lluvia-ceniza', 'forja-carmesi',
  'fuente-arcana', 'centinela-cristal', 'tejedora-escarcha', 'prision-glacial', 'cometa-arcano', 'torre-horizonte',
] as const;
