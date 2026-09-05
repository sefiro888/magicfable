import { CommanderDefinitionSchema, DeckDefinitionSchema } from './schemas';
import type { CommanderDefinition, DeckDefinition } from './types';

export const COMMANDERS = [
  CommanderDefinitionSchema.parse({
    id: 'kaela-corazon-caldera',
    name: 'Kaela',
    title: 'Corazón de la Caldera',
    faction: 'fury',
    nexusHealth: 35,
    rules: 'La primera vez que tu Nexo reciba daño cada turno, tu siguiente unidad cuesta 1 genérico menos.',
    flavor: 'Mientras quede una brasa, la montaña tendrá voz.',
    art: {
      webp: '/assets/cards/art/kaela-corazon-caldera.webp',
      fallback: '/assets/cards/art/kaela-corazon-caldera.svg',
      alt: 'Kaela ante el corazón incandescente de la Caldera',
    },
    vfx: { persistentEffect: 'commander-caldera-aura', impactEffect: 'commander-fury-hit' },
    power: {
      name: 'Erupción de la Caldera',
      description: 'Inflige 2 de daño a todas las unidades enemigas.',
      cost: { generic: 2, colored: { fury: 1 } },
      effects: [{ kind: 'damage-all-enemies', amount: 2 }],
      effectId: 'commander-fury-power',
    },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'oriel-custodio-septima-runa',
    name: 'Oriel',
    title: 'Custodio de la Séptima Runa',
    faction: 'arcane',
    nexusHealth: 35,
    rules: 'La primera vez que lances tu segundo hechizo cada turno, observa la primera carta de tu mazo.',
    flavor: 'Las respuestas son puertas; las preguntas deciden cuál abrir.',
    art: {
      webp: '/assets/cards/art/oriel-custodio-septima-runa.webp',
      fallback: '/assets/cards/art/oriel-custodio-septima-runa.svg',
      alt: 'Oriel custodiando una runa suspendida entre cristales',
    },
    vfx: { persistentEffect: 'commander-rune-aura', impactEffect: 'commander-arcane-hit' },
    power: {
      name: 'Quietud de la Séptima Runa',
      description: 'Congela una unidad enemiga 2 turnos y robas 1 carta.',
      cost: { generic: 1, colored: { arcane: 1 } },
      needsEnemyTarget: true,
      effects: [{ kind: 'freeze', duration: 2 }, { kind: 'draw', amount: 1 }],
      effectId: 'commander-arcane-power',
    },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'verdania-guardiana-raices',
    name: 'Verdania',
    title: 'Guardiana de las Raíces',
    faction: 'nature',
    nexusHealth: 35,
    rules: 'Siempre que una unidad aliada entra en juego, gana +1 Vida.',
    flavor: 'El bosque antigua que recuerda tiempos antes de las montañas.',
    art: {
      webp: '/assets/cards/art/verdania-guardiana-raices.webp',
      fallback: '/assets/cards/art/verdania-guardiana-raices.svg',
      alt: 'Verdania rodeada de antiguos árboles y magia verdadera',
    },
    vfx: { persistentEffect: 'commander-nature-aura', impactEffect: 'commander-nature-hit' },
    power: {
      name: 'Savia del Origen',
      description: 'Cura 7 de Vida a tu Nexo y escruta 1.',
      cost: { generic: 1, colored: { nature: 1 } },
      effects: [{ kind: 'heal-nexus', amount: 7 }, { kind: 'scry', amount: 1 }],
      effectId: 'commander-nature-power',
    },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'asterin-protector-luz',
    name: 'Asterin',
    title: 'Protector de la Luz Eterna',
    faction: 'order',
    nexusHealth: 35,
    rules: 'Cuando una unidad aliada entra en juego, gana escudo preventivo 1.',
    flavor: 'Portador de la luz que juzga con justicia y protege sin error.',
    art: {
      webp: '/assets/cards/art/asterin-protector-luz.webp',
      fallback: '/assets/cards/art/asterin-protector-luz.svg',
      alt: 'Asterin con alas de luz celestial y armadura dorada',
    },
    vfx: { persistentEffect: 'commander-order-aura', impactEffect: 'commander-order-hit' },
    power: {
      name: 'Égida Eterna',
      description: 'Inflige 3 de daño a todas las unidades enemigas y cura 3 a tu Nexo.',
      cost: { generic: 2, colored: { order: 1 } },
      effects: [{ kind: 'damage-all-enemies', amount: 3 }, { kind: 'heal-nexus', amount: 3 }],
      effectId: 'commander-order-power',
    },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'malachar-reidor-sombra',
    name: 'Malachar',
    title: 'Reidores de la Sombra',
    faction: 'shadow',
    nexusHealth: 35,
    rules: 'Tus unidades drenan 1 Vida adicional cuando atacan.',
    flavor: 'Rey del vacío que sonríe mientras sus enemigos olvidan cómo vivir sin miedo.',
    art: {
      webp: '/assets/cards/art/malachar-reidor-sombra.webp',
      fallback: '/assets/cards/art/malachar-reidor-sombra.svg',
      alt: 'Malachar flotando en sombras púrpuras y neblina oscura',
    },
    vfx: { persistentEffect: 'commander-shadow-aura', impactEffect: 'commander-shadow-hit' },
    power: {
      name: 'Diezmo de Malachar',
      description: 'El rival descarta 1 carta y tu Nexo se cura 4.',
      cost: { generic: 1, colored: { shadow: 1 } },
      effects: [{ kind: 'discard', amount: 1, target: 'enemy-hand' }, { kind: 'heal-nexus', amount: 4 }],
      effectId: 'commander-shadow-power',
    },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'nyxaris-heraldo-vacio',
    name: 'Nyxaris',
    title: 'Heraldo del Vacío',
    faction: 'void',
    nexusHealth: 35,
    rules: 'La primera unidad que despliegues cada turno entra sin mareo de invocación.',
    flavor: 'Donde el espacio se pliega, Nyxaris ya estaba esperando.',
    art: {
      webp: '/assets/cards/art/nyxaris-heraldo-vacio.webp',
      fallback: '/assets/cards/art/nyxaris-heraldo-vacio.svg',
      alt: 'Nyxaris emergiendo de una fractura violeta en el espacio',
    },
    vfx: { persistentEffect: 'commander-void-aura', impactEffect: 'commander-void-hit' },
    power: {
      name: 'Fractura del Heraldo',
      description: 'Inflige 4 de daño a una unidad enemiga.',
      cost: { generic: 2, colored: { void: 1 } },
      needsEnemyTarget: true,
      effects: [{ kind: 'damage', amount: 4, target: 'enemy-piece' }],
      effectId: 'commander-void-power',
    },
  }) as CommanderDefinition,
  // --- Comandantes alternativos (NEX-02 «Fractura») ---
  // Uno por facción. No traen cartas nuevas: reorientan el mazo entero desde
  // la pasiva, así que la misma lista de 60 cartas se juega de otra manera
  // según a quién pongas al mando.
  CommanderDefinitionSchema.parse({
    id: 'borran-yunque-vivo',
    name: 'Borrán',
    title: 'Yunque Vivo',
    faction: 'fury',
    nexusHealth: 35,
    rules: 'Tus estructuras entran con +2 de Resistencia. La primera unidad que destruyas cada turno cura 1 a tu Nexo.',
    flavor: 'Se injertó el yunque para no tener que soltarlo nunca.',
    art: {
      webp: '/assets/cards/art/borran-yunque-vivo.webp',
      fallback: '/assets/cards/art/borran-yunque-vivo.svg',
      alt: 'Borrán, herrero gigantesco con un yunque incandescente por brazo',
    },
    vfx: { persistentEffect: 'commander-caldera-aura', impactEffect: 'commander-fury-hit' },
    power: {
      name: 'Temple del Yunque',
      description: 'Inflige 5 de daño a una unidad enemiga y cura 2 a tu Nexo.',
      cost: { generic: 2, colored: { fury: 1 } },
      needsEnemyTarget: true,
      effects: [{ kind: 'damage', amount: 5, target: 'enemy-piece' }, { kind: 'heal-nexus', amount: 2 }],
      effectId: 'commander-fury-power',
    },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'sialu-lengua-de-hielo',
    name: 'Síalu',
    title: 'Lengua de Hielo',
    faction: 'arcane',
    nexusHealth: 35,
    rules: 'La primera vez que congelas o aturdes a una unidad cada turno, robas 1 carta.',
    flavor: 'Habla despacio. El aire se queda quieto para escucharla.',
    art: {
      webp: '/assets/cards/art/sialu-lengua-de-hielo.webp',
      fallback: '/assets/cards/art/sialu-lengua-de-hielo.svg',
      alt: 'Síalu, hechicera de piel azulada con el aliento helado',
    },
    vfx: { persistentEffect: 'commander-rune-aura', impactEffect: 'commander-arcane-hit' },
    power: {
      name: 'Palabra de Escarcha',
      description: 'Aturde a una unidad enemiga y robas 2 cartas.',
      cost: { generic: 1, colored: { arcane: 1 } },
      needsEnemyTarget: true,
      effects: [{ kind: 'stun' }, { kind: 'draw', amount: 2 }],
      effectId: 'commander-arcane-power',
    },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'marnak-raiz-profunda',
    name: 'Márnak',
    title: 'Raíz Profunda',
    faction: 'nature',
    nexusHealth: 35,
    rules: 'Tus unidades con Guardia entran en juego con un escudo de 2.',
    flavor: 'Lleva tanto tiempo quieto que ya no distingue dónde acaba él y empieza el bosque.',
    art: {
      webp: '/assets/cards/art/marnak-raiz-profunda.webp',
      fallback: '/assets/cards/art/marnak-raiz-profunda.svg',
      alt: 'Márnak, guardián anciano medio humano medio árbol',
    },
    vfx: { persistentEffect: 'commander-nature-aura', impactEffect: 'commander-nature-hit' },
    power: {
      name: 'Raíz que Sostiene',
      description: 'Cura 5 a tu Nexo y una unidad aliada gana +2 de Ataque hasta el final del turno.',
      cost: { generic: 1, colored: { nature: 1 } },
      effects: [{ kind: 'heal-nexus', amount: 5 }, { kind: 'passive', id: 'target-attack-until-end', value: 2 }],
      effectId: 'commander-nature-power',
    },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'veyra-espada-consagrada',
    name: 'Veyra',
    title: 'Espada Consagrada',
    faction: 'order',
    nexusHealth: 35,
    rules: 'Tus unidades voladoras tienen Vínculo vital.',
    flavor: 'El juramento no se pronuncia: se sostiene.',
    art: {
      webp: '/assets/cards/art/veyra-espada-consagrada.webp',
      fallback: '/assets/cards/art/veyra-espada-consagrada.svg',
      alt: 'Veyra, caballero de armadura de mármol sosteniendo una espada de luz',
    },
    vfx: { persistentEffect: 'commander-order-aura', impactEffect: 'commander-order-hit' },
    power: {
      name: 'Voto de Luz',
      description: 'Cura 6 a tu Nexo y escruta 1.',
      cost: { generic: 1, colored: { order: 1 } },
      effects: [{ kind: 'heal-nexus', amount: 6 }, { kind: 'scry', amount: 1 }],
      effectId: 'commander-order-power',
    },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'oren-el-tercer-luto',
    name: 'Orén',
    title: 'el Tercer Luto',
    faction: 'shadow',
    nexusHealth: 35,
    rules: 'Cada vez que tu Nexo se cura, el Nexo enemigo pierde 1 de Vida (como mucho 2 por turno).',
    flavor: 'Guarda tres lutos: el que llevó, el que lleva y el que ya tiene preparado.',
    art: {
      webp: '/assets/cards/art/oren-el-tercer-luto.webp',
      fallback: '/assets/cards/art/oren-el-tercer-luto.svg',
      alt: 'Orén, hombre enjuto de luto ceremonial con una vela de llama violeta',
    },
    vfx: { persistentEffect: 'commander-shadow-aura', impactEffect: 'commander-shadow-hit' },
    power: {
      name: 'Tercer Luto',
      description: 'Cura 6 a tu Nexo y el rival descarta 1 carta.',
      cost: { generic: 1, colored: { shadow: 1 } },
      effects: [{ kind: 'heal-nexus', amount: 6 }, { kind: 'discard', amount: 1, target: 'enemy-hand' }],
      effectId: 'commander-shadow-power',
    },
  }) as CommanderDefinition,
  CommanderDefinitionSchema.parse({
    id: 'zeph-sin-orilla',
    name: 'Zeph',
    title: 'Sin Orilla',
    faction: 'void',
    nexusHealth: 35,
    rules: 'La primera unidad que despliegues cada turno puede moverse el turno en que entra.',
    flavor: 'No llegó de ninguna parte. Solo dejó de no estar.',
    art: {
      webp: '/assets/cards/art/zeph-sin-orilla.webp',
      fallback: '/assets/cards/art/zeph-sin-orilla.svg',
      alt: 'Zeph, figura andrógina cuyo contorno se deshace en vidrio púrpura',
    },
    vfx: { persistentEffect: 'commander-void-aura', impactEffect: 'commander-void-hit' },
    power: {
      name: 'Marea sin Orilla',
      description: 'Una unidad aliada puede volver a moverse y gana Perforar hasta el final del turno.',
      cost: { generic: 1, colored: { void: 1 } },
      effects: [{ kind: 'refresh-move' }, { kind: 'grant-keyword', keyword: 'pierce' }],
      effectId: 'commander-void-power',
    },
  }) as CommanderDefinition,
  // --- Duna (NEX-03 «El Tribunal de Arena») ---
  CommanderDefinitionSchema.parse({
    id: 'khaeris-la-balanza',
    name: 'Khaeris',
    title: 'La Balanza',
    faction: 'duna',
    nexusHealth: 35,
    rules: 'La primera vez cada turno que pagas una Ofrenda, robas 1 carta.',
    flavor: 'No juzga lo que hiciste. Pesa lo que queda de ti.',
    art: {
      webp: '/assets/cards/art/khaeris-la-balanza.webp',
      fallback: '/assets/cards/art/khaeris-la-balanza.svg',
      alt: 'Khaeris con máscara ceremonial de chacal sosteniendo una balanza de oro',
    },
    vfx: { persistentEffect: 'commander-duna-aura', impactEffect: 'commander-duna-hit' },
    power: {
      name: 'Pesaje del Corazón',
      description: 'Cura 8 a tu Nexo y el rival descarta 1 carta.',
      cost: { generic: 2, colored: { duna: 1 } },
      effects: [{ kind: 'heal-nexus', amount: 8 }, { kind: 'discard', amount: 1, target: 'enemy-hand' }],
      effectId: 'commander-duna-power',
    },
  }) as CommanderDefinition,
  // --- Fimbul (NEX-04 «El Invierno que No Termina») ---
  CommanderDefinitionSchema.parse({
    id: 'hildr-la-que-elige',
    name: 'Hildr',
    title: 'La que Elige a los Caídos',
    faction: 'fimbul',
    nexusHealth: 35,
    rules: 'La primera vez cada turno que una unidad tuya ataca a otra con más Ataque, robas 1 carta.',
    flavor: 'No decide quién gana. Decide a quién se lleva.',
    art: {
      webp: '/assets/cards/art/hildr-la-que-elige.webp',
      fallback: '/assets/cards/art/hildr-la-que-elige.svg',
      alt: 'Hildr con lanza y yelmo de hierro ante un campo nevado bajo la aurora boreal',
    },
    vfx: { persistentEffect: 'commander-fimbul-aura', impactEffect: 'commander-fimbul-hit' },
    power: {
      name: 'Elección del Campo',
      description: 'Todas tus unidades ganan +2 de Ataque hasta el final del turno y pueden volver a atacar.',
      cost: { generic: 2, colored: { fimbul: 1 } },
      effects: [{ kind: 'buff-all-allies-attack', amount: 2 }, { kind: 'refresh-attack-all' }],
      effectId: 'commander-fimbul-power',
    },
  }) as CommanderDefinition,
  // --- Samsara (NEX-05 «La Rueda que no se Detiene») ---
  CommanderDefinitionSchema.parse({
    id: 'indrayani-la-rueda',
    name: 'Indrayani',
    title: 'La que Hace Girar la Rueda',
    faction: 'samsara',
    nexusHealth: 35,
    rules: 'La primera unidad aliada que muere cada turno te hace robar 1 carta.',
    flavor: 'No castiga ni perdona. Solo se asegura de que la rueda siga girando.',
    art: {
      webp: '/assets/cards/art/indrayani-la-rueda.webp',
      fallback: '/assets/cards/art/indrayani-la-rueda.svg',
      alt: 'Indrayani, figura de cuatro brazos con corona de oro y aureola de fuego',
    },
    vfx: { persistentEffect: 'commander-samsara-aura', impactEffect: 'commander-samsara-hit' },
    power: {
      name: 'Vuelta Completa',
      description: 'Devuelve a tu mano todas tus unidades destruidas esta partida que tuvieran Renacer.',
      cost: { generic: 2, colored: { samsara: 1 } },
      effects: [{ kind: 'return-graveyard-renacer' }],
      effectId: 'commander-samsara-power',
    },
  }) as CommanderDefinition,
  // --- Jade (NEX-06 «El Mandato del Cielo») ---
  CommanderDefinitionSchema.parse({
    id: 'xiwangmu-la-reina-madre',
    name: 'Xiwangmu',
    title: 'La Reina Madre de Occidente',
    faction: 'jade',
    nexusHealth: 35,
    rules: 'Mientras tengas el Mandato, la primera carta que juegas cada turno cuesta 1 genérico menos.',
    flavor: 'Su jardín da fruta cada tres mil años. Sabe esperar.',
    art: {
      webp: '/assets/cards/art/xiwangmu-la-reina-madre.webp',
      fallback: '/assets/cards/art/xiwangmu-la-reina-madre.svg',
      alt: 'Xiwangmu con tocado de jade y oro sosteniendo un melocotón de la inmortalidad',
    },
    vfx: { persistentEffect: 'commander-jade-aura', impactEffect: 'commander-jade-hit' },
    power: {
      name: 'Melocotón de la Inmortalidad',
      description: 'Cura 8 a tu Nexo, robas 1 carta y reclamas el Mandato Celestial.',
      cost: { generic: 2, colored: { jade: 1 } },
      effects: [{ kind: 'heal-nexus', amount: 8 }, { kind: 'draw', amount: 1 }, { kind: 'claim-mandate' }],
      effectId: 'commander-jade-power',
    },
  }) as CommanderDefinition,
  // --- Olimpo (NEX-07 «La Medida y el Exceso») ---
  CommanderDefinitionSchema.parse({
    id: 'nemesis-la-que-mide',
    name: 'Némesis',
    title: 'La que Mide',
    faction: 'olimpo',
    nexusHealth: 35,
    rules: 'Mientras tu Hybris sea 5 o menos, tus unidades tienen +1 de Vida.',
    flavor: 'No castiga la maldad. Castiga la desproporción, que es más común.',
    art: {
      webp: '/assets/cards/art/nemesis-la-que-mide.webp',
      fallback: '/assets/cards/art/nemesis-la-que-mide.svg',
      alt: 'Némesis con alas oscuras sosteniendo una vara de medir y una brida',
    },
    vfx: { persistentEffect: 'commander-olimpo-aura', impactEffect: 'commander-olimpo-hit' },
    power: {
      name: 'Restitución',
      description: 'Pon tu Hybris a cero y cura a tu Nexo tanta Vida como el contador que has borrado.',
      cost: { generic: 2, colored: { olimpo: 1 } },
      effects: [{ kind: 'reset-hybris-and-heal' }],
      effectId: 'commander-olimpo-power',
    },
  }) as CommanderDefinition,
  // --- Quinto Sol (NEX-08 «El que hay que Alimentar») ---
  CommanderDefinitionSchema.parse({
    id: 'itzpapalotl-mariposa-obsidiana',
    name: 'Itzpapálotl',
    title: 'Mariposa de Obsidiana',
    faction: 'sol',
    nexusHealth: 35,
    rules: 'El primer Sacrificio de cada turno también inflige 1 de daño al Nexo enemigo.',
    flavor: 'No pide nada que no vaya a devolver convertido en amanecer.',
    art: {
      webp: '/assets/cards/art/itzpapalotl-mariposa-obsidiana.webp',
      fallback: '/assets/cards/art/itzpapalotl-mariposa-obsidiana.svg',
      alt: 'Itzpapálotl con alas de hojas de obsidiana bajo un cielo de estrellas cayendo',
    },
    vfx: { persistentEffect: 'commander-sol-aura', impactEffect: 'commander-sol-hit' },
    power: {
      name: 'Caída de las Estrellas',
      description: 'Inflige a todas las unidades enemigas daño igual a tu Cuenta del Sol.',
      cost: { generic: 2, colored: { sol: 1 } },
      effects: [{ kind: 'damage-all-enemies-by-sun-count' }],
      effectId: 'commander-sol-power',
    },
  }) as CommanderDefinition,
  // --- Bestiario (NEX-09 «Las Bestias que Ningún Pueblo Pudo Domesticar») ---
  CommanderDefinitionSchema.parse({
    id: 'vaelith-la-guardabestias',
    name: 'Vaelith',
    title: 'La Guardabestias',
    faction: 'bestiario',
    nexusHealth: 35,
    rules: 'Mientras controles una unidad con Guardia, tus unidades entran en juego con +1 de Vida.',
    flavor: 'No las domó. Aprendió a pedir permiso.',
    art: {
      webp: '/assets/cards/art/vaelith-la-guardabestias.webp',
      fallback: '/assets/cards/art/vaelith-la-guardabestias.svg',
      alt: 'Vaelith con ropa de cuero remendado sosteniendo una cadena suelta ante el bosque',
    },
    vfx: { persistentEffect: 'commander-bestiario-aura', impactEffect: 'commander-bestiario-hit' },
    power: {
      name: 'Instinto de Caza',
      description: 'Inflige 6 de daño a la unidad enemiga con más Ataque y cura 6 a tu Nexo.',
      cost: { generic: 2, colored: { bestiario: 1 } },
      effects: [{ kind: 'passive', id: 'entry-damage-strongest', value: 6 }, { kind: 'heal-nexus', amount: 6 }],
      effectId: 'commander-bestiario-power',
    },
  }) as CommanderDefinition,
  // --- Plaga (NEX-10 «Lo que Muerde, no Perdona») ---
  CommanderDefinitionSchema.parse({
    id: 'kessra-paciente-cero',
    name: 'Kessra',
    title: 'La Paciente Cero',
    faction: 'plaga',
    nexusHealth: 35,
    rules: 'La primera vez cada turno que infectas a una unidad enemiga, robas 1 carta.',
    flavor: 'No recuerda haber estado enferma. Recuerda que dejó de importarle.',
    art: {
      webp: '/assets/cards/art/kessra-paciente-cero.webp',
      fallback: '/assets/cards/art/kessra-paciente-cero.svg',
      alt: 'Kessra con máscara de pico de peste vacía en una tienda de cuarentena',
    },
    vfx: { persistentEffect: 'commander-plaga-aura', impactEffect: 'commander-plaga-hit' },
    power: {
      name: 'Brote Final',
      description: 'Infecta a todas las unidades enemigas y todas las unidades Infectadas pierden 3 de Vida de inmediato.',
      cost: { generic: 2, colored: { plaga: 1 } },
      effects: [
        { kind: 'passive', id: 'infect-all-enemies' },
        { kind: 'passive', id: 'damage-all-infected-enemies', value: 3 },
      ],
      effectId: 'commander-plaga-power',
    },
  }) as CommanderDefinition,
  // --- Marea (NEX-11 «El Ciclo de las Aguas») ---
  CommanderDefinitionSchema.parse({
    id: 'nerith-voz-de-la-resaca',
    name: 'Nerith',
    title: 'Voz de la Resaca',
    faction: 'marea',
    nexusHealth: 35,
    rules: 'En Pleamar, la primera unidad que juegues cada turno entra con un escudo de 2.',
    flavor: 'El mar no discute. Vuelve.',
    art: {
      webp: '/assets/cards/art/nerith-voz-de-la-resaca.webp',
      fallback: '/assets/cards/art/nerith-voz-de-la-resaca.svg',
      alt: 'Nerith cubierta por una segunda piel de agua, con corona de coral',
    },
    vfx: { persistentEffect: 'commander-marea-aura', impactEffect: 'commander-marea-hit' },
    power: {
      name: 'Resaca',
      description: 'Empuja 1 casilla hacia atrás a todas las unidades enemigas y cura 3 a tu Nexo.',
      cost: { generic: 2, colored: { marea: 1 } },
      effects: [
        { kind: 'push-all-enemies', amount: 1, toward: 'away' },
        { kind: 'heal-nexus', amount: 3 },
      ],
      effectId: 'commander-marea-power',
    },
  }) as CommanderDefinition,
  // --- Forja (NEX-12 «El Gremio de los Engranajes») ---
  CommanderDefinitionSchema.parse({
    id: 'torvald-maestro-del-yunque',
    name: 'Torvald',
    title: 'Maestro del Yunque',
    faction: 'forja',
    nexusHealth: 35,
    rules: 'Tus estructuras entran en juego con +1 de Resistencia.',
    flavor: 'Una pieza bien hecha no necesita que la animen. Solo que la dejen girar.',
    art: {
      webp: '/assets/cards/art/torvald-maestro-del-yunque.webp',
      fallback: '/assets/cards/art/torvald-maestro-del-yunque.svg',
      alt: 'Torvald, artesano corpulento con brazo mecánico de latón, en su taller',
    },
    vfx: { persistentEffect: 'commander-forja-aura', impactEffect: 'commander-forja-hit' },
    power: {
      name: 'Dar cuerda',
      description: 'Todas tus unidades ganan +2 de Ataque hasta el final del turno y pueden volver a moverse.',
      cost: { generic: 2, colored: { forja: 1 } },
      effects: [
        { kind: 'buff-all-allies-attack', amount: 2 },
        { kind: 'refresh-move' },
      ],
      effectId: 'commander-forja-power',
    },
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
    { cardId: 'sabueso-brasa', count: 3 },
    { cardId: 'berserker-ignivoro', count: 3 },
    { cardId: 'dragon-caldera', count: 1 },
    { cardId: 'lluvia-ceniza', count: 2 },
    { cardId: 'forja-carmesi', count: 2 },
    { cardId: 'lancera-magma', count: 2 },
    { cardId: 'fenix-pavesa', count: 2 },
    { cardId: 'ariete-volcanico', count: 3 },
    { cardId: 'pacto-ascuas', count: 1 },
    { cardId: 'altar-combustion', count: 2 },
    { cardId: 'temblor-rojo', count: 2 },
    { cardId: 'gigante-magma', count: 1 },
    { cardId: 'draco-magma', count: 1 },
    { cardId: 'elemental-tormenta', count: 2 },
    { cardId: 'heraldo-de-la-ruina', count: 2 },
    { cardId: 'pira-de-los-caidos', count: 1 },
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
    { cardId: 'prision-glacial', count: 2 },
    { cardId: 'cometa-arcano', count: 1 },
    { cardId: 'torre-horizonte', count: 2 },
    { cardId: 'duelista-prisma', count: 2 },
    { cardId: 'golem-azur', count: 3 },
    { cardId: 'niebla-espejada', count: 1 },
    { cardId: 'eco-cronomante', count: 1 },
    { cardId: 'archivo-viviente', count: 1 },
    { cardId: 'convergencia-astral', count: 1 },
    { cardId: 'dragon-escarcha', count: 1 },
    { cardId: 'mago-celestial', count: 2 },
    { cardId: 'destello-runico', count: 1 },
    { cardId: 'custodio-del-solsticio', count: 1 },
    { cardId: 'garza-de-escarcha', count: 2 },
    { cardId: 'biblioteca-sumergida', count: 1 },
    { cardId: 'silencio-prismatico', count: 2 },
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
    { cardId: 'lobo-salvaje', count: 3 },
    { cardId: 'driada-manantial', count: 3 },
    { cardId: 'jabali-embestida', count: 2 },
    { cardId: 'guardian-robledal', count: 2 },
    { cardId: 'crecimiento-salvaje', count: 3 },
    { cardId: 'oso-forestal', count: 1 },
    { cardId: 'centauro-cazador', count: 2 },
    { cardId: 'elfo-ancestral', count: 2 },
    { cardId: 'arboleda-sagrada', count: 2 },
    { cardId: 'savia-restauradora', count: 2 },
    { cardId: 'muralla-zarzas', count: 1 },
    { cardId: 'aliento-primavera', count: 1 },
    { cardId: 'guardabosques-tenaz', count: 2 },
    { cardId: 'corazon-del-manantial', count: 1 },
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
    { cardId: 'lancero-alba', count: 2 },
    { cardId: 'clerigo-luz', count: 3 },
    { cardId: 'aguila-celestial', count: 4 },
    { cardId: 'centinela-solar', count: 1 },
    { cardId: 'angel-celestial', count: 2 },
    { cardId: 'bendicion-escudo', count: 3 },
    { cardId: 'pegaso-celestial', count: 3 },
    { cardId: 'paladin-glorioso', count: 1 },
    { cardId: 'grifo-orden', count: 1 },
    { cardId: 'heraldo-juicio', count: 2 },
    { cardId: 'columna-luz', count: 2 },
    { cardId: 'juicio-divino', count: 1 },
    { cardId: 'escudera-del-alba', count: 4 },
    { cardId: 'arcangel-del-veredicto', count: 1 },
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
    { cardId: 'sacerdote-carrona', count: 2 },
    { cardId: 'ritual-sanguino', count: 1 },
    { cardId: 'nigromante-oscuro', count: 4 },
    { cardId: 'maldicion-sombra', count: 2 },
    { cardId: 'vampiro-siniestro', count: 3 },
    { cardId: 'guadana-espectral', count: 1 },
    { cardId: 'pesadilla-mortal', count: 3 },
    { cardId: 'senor-osario', count: 4 },
    { cardId: 'cripta-olvidada', count: 2 },
    { cardId: 'senora-de-la-mortaja', count: 1 },
    { cardId: 'carronero-del-osario', count: 3 },
    { cardId: 'mausoleo-hambriento', count: 2 },
    { cardId: 'diezmo-de-sangre', count: 2 },
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
    { cardId: 'singularidad', count: 2 },
    { cardId: 'quimera-caos', count: 2 },
    { cardId: 'devorador-entropico', count: 2 },
    { cardId: 'tejedor-entropia', count: 2 },
    { cardId: 'colapso-dimensional', count: 1 },
    { cardId: 'paradoja-vacio', count: 1 },
    { cardId: 'portal-inestable', count: 2 },
    { cardId: 'aniquilacion-vacio', count: 1 },
    { cardId: 'leviatan-abismal', count: 1 },
    { cardId: 'devorador-de-ecos', count: 2 },
    { cardId: 'faro-de-la-fractura', count: 1 },
    { cardId: 'arquitecta-del-vacio', count: 1 },
  ],
}) as DeckDefinition;

