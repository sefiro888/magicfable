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
      webp: '/assets/cards/art/verdania-guardiana-raices.webp',
      fallback: '/assets/cards/art/verdania-guardiana-raices.svg',
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
      webp: '/assets/cards/art/asterin-protector-luz.webp',
      fallback: '/assets/cards/art/asterin-protector-luz.svg',
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
      webp: '/assets/cards/art/malachar-reidor-sombra.webp',
      fallback: '/assets/cards/art/malachar-reidor-sombra.svg',
      alt: 'Malachar flotando en sombras púrpuras y neblina oscura',
    },
    vfx: { persistentEffect: 'commander-shadow-aura', impactEffect: 'commander-shadow-hit' },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'nyxaris-heraldo-vacio',
    name: 'Nyxaris',
    title: 'Heraldo del Vacío',
    faction: 'void',
    nexusHealth: 25,
    rules: 'La primera unidad que despliegues cada turno entra sin mareo de invocación.',
    flavor: 'Donde el espacio se pliega, Nyxaris ya estaba esperando.',
    art: {
      webp: '/assets/cards/art/nyxaris-heraldo-vacio.webp',
      fallback: '/assets/cards/art/nyxaris-heraldo-vacio.svg',
      alt: 'Nyxaris emergiendo de una fractura violeta en el espacio',
    },
    vfx: { persistentEffect: 'commander-void-aura', impactEffect: 'commander-void-hit' },
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
    // Equilibrio (25 jul): Furia tenía fuera del mazo a sus dos mayores
    // amenazas (Gigante y Draco de Magma) y abusaba de criaturas de 1-2 de
    // Vida, que con el combate cuerpo a cuerpo mutuo mueren en cada cambio.
    { cardId: 'fuente-furia', count: 20 },
    { cardId: 'sabueso-brasa', count: 2 },
    { cardId: 'berserker-ignivoro', count: 3 },
    { cardId: 'dragon-caldera', count: 1 },
    { cardId: 'lluvia-ceniza', count: 3 },
    { cardId: 'forja-carmesi', count: 2 },
    { cardId: 'lancera-magma', count: 3 },
    { cardId: 'fenix-pavesa', count: 3 },
    { cardId: 'ariete-volcanico', count: 3 },
    { cardId: 'pacto-ascuas', count: 1 },
    { cardId: 'altar-combustion', count: 2 },
    { cardId: 'temblor-rojo', count: 2 },
    { cardId: 'gigante-magma', count: 2 },
    { cardId: 'draco-magma', count: 1 },
    { cardId: 'elemental-tormenta', count: 2 },
  ],
}) as DeckDefinition;

const arcaneDeck = DeckDefinitionSchema.parse({
  id: 'secretos-arcano',
  name: 'Secretos del Arcano',
  faction: 'arcane',
  commanderId: 'oriel-custodio-septima-runa',
  cards: [
    // Equilibrio (25 jul): era la facción más débil con diferencia (0,80 de
    // Ataque por carta frente a 1,6-2,0 del resto). Llevaba 13 instantes y
    // unidades de 1/2 y 1/3, y dejaba fuera del mazo a sus dos amenazas
    // reales: Dragón de Escarcha y Mago Celestial.
    // v2: subió de 12% a 72% — se pasó de frenada por meter demasiado
    // Alcance de golpe (Dragón de Escarcha + Mago Celestial). Se recorta a
    // la mitad y se devuelve peso a cuerpos cuerpo a cuerpo.
    { cardId: 'fuente-arcana', count: 20 },
    { cardId: 'centinela-cristal', count: 3 },
    { cardId: 'tejedora-escarcha', count: 3 },
    { cardId: 'prision-glacial', count: 3 },
    { cardId: 'cometa-arcano', count: 2 },
    { cardId: 'torre-horizonte', count: 2 },
    { cardId: 'duelista-prisma', count: 3 },
    { cardId: 'golem-azur', count: 3 },
    { cardId: 'niebla-espejada', count: 2 },
    { cardId: 'eco-cronomante', count: 1 },
    { cardId: 'archivo-viviente', count: 1 },
    { cardId: 'convergencia-astral', count: 2 },
    { cardId: 'dragon-escarcha', count: 1 },
    { cardId: 'mago-celestial', count: 2 },
    { cardId: 'destello-runico', count: 2 },
  ],
}) as DeckDefinition;

const natureDeck = DeckDefinitionSchema.parse({
  id: 'sabiduria-bosque',
  name: 'Sabiduría del Bosque',
  faction: 'nature',
  commanderId: 'verdania-guardiana-raices',
  cards: [
    // Equilibrio (25 jul): segunda más fuerte; se le recortan Guardias
    // (de 5 copias a 3) que es la palabra clave que más desnivela.
    { cardId: 'fuente-naturaleza', count: 20 },
    { cardId: 'ciervo-sagrado', count: 3 },
    { cardId: 'lobo-salvaje', count: 4 },
    { cardId: 'driada-manantial', count: 3 },
    { cardId: 'jabali-embestida', count: 3 },
    { cardId: 'guardian-robledal', count: 2 },
    { cardId: 'crecimiento-salvaje', count: 4 },
    { cardId: 'oso-forestal', count: 1 },
    { cardId: 'centauro-cazador', count: 2 },
    { cardId: 'elfo-ancestral', count: 2 },
    { cardId: 'arboleda-sagrada', count: 2 },
    { cardId: 'savia-restauradora', count: 2 },
    { cardId: 'muralla-zarzas', count: 1 },
    { cardId: 'aliento-primavera', count: 1 },
  ],
}) as DeckDefinition;

