import { CommanderDefinitionSchema, DeckDefinitionSchema } from './schemas';
import type { CommanderDefinition, DeckDefinition } from './types';

export const COMMANDERS = [
  CommanderDefinitionSchema.parse({
    id: 'kaela-corazon-caldera',
    name: 'Kaela',
    title: 'Corazón de la Caldera',
    faction: 'fury',
    nexusHealth: 25,
    rules: 'La primera vez que tu Nexo reciba daño cada turno, tu siguiente unidad cuesta 1 genérico menos.',
    flavor: 'Mientras quede una brasa, la montaña tendrá voz.',
    art: {
      webp: '/assets/cards/art/kaela-corazon-caldera.webp',
      fallback: '/assets/cards/art/kaela-corazon-caldera.svg',
      alt: 'Kaela ante el corazón incandescente de la Caldera',
    },
    vfx: { persistentEffect: 'commander-caldera-aura', impactEffect: 'commander-fury-hit' },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'oriel-custodio-septima-runa',
    name: 'Oriel',
    title: 'Custodio de la Séptima Runa',
    faction: 'arcane',
    nexusHealth: 25,
    rules: 'La primera vez que lances tu segundo hechizo cada turno, observa la primera carta de tu mazo.',
    flavor: 'Las respuestas son puertas; las preguntas deciden cuál abrir.',
    art: {
      webp: '/assets/cards/art/oriel-custodio-septima-runa.webp',
      fallback: '/assets/cards/art/oriel-custodio-septima-runa.svg',
      alt: 'Oriel custodiando una runa suspendida entre cristales',
    },
    vfx: { persistentEffect: 'commander-rune-aura', impactEffect: 'commander-arcane-hit' },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'verdania-guardiana-raices',
    name: 'Verdania',
    title: 'Guardiana de las Raíces',
    faction: 'nature',
    nexusHealth: 25,
    rules: 'Siempre que una unidad aliada entra en juego, gana +1 Vida.',
    flavor: 'El bosque antigua que recuerda tiempos antes de las montañas.',
    art: {
      webp: '/assets/cards/art/kaela-corazon-caldera.webp',
      fallback: '/assets/cards/art/kaela-corazon-caldera.svg',
      alt: 'Verdania rodeada de antiguos árboles y magia verdadera',
    },
    vfx: { persistentEffect: 'commander-nature-aura', impactEffect: 'commander-nature-hit' },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'asterin-protector-luz',
    name: 'Asterin',
    title: 'Protector de la Luz Eterna',
    faction: 'order',
    nexusHealth: 25,
    rules: 'Cuando una unidad aliada entra en juego, gana escudo preventivo 1.',
    flavor: 'Portador de la luz que juzga con justicia y protege sin error.',
    art: {
      webp: '/assets/cards/art/oriel-custodio-septima-runa.webp',
      fallback: '/assets/cards/art/oriel-custodio-septima-runa.svg',
      alt: 'Asterin con alas de luz celestial y armadura dorada',
    },
    vfx: { persistentEffect: 'commander-order-aura', impactEffect: 'commander-order-hit' },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'malachar-reidor-sombra',
    name: 'Malachar',
    title: 'Reidores de la Sombra',
    faction: 'shadow',
    nexusHealth: 25,
    rules: 'Tus unidades drenan 1 Vida adicional cuando atacan.',
    flavor: 'Rey del vacío que sonríe mientras sus enemigos olvidan cómo vivir sin miedo.',
    art: {
      webp: '/assets/cards/art/kaela-corazon-caldera.webp',
      fallback: '/assets/cards/art/kaela-corazon-caldera.svg',
      alt: 'Malachar flotando en sombras púrpuras y neblina oscura',
    },
    vfx: { persistentEffect: 'commander-shadow-aura', impactEffect: 'commander-shadow-hit' },
  }) as CommanderDefinition,
] as const;

export const COMMANDER_BY_ID: Readonly<Record<string, CommanderDefinition>> = Object.freeze(
  Object.fromEntries(COMMANDERS.map((commander) => [commander.id, commander])),
);

