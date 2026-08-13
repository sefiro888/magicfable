/** Nombre visible de cada fase del turno. */
export const PHASE_LABELS: Record<string, string> = {
  start: 'Preparación',
  draw: 'Robo',
  main: 'Principal',
  combat: 'Combate',
  end: 'Fin',
  finished: 'Terminada',
}

/** Palabras clave tal como se muestran en el panel de contexto de la batalla. */
export const BATTLE_KEYWORD_LABELS: Record<string, string> = {
  impulse: 'Impulso',
  'swift-strike': 'Golpe veloz',
  guard: 'Guardia',
  flying: 'Volador',
  pierce: 'Perforar',
  lifelink: 'Vínculo vital',
  stun: 'Aturdir',
}

/** Nombre temático de la Esencia de cada facción, para los tooltips. */
export const ESSENCE_LABELS: Record<string, string> = {
  fury: 'Esencia Carmesí',
  arcane: 'Esencia Celeste',
  nature: 'Esencia Verde',
  order: 'Esencia Áurea',
  shadow: 'Esencia Umbría',
  void: 'Esencia del Vacío',
}