/**
 * Duna: 20 fuentes y una lista que gira sobre Ofrenda y Juicio. Lleva más
 * curación de la que parece razonable a propósito — es lo que le permite
 * pagar Ofrendas sin morirse y volver a subir después de que el Tribunal ya
 * haya fallado a su favor.
 */
const dunaDeck = DeckDefinitionSchema.parse({
  id: 'tribunal-duna',
  name: 'Tribunal de Arena',
  faction: 'duna',
  commanderId: 'khaeris-la-balanza',
  cards: [
    { cardId: 'fuente-duna', count: 20 },
    { cardId: 'escriba-del-tribunal', count: 2 },
    { cardId: 'lancero-de-arena', count: 2 },
    { cardId: 'chacal-guardian', count: 1 },
    { cardId: 'portadora-de-ofrendas', count: 2 },
    { cardId: 'embalsamador', count: 2 },
    { cardId: 'guardiana-de-la-tumba', count: 1 },
    { cardId: 'sacerdote-solar', count: 2 },
    { cardId: 'momia-funcionaria', count: 2 },
    { cardId: 'arquera-del-nilo', count: 2 },
    { cardId: 'escorpion-de-basalto', count: 1 },
    { cardId: 'heraldo-con-cabeza-de-ibis', count: 1 },
    { cardId: 'devoradora-del-inframundo', count: 1 },
    { cardId: 'visir-de-la-arena', count: 1 },
    { cardId: 'leon-de-la-sequia', count: 1 },
    { cardId: 'plegaria-al-sol', count: 1 },
    { cardId: 'crecida-del-rio', count: 1 },
    { cardId: 'vendaje-ritual', count: 1 },
    { cardId: 'maldicion-del-sello', count: 1 },
    { cardId: 'obelisco', count: 1 },
    { cardId: 'pozo-escalonado', count: 1 },
    { cardId: 'templo-del-veredicto', count: 1 },
    { cardId: 'balanza-de-maat', count: 1 },
    { cardId: 'escriba-del-tribunal', count: 1 },
  ],
}) as DeckDefinition;

