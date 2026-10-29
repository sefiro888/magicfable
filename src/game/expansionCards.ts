import seeds from './expansionSeeds.json' with { type: 'json' };
import { FACTION_BY_ID } from './factions';
import { CardDefinitionSchema } from './schemas';
import type { CardDefinition, CardEffect, FactionId } from './types';

/** Una carta solo sale de pendientes cuando todas sus reglas tienen ruta de
 * resolución. El catálogo activo no debe mostrar texto que el motor ignore. */
const implementedEffects: Readonly<Record<string, readonly CardEffect[]>> = {
  'fuente-goblin': [], 'fuente-tercios': [], 'fuente-kalevala': [],
  'pinche-de-polvora': [{ kind: 'passive', id: 'petardazo', value: 2 }],
  'el-gran-petardo': [{ kind: 'passive', id: 'petardazo', value: 2 }, { kind: 'passive', id: 'death-damage-enemy-nexus', value: 3 }],
  'artillero-chapucero': [{ kind: 'spark', face: 'cara' }, { kind: 'buff-self-on-attack', attack: 1 }, { kind: 'otherwise' }, { kind: 'passive', id: 'spark-ally-backfire', value: 1 }],
  lanzabombas: [{ kind: 'spark', face: 'cara' }, { kind: 'passive', id: 'spark-target-splash', value: 1 }, { kind: 'otherwise' }, { kind: 'passive', id: 'spark-self-splash', value: 1 }],
  chispazo: [{ kind: 'spark', face: 'cara' }, { kind: 'damage', amount: 3, target: 'enemy-piece' }, { kind: 'otherwise' }, { kind: 'damage-all-enemies', amount: 1 }],
  'a-ver-que-pasa': [{ kind: 'spark', face: 'cara' }, { kind: 'draw', amount: 2 }, { kind: 'otherwise' }, { kind: 'draw', amount: 1 }, { kind: 'passive', id: 'target-attack-until-end', value: 2 }],
  'doble-o-nada': [{ kind: 'spark', face: 'cara' }, { kind: 'passive', id: 'target-permanent-buff', value: 3 }, { kind: 'otherwise' }, { kind: 'passive', id: 'target-permanent-buff', value: 1 }, { kind: 'passive', id: 'target-petardazo' }],
  'invento-sin-probar': [{ kind: 'spark', face: 'cara' }, { kind: 'damage', amount: 5, target: 'enemy-piece' }, { kind: 'otherwise' }, { kind: 'damage', amount: 3, target: 'enemy-piece' }, { kind: 'damage-enemy-nexus', amount: 3 }],
  'remiendo-rapido': [{ kind: 'passive', id: 'target-shield', value: 3 }],
  'fiesta-de-la-polvora': [{ kind: 'damage-all-enemies', amount: 3, includeAllies: true }, { kind: 'passive', id: 'draw-own-casualties' }],
  buscachatarra: [{ kind: 'scry', amount: 1 }],
  'jinete-de-jabali': [], 'probador-voluntario': [{ kind: 'passive', id: 'petardazo', value: 2 }],
  coheteador: [], 'acorazado-de-latas': [],
  'cuadrilla-de-sabotaje': [{ kind: 'passive', id: 'structure-bonus-damage', value: 3 }],
  gastador: [{ kind: 'passive', id: 'double-structure-damage' }],
  'maestranza-de-artilleria': [],
  'capataz-griton': [{ kind: 'passive', id: 'attack-buff-nearby-allies', value: 1 }],
  'ingeniera-jefa': [], 'maquina-de-la-suerte': [],
  'maquina-andante': [{ kind: 'passive', id: 'petardazo', value: 2 }],
  'mecanico-de-urgencia': [{ kind: 'passive', id: 'start-repair-structure', value: 2 }],
  'torreta-de-chatarra': [{ kind: 'passive', id: 'start-damage-nearest', value: 1 }],
  'taller-de-remiendos': [{ kind: 'passive', id: 'start-heal-unit', value: 1 }],
  'montana-de-chatarra': [{ kind: 'passive', id: 'start-scry', value: 1 }],
  'la-fabrica': [{ kind: 'passive', id: 'start-grant-petardazo' }],
  'barril-de-polvora': [{ kind: 'passive', id: 'petardazo', value: 4 }],
  'mecha-corta': [{ kind: 'damage', amount: 2, target: 'enemy-piece' }, { kind: 'stun' }],
  'rebusca-en-la-chatarra': [{ kind: 'scry', amount: 2 }, { kind: 'draw', amount: 1 }],
  sabotaje: [{ kind: 'destroy-all-enemy-structures', gainEssencePerResistance: false }],
  'piquero-de-flandes': [{ kind: 'passive', id: 'formation' }],
  'arcabucero-bisono': [{ kind: 'passive', id: 'discharge' }],
  rodelero: [],
  'mosquetero-veterano': [{ kind: 'passive', id: 'discharge' }],
  'cabo-de-escuadra': [{ kind: 'passive', id: 'formation' }],
  'alferez-de-la-cruz': [{ kind: 'passive', id: 'formation' }],
  coselete: [{ kind: 'passive', id: 'formation' }],
  'jinete-herreruelo': [{ kind: 'passive', id: 'discharge' }],
  'capitan-de-infanteria': [{ kind: 'passive', id: 'formation' }],
  'el-gran-capitan': [{ kind: 'passive', id: 'formation' }],
  'sargento-mayor': [{ kind: 'passive', id: 'start-choose-move', value: 1 }],
  'maestre-de-campo': [{ kind: 'passive', id: 'formation' }, { kind: 'choose-formation', count: 2 }],
  'el-ultimo-cuadro': [{ kind: 'passive', id: 'formation' }, { kind: 'passive', id: 'last-square-indestructible' }, { kind: 'passive', id: 'grow-on-adjacent-ally-death' }],
  'a-la-pica': [{ kind: 'grant-formation' }],
  'santiago-y-cierra-espana': [{ kind: 'formation-march' }],
  'cuerda-encendida': [{ kind: 'boost-discharge', amount: 2 }],
  'mina-bajo-la-muralla': [{ kind: 'mine-structure', splash: 3 }],
  'motin-de-impagados': [{ kind: 'draw', amount: 3 }, { kind: 'forbid-own-attacks' }],
  rocroi: [{ kind: 'rocroi' }],
  'descarga-cerrada': [{ kind: 'choose-line', amount: 2, enemiesOnly: true, unitsOnly: true, rowsOnly: false }],
  'el-brulote': [{ kind: 'choose-line', amount: 4, enemiesOnly: false, unitsOnly: false, rowsOnly: true }],
  trinchera: [],
  'tambor-del-tercio': [], 'camino-espanol': [], 'puente-sobre-el-escalda': [], 'fuerte-de-estrella': [],
  'tobogan-de-tubos': [], 'fragua-de-ilmarinen': [], 'el-pino-que-llega-al-cielo': [],
  pagaduria: [{ kind: 'passive', id: 'start-draw-if-three-units', value: 1 }],
  'el-cuartel-de-invierno': [{ kind: 'passive', id: 'start-heal-and-form', value: 2 }],
  'pescador-del-lago': [], 'cazador-de-lapones': [], 'oso-otso': [],
  'cantor-de-aldea': [{ kind: 'gain-runo', amount: 1 }],
  'ilmarinen-el-herrero': [{ kind: 'passive', id: 'entry-draw-structure' }],
  'tejedora-de-patrones': [{ kind: 'passive', id: 'start-scry', value: 1 }],
  'antero-vipunen': [{ kind: 'passive', id: 'cannot-move' }, { kind: 'passive', id: 'start-gain-runo', value: 2 }],
  'vieja-madre-del-agua': [{ kind: 'passive', id: 'start-gain-runo', value: 2 }, { kind: 'passive', id: 'weaken-adjacent-enemies', value: 1 }],
  'casa-de-troncos': [{ kind: 'passive', id: 'start-heal-unit', value: 1 }],
  'sauna-de-humo': [{ kind: 'passive', id: 'start-cleanse-unit' }],
  'piedra-de-ofrendas': [{ kind: 'passive', id: 'start-gain-runo', value: 1 }],
  lemminkainen: [{ kind: 'passive', id: 'death-gain-runo', value: 2 }],
  'doncella-del-arcoiris': [{ kind: 'passive', id: 'enemy-spell-immune' }],
  'cisne-de-tuonela': [],
  'louhi-senora-de-pohjola': [{ kind: 'passive', id: 'start-canto-adjacent', value: 6 }],
  kullervo: [{ kind: 'passive', id: 'kill-random-ally-damage' }],
  'aguila-de-pohjola': [{ kind: 'passive', id: 'attack-canto-at-nine' }],
  'lucio-de-tuonela': [{ kind: 'passive', id: 'death-draw', value: 2 }],
  'verso-de-apertura': [{ kind: 'gain-runo', amount: 2 }, { kind: 'draw', amount: 1 }],
  'hundirlo-en-la-cienaga': [{ kind: 'sink' }],
  'el-duelo-de-versos': [{ kind: 'passive', id: 'gain-runo-per-spell' }, { kind: 'draw', amount: 2 }],
  'el-robo-del-sampo': [{ kind: 'sink-low-health', maximumHealth: 4 }, { kind: 'gain-runo', amount: 3 }],
  'la-barca-de-un-tronco': [{ kind: 'choose-moves', count: 2, distance: 3 }, { kind: 'gain-runo', amount: 1 }],
  'canto-de-la-helada': [{ kind: 'choose-sinks', count: 2, adjacent: true }, { kind: 'gain-runo', amount: 1 }],
  'saber-el-nombre': [{ kind: 'silence-unit' }, { kind: 'gain-runo', amount: 1 }],
  'la-herida-de-hierro': [{ kind: 'gain-runo', amount: 1 }, { kind: 'heal-unit', amount: 3, nexusRunoThreshold: 6 }],
  'el-rio-de-tuonela': [],
  'el-sampo': [{ kind: 'passive', id: 'start-sampo' }, { kind: 'passive', id: 'death-draw', value: 3 }, { kind: 'passive', id: 'death-gain-runo', value: 3 }],
};

