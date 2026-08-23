import type { CardType, FactionId, Keyword, Rarity } from '../game'

export const FACTION_LABELS: Record<FactionId, string> = {
  fury: 'Furia',
  arcane: 'Arcano',
  nature: 'Naturaleza',
  order: 'Orden',
  shadow: 'Sombra',
  void: 'Vacío',
  duna: 'Duna',
  fimbul: 'Fimbul',
  samsara: 'Samsara',
  jade: 'Jade',
  olimpo: 'Olimpo',
}

export const TYPE_LABELS: Record<CardType, string> = {
  mana: 'Esencia',
  unit: 'Unidad',
  instant: 'Hechizo inmediato',
  structure: 'Estructura',
}

/**
 * Nombre en español de cada palabra clave. Vivía dentro de `CardInspector`, así
 * que la Galería —que filtra por palabra clave— acababa enseñando los
 * identificadores internos en inglés ('swift-strike', 'lifelink') en su
 * desplegable. Aquí lo comparten todas las pantallas.
 */
export const KEYWORD_LABELS: Readonly<Record<Keyword, string>> = {
  impulse: 'Impulso',
  'swift-strike': 'Golpe veloz',
  guard: 'Guardia',
  flying: 'Volador',
  pierce: 'Perforar',
  lifelink: 'Vínculo vital',
  stun: 'Aturdir',
}

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Común',
  uncommon: 'Infrecuente',
  rare: 'Rara',
  mythic: 'Mítica',
}

export function totalCost(generic: number, colored: Readonly<Record<string, number | undefined>>): number {
  let total = generic
  for (const value of Object.values(colored)) total += value ?? 0
  return total
}