/**
 * Fimbul: quiere el intercambio difícil, no el fácil. 20 fuentes y una lista
 * que se apoya en Desafío y Furor tal como pide el dosier — Húscarle, Lobo y
 * Valquiria buscan chocar con lo grande del rival, y Berserker y Gigante
 * rinden justo cuando ya les han pegado.
 */
const fimbulDeck = DeckDefinitionSchema.parse({
  id: 'invierno-fimbul',
  name: 'El Invierno que No Termina',
  faction: 'fimbul',
  commanderId: 'hildr-la-que-elige',
  cards: [
    { cardId: 'fuente-fimbul', count: 20 },
    { cardId: 'escudero-del-thing', count: 2 },
    { cardId: 'doncella-escudo', count: 2 },
    { cardId: 'cuervo-de-la-horca', count: 1 },
    { cardId: 'berserker-de-piel-de-oso', count: 2 },
    { cardId: 'arquera-de-hielo', count: 2 },
    { cardId: 'huscarle-del-rey', count: 2 },
    { cardId: 'skald-de-las-sagas', count: 1 },
    { cardId: 'jinete-del-drakkar', count: 1 },
    { cardId: 'draugr-del-tumulo', count: 1 },
    { cardId: 'jarl-de-la-costa', count: 1 },
    { cardId: 'herrero-de-los-enanos', count: 1 },
    { cardId: 'lobo-de-fenrir', count: 1 },
    { cardId: 'valquiria-de-la-eleccion', count: 1 },
    { cardId: 'gigante-de-la-escarcha', count: 1 },
    { cardId: 'serpiente-del-mundo', count: 1 },
    { cardId: 'holmgang', count: 1 },
    { cardId: 'martillo-que-vuelve', count: 1 },
    { cardId: 'runa-de-la-victoria', count: 1 },
    { cardId: 'invierno-de-fimbul', count: 1 },
    { cardId: 'lanza-que-no-falla', count: 1 },
    { cardId: 'ocaso-de-los-dioses', count: 1 },
    { cardId: 'muro-de-escudos', count: 1 },
    { cardId: 'salon-de-los-caidos', count: 1 },
    { cardId: 'piedra-runica', count: 1 },
    { cardId: 'fresno-del-mundo', count: 1 },
  ],
}) as DeckDefinition;

