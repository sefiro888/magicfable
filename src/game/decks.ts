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

export const STARTER_DECKS = Object.freeze([furyDeck, arcaneDeck]) as readonly DeckDefinition[];

export const DECK_BY_ID: Readonly<Record<string, DeckDefinition>> = Object.freeze(
  Object.fromEntries(STARTER_DECKS.map((deck) => [deck.id, deck])),
);

export const expandDeck = (deck: DeckDefinition): readonly string[] =>
  deck.cards.flatMap((entry) => Array.from({ length: entry.count }, () => entry.cardId));