const furyDeck = DeckDefinitionSchema.parse({
  id: 'furia-caldera',
  name: 'Furia de la Caldera',
  faction: 'fury',
  commanderId: 'kaela-corazon-caldera',
  cards: [
    { cardId: 'fuente-furia', count: 20 },
    { cardId: 'sabueso-brasa', count: 4 },
    { cardId: 'berserker-ignivoro', count: 3 },
    { cardId: 'dragon-caldera', count: 1 },
    { cardId: 'lluvia-ceniza', count: 3 },
    { cardId: 'forja-carmesi', count: 2 },
    { cardId: 'lancera-magma', count: 4 },
    { cardId: 'fenix-pavesa', count: 3 },
    { cardId: 'ariete-volcanico', count: 3 },
    { cardId: 'pacto-ascuas', count: 2 },
    { cardId: 'altar-combustion', count: 2 },
    { cardId: 'temblor-rojo', count: 3 },
  ],
}) as DeckDefinition;

const arcaneDeck = DeckDefinitionSchema.parse({
  id: 'secretos-arcano',
  name: 'Secretos del Arcano',
  faction: 'arcane',
  commanderId: 'oriel-custodio-septima-runa',
  cards: [
    { cardId: 'fuente-arcana', count: 20 },
    { cardId: 'centinela-cristal', count: 4 },
    { cardId: 'tejedora-escarcha', count: 3 },
    { cardId: 'prision-glacial', count: 3 },
    { cardId: 'cometa-arcano', count: 2 },
    { cardId: 'torre-horizonte', count: 2 },
    { cardId: 'duelista-prisma', count: 4 },
    { cardId: 'golem-azur', count: 3 },
    { cardId: 'niebla-espejada', count: 2 },
    { cardId: 'eco-cronomante', count: 3 },
    { cardId: 'archivo-viviente', count: 1 },
    { cardId: 'convergencia-astral', count: 3 },
  ],
}) as DeckDefinition;

const natureDeck = DeckDefinitionSchema.parse({
  id: 'sabiduria-bosque',
  name: 'Sabiduría del Bosque',
  faction: 'nature',
  commanderId: 'verdania-guardiana-raices',
  cards: [
    { cardId: 'fuente-naturaleza', count: 20 },
    { cardId: 'ciervo-sagrado', count: 5 },
    { cardId: 'lobo-salvaje', count: 5 },
    { cardId: 'oso-forestal', count: 4 },
    { cardId: 'centauro-cazador', count: 4 },
    { cardId: 'elfo-ancestral', count: 4 },
    { cardId: 'arboleda-sagrada', count: 4 },
    { cardId: 'crecimiento-salvaje', count: 4 },
  ],
}) as DeckDefinition;

const orderDeck = DeckDefinitionSchema.parse({
  id: 'orden-celestial',
  name: 'Orden Celestial',
  faction: 'order',
  commanderId: 'asterin-protector-luz',
  cards: [
    { cardId: 'fuente-orden', count: 20 },
    { cardId: 'angel-celestial', count: 5 },
    { cardId: 'aguila-celestial', count: 5 },
    { cardId: 'pegaso-celestial', count: 4 },
    { cardId: 'paladin-glorioso', count: 4 },
    { cardId: 'clerigo-luz', count: 4 },
    { cardId: 'grifo-orden', count: 4 },
    { cardId: 'juicio-divino', count: 4 },
  ],
}) as DeckDefinition;

const shadowDeck = DeckDefinitionSchema.parse({
  id: 'reidores-sombra',
  name: 'Reidores de la Sombra',
  faction: 'shadow',
  commanderId: 'malachar-reidor-sombra',
  cards: [
    { cardId: 'fuente-sombra', count: 20 },
    { cardId: 'murcielago-sombra', count: 5 },
    { cardId: 'espectro-siniestro', count: 5 },
    { cardId: 'esqueleto-guerrero', count: 4 },
    { cardId: 'nigromante-oscuro', count: 4 },
    { cardId: 'maldicion-sombra', count: 4 },
    { cardId: 'vampiro-siniestro', count: 4 },
    { cardId: 'pesadilla-mortal', count: 4 },
  ],
}) as DeckDefinition;

export const STARTER_DECKS = Object.freeze([furyDeck, arcaneDeck, natureDeck, orderDeck, shadowDeck]) as readonly DeckDefinition[];

export const DECK_BY_ID: Readonly<Record<string, DeckDefinition>> = Object.freeze(
  Object.fromEntries(STARTER_DECKS.map((deck) => [deck.id, deck])),
);

export const expandDeck = (deck: DeckDefinition): readonly string[] =>
  deck.cards.flatMap((entry) => Array.from({ length: entry.count }, () => entry.cardId));