/**
 * Samsara: gira sobre Renacer y Avatar tal como pide el dosier — Peregrino y
 * Mono Saltarín entran, mueren, vuelven mayores; Garuda, Rakshasa y Avatar del
 * Jabalí premian que ya haya muerto algo tuyo ese turno.
 */
const samsaraDeck = DeckDefinitionSchema.parse({
  id: 'rueda-samsara',
  name: 'La Rueda que no se Detiene',
  faction: 'samsara',
  commanderId: 'indrayani-la-rueda',
  cards: [
    { cardId: 'fuente-samsara', count: 20 },
    { cardId: 'peregrino-del-ganges', count: 1 },
    { cardId: 'guardian-de-la-puerta', count: 2 },
    { cardId: 'tigresa-de-la-diosa', count: 2 },
    { cardId: 'mono-saltarin', count: 1 },
    { cardId: 'bailarina-de-los-cien-brazos', count: 1 },
    { cardId: 'naga-del-pozo', count: 2 },
    { cardId: 'asceta-de-la-ceniza', count: 1 },
    { cardId: 'arquero-del-arco-de-cuerno', count: 2 },
    { cardId: 'vaca-de-la-abundancia', count: 2 },
    { cardId: 'elefante-de-guerra', count: 1 },
    { cardId: 'garuda-de-alas-de-sol', count: 1 },
    { cardId: 'rakshasa-de-la-noche', count: 1 },
    { cardId: 'nino-de-la-flauta', count: 1 },
    { cardId: 'avatar-del-jabali', count: 1 },
    { cardId: 'danzante-de-la-destruccion', count: 1 },
    { cardId: 'flecha-de-brahma', count: 1 },
    { cardId: 'rueda-que-gira', count: 1 },
    { cardId: 'bendicion-del-rio', count: 1 },
    { cardId: 'ofrenda-de-fuego', count: 1 },
    { cardId: 'monzon', count: 1 },
    { cardId: 'karma', count: 1 },
    { cardId: 'templo-de-la-rueda', count: 1 },
    { cardId: 'pira-del-ghat', count: 1 },
    { cardId: 'estanque-de-loto', count: 1 },
    { cardId: 'montana-batida', count: 1 },
  ],
}) as DeckDefinition;

