import type { CardType, FactionId, Rarity } from '../game'

export const FACTION_LABELS: Record<FactionId, string> = {
  fury: 'Furia',
  arcane: 'Arcano',
  nature: 'Naturaleza',
  order: 'Orden',
  shadow: 'Sombra',
  void: 'Vacío',
}

export const TYPE_LABELS: Record<CardType, string> = {
  mana: 'Esencia',
  unit: 'Unidad',
  instant: 'Hechizo inmediato',
  structure: 'Estructura',
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
