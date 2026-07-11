import type { FactionDefinition, FactionId } from './types';

export const FACTIONS = [
  {
    id: 'fury',
    name: 'Furia',
    description: 'Agresión volcánica, criaturas veloces y daño inmediato.',
    color: '#b72d20',
    accentColor: '#ff9a3d',
    icon: 'flame',
    unlocked: true,
    themes: ['fuego', 'agresión', 'sacrificio'],
  },
  {
    id: 'arcane',
    name: 'Arcano',
    description: 'Control del campo, hielo y manipulación del conocimiento.',
    color: '#2356a8',
    accentColor: '#75dcff',
    icon: 'crystal',
    unlocked: true,
    themes: ['hielo', 'control', 'robo'],
  },
  {
    id: 'nature',
    name: 'Naturaleza',
    description: 'Crecimiento, curación y reservas de Esencia abundantes.',
    color: '#39753a',
    accentColor: '#a7db67',
    icon: 'leaf',
    unlocked: false,
    themes: ['curación', 'crecimiento', 'resistencia'],
  },
  {
    id: 'order',
    name: 'Orden',
    description: 'Formaciones defensivas, escudos y grandes estructuras.',
    color: '#d8caa4',
    accentColor: '#f2cf68',
    icon: 'sun-shield',
    unlocked: false,
    themes: ['defensa', 'soldados', 'muros'],
  },
  {
    id: 'shadow',
    name: 'Sombra',
    description: 'Veneno, descarte y poder obtenido del cementerio.',
    color: '#261d2d',
    accentColor: '#8d51aa',
    icon: 'eclipse',
    unlocked: false,
    themes: ['veneno', 'cementerio', 'robo de vida'],
  },
  {
    id: 'void',
    name: 'Vacío',
    description: 'Portales y distorsiones que reescriben el espacio.',
    color: '#59327d',
    accentColor: '#c775ff',
    icon: 'portal',
    unlocked: false,
    themes: ['portales', 'teletransporte', 'distorsión'],
  },
] as const satisfies readonly FactionDefinition[];

export const FACTION_BY_ID = Object.freeze({
  fury: FACTIONS[0],
  arcane: FACTIONS[1],
  nature: FACTIONS[2],
  order: FACTIONS[3],
  shadow: FACTIONS[4],
  void: FACTIONS[5],
}) satisfies Readonly<Record<FactionId, FactionDefinition>>;

export const PLAYABLE_FACTIONS = FACTIONS.filter((faction) => faction.unlocked);