/**
 * Jade: gira sobre el Mandato Celestial tal como pide el dosier — Qilin y
 * General lo reclaman al entrar, Monje y Zorra rinden más mientras lo tengas,
 * y Sello Imperial/Mandato Revocado te dejan pelear por él fuera de turno.
 */
const jadeDeck = DeckDefinitionSchema.parse({
  id: 'mandato-jade',
  name: 'El Mandato del Cielo',
  faction: 'jade',
  commanderId: 'xiwangmu-la-reina-madre',
  cards: [
    { cardId: 'fuente-jade', count: 20 },
    { cardId: 'guardia-de-terracota', count: 2 },
    { cardId: 'grulla-mensajera', count: 1 },
    { cardId: 'jinete-de-la-estepa', count: 2 },
    { cardId: 'funcionario-del-censo', count: 2 },
    { cardId: 'arquero-de-la-muralla', count: 1 },
    { cardId: 'monje-de-la-montana', count: 1 },
    { cardId: 'alquimista-del-cinabrio', count: 1 },
    { cardId: 'tigre-blanco-del-oeste', count: 1 },
    { cardId: 'tortuga-negra-del-norte', count: 1 },
    { cardId: 'ave-bermeja-del-sur', count: 1 },
    { cardId: 'qilin-de-buen-augurio', count: 1 },
    { cardId: 'zorra-de-nueve-colas', count: 1 },
    { cardId: 'leon-guardian-de-bronce', count: 1 },
    { cardId: 'dragon-del-rio-amarillo', count: 1 },
    { cardId: 'general-de-los-mil-estandartes', count: 1 },
    { cardId: 'sello-imperial', count: 1 },
    { cardId: 'mandato-revocado', count: 1 },
    { cardId: 'fuegos-de-artificio', count: 2 },
    { cardId: 'viento-del-este', count: 1 },
    { cardId: 'inundacion-del-rio', count: 1 },
    { cardId: 'examen-imperial', count: 1 },
    { cardId: 'decreto-de-jade', count: 1 },
    { cardId: 'gran-muralla', count: 1 },
    { cardId: 'torre-del-tambor', count: 1 },
    { cardId: 'altar-del-cielo', count: 1 },
    { cardId: 'palacio-de-jade', count: 1 },
  ],
}) as DeckDefinition;