const orderDeck = DeckDefinitionSchema.parse({
  id: 'orden-celestial',
  name: 'Orden Celestial',
  faction: 'order',
  commanderId: 'asterin-protector-luz',
  cards: [
    // Equilibrio (25 jul): dominaba con un 95% de victorias por acumular 7
    // copias de Guardia (Lancero, Paladín y Grifo). Guardia obliga a atacar
    // al muro y bloquea el Nexo, y con el combate mutuo romperlo cuesta aún
    // más: se baja a 3 copias y se compensa con cartas sin Guardia.
    // v2: aun así subió a 74% — el problema real no era solo Guardia, era
    // que 17 de sus 21 unidades tenían Alcance 2+ (el mayor desequilibrio
    // de los 6 mazos). Se recorta el Alcance también, no solo Guardia.
    // v3: subió a 77% — sin querer también le había subido su remoción y
    // curación (Bendición del Escudo, Columna de Luz, Juicio Divino) a la
    // vez que recortaba Guardia/Alcance, tapando el efecto del recorte.
    // Se corrige eso específicamente y se devuelve peso a cuerpos simples.
    { cardId: 'fuente-orden', count: 20 },
    { cardId: 'lancero-alba', count: 3 },
    { cardId: 'clerigo-luz', count: 2 },
    { cardId: 'aguila-celestial', count: 2 },
    { cardId: 'centinela-solar', count: 2 },
    { cardId: 'angel-celestial', count: 2 },
    { cardId: 'bendicion-escudo', count: 2 },
    { cardId: 'pegaso-celestial', count: 3 },
    { cardId: 'paladin-glorioso', count: 3 },
    { cardId: 'grifo-orden', count: 1 },
    { cardId: 'heraldo-juicio', count: 4 },
    { cardId: 'columna-luz', count: 2 },
    { cardId: 'juicio-divino', count: 1 },
    { cardId: 'bastion-marmoreo', count: 3 },
  ],
}) as DeckDefinition;

const shadowDeck = DeckDefinitionSchema.parse({
  id: 'reidores-sombra',
  name: 'Reidores de la Sombra',
  faction: 'shadow',
  commanderId: 'malachar-reidor-sombra',
  cards: [
    // Equilibrio (25 jul): la más castigada por el combate mutuo (21%). Es
    // la única sin Guardias y la de menos Vida total, y su plan es atacar:
    // se cambian las criaturas de 1 de Vida (Sabueso de la Tumba 3/1) por
    // cuerpos que aguanten el intercambio.
    // v2: solo Nigromante Oscuro tiene Alcance 2+ en todo el pool de
    // Sombra (ya al máximo, 4 copias) — no hay más margen de Alcance por
    // lista. Se compensa subiendo cuerpos duros (Señor del Osario 5/4,
    // Sacerdote de Carroña) y estructura segura (Cripta) en vez de piezas
    // frágiles que mueren en cualquier intercambio.
    { cardId: 'fuente-sombra', count: 20 },
    { cardId: 'murcielago-sombra', count: 2 },
    { cardId: 'sabueso-tumba', count: 1 },
    { cardId: 'esqueleto-guerrero', count: 1 },
    { cardId: 'espectro-siniestro', count: 2 },
    { cardId: 'sacerdote-carrona', count: 4 },
    { cardId: 'ritual-sanguino', count: 2 },
    { cardId: 'nigromante-oscuro', count: 4 },
    { cardId: 'maldicion-sombra', count: 3 },
    { cardId: 'vampiro-siniestro', count: 2 },
    { cardId: 'guadana-espectral', count: 2 },
    { cardId: 'pesadilla-mortal', count: 2 },
    { cardId: 'senor-osario', count: 3 },
    { cardId: 'cripta-olvidada', count: 2 },
  ],
}) as DeckDefinition;

const voidDeck = DeckDefinitionSchema.parse({
  id: 'fractura-vacio',
  name: 'Fractura del Vacío',
  faction: 'void',
  commanderId: 'nyxaris-heraldo-vacio',
  cards: [
    { cardId: 'fuente-vacio', count: 20 },
    { cardId: 'heraldo-fractura', count: 3 },
    { cardId: 'horror-abisal', count: 3 },
    { cardId: 'caminante-umbral', count: 3 },
    { cardId: 'basilisco-caos', count: 3 },
    { cardId: 'singularidad', count: 3 },
    { cardId: 'quimera-caos', count: 2 },
    { cardId: 'devorador-entropico', count: 2 },
    { cardId: 'tejedor-entropia', count: 2 },
    { cardId: 'colapso-dimensional', count: 2 },
    { cardId: 'paradoja-vacio', count: 2 },
    { cardId: 'portal-inestable', count: 2 },
    { cardId: 'aniquilacion-vacio', count: 2 },
    { cardId: 'leviatan-abismal', count: 1 },
  ],
}) as DeckDefinition;

export const STARTER_DECKS = Object.freeze([furyDeck, arcaneDeck, natureDeck, orderDeck, shadowDeck, voidDeck]) as readonly DeckDefinition[];

export const DECK_BY_ID: Readonly<Record<string, DeckDefinition>> = Object.freeze(
  Object.fromEntries(STARTER_DECKS.map((deck) => [deck.id, deck])),
);

export const expandDeck = (deck: DeckDefinition): readonly string[] =>
  deck.cards.flatMap((entry) => Array.from({ length: entry.count }, () => entry.cardId));