export const EXPANSION_PENDING_IDS = Object.freeze(seeds.filter((seed) => !(seed.id in implementedEffects)).map((seed) => seed.id));

/** Estos datos están validados, pero permanecen fuera de CARDS y bloqueados
 * hasta cerrar el conjunto: evita publicar facciones parcialmente jugables. */
export const EXPANSION_DRAFTS: readonly CardDefinition[] = Object.freeze(seeds.map((seed, index) =>
  CardDefinitionSchema.parse({ ...seed,
    color: FACTION_BY_ID[seed.faction as FactionId].color,
    art: { webp: `/assets/cards/art/${seed.id}.webp`, fallback: `/assets/cards/art/${seed.id}.svg`, alt: `Ilustración de ${seed.name}` },
    set: `NEX-${13 + Math.floor(index / 31)} · ${FACTION_BY_ID[seed.faction as FactionId].name}`,
    collectorNumber: 425 + index, artist: 'Arte facilitado por el proyecto', unlocked: false,
    aiTags: [seed.type], effects: implementedEffects[seed.id] ?? [],
    vfx: { summonEffect: `${seed.faction}-summon`, impactEffect: `${seed.faction}-impact` },
    sfx: { play: `${seed.faction}-play`, impact: `${seed.faction}-impact` },
  }) as CardDefinition));

const enabled = new Set<FactionId>(['goblins', 'tercios', 'kalevala']);
if (EXPANSION_PENDING_IDS.some((id) => enabled.has(seeds.find((seed) => seed.id === id)!.faction as FactionId))) {
  throw new Error('Una facción con reglas pendientes no puede entrar en el catálogo jugable.');
}
export const READY_EXPANSION_CARDS = Object.freeze(EXPANSION_DRAFTS.filter((card) => enabled.has(card.faction)).map((card) => ({ ...card, unlocked: true })));