/**
 * Olimpo: busca golpear el Nexo pronto para que Hybris crezca, y decide
 * cuándo frenar antes de que la desmesura le pase factura — Sacerdotisa y
 * Templo aguantan el peaje, Némesis lo borra una vez por partida.
 */
const olimpoDeck = DeckDefinitionSchema.parse({
  id: 'medida-olimpo',
  name: 'La Medida y el Exceso',
  faction: 'olimpo',
  commanderId: 'nemesis-la-que-mide',
  cards: [
    { cardId: 'fuente-olimpo', count: 20 },
    { cardId: 'hoplita-de-la-falange', count: 2 },
    { cardId: 'corredor-de-maraton', count: 2 },
    { cardId: 'arquera-de-creta', count: 2 },
    { cardId: 'oraculo-de-delfos', count: 2 },
    { cardId: 'sirena-de-las-rocas', count: 2 },
    { cardId: 'escultor-de-marmol', count: 1 },
    { cardId: 'centauro-del-pelion', count: 1 },
    { cardId: 'pegaso-de-corinto', count: 1 },
    { cardId: 'medusa-de-mirada-fija', count: 1 },
    { cardId: 'minotauro-del-laberinto', count: 1 },
    { cardId: 'quimera-de-licia', count: 1 },
    { cardId: 'sacerdotisa-de-eleusis', count: 1 },
    { cardId: 'heroe-de-los-doce-trabajos', count: 1 },
    { cardId: 'hidra-de-lerna', count: 1 },
    { cardId: 'titan-encadenado', count: 1 },
    { cardId: 'rayo-del-olimpo', count: 1 },
    { cardId: 'ambrosia', count: 1 },
    { cardId: 'hilo-de-las-moiras', count: 1 },
    { cardId: 'canto-de-las-musas', count: 1 },
    { cardId: 'tempestad-del-egeo', count: 1 },
    { cardId: 'hybris', count: 1 },
    { cardId: 'templo-de-columnas', count: 1 },
    { cardId: 'muralla-ciclopea', count: 1 },
    { cardId: 'agora', count: 1 },
    { cardId: 'altar-de-los-doce', count: 1 },
  ],
}) as DeckDefinition;

/**
 * Quinto Sol: despliega barato y lo gasta. Cargador y Perro son munición con
 * beneficio propio al morir; Portador, Colibrí y Tzitzimitl exigen esa
 * munición para entrar; Sacerdote, Danzante, Serpiente y Cuenta de los Días
 * tiran de la Cuenta del Sol que todos esos Sacrificios van dejando atrás.
 */
const solDeck = DeckDefinitionSchema.parse({
  id: 'alimentar-sol',
  name: 'El que hay que Alimentar',
  faction: 'sol',
  commanderId: 'itzpapalotl-mariposa-obsidiana',
  cards: [
    { cardId: 'fuente-sol', count: 20 },
    { cardId: 'cargador-de-tributo', count: 2 },
    { cardId: 'guerrero-aguila', count: 2 },
    { cardId: 'guerrero-jaguar', count: 2 },
    { cardId: 'perro-guia-del-inframundo', count: 1 },
    { cardId: 'arquero-de-chinampa', count: 2 },
    { cardId: 'portador-del-cuchillo', count: 2 },
    { cardId: 'tejedora-de-plumas', count: 1 },
    { cardId: 'mensajero-de-obsidiana', count: 1 },
    { cardId: 'sacerdote-del-templo-mayor', count: 1 },
    { cardId: 'colibri-del-sur', count: 1 },
    { cardId: 'danzante-del-fuego-nuevo', count: 1 },
    { cardId: 'senora-de-la-falda-de-jade', count: 1 },
    { cardId: 'monolito-viviente', count: 1 },
    { cardId: 'serpiente-emplumada', count: 1 },
    { cardId: 'tzitzimitl-estrella-caida', count: 1 },
    { cardId: 'corazon-ofrecido', count: 1 },
    { cardId: 'canto-de-guerra', count: 1 },
    { cardId: 'lluvia-de-obsidiana', count: 1 },
    { cardId: 'fuego-nuevo', count: 1 },
    { cardId: 'espejo-humeante', count: 1 },
    { cardId: 'cuenta-de-los-dias', count: 1 },
    { cardId: 'templo-mayor', count: 1 },
    { cardId: 'piedra-del-sol', count: 1 },
    { cardId: 'muro-de-craneos', count: 1 },
    { cardId: 'calzada-de-la-laguna', count: 1 },
  ],
}) as DeckDefinition;

/**
 * Bestiario: sin mecánica propia a propósito — solo palabras clave que ya
 * existen (Guardia, Impulso, Golpe veloz, Volador, Perforar, Vínculo vital,
 * Aturdir) y los cuerpos más grandes del juego coste por coste.
 */
const bestiarioDeck = DeckDefinitionSchema.parse({
  id: 'bestias-legendarias',
  name: 'Bestiario',
  faction: 'bestiario',
  commanderId: 'vaelith-la-guardabestias',
  cards: [
    { cardId: 'fuente-bestiario', count: 20 },
    { cardId: 'chupacabras', count: 3 },
    { cardId: 'yeti-de-la-cumbre', count: 2 },
    { cardId: 'viborno-alado', count: 2 },
    { cardId: 'manticora-del-desfiladero', count: 2 },
    { cardId: 'esfinge-del-umbral', count: 2 },
    { cardId: 'cancerbero', count: 1 },
    { cardId: 'anzu-tormenta', count: 1 },
    { cardId: 'roc-de-las-cumbres', count: 1 },
    { cardId: 'simurgh-de-plumas-de-cobre', count: 1 },
    { cardId: 'leon-de-piel-de-hierro', count: 1 },
    { cardId: 'tarasca-del-rio', count: 1 },
    { cardId: 'bakunawa', count: 1 },
    { cardId: 'aspidoquelone', count: 1 },
    { cardId: 'kraken-del-abismo', count: 1 },
    { cardId: 'behemot', count: 1 },
    { cardId: 'aliento-feroz', count: 1 },
    { cardId: 'coraza-de-escamas', count: 1 },
    { cardId: 'presa-debilitada', count: 1 },
    { cardId: 'instinto-de-manada', count: 1 },
    { cardId: 'estampida', count: 1 },
    { cardId: 'sangre-antigua', count: 1 },
    { cardId: 'guarida-profunda', count: 1 },
    { cardId: 'osario-de-huesos', count: 1 },
    { cardId: 'fosa-de-alimentacion', count: 1 },
  ],
}) as DeckDefinition;

/**
 * Plaga: siembra Contagio pronto (Mordedor, Verdugo) para que las piezas
 * infectadas rivales acaben convirtiéndose en Zombis Contagiados propios, y
 * deja que Fosa Común Andante y Turba Devoradora crezcan con esa horda.
 */
const plagaDeck = DeckDefinitionSchema.parse({
  id: 'contagio-plaga',
  name: 'Lo que Muerde, no Perdona',
  faction: 'plaga',
  commanderId: 'kessra-paciente-cero',
  cards: [
    { cardId: 'fuente-plaga', count: 20 },
    { cardId: 'mordedor-recien-alzado', count: 3 },
    { cardId: 'zombi-contagiado', count: 3 },
    { cardId: 'enjambre-de-moscas', count: 2 },
    { cardId: 'paciente-en-cuarentena', count: 2 },
    { cardId: 'verdugo-podrido', count: 2 },
    { cardId: 'enterrador-ciego', count: 1 },
    { cardId: 'fosa-comun-andante', count: 1 },
    { cardId: 'nino-infectado', count: 1 },
    { cardId: 'alguacil-reanimado', count: 1 },
    { cardId: 'medica-de-la-peste', count: 1 },
    { cardId: 'golem-de-carne-cosida', count: 1 },
    { cardId: 'turba-devoradora', count: 1 },
    { cardId: 'alcalde-caido', count: 1 },
    { cardId: 'horda-sin-fin', count: 1 },
    { cardId: 'titan-de-la-plaga', count: 1 },
    { cardId: 'mordisco-infeccioso', count: 1 },
    { cardId: 'niebla-infecciosa', count: 1 },
    { cardId: 'saqueo-de-tumbas', count: 1 },
    { cardId: 'avalancha-podrida', count: 1 },
    { cardId: 'resurreccion-forzada', count: 1 },
    { cardId: 'foso-comun', count: 1 },
    { cardId: 'campana-de-cuarentena', count: 1 },
    { cardId: 'criadero-de-horda', count: 1 },
  ],
}) as DeckDefinition;


/**
 * Marea. La primera lista que escribí para esta facción sacó un 16% de
 * victorias en la simulación, la peor de las dieciséis, con derrotas de 0% a
 * 100% contra Orden, Samsara y Bestiario. No era un fallo del motor —el empuje
 * y el ciclo funcionaban— sino de construcción: había cargado en lo defensivo
 * y en lo barato hasta dejar un mazo de control SIN NADA CON QUÉ CONTROLAR y
 * sin forma de cerrar. Cuatro cartas de 1 de Ataque, la carta con más copias
 * era un 2/3 de movimiento 1, y los Nexos se quedaban a 35 y 35 durante veinte
 * turnos hasta que Marea se quedaba sin cartas.
 *
 * Rehecha en torno a lo que la facción hace de verdad: presionar barato y
 * pronto, y usar el empuje para que el rival no pueda devolver el golpe. Fuera
 * el Centinela de Coral, el Pez Linterna y la Tejedora (los tres de 1 de
 * Ataque); dentro más Ahogado y más Rémora, que son las que corren. El
 * Lanzarredes baja de tres copias a dos: su empuje aparta al objetivo FUERA de
 * su propio alcance, así que acumularlo estorba en vez de sumar.
 *
 * Y SIN ESTRUCTURAS, que fue el cambio que más movió la aguja (de 22% a 28%).
 * En la traza se veía a la IA gastando los turnos tres y cuatro en levantar el
 * Arrecife y el Faro mientras el rival desplegaba; con dos estructuras de cero
 * ataque en la mesa, Marea llegaba al turno doce con una sola unidad. Marea no
 * es una facción que construya: es una que empuja y corre.
 *
 * Queda en el 28%, que sigue siendo parte baja. Es previsible y conviene no
 * sobreajustarlo: el valor de esta facción es POSICIONAL, y la IA valora
 * presencia y daño pero no reposicionamiento, así que su plan le resulta
 * invisible. Le pasa lo mismo que a Duna (29%) y al Quinto Sol (20%). Antes de
 * seguir tocando números hace falta jugarla a mano.
 *
 * Las cartas de Bajamar van por delante de las de Pleamar porque el primer
 * turno de la partida es impar, y una facción que solo despertara en los pares
 * empezaría siempre por detrás.
 */
const mareaDeck = DeckDefinitionSchema.parse({
  id: 'ciclo-marea',
  name: 'El Ciclo de las Aguas',
  faction: 'marea',
  commanderId: 'nerith-voz-de-la-resaca',
  cards: [
    { cardId: 'fuente-marea', count: 20 },
    { cardId: 'ahogado-rencoroso', count: 3 },
    { cardId: 'remora-oportunista', count: 3 },
    { cardId: 'nadadora-de-arrecife', count: 3 },
    { cardId: 'mensajera-de-espuma', count: 2 },
    { cardId: 'heraldo-de-la-corriente', count: 2 },
    { cardId: 'lanzarredes', count: 2 },
    { cardId: 'crustaceo-acorazado', count: 2 },
    { cardId: 'arponera-de-la-fosa', count: 2 },
    { cardId: 'guardiana-del-faro', count: 1 },
    { cardId: 'coloso-de-marea', count: 1 },
    { cardId: 'leviatan-de-las-simas', count: 1 },
    { cardId: 'abrazo-del-abismo', count: 2 },
    { cardId: 'sal-en-la-herida', count: 2 },
    { cardId: 'marea-viva', count: 1 },
    { cardId: 'nautilo-blindado', count: 2 },
    { cardId: 'resaca-subita', count: 1 },
  ],
});


/**
 * Forja: la lista carga en estructuras baratas por delante, porque cada una da
 * cuerda a los autómatas y sube el Ensamblaje de lo que venga después. Los dos
 * autómatas de coste cero están a cuatro copias a propósito: son el relleno que
 * hace de suelo mientras se monta la máquina, y sin ellos la facción se pasa
 * los tres primeros turnos sin poder hacer nada.
 */
const forjaDeck = DeckDefinitionSchema.parse({
  id: 'gremio-forja',
  name: 'El Gremio de los Engranajes',
  faction: 'forja',
  commanderId: 'torvald-maestro-del-yunque',
  cards: [
    { cardId: 'fuente-forja', count: 20 },
    { cardId: 'automata-de-taller', count: 4 },
    { cardId: 'chatarrero', count: 2 },
    { cardId: 'remachadora', count: 2 },
    { cardId: 'carguero-oxidado', count: 2 },
    { cardId: 'capataz-del-gremio', count: 2 },
    { cardId: 'ingeniera-de-campo', count: 1 },
    { cardId: 'soldadora-veterana', count: 1 },
    { cardId: 'centinela-de-engranaje', count: 2 },
    { cardId: 'perforadora-de-vapor', count: 1 },
    { cardId: 'martillo-automata', count: 1 },
    { cardId: 'titan-de-cuerda', count: 1 },
    { cardId: 'coloso-de-la-fundicion', count: 1 },
    { cardId: 'yunque-del-gremio', count: 3 },
    { cardId: 'torre-de-vapor', count: 2 },
    { cardId: 'deposito-de-piezas', count: 1 },
    { cardId: 'muralla-remachada', count: 1 },
    { cardId: 'dar-cuerda', count: 1 },
    { cardId: 'sobrecarga', count: 1 },
    { cardId: 'martillo-de-precision', count: 1 },
  ],
});

export const STARTER_DECKS = Object.freeze([
  furyDeck, arcaneDeck, natureDeck, orderDeck, shadowDeck, voidDeck,
  dunaDeck, fimbulDeck, samsaraDeck, jadeDeck, olimpoDeck, solDeck, bestiarioDeck, plagaDeck, mareaDeck, forjaDeck,
]) as readonly DeckDefinition[];

export const DECK_BY_ID: Readonly<Record<string, DeckDefinition>> = Object.freeze(
  Object.fromEntries(STARTER_DECKS.map((deck) => [deck.id, deck])),
);

export const expandDeck = (deck: DeckDefinition): readonly string[] =>
  deck.cards.flatMap((entry) => Array.from({ length: entry.count }, () => entry.cardId));
